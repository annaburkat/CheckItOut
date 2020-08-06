const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({
  path: './config.env'
});


//catch uncaught exception - what will happen?
// https://nodejs.org/api/process.html#process_event_uncaughtexception
process.on('uncaughtException', (err, origin) => {
    console.log(err);
  fs.writeSync(
    process.stderr.fd,
    `Caught exception: ${err}\n |` +
    `Exception origin: ${origin}\n |` +
    `Application will crash in very soon!\n`
  );

  //stop application asap
  process.exit(1);

});

const app = require('./app');

const database = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

//conect with live db
mongoose.connect(database, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(connection => console.log('DB connection correct!'));
// .catch(err => console.log('ERROR DB'));
// }).then(connection =>  console.log(connection.connections));

// //conect with local db
// mongoose.connect(process.env.DATABASE_LOCAL, {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useFindAndModify: false
// }).then(connection =>  console.log(connection.connections));

// Start server
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});


//alternative to: // .catch(err => console.log('ERROR DB'));
// // https://nodejs.org/api/process.html#process_event_unhandledrejection
// process.on('unhandledRejection', (reason, promise) => {
//   console.log('Unhandled Rejection at:', promise, 'reason:', reason);
//   // Application specific logging, throwing an error, or other logic here
// server.close(() => {
//   process.exit(1);
// });
// });

process.on('unhandledRejection', (err) => {

  console.log(err.message, err.name);
  console.log('Application will crush really soon. Bye!');
  // Application specific logging, throwing an error, or other logic here

  process.exit(1);

});

