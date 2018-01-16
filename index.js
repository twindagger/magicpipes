const filters = require('./lib')

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

const pipeFactory = (...pipeFilters) => {
  const filters = [].concat(pipeFilters)

  return {
    send (context) {
      const step = (idx) => (ctx) =>
        idx < filters.length
          ? pwrap(filters[idx], ctx, step(idx + 1))
          : Promise.resolve(ctx)

      return step(0)(context)
    },
    prepend (filtersToPrepend) {
      return pipeFactory(filtersToPrepend.concat(pipeFilters))
    },
    append (filtersToAppend) {
      return pipeFactory(pipeFilters.concat(filtersToAppend))
    },
    inspect () {
      return {
        pipeline: filters.map((m) => typeof (m.inspect) === 'function' ? m.inspect() : 'Unknown Filter')
      }
    }
  }
}

Object.assign(pipeFactory, filters)

module.exports = pipeFactory
