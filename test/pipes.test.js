const pipes = require("..");

const setA = (i) => (context, next) => {
  context.a = i;
  return next(context);
};

describe("pipes", () => {
  it("does not support non function filters", async () => {
    const pipe = pipes({ blah: 1 });
    await expect(pipe.send({ a: 0 })).rejects.toThrow(
      "Expected filter to be a function"
    );
  });
  it("supports synchronous filters", async () => {
    const pipe = pipes(setA(1));
    const result = await pipe.send({ a: 0 });
    expect(result).toEqual({ a: 1 });
  });
  it("can handle synchronous errors", async () => {
    const pipe = pipes(() => {
      throw new Error("Some Error");
    });
    await expect(pipe.send({ a: 0 })).rejects.toThrow();
  });
  it("supports asynchronous filters", async () => {
    const pipe = pipes(async (context, next) => {
      context.a++;
      await Promise.resolve();
      return await next(context);
    });
    const result = await pipe.send({ a: 0 });
    expect(result).toEqual({ a: 1 });
  });
  it("can handle asynchronous errors", async () => {
    const pipe = pipes(() => Promise.reject(new Error("Some Error")));
    await expect(pipe.send({ a: 0 })).rejects.toThrow();
  });
  it("can append", async () => {
    const pipe = pipes(setA(1));
    const context = { a: 0 };
    await pipe.append(setA(2)).send(context);
    expect(context.a).toEqual(2);
  });
  it("can prepend", async () => {
    const pipe = pipes(setA(1));
    const context = { a: 0 };
    await pipe.prepend(setA(2)).send(context);
    expect(context.a).toEqual(1);
  });
});
