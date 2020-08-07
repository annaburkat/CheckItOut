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
  getPlaceStats,
  getCities
} = require('./../controllers/placeController');

const {
  protectRoutes,
  restrictRoutes
} = require('./../controllers/authenticationController');


const router = express.Router();

router.use('/:placeID/reviews', reviewRouter);

router
  .route('/getCities')
  .get(
    getCities
  );

router
  .route('/top-six')
  .get(
    aliasTopTours,
    getAllPlaces
  );

router
  .route('/')
  .get(
    protectRoutes,
    getAllPlaces
  )
  .post(
    protectRoutes,
    createPlace
  );

router
  .route('/:id')
  .get(
    protectRoutes,
    getOnePlace
  )
  .delete(
    protectRoutes,
    restrictRoutes('admin'),
    deletePlace
  )
  .patch(
    updatePlace
  );

router
  .route('/place-stats')
  .get(getPlaceStats);


module.exports = router;