const repeatFilter = ({
  until
}) => {
  const filter = async (context, next) => {
    let done = false;
    const setDone = () => done = true;
    let first = true;
    let res;
    while (!done){
      res = await next(context);
      if (first) {
        until(context).then(setDone).catch(setDone);
        first = false;
      }
    }
    return res;
  };

  filter.inspect = () => ({
    type: 'repeat'
  });

  return filter;
};

module.exports = repeatFilter;
