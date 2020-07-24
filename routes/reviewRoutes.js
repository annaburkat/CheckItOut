const express = require('express');

const {
  getAllReviews,
  getOneReview,
  createReview,
  updateReview,
  deleteReview
} = require('./../controllers/reviewController');

const {
  protectRoutes,
  restrictRoutes
} = require('./../controllers/authenticationController');

const router = express.Router();

router
  .route('/')
  .get(protectRoutes, getAllReviews)
  .post(protectRoutes, restrictRoutes('user'), createReview);

// router
//   .route('/:reviewID')
//   .get(getOneReview)
//   .patch(updateReview)
//   .delete(deleteReview);


// module.exports = router;
//
// const express = require('express');
// const reviewController = require('../controllers/reviewController');
//
// const router = express.Router();
//
// router.route('/').get(getAllReviews);
// router.route('/').post(createReview);

module.exports = router;