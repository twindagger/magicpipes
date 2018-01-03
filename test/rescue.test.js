const pipes = require('../');

describe('rescue', () => {
  let testFilter, context, pipe, rescueFilter, rescuePipe;

  beforeEach(() => {
    testFilter = jest.fn(async (ctx, next) => {
      ctx.a++;
      await next(ctx);
    });
    context = { a: 1 };
    rescueFilter = jest.fn(async (ctx, next) => {
      await next(ctx);
    });
    rescuePipe = pipes(rescueFilter);
    pipe = pipes(pipes.rescue({
      rescuePipe
    }), testFilter);
  });

  it('should not call rescue pipe when pipe remnant succeeds', async () => {
    await pipe.send(context);
    expect(rescueFilter).not.toHaveBeenCalled();
  });

  it('should call rescue pipe when pipe remnant fails', async () => {
    testFilter.mockImplementationOnce(() => Promise.reject('Some error'));
    await pipe.send(context);
    expect(rescueFilter).toHaveBeenCalled();
    expect(rescueFilter.mock.calls[0][0]).toEqual({ context, error: 'Some error' });
  });

  describe('when there is an error filter', () => {
    const shouldRescue = 'This error should trigger a rescue';
    const shouldIgnore = 'This error should be ignored';
    beforeEach(() => {
      pipe = pipes(pipes.rescue({
        rescuePipe,
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
      expect(rescueFilter).toHaveBeenCalled();
    });
  });

  describe('when a custom rescue context factory is provided', () => {
    beforeEach(() => {
      pipe = pipes(pipes.rescue({
        rescuePipe,
        rescueContextFactory: (ctx, err) => ({ ctx, err })
      }), testFilter);
    });

    it('should call rescue pipe with result from custom factory', async () => {
      testFilter.mockImplementationOnce(() => Promise.reject('Some error'));
      await pipe.send(context);
      expect(rescueFilter).toHaveBeenCalled();
      expect(rescueFilter.mock.calls[0][0]).toEqual({ ctx: context, err: 'Some error' });
    });
  });

  it('should support inspect', async () => {
    expect(pipe.inspect().pipeline[0]).toEqual({ type: 'rescue' });
  });
});
