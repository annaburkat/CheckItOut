const fs = require('fs');
const Place = require('./../models/placeModel');


//concept of showing extra features on your website
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '=-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulties';

  next();
};

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // 1/ FILTERING
  filtering() {
    //  1A/ FILTERING
    const queryObj = {
      ...this.queryString
    };
    const ignoredFileds = ['sort', 'page', 'limit', 'fields'];
    ignoredFileds.forEach(x => delete queryObj[x]);

    //  1B/ ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  // 2/ SORTING
  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy)
    } else {
      // finalQuery = finalQuery.sort('name');
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  //
  // 3. DATA LIMITING
  limiting() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      //extra feature - not show some stuff
      //createdAt hidden in model
      this.query = this.query.select('-__v')
    }
    return this;
  }
  //
  // 4. PAGINTION
  paginating() {
    const page = parseInt(this.queryString.page) || 1;
    const limit = parseInt(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}


//Places
exports.getAllPlaces = async (req, res) => {
  try {
    // // building query
    // //  1A/ FILTERING
    // const queryObj = {...req.query};
    // const ignoredFileds = ['sort', 'page', 'limit', 'fields'];
    // ignoredFileds.forEach(x => delete queryObj[x]);
    //
    // //  1B/ ADVANCED FILTERING
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    //
    // let finalQuery = Place.find(JSON.parse(queryStr));
    //
    // // 2/ SORTING
    // if(req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   finalQuery = finalQuery.sort(sortBy)
    // } else {
    //   finalQuery = finalQuery.sort('name');
    //   // finalQuery = finalQuery.sort('-createdAt');
    // };
    //
    // // 3. DATA LIMITING
    // if(req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   finalQuery = finalQuery.select(fields);
    // } else {
    //     //extra feature - not show some stuff
    //     //createdAt hidden in model
    //     finalQuery = finalQuery.select('-__v')
    // };
    //
    // // 4. PAGINTION
    // const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 100;
    // const skip =  (page - 1) * limit;
    //
    // finalQuery = finalQuery.skip(skip).limit(limit);
    //
    // if(req.query.page) {
    //   const numberOfPlaces = await Place.countDocuments();
    //   if(skip >= numberOfPlaces) {
    //     throw new Error('This page does not exist');
    //   }
    // };

    // execute query
    const features = new APIFeatures(Place.find(), req.query)
      // .filtering()
      .sorting()
      .limiting()
      .paginating(0);

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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  };
};

exports.getOnePlace = async (req, res) => {
  try {
    const place = await Place.findOne({
      _id: req.params.placeID
    })
    // const place = await Place.findById(req.params.placeID)

    res.status(200).json({
      status: 'success',
      data: {
        place
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  };
};

exports.createPlace = async (req, res) => {
  try {
    const newPlace = await Place.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        place: newPlace
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.updatePlace = async (req, res) => {
  try {
    const updatedPlace = await Place.findByIdAndUpdate(req.params.placeID, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        place: updatedPlace
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  };
};

exports.deletePlace = async (req, res) => {
  try {
    const deletedPlace = await Place.findByIdAndDelete(req.params.placeID);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getPlaceStats = async (req, res) => {
  try {
    //mongodb feature - mongoose
    const stats = await Place.aggregate([{
        $match: {
          ratingsAverage: {
            $gte: 5
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
      },
      {
        //exclude some data
        $match: {
          _id: {$ne: 'CAFE'}
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'something went wrong',
      message: err
    });
  }
};




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