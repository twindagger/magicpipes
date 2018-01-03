const logFilter = ({
  logger,
  level = 'info'
}) => {
  const filter = (context, next) => {
    logger.log(level, context)
    return next(context)
  }

  filter.inspect = () => ({
    type: 'log',
    level
  })

  return filter
}

module.exports = logFilter
