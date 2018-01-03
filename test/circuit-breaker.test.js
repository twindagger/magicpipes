const pipes = require('../')
const lolex = require('lolex')

const clock = lolex.install()
const failFilter = (message) => () => Promise.reject(new Error(message))

describe('circuitBreaker', () => {
  let testFilter, context, pipe

  beforeEach(() => {
    testFilter = jest.fn((ctx, next) => {
      ctx.a++
      next(ctx)
    })
    context = { a: 1 }
    pipe = pipes(pipes.circuitBreaker({
      trackingPeriod: 1,
      resetTimeout: 2
    }), testFilter)
  })

  it('should call normally when no errors occur', async () => {
    await pipe.send(context)
    expect(context.a).toBe(2)
  })

  describe('when an error happens', () => {
    const errorMessage = 'Expected Test Error'
    beforeEach(() => testFilter.mockImplementationOnce(failFilter(errorMessage)))

    it('should not alter pipeline result from error', async () => {
      await expect(pipe.send(context)).rejects.toThrow(errorMessage)
    })

    it('should fail second run with first error', async () => {
      await pipe.send(context).catch(() => 0)
      await expect(pipe.send(context)).rejects.toThrow(errorMessage)
      expect(testFilter).toHaveBeenCalledTimes(1)
    })

    it('should retry after reset delay', async () => {
      await pipe.send(context).catch(() => 0)
      clock.tick(2000)
      await pipe.send(context)
      expect(context.a).toBe(2)
    })

    it('should still fail when retry fails after reset delay', async () => {
      await pipe.send(context).catch(() => 0)
      clock.tick(2000)
      testFilter.mockImplementationOnce(failFilter(errorMessage))
      await expect(pipe.send(context)).rejects.toThrow(errorMessage)
    })
  })

  describe('when there is an error filter', () => {
    const shouldBreak = 'This error should trigger the breaker'
    const shouldIgnore = 'This error should be ignored by the breaker'
    beforeEach(() => {
      pipe = pipes(pipes.circuitBreaker({
        trackingPeriod: 1,
        resetTimeout: 2,
        errorFilter: (err) => err.message === shouldBreak
      }), testFilter)
    })

    it('Should fail every time ignored errors are passed', async () => {
      for (let i = 0; i < 2; i++) {
        testFilter.mockImplementationOnce(failFilter(shouldIgnore))
        await expect(pipe.send(context)).rejects.toThrow(shouldIgnore)
      }
    })

    it('Should behave correctly when breaker errors occur', async () => {
      testFilter.mockImplementationOnce(failFilter(shouldBreak))
      for (let i = 0; i < 2; i++) {
        await expect(pipe.send(context)).rejects.toThrow(shouldBreak)
      }
      expect(testFilter).toHaveBeenCalledTimes(1)
      expect(pipe.inspect().pipeline[0].state.state).toEqual('opened')
    })
  })

  describe('when there is an active threshold', () => {
    const errorMessage = 'Expected Test Error'
    beforeEach(() => {
      pipe = pipes(pipes.circuitBreaker({
        trackingPeriod: 1,
        resetTimeout: 2,
        activeThreshold: 2
      }), testFilter)
    })

    it('breaker should remain closed when error happens before active threshold', async () => {
      testFilter.mockImplementationOnce(failFilter(errorMessage))
      await pipe.send(context).catch(() => 0)
      await pipe.send(context)
      expect(context.a).toEqual(2)
      expect(pipe.inspect().pipeline[0].state.state).toEqual('closed')
    })

    it('breaker should open when error occurs after activeThreshold is reached', async () => {
      await pipe.send(context)
      await pipe.send(context)
      // opens breaker
      testFilter.mockImplementationOnce(failFilter(errorMessage))
      await pipe.send(context).catch(() => 0)
      expect(pipe.inspect().pipeline[0].state.state).toEqual('opened')
      await expect(pipe.send(context)).rejects.toThrow(errorMessage)
    })

    it('breaker should not re-close until activeThreshold is reached again', async () => {
      await pipe.send(context)
      await pipe.send(context)
      // opens breaker
      testFilter.mockImplementationOnce(failFilter(errorMessage))
      await pipe.send(context).catch(() => 0)
      expect(pipe.inspect().pipeline[0].state.state).toEqual('opened')
      clock.tick(2000)
      await pipe.send(context)
      expect(pipe.inspect().pipeline[0].state.state).toEqual('halfOpened')
      await pipe.send(context)
      expect(pipe.inspect().pipeline[0].state.state).toEqual('closed')
    })
  })

  describe('when there is a trip threshold', () => {
    const errorMessage = 'Expected Test Error'
    beforeEach(() => {
      pipe = pipes(pipes.circuitBreaker({
        trackingPeriod: 1,
        resetTimeout: 2,
        tripThreshold: 40
      }), testFilter)
    })

    it('breaker should remain closed when error keeps below the trip threshold', async () => {
      await pipe.send(context)
      await pipe.send(context)
      // 1 failure / 3 tries = 33%
      testFilter.mockImplementationOnce(failFilter(errorMessage))
      await expect(pipe.send(context)).rejects.toThrow(errorMessage)
      expect(pipe.inspect().pipeline[0].state.state).toEqual('closed')
      await pipe.send(context)
    })

    it('breaker should open when enough errors occur to reach trip threshold', async () => {
      await pipe.send(context)
      // 1 failure / 2 tries = 50%
      testFilter.mockImplementationOnce(failFilter(errorMessage))
      await expect(pipe.send(context)).rejects.toThrow(errorMessage)
      await expect(pipe.send(context)).rejects.toThrow(errorMessage)
      expect(pipe.inspect().pipeline[0].state.state).toEqual('opened')
    })
  })

  describe('given no options', () => {
    beforeEach(() => {
      pipe = pipes(pipes.circuitBreaker(), testFilter)
    })

    it('should default as expected', async () => {
      expect(pipe.inspect().pipeline[0]).toEqual({ type: 'circuitBreaker', trackingPeriod: 60, resetTimeout: 300, activeThreshold: 0, tripThreshold: 0, state: { state: 'closed', attempts: 0, failures: 0 } })
    })
  })
})
