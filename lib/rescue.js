const rescueFilter = ({
  rescuePipe,
  rescueContextFactory = (context, error) => ({ context, error }),
  errorFilter = () => true,
}) => {
  const filter = async (context, next) => {
    try {
      return await next(context);
    } catch (error) {
      if (!errorFilter(error)) {
        throw error;
      }
      return await rescuePipe.send(rescueContextFactory(context, error));
    }
  };

  filter.inspect = () => ({
    type: "rescue",
  });

  return filter;
};

module.exports = rescueFilter;
