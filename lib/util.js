let pimpl = Promise;

const utils = {
  delay: (timeout) => new Promise((res) => setTimeout(res, timeout)),
  usePromiseImplementation: (impl) => pimpl = impl,
  getPromiseImplementation: () => pimpl
};

module.exports = utils;
