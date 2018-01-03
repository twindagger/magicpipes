# magicpipes

[![CircleCI](https://circleci.com/gh/twindagger/magicpipes.svg?style=svg)](https://circleci.com/gh/twindagger/magicpipes)  [![Coverage Status](https://coveralls.io/repos/github/twindagger/magicpipes/badge.svg)](https://coveralls.io/github/twindagger/magicpipes)

Provides a decorator pattern implementation and several useful filters.

## Usage

```javascript
const pipes = require('magicpipes');

const customFilter = async (context, next) => {
  context.someProperty = await someWorker();
  await next(context);
};

let pipeline = pipes(pipes.circuitBreaker({ interval: 3 }), customFilter);
pipeline.send({ some: 'context' })
  .then(/* called when pipeline finishes */)
  .catch(/* called if pipeline cannot finish */);
```

## Pipeline API

### Pipeline factory

`let pipeline = pipes(firmware1, firmware2 /*, ... */)`
The main export of the pipeline api is the pipeline factory function. It takes as its arguments 0 or more filter functions to be called in the pipe.

### Use your own promise implementation

By default magicpipes uses the global `Promise`. You can use `pipes.usePromiseImplementation` to use any compliant Promise implementation. For now, there can only be one implementation set at a time. Example:
```javascript
pipes.usePromiseImplementation(require('bluebird'));
```

## Included Filters

### Circuit Breaker

`pipes.circuitBreaker({ errorFilter, trackingPeriod, resetTimeout, tripThreshold, activeThreshold })`

* `errorFilter` - function to filter errors (for example of a specific type). Must return a truthy value when an error should impact the circuit breaker. Defaults to a function that always returns true.
* `trackingPeriod` - time in seconds to track errors before they fall off of the breaker state. Defaults to 60 (1 minute).
* `resetTimeout` - time in seconds to wait after the breaker has been opened to attempt closing it. Defaults to 300 (5 minutes).
* `activeThreshold` - Number of executions required to enable the circuit breaker. Defaults to 0.
* `tripThreshold` - percentage (0-100) of failures required to trip the breaker. Defaults to 0 (any failure trips the breaker).

### Concurrency Limit

`pipes.concurrency({ limit })`

* `limit` - number of items allowed to be executing (waiting for promise fulfillment) at once. Required.

### Log

`pipes.log({ logger })`

* `logger` - logger instance. Must implement `log(level, message, error)`. Required.
* `level` - log level. Defaults to `"info"`.

### Rate Limit

`pipes.rateLimit({ limit, interval })`

* `limit` - number of items allowed to execute in the specified time frame. Required.
* `interval` - time in seconds executions are counted before falling off the limit state. Defaults to 60 (1 minute).

### Repeat

`pipes.repeat({ until })`

* `until` - function that returns a promise. When that promise is fulfilled, repetition of the subsequent pipe is finished. Required.

**NOTE** `until` will be called _after_ the first execution of the subsequent pipeline succeeds.

### Rescue

`pipes.rescue({ rescuePipe, rescueContextFactory, errorFilter })`

* `rescuePipe` - pipeline to be called when subsequent pipe raises exception or Promise rejections. Required.
* `rescueContextFactory` - function which takes the error and pipe context and returns a context object passed to the rescue pipe. Defaults to `(context, error) => { context, error }`
* `errorFilter` - function to filter errors (for example of a specific type). Must return a truthy value when a pipeline should be rescued. Defaults to a function that always returns true.

### Retry

`pipes.retry({ times, interval, before })`

* `times` - number of times to retry. Defaults to 0 (infinite).
* `interval` - time in seconds to wait before executing a retry. Defaults to 1. Ignored if `before` is provided.
* `before` - function called before each retry occurs. Use to implement an exponential retry, for example. _Must_ return a promise to be fulfilled before retry occurs.
* `errorFilter` - function to filter errors (for example of a specific type). Must return a truthy value when a pipeline should be retried. Defaults to a function that always returns true.


## Credits

* Heavily inspired by https://github.com/phatboyg/GreenPipes
