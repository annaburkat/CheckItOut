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

// exports.aliasTopTours = (req, res, next) => {
//   req.query.limit = '5';
//   req.query.sort = '-ratingsAverage,price';
//   req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
//   next();
// };

//Places
exports.getAllPlaces = functionsHandler.getAll(Place);
exports.getOnePlace = functionsHandler.getOne(Place, {path: 'reviews'});
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
    // {
    //   //exclude some data
    //   $match: {
    //     _id: {$ne: 'CAFE'}
    //   }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});









// //Filter data by places open per month
// exports.getMonthlyPlan = async (req, res) => {
//   try {
//     const year = parseInt(req.params.year); // 2021
//
//     const plan = await Place.aggregate([
//       {
//         $unwind: '$startDates'
//       },
//       {
//         //select document - do query
//         $match: {
//           startDates: {
//             $gte: new Date(`${year}-01-01`),
//             $lte: new Date(`${year}-12-31`),
//           }
//         }
//       },
//       {
//         $group: {
//           _id: {
//             month: '$startDates'
//           },
//           numberPlacesStarts: {
//             $sum: 1
//           },
//           tours: {
//             $push: '$name'
//           }
//         }
//       },
//       {
//         $addField: {
//           month: '$_id'
//         }
//       },
//       {
//         $project: {
//           _id: 0
//         },
//         $sort: {
//           numberPlacesStarts: -1
//         }
//       }
//     ]);
//
//     res.status(200).json({
//       status: 'success',
//       data: {
//         plan
//       }
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'something went wrong',
//       message: err
//     });
//   }
// };



// //test with local data
// const places = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev/data/places.json`)
// );

// //Middlware to check if place with requested ID exists
// exports.validatePlaceID = (req, res, next, value) => {
//   if (parseInt(req.params.placeID) > places.length) {
//       return res.status(404).json({
//           status: 'fail',
//           message: 'no such a place'
//       });
//   }
//   next();
// };

// exports.validateNewPlaceBody = (req, res, next) => {
//   if (!req.body.name || !req.body.summary) {
//       return res.status(400).json({
//           status: 'fail',
//           message: 'New place missing name or summary'
//       });
//   }
//   next();
// }