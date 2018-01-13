const concurrencyFilter = ({
  limit
}) => {
  let executing = new Set()

  const filter = async (context, next) => {
    if (executing.size >= limit) {
      await Promise.race(executing.values())
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
