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
    max: [10, 'Rating must be below or equal 10']
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

reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'place',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // });
  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;