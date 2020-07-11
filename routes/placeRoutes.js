const express = require('express');
const fs = require('fs');
// const placeController = require('./../controllers/placeController.js');
const {getAllPlaces, createPlace, getOnePlace, deletePlace, updatePlace, validatePlaceID, validateNewPlaceBody, aliasTopTours} = require('./../controllers/placeController.js');

const router = express.Router();

// router.param('placeID', validatePlaceID);
router
  .route('/top-five-cheap')
  .get(aliasTopTours, getAllPlaces);

router
  .route('/')
  .get(getAllPlaces)
  .post(createPlace);

router
  .route('/:placeID')
  .get(getOnePlace)
  .delete(deletePlace)
  .patch(updatePlace);

module.exports = router;