const pipes = require('..')
const { getPromiseImplementation } = require('../lib/util')
const es6promise = require('es6-promise-promise')

describe('pipes', () => {
  it('can be passed a custom promise implementation', () => {
    pipes.usePromiseImplementation(es6promise)
    expect(getPromiseImplementation()).toBe(es6promise)
  })
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
})
