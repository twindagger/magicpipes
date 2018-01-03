const pipes = require('../');
const lolex = require('lolex');

const clock = lolex.install();

describe('circuitBreaker', () => {
  let testFilter, context, pipe;

  beforeEach(() => {
    testFilter = jest.fn((ctx, next) => {
      ctx.a++;
      next(ctx);
    });
    context = { a: 1 };
    pipe = pipes(pipes.circuitBreaker({
      trackingPeriod: 1,
      resetTimeout: 2
    }), testFilter);
  });

  it('should call normally when no errors occur', async function() {
    await pipe.send(context);
    expect(context.a).toBe(2);
  });

  describe('when an error happens', () => {
    const errorMessage = 'Expected Test Error';
    const failFilter = () => Promise.reject(new Error(errorMessage));
    beforeEach(() => testFilter.mockImplementationOnce(failFilter));

    it('should not alter pipeline result from error', async function() {
      let failed = false;
      try {
        await pipe.send(context);
      } catch(err){
        failed = true;
        expect(err.message).toBe(errorMessage);
      }

      expect(failed).toBe(true);
    });

    it('should fail second run with first error', async function() {
      await pipe.send(context).catch(() => 0);
      let failed = false;
      try {
        await pipe.send(context);
      } catch(err){
        failed = true;
        expect(err.message).toBe(errorMessage);
      }

      expect(failed).toBe(true);
      expect(testFilter).toHaveBeenCalledTimes(1);
    });

    it('should retry after reset delay', async function() {
      await pipe.send(context).catch(() => 0);
      clock.tick(2500);
      // apparently the delay promise I'm using doesn't actually
      // trigger with advance timers unless we wait until the next tick
      await new Promise(res => process.nextTick(res));

      await pipe.send(context);
      expect(context.a).toBe(2);
    });
  });
});
