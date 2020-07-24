const express = require('express');
// const fs = require('fs');
// const placeController = require('./../controllers/placeController.js');
const {
  getAllPlaces,
  createPlace,
  getOnePlace,
  deletePlace,
  updatePlace,
  validatePlaceID,
  validateNewPlaceBody,
  aliasTopTours,
  getPlaceStats
} = require('./../controllers/placeController');

const {
  protectRoutes,
  restrictRoutes
} = require('./../controllers/authenticationController');

const {
  createReview
} = require('./../controllers/reviewController.js');

const router = express.Router();

// router.param('placeID', validatePlaceID);
router
  .route('/top-five-cheap')
  .get(aliasTopTours, getAllPlaces);

router
  .route('/place-stats')
  .get(getPlaceStats);

router
  .route('/')
  .get(protectRoutes, getAllPlaces)
  .post(createPlace);

router
  .route('/:placeID')
  .get(getOnePlace)
  .delete(protectRoutes, restrictRoutes('admin', 'redactor'), deletePlace)
  .patch(updatePlace);

router
  .route('/:placeID/reviews')
  .post(protectRoutes, restrictRoutes('user'), createReview);


module.exports = router;