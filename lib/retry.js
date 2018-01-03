const { delay } = require('./util');
const retryFilter = ({
  times = 0,
  interval = 1,
  before = null,
  errorFilter = () => true
} = {}) => {
  let between, intervalDescription;
  if (typeof(before) === 'function'){
    between = before;
    intervalDescription = 'N/A';
  } else {
    between = () => delay(interval * 1000);
    intervalDescription = interval;
  }

  const filter = async (context, next) => {
    let retryCount = 0;
    let lastError;
    while (times <= 0 || retryCount <= times) {
      try {
        return await next(context);
      } catch (err) {
        if (!errorFilter(err)) {
          throw err;
        }
        lastError = err;
        await between();
        retryCount++;
      }
    }
    throw lastError;
  };

  filter.inspect = () => ({
    type: 'retry',
    times,
    interval: intervalDescription
  });

  return filter;
};

module.exports = retryFilter;
