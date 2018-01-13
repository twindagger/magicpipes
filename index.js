const filters = require('./lib')

const pipeFactory = (...pipeFilters) => {
  const pwrap = (fn, ...args) => {
    let res
    try {
      res = fn(...args)
    } catch (ex) {
      return Promise.reject(ex)
    }
    if (res && typeof (res.then) === 'function') {
      return res
    }
    return Promise.resolve(res)
  }

  return {
    send (context) {
      const step = (idx) => (ctx) =>
        idx < pipeFilters.length
          ? pwrap(pipeFilters[idx], ctx, step(idx + 1))
          : Promise.resolve(ctx)

      return step(0)(context)
    },
    inspect () {
      return {
        pipeline: pipeFilters.map((m) => typeof (m.inspect) === 'function' ? m.inspect() : 'Unknown Filter')
      }
    }
  }
}

Object.assign(pipeFactory, filters)

module.exports = pipeFactory
