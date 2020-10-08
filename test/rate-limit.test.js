const pipes = require("..");
const lolex = require("@sinonjs/fake-timers");

const clock = lolex.install();

const waitForNextTick = () => new Promise((res) => process.nextTick(res));

describe("rateLimit", () => {
  let testFilter, context, pipe;
  const limit = 2;
  const interval = 1;

  beforeEach(() => {
    testFilter = jest.fn(async (context_, next) => {
      context_.a++;
      await next(context_);
    });
    context = { a: 1 };
    pipe = pipes(
      pipes.rateLimit({
        limit,
        interval,
      }),
      testFilter
    );
  });

  it("should make more than limit items wait", async () => {
    await pipe.send(context);
    await pipe.send(context);
    let done = false;
    let throttled = pipe.send(context).then(() => void (done = true));
    await waitForNextTick();
    expect(done).toBe(false);
    clock.tick(1000);
    await throttled;
    expect(done).toBe(true);
  });

  describe("given no interval", () => {
    beforeEach(() => {
      pipe = pipes(pipes.rateLimit({ limit }), testFilter);
    });

    it("should default as expected", async () => {
      expect(pipe.inspect().pipeline[0]).toEqual({
        type: "rateLimit",
        limit,
        interval: 60,
        count: 0,
      });
    });
  });

  it("should support inspect", async () => {
    expect(pipe.inspect().pipeline[0]).toEqual({
      type: "rateLimit",
      limit,
      interval,
      count: 0,
    });
  });
});
