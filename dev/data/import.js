const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Place = require('./../../models/placeModel');
dotenv.config({
  path: './config.env'
});

const database = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

//conect with live db
mongoose.connect(database, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(connection => console.log(connection.connections));

//Read json
const places = JSON.parse(fs.readFileSync(`${__dirname}/places.json`, 'utf-8'));

//Import data
const importData = async () => {
  try {
    await Place.create(places);
    console.log('Data LOADED!!!!!!!!!!!!');
  } catch (err) {
    console.log(err);
  }
};

//delete data from db
const deleteData = async () => {
  try {
    await Place.deleteMany({});
    console.log('Data DELETED!!!!!!!!!!!!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if(process.argv[2]==='--import') {
  importData();
} else if(process.argv[2]==='--delete') {
  deleteData();
};

console.log(process.argv);