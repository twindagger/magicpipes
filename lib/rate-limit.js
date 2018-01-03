const { delay } = require('./util');
const rateLimitFilter = ({
  limit,
  interval = 60
}) => {
  let count = 0;
  let nextReset;

  const filter = async (context, next) => {
    if (!nextReset) {
      count = 0;
      nextReset = delay(interval);
    }
    if (count > limit) {
      await nextReset;
      count = 0;
    }
    return await next(context);
  };

  filter.inspect = () => ({
    type: 'rateLimit',
    limit,
    interval,
    count
  });

  return filter;
};

module.exports = rateLimitFilter;
