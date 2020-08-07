const mongoose = require('mongoose');
const Place = require('./placeModel');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, "Please add some review."]
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be above 1 or equal'],
    max: [10, 'Rating must be below or equal 10'],
    required: [true, "Please rate this place"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  place: {
    type: mongoose.Schema.ObjectId,
    ref: 'Place',
    required: [true, 'Review is about place, add some place ;)']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review should be written by user - who are you? ;)']
  }
}, {
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});


reviewSchema.index({ place: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});


reviewSchema.statics.calcAvgRatings = async function(placeID) {

  const stats = await this.aggregate([{
      $match: {
        place: placeID
      }
    },
    {
      $group: {
        _id: '$place',
        nRating: {
          $sum: 1
        },
        avgRating: {
          $avg: '$rating'
        }
      }
    }
  ]);

  if (stats.length > 0) {
    await Place.findByIdAndUpdate(placeID, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcAvgRatings(this.place);
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAvgRatings(this.r.place);
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;