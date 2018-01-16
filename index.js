const filters = require('./lib')

const flatten = (arr) =>
  arr.reduce((flat, toFlatten) => flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten), [])

const pwrap = (fn, ...args) => {
  if (typeof fn !== 'function') {
    return Promise.reject(new TypeError('Expected filter to be a function'))
  }
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
  const filters = flatten(pipeFilters)

  return {
    send (context) {
      const step = (idx) => (ctx) =>
        idx < filters.length
          ? pwrap(filters[idx], ctx, step(idx + 1))
          : Promise.resolve(ctx)

      return step(0)(context)
    },
    prepend (...filtersToPrepend) {
      return pipeFactory(filtersToPrepend.concat(filters))
    },
    append (...filtersToAppend) {
      return pipeFactory(filters.concat(filtersToAppend))
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
