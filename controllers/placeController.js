const fs = require('fs');
const Place = require('./../models/placeModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const functionsHandler = require('./functionsHandler');


//Top 6 places
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '6';
  req.query.sort = '-ratingsAverage';
  next();
};

//get all places
exports.getCities = (req, res, next) => {
  Place.find({}, 'city', function(error, allCities) {
    const data = [];
    for(let city of allCities){
      if(!data.includes(city.city) && city.city !== null && city.city !== undefined){
        data.push(city.city);
      }
    }
    res.status(200).json({
      status: 'success',
      data
    });
  });
  next();
};


//Places
exports.getAllPlaces = functionsHandler.getAll(Place);
exports.getOnePlace = functionsHandler.getOne(Place, {
  path: 'reviews'
});
exports.createPlace = functionsHandler.createOne(Place);
exports.updatePlace = functionsHandler.updateOne(Place);
exports.deletePlace = functionsHandler.deleteOne(Place);
exports.getPlaceStats = catchAsync(async (req, res, next) => {
  //mongodb feature - mongoose
  const stats = await Place.aggregate([{
      $match: {
        ratingsAverage: {
          $gte: 1
        }
      }
    },
    {
      $group: {
        // _id: null,
        _id: {
          $toUpper: "$category"
        },
        // _id: "$country",
        numOfPlaces: {
          $sum: 1
        },
        numOfRatings: {
          $sum: '$ratingsQuantity'
        },
        avgRating: {
          $avg: '$ratingsAverage'
        },
        avgPrice: {
          $avg: '$averagePrice'
        },
        minPrice: {
          $min: '$averagePrice'
        },
        maxPrice: {
          $max: '$averagePrice'
        }
      }
    },
    {
      $sort: {
        avgPrice: -1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});