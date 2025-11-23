const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// exports.allReview = catchAsync(async (req, res, next) => {
//   let fillter = {};
//   if (req.params.tourId) fillter = { tour: req.params.tourId };
//   const reviews = await Review.find(fillter);

//   res.status(200).json({
//     status: 'success',
//     result: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

// exports.getReview = catchAsync(async (req, res, next) => {
//   const review = await Review.findById(req.params.id);
//   if (!review) {
//     return next(new AppError('there is no review with id', 404));
//   }

//   res.status(200).json({
//     status: 'Success',
//     data: {
//       review,
//     },
//   });
// });
exports.settouransuserId = (req, res, next) => {
  //Allow nested route
  if (!req.body.tour) req.body.tour = req.params.tourId;
  req.body.user = req.user.id;
  next();
};
exports.checkIfAuthor = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }
  if (!review.user) {
    if (req.user.role === 'admin') return next();

    return next(
      new AppError('The user who wrote this review no longer exists.', 403)
    );
  }
  if (req.user.role === 'admin') {
    return next();
  }

  const reviewAuthorId = review.user._id
    ? review.user._id.toString()
    : review.user.toString();
  // if (req.user.role === 'admin') {
  //   return next();
  // }

  // if (review.user.toString() !== req.user.id) {
  //   return next(
  //     new AppError(`You do not have permission to perform this action`, 403)
  //   );
  // }

  if (reviewAuthorId !== req.user.id) {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
  }
  next();
});
exports.allReview = factory.getAll(Review);
exports.getReview = factory.getone(Review);
exports.createReview = factory.createone(Review);
exports.updateReview = factory.updateone(Review);
exports.deletereview = factory.deleteone(Review);
// exports.createReview = catchAsync(async (req, res, next) => {
//   //Allow nested route
//   if (!req.body.tour) req.body.tour = req.params.tourId;
//   req.body.user = req.user.id;
//   const newReview = await Review.create(req.body);

//   res.status(201).json({
//     status: 'Success',
//     data: {
//       review: newReview,
//     },
//   });
// });

// exports.updateReview = catchAsync(async (req, res, next) => {
//   const review = await Review.findById(req.params.id);
//   if (!review) {
//     return next(new AppError('No review found with that ID', 404));
//   }
//   if (review.user.id.toString() !== req.user.id) {
//     return next(
//       new AppError('You do not have permission to perform this action', 403)
//     );
//   }
//   const updatereview = await Review.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   res.status(200).json({
//     status: 'success',
//     data: {
//       review: updatereview,
//     },
//   });
// });

// exports.deletereview = catchAsync(async (req, res, next) => {
//   const review = await Review.findById(req.params.id);
//   if (!review) {
//     return next(new AppError('there is no review with this id'));
//   }
//   if (review.user.id.toString() !== req.user.id) {
//     return next(
//       new AppError('You do not have permission to perform this action', 403)
//     );
//   }
//   await Review.findByIdAndDelete(req.params.id);
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });
