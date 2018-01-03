let pimpl = Promise;

const utils = {
  // be careful when using delay, as it will prevent garbage collection
  // of anything in scope for the entire call stack
  // NEVER have a delay callback create another delay promise - that will create a memory leak.
  delay: (timeout) => new Promise((res) => setTimeout(res, timeout)),
  usePromiseImplementation: (impl) => pimpl = impl,
  getPromiseImplementation: () => pimpl
};

module.exports = utils;
