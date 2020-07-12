const Place = require('./../models/placeModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

//concept of showing extra features on your website
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '=-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulties';
  next();
};

//Places
exports.getAllPlaces = catchAsync(async (req, res, next) => {
  // execute query
  const features = new APIFeatures(Place.find(), req.query)
    .filtering()
    .sorting()
    .limiting()
    .paginating();

  const places = await features.query;
  // const places = await finalQuery;

  //send response
  res.status(200).json({
    status: 'success',
    results: places.length,
    data: {
      places
    }
  });
});

exports.getOnePlace = catchAsync(async (req, res, next) => {
  // const place = await Place.findOne({
  //   _id: req.params.id
  // });
  const place = await Place.findById(req.params.id);
  // const place = await Place.findById(req.params.placeID);

  //404 error
  if (!place) {
    return next(new AppError('Place with given ID not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      place
    }
  });
});

exports.createPlace = catchAsync(async (req, res, next) => {
  const newPlace = await Place.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      place: newPlace
    }
  });
});

exports.updatePlace = catchAsync(async (req, res, next) => {
  const place = await Place.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  //404 error
  if (!place) {
    return next(new AppError('Place with given ID not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
       place
    }
  });
});

exports.deletePlace = catchAsync(async (req, res, next) => {
  const place = await Place.findByIdAndDelete(req.params.id);

  //404 error
  if (!place) {
    return next(new AppError('Place with given ID not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

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