const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingcontroller = require('../controllers/bookingcontroller');

const router = express.Router();
router.get('/login', viewController.getLoginForm);
router.get('/signup', viewController.getSignForm);
router.get('/confirmEmail/:token', authController.signupconfirm);
router.get(
  '/',

  authController.isLoggin,
  viewController.getOverview
);

router.get(
  '/my-booking',
  authController.protect,
  bookingcontroller.createBookingCheckout,
  viewController.getmyBooking
);

router.get('/my-reviews', authController.protect, viewController.getmyReview);

router.get('/tour/:slug', authController.isLoggin, viewController.getTour);
router.get('/me', authController.protect, viewController.getuserAccount);
router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateuserdata
);

router.get('/billing', authController.protect, viewController.getBilling);
router.get(
  '/invoice/:bookingId',
  authController.protect,
  viewController.downloadInvoice
);

router.use(authController.protect, authController.restrictTO('admin'));
router.get('/mange-tours', viewController.mangetour);
router.get('/mange-users', viewController.mangeuser);
router.get(
  '/manage-reviews',

  viewController.getManageReviewsTours
);
router.get(
  '/manage-reviews/:tourId',

  viewController.getTourReviews
);
router.get(
  '/mange-bookings',

  viewController.mangebooking
);

module.exports = router;
