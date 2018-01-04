const pipes = require('..')

describe('log', () => {
  let testFilter, context, pipe, logger
  const level = 'debug'

  beforeEach(() => {
    logger = { log: jest.fn() }
    testFilter = jest.fn(async (ctx, next) => {
      ctx.a++
      await next(ctx)
    })
    context = { a: 1 }
    pipe = pipes(pipes.log({
      logger,
      level
    }), testFilter)
  })

  it('should log context', async () => {
    await pipe.send(context)
    expect(logger.log).toHaveBeenCalledWith('debug', context)
  })

  describe('given no level', () => {
    beforeEach(() => {
      pipe = pipes(pipes.log({
        logger
      }), testFilter)
    })

    it('should log at an info level', async () => {
      await pipe.send(context)
      expect(logger.log).toHaveBeenCalledWith('info', context)
    })
  })

  it('should support inspect', async () => {
    expect(pipe.inspect().pipeline[0]).toEqual({ type: 'log', level })
  })
})
