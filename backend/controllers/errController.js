import AppError from '../utils/appError.js';

// handling cast error
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return AppError(message, 400);
};

// handling duplicate field error
const handleDuplicateFieldDB = (err) => {
  const message = `duplicate name: ${err.keyValue.name}. Provide unique name`;
  return AppError(message, 400);
};

// handling validation error
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return AppError(message, 400);
};

// handling jwt error
const handleJsonWebTokenError = () =>
  AppError('invalid token, please log in again', 401);

// handle expired token error
const handleExpiredTokenError = () =>
  AppError('your token has expired, pls login again', 401);

// development errors
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// production erros
const sendErrorProd = (err, res) => {
  // error will be sent to client in production only
  // if isOperational == true
  // only trusted error messages will be sent to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // loggin error
    console.error('Error ❌', err);
    // programming or other unknown errors
    // that we don't want to send to the client
    res.status(500).json({
      status: 'error',
      message: 'something went wrong :(',
    });
  }
};

const globalErrorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // making copy of err
    let error = err;

    // handling castError: error due to invalid ID
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    // handling duplicate field
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    // handling validation error
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    // handling jsonwebtoken error
    if (error.name === 'JsonWebTokenError')
      error = handleJsonWebTokenError();
    // handling expired token error
    if (error.name === 'TokenExpiredError')
      error = handleExpiredTokenError();

    sendErrorProd(error, res);
  }
};

export default globalErrorMiddleware;
