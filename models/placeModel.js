const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');

const placeSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Please enter a name"],
      unique: true,
      maxlength: [100, 'The name is too long - it should be shorter or equal 100 characters but not shorter than one character'],
      minlength: [1, 'The name is too short - it should be longer or equal 1 character but not longer than 100 characters']
      // validate: [validator.isAlpha, 'Place name should only contains characters']
    },
    category: {
      type: String,
      required: [true, "Please enter category"],
      enum: {
        values: ['cinema', 'cafe', 'shop', 'restaurant', 'museum'],
        messages: 'You can add only: cinema, cafe, shop, restaurant, museum.'
      }
    },
    location: {
      //GeoJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      city: String,
      country: String
    },
    description: {
      type: String,
      trim: true
    },
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
      max: [10, 'Rating must be below or equal 10']
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
    kidFriendly: {
      type: Boolean,
      default: false
    },
    imageCover: {
      type: String,
      required: [true, "Place should have an image"]
    },
    likes: {
      type: Number
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    slug: String,
    secretPlace: {
      type: Boolean,
      default: false
    },
    // redactors: Array
    redactors: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }]
  }
  // //options for schema
  // {
  //   toJSON: {virtual: true},
  //   toObject: {virtual: true}
  // }
);

//when you want to have something in schema, which is coming from calculation like changing km to cm 103
// //count duration in weeks
// placeSchema.virtual('durationWeeks').get(function(){
//   return this.duration/7;
// });

//DOCUMENT Middlware/hook 104
//It runs before save and create
//middlware which will run before
placeSchema.pre('save', function(next) {
  //this = currently processed document
  this.slug = slugify(this.name, {
    lower: true
  });
  next();
});

// //embeding REDACTORS
// placeSchema.pre('save', async function(next) {
//   //this = currently processed document
//   const redactorPromises = this.redactors.map(async id=> await User.findById(id));
//   this.redactors =  await Promise.all(redactorPromises);
//   next();
// });

//QUERY MIDDLEWARE
//what shoould happen before
// placeSchema.pre(/^find/, function(next) {
placeSchema.pre('find', function(next) {
  //this = current query
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

placeSchema.pre(/^find/, function(next){
  this.populate({
    path: 'redactors',
    select: '-__v'
  });
  next();
});

//AGGREGATION middlware
placeSchema.pre('aggregate', function(next) {
  //this = current aggregation object
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