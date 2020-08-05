const Review = require('../models/reviewModel');
const functionsHandler = require('./functionsHandler');

exports.setUserPlaceDetails = (req, res, next) => {
  if (!req.body.place) {
    req.body.place = req.params.placeID;
  };
  if (!req.body.user) {
    req.body.user = req.user.id;
  };
  next();
};

exports.getAllReviews = functionsHandler.getAll(Review);
exports.getOneReview = functionsHandler.getOne(Review);
exports.createReview = functionsHandler.createOne(Review);
exports.deleteReview = functionsHandler.deleteOne(Review);
exports.updateReview = functionsHandler.updateOne(Review);
