const pipes = require('../');

describe('retry', () => {
  let testFilter, context, pipe, before;
  const times = 2;

  beforeEach(() => {
    before = jest.fn(() => Promise.resolve());
    testFilter = jest.fn(async (ctx, next) => {
      ctx.a++;
      await next(ctx);
    });
    context = { a: 1 };
    pipe = pipes(pipes.retry({
      times,
      before
    }), testFilter);
  });

  it('should not retry when pipe remnant succeeds', async () => {
    await pipe.send(context);
    expect(testFilter).toHaveBeenCalledTimes(1);
  });

  it('should retry when pipe remnant fails', async () => {
    testFilter.mockImplementationOnce(() => Promise.reject('Some error'));
    await pipe.send(context);
    expect(testFilter).toHaveBeenCalledTimes(2);
  });

  it('should only retry maximum times', async () => {
    testFilter.mockImplementationOnce(() => Promise.reject('Some error'));
    testFilter.mockImplementationOnce(() => Promise.reject('Some error'));
    testFilter.mockImplementationOnce(() => Promise.reject('Some error'));
    testFilter.mockImplementationOnce(() => Promise.reject('Some error'));
    await expect(pipe.send(context)).rejects.toThrow();
    expect(testFilter).toHaveBeenCalledTimes(3);
  });

  describe('when there is an error filter', () => {
    const shouldRescue = 'This error should trigger a retry';
    const shouldIgnore = 'This error should be ignored';
    beforeEach(() => {
      pipe = pipes(pipes.retry({
        times,
        before,
        errorFilter: (err) => err === shouldRescue
      }), testFilter);
    });

    it('Should fail every time ignored errors are passed', async () => {
      testFilter.mockImplementationOnce(() => Promise.reject(shouldIgnore));
      await expect(pipe.send(context)).rejects.toThrow(shouldIgnore);
    });

    it('Should behave correctly when applicable errors occur', async () => {
      testFilter.mockImplementationOnce(() => Promise.reject(shouldRescue));
      await pipe.send(context);
      expect(testFilter).toHaveBeenCalledTimes(2);
    });
  });

  describe('when there is an interval passed', () => {
    beforeEach(() => {
      pipe = pipes(pipes.retry({
        times,
        interval: .001 // keep interval small, 1ms
      }), testFilter);
    });

    it('should not retry when pipe remnant succeeds', async () => {
      await pipe.send(context);
      expect(testFilter).toHaveBeenCalledTimes(1);
    });

    it('should retry when pipe remnant fails', async () => {
      testFilter.mockImplementationOnce(() => Promise.reject('Some error'));
      await pipe.send(context);
      expect(testFilter).toHaveBeenCalledTimes(2);
    });
  });

  describe('given no options', () => {
    beforeEach(() => {
      pipe = pipes(pipes.retry(), testFilter);
    });

    it('should default as expected', async () => {
      expect(pipe.inspect().pipeline[0]).toEqual({ type: 'retry', times: 0, interval: 1 });
    });
  });

  it('should support inspect', async () => {
    expect(pipe.inspect().pipeline[0]).toEqual({ type: 'retry', times, interval: 'N/A' });
  });
});
