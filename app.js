const express = require('express');
const morgan = require('morgan');
const winston = require('winston');
//winston
// https://github.com/jstevenperry/IBM-Developer/tree/master/Node.js/Course/Unit-10

const placesRouter = require('./routes/placeRoutes');
const usersRouter = require('./routes/userRoutes');

const app = express();

// Middlwares - middlware is a function which can modify incoming request data
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from middlware1');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});


// Routes - mounting routers
app.use('/api/v1/places', placesRouter);
app.use('/api/v1/users', usersRouter);


module.exports = app;








