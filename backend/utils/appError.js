export default function AppError (message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
  err.isOperational = true;
  Error.captureStackTrace(err, AppError)
  return err;
}