const express = require('express');
// const fs = require('fs');
// const placeController = require('./../controllers/placeController.js');
const reviewRouter = require('./reviewRoutes.js');

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


const router = express.Router();

router.use('/:placeID/reviews', reviewRouter);

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
  .route('/:id')
  .get(getOnePlace)
  .delete(protectRoutes, restrictRoutes('admin', 'redactor'), deletePlace)
  .patch(updatePlace);


module.exports = router;