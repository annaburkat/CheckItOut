const express = require('express');

const {
  getAllReviews,
  getOneReview,
  createReview,
  updateReview,
  deleteReview,
  setUserPlaceDetails
} = require('./../controllers/reviewController');

const {
  protectRoutes,
  restrictRoutes
} = require('./../controllers/authenticationController');

const router = express.Router({
  mergeParams: true
});

router
  .route('/')
  .get(protectRoutes, getAllReviews)
  .post(
    protectRoutes,
    restrictRoutes('user'),
    setUserPlaceDetails,
    createReview);


router
  .route('/:id')
  .delete(deleteReview)
  .patch(updateReview)
  .get(getOneReview);

module.exports = router;