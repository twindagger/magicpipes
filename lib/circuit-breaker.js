const { getPromiseImplementation } = require('./util');
const circuitBreakerFilter = ({
  errorFilter = () => true,
  trackingPeriod = 60,
  resetTimeout = 300,
  activeThreshold = 0,
  tripThreshold = 0
} = {}) => {
  const pimpl = getPromiseImplementation();

  let state;
  let closed;
  let opened;
  let halfOpened;
  let trackingStart = 0;

  // state representing closed circuit, allowing processing
  // until enough faults have occurred to close the circuit
  closed = () => {
    let attempts = 0;
    let failures = 0;
    const reset = () => {
      attempts = 0;
      failures = 0;
      trackingStart = Date.now();
    };
    return {
      pre() {
        if (Date.now() - trackingStart >= trackingPeriod * 1000) reset();
        attempts++;
        return pimpl.resolve();
      },
      fault(err) {
        failures++;
        if (attempts > activeThreshold && (100*failures/attempts) > tripThreshold) {
          state = opened(err);
        }
      },
      post() {
      },
      inspect: () => ({
        state: 'closed',
        attempts,
        failures
      })
    };
  };

  // state representing open circuit, blocking any processing
  // by returning the error that tripped the circuit
  opened = err => {
    let openStart = Date.now();
    return {
      pre() {
        if (Date.now() - openStart >= resetTimeout*1000) {
          state = halfOpened();
          return state.pre();
        }
        return pimpl.reject(err);
      },
      fault() {
        // should only hit in race conditions, probably not possible
      },
      post() {
        // should only hit in race conditions, probably not possible
      },
      inspect: () => ({
        state: 'opened',
        error: err
      })
    };
  };

  // state representing circuit attempting to close
  // Any faults moves the circuit back to open, if enough successes happen
  // then the circuit is closed
  halfOpened = () => {
    let attempts = 0;
    return {
      pre() {
        attempts++;
        return pimpl.resolve();
      },
      fault(err) {
        state = opened(err);
      },
      post() {
        if (attempts > activeThreshold) {
          state = closed();
        }
      },
      inspect: () => ({
        state: 'halfOpened',
        attempts
      })
    };
  };

  state = closed();

  const filter = async (context, next) => {
    try {
      await state.pre();
      await next(context);
      state.post();
    } catch (err) {
      if (errorFilter(err)) {
        state.fault(err);
      }
      throw err;
    }
  };

  filter.inspect = () => ({
    type: 'circuitBreaker',
    activeThreshold,
    tripThreshold,
    trackingPeriod,
    resetTimeout,
    state: state.inspect()
  });

  return filter;
};

module.exports = circuitBreakerFilter;
