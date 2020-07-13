const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  //400 bad request
  return new AppError(message, 400);
}

const handleDuplicatedDB = err => {
  const message = `Duplicated place name: name ${err.keyValue.name} is already taken.`;
  //400 bad request
  return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid data: ${errors.join(' | ')}`;
  //400 bad request
  return new AppError(message, 400);
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err
  });
}

const sendErrorProd = (err, res) => {
  //for opoational  errors we managed ourselves
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    //extrernal errors, random programic error
    //log to concole for developer
    //add some library
    console.error('Something went wrong ERROR!!!!!!!!!!!!!!!');

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong, please try again later'
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';


  //distinguish between dev and prod
  if (process.env.NODE_ENV === 'development') {
    // console.log(err.name);
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {

    let error = Object.assign(err);

    if (error.code === 11000) {
      error = handleDuplicatedDB(error);
    }

    if (error.name === "CastError") {
      error = handleCastErrorDB(error);
    }

    if (error.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    }

    sendErrorProd(error, res);
  };
};