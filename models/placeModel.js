const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a name"],
    unique: true
  },
  category: {
    type: String,
    required: [true, "Please enter category"]
  },
  country: {
    type: String,
    required: [true, "Please enter a country"]
  },
  city: {
    type: String,
    required: [true, "Please enter a city"]
  },
  address: {
    type: String,
    required: [true, "Please enter an address"]
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
    default: 4.5
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  priceRange: {
    type: String
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
});

const Place = mongoose.model('Place', placeSchema);

module.exports = Place;