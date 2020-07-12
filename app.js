const express = require('express');
const morgan = require('morgan');
// const winston = require('winston');
//winston
// https://github.com/jstevenperry/IBM-Developer/tree/master/Node.js/Course/Unit-10

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const placesRouter = require('./routes/placeRoutes');
const usersRouter = require('./routes/userRoutes');

const app = express();

// Middlwares - middlware is a function which can modify incoming request data
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes - mounting routers
app.use('/api/v1/places', placesRouter);
app.use('/api/v1/users', usersRouter);

//for all http methods/verbs - in case the url is wrong
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Error handling middlware
app.use(globalErrorHandler);

module.exports = app;