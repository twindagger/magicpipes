const { delay } = require('./util');
const retryFilter = ({
  times = 0,
  interval = 1,
  before = null,
  errorFilter = () => true
}) => {
  const between = typeof(before) === 'function' ? before : () => delay(interval * 1000);

  const filter = async (context, next) => {
    let retryCount = 0;
    let lastError;
    while (times <= 0 || retryCount < times) {
      try {
        return await next(context);
      } catch (err) {
        if (!errorFilter(err)) {
          throw err;
        }
        lastError = err;
        await between();
      }
    }
    throw lastError;
  };

  filter.inspect = () => ({
    type: 'retry',
    times,
    interval
  });

  return filter;
};

module.exports = retryFilter;
