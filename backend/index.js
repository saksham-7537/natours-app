import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import AppError from './utils/appError.js';
import globalErrorMiddleware from './controllers/errController.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);


// importing routers
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';

//global middleware

// set security HTTP headers
// app.use(helmet());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow images from other origins
  })
);


// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //morgan
}

// limiting the number of request made by an ip in a particular time
// using the rateLimit library i.e npm i express-rate-limit
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'too many req from this ip, pls try again in an hour',
});
app.use('/api', limiter); // only for /api routes

app.use(express.json({ limit: '10kb' })); // body parser
app.use(cookieParser())

// data sanitization against NOSQL query injection
// npm i express-mongo-sanitize
// app.use(mongoSanitize())

// data sanitization againt XSS

app.use(express.static('./public')); // serving static files

// test middleware
app.use((req, res, next) => {
  next()
});

// routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter)

// response message for all unhandled routes!!
// wil come after all the routes
app.all('/{*any}', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can't find ${req.originalUrl}`
  // });
  next(AppError(`can't find ${req.originalUrl}`, 404));
});

// global error handling middleware
app.use(globalErrorMiddleware);

export default app;
