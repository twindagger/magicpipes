const { getPromiseImplementation } = require('./util')
const concurrencyFilter = ({
  limit
}) => {
  let pimpl = getPromiseImplementation()
  let executing = new Set()

  const filter = async (context, next) => {
    if (executing.size >= limit) {
      await pimpl.race(executing.values())
    }
    let nextPromise = next(context)
    executing.add(nextPromise)
    let result = await nextPromise
    executing.delete(nextPromise)
    return result
  }

  filter.inspect = () => ({
    type: 'concurrency',
    limit,
    executing: executing.size
  })

  return filter
}

module.exports = concurrencyFilter
