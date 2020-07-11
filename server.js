const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

const app = require('./app');

const database = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

//conect with live db
mongoose.connect(database, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(connection =>  console.log("connected"));
// }).then(connection =>  console.log(connection.connections));

// //conect with local db
// mongoose.connect(process.env.DATABASE_LOCAL, {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useFindAndModify: false
// }).then(connection =>  console.log(connection.connections));

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

