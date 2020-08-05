const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitize = require('express-mongo-sanitize');
const expAutoSan = require('express-autosanitizer');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// const winston = require('winston');
//winston
// https://github.com/jstevenperry/IBM-Developer/tree/master/Node.js/Course/Unit-10

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');
const placeRouter = require('./routes/placeRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();
app.use(cors({ credentials: true }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Methods", ["PUT", "DELETE", "GET", "PATCH", "PUT"]);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  req.header("Access-Control-Allow-Credentials", true);
  next();
});

//Global middlwares
//additional security HTTP headers
app
  .use(helmet());

//Development login
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
};

//Limiting number of requests from the sane IP address
const limiter = rateLimit({
  max: 100,
  windowMs: 3600000,
  message: 'Attention! Too many requests from this IP address, please try in one hour.'
});
if (process.env.NODE_ENV !== 'development') {
  app.use('/api', limiter);
};

//Reading data from body into req.body
app.use(express.json({
  limit: '20kb'
}));
app.use(cookieParser());

//SANITAZATION
//Data sanitazation against NoSQL injection
app.use(sanitize());

//Data sanitazation against XSS
app.use(expAutoSan.allUnsafe);

//Prevent parameter pollution
app.use(hpp({
  whitelist: ['ratingsAverage', 'averagePrice', 'category', 'country', 'city']
}));

//Serving static files
app.use(express.static(`${__dirname}/public`));

//Test middlware
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// Routes - mounting routers
app.use('/api/v1/places', placeRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//catch all methodes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;