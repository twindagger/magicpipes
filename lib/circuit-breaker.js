const { nop } = require("./util");

const circuitBreakerFilter = ({
  errorFilter = () => true,
  trackingPeriod = 60,
  resetTimeout = 300,
  activeThreshold = 0,
  tripThreshold = 0,
} = {}) => {
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
        if (Date.now() - trackingStart >= trackingPeriod * 1000) {
          reset();
        }
        attempts++;
        return Promise.resolve();
      },
      fault(error) {
        failures++;
        if (
          attempts >= activeThreshold &&
          (100 * failures) / attempts > tripThreshold
        ) {
          state = opened(error);
        }
      },
      post: nop,
      inspect: () => ({
        state: "closed",
        attempts,
        failures,
      }),
    };
  };

  // state representing open circuit, blocking any processing
  // by returning the error that tripped the circuit
  opened = (error) => {
    let openStart = Date.now();
    return {
      pre() {
        if (Date.now() - openStart >= resetTimeout * 1000) {
          state = halfOpened();
          return state.pre();
        }
        return Promise.reject(error);
      },
      fault: nop, // should only hit in race conditions, probably not possible
      post: nop, // should only hit in race conditions, probably not possible
      inspect: () => ({
        state: "opened",
        error: error,
      }),
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
        return Promise.resolve();
      },
      fault(error) {
        state = opened(error);
      },
      post() {
        if (attempts >= activeThreshold) {
          state = closed();
        }
      },
      inspect: () => ({
        state: "halfOpened",
        attempts,
      }),
    };
  };

  state = closed();

  const filter = async (context, next) => {
    try {
      await state.pre();
      await next(context);
      state.post();
    } catch (error) {
      if (errorFilter(error)) {
        state.fault(error);
      }
      throw error;
    }
  };

  filter.inspect = () => ({
    type: "circuitBreaker",
    activeThreshold,
    tripThreshold,
    trackingPeriod,
    resetTimeout,
    state: state.inspect(),
  });

  return filter;
};

module.exports = circuitBreakerFilter;
