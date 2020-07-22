const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitize = require('express-mongo-sanitize');
const expAutoSan = require('express-autosanitizer');
const hpp = require('hpp');
// const winston = require('winston');
//winston
// https://github.com/jstevenperry/IBM-Developer/tree/master/Node.js/Course/Unit-10

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');
const placesRouter = require('./routes/placeRoutes');
const usersRouter = require('./routes/userRoutes');
const san = require('./routes/userRoutes');

const app = express();

//Global middlware
//Set additional security HTTP headers
app.use(helmet());


// Middlwares - middlware is a function which can modify incoming request data
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

//SANITAZATION
//Data sanitazation against NoSQL injection
//protect us from queries with $ signs and similar
app.use(sanitize());

//Data sanitazation against XSS
// //malicious html & js code
app.use(expAutoSan.allUnsafe);

//Prevent parameter pollution
app.use(hpp({
  whitelist:  ['ratingsAverage', 'averagePrice', 'likes', 'category', 'country', 'city']
}));

//Serving static files
app.use(express.static(`${__dirname}/public`));

//Test middlware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes - mounting routers
app.use('/api/v1/places', placesRouter);
app.use('/api/v1/users', usersRouter);

//catch all methodes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;