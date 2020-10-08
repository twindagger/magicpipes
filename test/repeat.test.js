const pipes = require("..");

function Deferred() {
  this.promise = new Promise((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });
}

describe("repeat", () => {
  let testFilter, context, pipe, until, deferred;

  beforeEach(() => {
    deferred = new Deferred();
    until = jest.fn(() => deferred.promise);
    testFilter = jest.fn(async (context_, next) => {
      context_.a++;
      await next(context_);
    });
    context = { a: 1 };
    pipe = pipes(
      pipes.repeat({
        until,
      }),
      testFilter
    );
  });

  it("should only call filter once when until function resolves immediately", async () => {
    deferred.resolve();
    await pipe.send(context);

    expect(until).toHaveBeenCalledTimes(1);
  });

  it("should not care if until promise is resolved or rejected", async () => {
    deferred.reject();
    await pipe.send(context);

    expect(until).toHaveBeenCalledTimes(1);
  });

  it("should call filter as long as until function promise is not resolved", async () => {
    let callCount = 0;
    testFilter.mockImplementation((context_, next) => {
      if (callCount++ > 1) {
        deferred.resolve();
      }
      return next(context_);
    });
    await pipe.send(context);

    expect(callCount).toBeGreaterThan(1);
  });

  it("should support inspect", async () => {
    expect(pipe.inspect().pipeline[0]).toEqual({ type: "repeat" });
  });
});
