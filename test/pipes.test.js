const pipes = require('..')

const setA = (i) => (ctx, next) => {
  ctx.a = i
  return next(ctx)
}

describe('pipes', () => {
  it('does not support non function filters', async () => {
    let pipe = pipes({ blah: 1 })
    await expect(pipe.send({ a: 0 })).rejects.toThrow('Expected filter to be a function')
  })
  it('supports synchronous filters', async () => {
    let pipe = pipes(setA(1))
    await pipe.send({ a: 0 })
  })
  it('can handle synchronous errors', async () => {
    let pipe = pipes(() => {
      throw new Error('Some Error')
    })
    await expect(pipe.send({ a: 0 })).rejects.toThrow()
  })
  it('supports asynchronous filters', async () => {
    let pipe = pipes(async (ctx, next) => {
      ctx.a++
      await Promise.resolve()
      return await next(ctx)
    })
    await pipe.send({ a: 0 })
  })
  it('can handle asynchronous errors', async () => {
    let pipe = pipes(() =>
      Promise.reject('Some Error')
    )
    await expect(pipe.send({ a: 0 })).rejects.toThrow()
  })
  it('can append', async () => {
    let pipe = pipes(setA(1))
    let context = { a: 0 }
    await pipe.append(setA(2)).send(context)
    expect(context.a).toEqual(2)
  })
  it('can prepend', async () => {
    let pipe = pipes(setA(1))
    let context = { a: 0 }
    await pipe.prepend(setA(2)).send(context)
    expect(context.a).toEqual(1)
  })
})
