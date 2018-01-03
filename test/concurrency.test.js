const pipes = require('../');
const delay = (timeout) => new Promise((res) => setTimeout(res, timeout));

describe('concurrency', () => {
  let testFilter, context, pipe, maxConcurrent;

  beforeEach(() => {
    maxConcurrent = 0;
    testFilter = jest.fn(async (ctx, next) => {
      ctx.a++;
      maxConcurrent++;
      await delay(10);
      maxConcurrent--;
      await next(ctx);
    });
    context = { a: 1 };
    pipe = pipes(pipes.concurrency({
      limit: 2
    }), testFilter);
  });

  it('should call up to limit simultaneously', async () => {
    let both = Promise.all([pipe.send(context), pipe.send(context)]);
    await both;
  });

  it('should never run more than limit concurrently', async () => {
    let all = Promise.all([pipe.send(context), pipe.send(context), pipe.send(context), pipe.send(context)]);
    await all;
    expect(maxConcurrent).toBeLessThanOrEqual(2);
  });
});
