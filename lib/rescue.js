const rescueFilter = ({
  rescuePipe,
  rescueContextFactory = (context, error) => ({ context, error }),
  errorFilter = () => true
}) => {
  const filter = async (context, next) => {
    try {
      return await next(context)
    } catch (err) {
      if (!errorFilter(err)) {
        throw err
      }
      return await rescuePipe.send(rescueContextFactory(context, err))
    }
  }

  filter.inspect = () => ({
    type: 'rescue'
  })

  return filter
}

module.exports = rescueFilter
