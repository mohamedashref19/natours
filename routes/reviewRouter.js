const express = require('express');
const reviewControl = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const bookingcontroller = require('../controllers/bookingcontroller');

const router = express.Router({ mergeParams: true });
//POST tour/tourID/review
//GET tour/tourID/review
//post review
router.use(authController.protect);
router
  .route('/')
  .get(reviewControl.allReview)
  .post(
    authController.restrictTO('user'),
    reviewControl.settouransuserId,
    bookingcontroller.checkifBoooking,
    reviewControl.createReview
  );
router
  .route('/:id')
  .get(reviewControl.getReview)
  .patch(
    authController.protect,
    authController.restrictTO('user', 'admin'),
    reviewControl.checkIfAuthor,
    reviewControl.updateReview
  )
  .delete(
    authController.protect,
    authController.restrictTO('user', 'admin'),
    reviewControl.checkIfAuthor,
    reviewControl.deletereview
  );

module.exports = router;
