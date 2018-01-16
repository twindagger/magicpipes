const pipes = require('..')

describe('pipes', () => {
  it('supports synchronous filters', async () => {
    let pipe = pipes((ctx, next) => {
      ctx.a++
      return next(ctx)
    })
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
})
