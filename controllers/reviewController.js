const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// getallreviews / createreview
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  res.status(200)
    .json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews
      }
    });
});

exports.createReview = catchAsync(async (req, res, next) => {
  //nested routs: place + user
  if (!req.body.place) {
    req.body.place = req.params.placeID;
  };
  if (!req.body.user) {
    req.body.user = req.user.id;
  };

  const newReview = await Review.create(req.body);

  res.status(200)
    .json({
      status: 'success',
      data: {
        review: newReview
      }
    });
});

// exports.getOneReview = catchAsync(async (req, res, next) => {
//   const review = await Review.find(req.params.reviewID);
//
//   if (!review) {
//     return next(new AppError('There is no such a review!', 404));
//   }
//
//   res.status(200).json({
//     status: 'success',
//     data: {
//       review
//     }
//   });
// });

// exports.updateReview = catchAsync(async (req, res, next) => {
//   const updatedReview = await Review.findByIdAndUpdate(req.params.reviewID, req.body, {
//     new: true,
//     runValidators: true
//   });
//
//   if (!updatedReview) {
//     return next(new AppError('There is no such a review!', 404));
//   }
//
//   res.status(200).json({
//     status: 'success',
//     data: {
//       updatedReview
//     }
//   });
// });
//
// exports.deleteReview = catchAsync(async (req, res, next) => {
//   const deletedReview = await Review.findByIdAndDelete(req.params.reviewID);
//
//   if (!deletedReview) {
//     return next(new AppError('There is no such a review so we cannot really delete it, righto?', 404));
//   }
//
//   res.status(200).json({
//     status: 'success',
//     message: 'Review successfully removed.',
//     data: null
//   });
// });