const filters = require('./lib');
const { usePromiseImplementation, getPromiseImplementation } = require('./lib/util');

const pipeFactory = (...middleware) => {
  let pimpl = getPromiseImplementation();

  const pwrap = (fn, ...args) => {
    let res;
    try {
      res = fn(...args);
    } catch(ex) {
      return pimpl.reject(ex);
    }
    if (typeof(res.then) === 'function') {
      return res;
    }
    return pimpl.resolve(res);
  };

  return {
    send(context) {
      const step = idx => ctx =>
        idx < middleware.length
          ? pwrap(middleware[idx], ctx, step(idx + 1))
          : pimpl.resolve(ctx);

      return step(0)(context);
    },
    inspect() {
      return {
        pipeline: middleware.map(m => typeof(m.inspect) === 'function' ? m.inspect() : 'Unknown Filter')
      };
    }
  };
};

pipeFactory.usePromiseImplementation = usePromiseImplementation;

Object.assign(pipeFactory, filters);

module.exports = pipeFactory;
