//we will pass some function in it to catch error
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

