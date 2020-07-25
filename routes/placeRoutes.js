const express = require('express');
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
  .route('/')
  .get(getAllPlaces)
  .post(
    protectRoutes,
    restrictRoutes('admin', 'redactor'),
    createPlace
  );

router
  .route('/:id')
  .get(getOnePlace)
  .delete(
    protectRoutes,
    restrictRoutes('admin', 'redactor'),
    deletePlace
  )
  .patch(
    protectRoutes,
    restrictRoutes('admin', 'redactor'),
    updatePlace
  );

router
  .route('/top-five-cheap')
  .get(
    aliasTopTours,
    getAllPlaces
  );

router
  .route('/place-stats')
  .get(getPlaceStats);


module.exports = router;