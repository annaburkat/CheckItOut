const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const placeSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Please enter a name"],
      unique: true
    },
    category: {
      type: String,
      required: [true, "Please enter category"],
      enum: {
        values: ['cinema', 'cafe', 'pub', 'restaurant', 'museum', 'outdoor'],
        messages: 'You can add only: cinema, cafe, shop, restaurant, museum.'
      }
    },
    address: String,
    city:  {
      type: String,
      required: [true, "Please enter city"]
    },
    country:   {
      type: String,
      required: [true, "Please enter country"]
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Please enter short description"],
      min: [1, 'Rating must be above 1 or equal'],
      max: [10, 'Rating must be below or equal 10']
    },
    slug: String,
    contact: {
      type: String
    },
    fb: {
      type: String,
      trim: true
    },
    instagram: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    opening: {
      type: String
    },
    ratingsAverage: {
      type: Number,
      default: 5,
      min: [1, 'Rating must be above 1 or equal'],
      max: [10, 'Rating must be below or equal 10'],
      set: val => Math.round(val)
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    priceRange: {
      type: String,
      enum: {
        values: ['low', 'high', 'middle'],
        messages: 'You can add only: middle, high, low.'
      }
    },
    averagePrice: {
      type: Number
    },
    imageCover:  {
      type: String,
      required: [true, "Please enter image"]
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    secretPlace: {
      type: Boolean,
      default: false
    },
    redactors: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }]
  },
  //options for schema
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

//INDEXING
placeSchema.index({
  slug: 1
});

//virtual populate Place with Review
placeSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'place',
  localField: '_id'
});

placeSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {
    lower: true
  });
  next();
});

//QUERY MIDDLEWARE
placeSchema.pre('find', function(next) {
  this.find({
    secretPlace: {
      $ne: true
    }
  });

  this.start = Date.now();
  next();
});

placeSchema.pre('findOne', function(next) {
  this.find({
    secretPlace: {
      $ne: true
    }
  });
  next();
});

placeSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'redactors',
    select: '-__v'
  });
  next();
});

//AGGREGATION middlware
placeSchema.pre('aggregate', function(next) {
  //excluding places filter in aggregation
  this.pipeline().unshift({
    $match: {
      secretPlace: {
        $ne: true
      }
    }
  });
  next();
});

const Place = mongoose.model('Place', placeSchema);

module.exports = Place;