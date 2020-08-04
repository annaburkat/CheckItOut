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
    restrictRoutes('admin', 'redactor'),
    deletePlace
  )
  .patch(
    updatePlace
  );

router
  .route('/place-stats')
  .get(getPlaceStats);


module.exports = router;