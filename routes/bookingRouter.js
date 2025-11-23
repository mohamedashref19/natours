const express = require('express');
const bookingcontroller = require('../controllers/bookingcontroller');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router.get(
  '/checkout-session/:tourId/:dateId',

  bookingcontroller.checkoutsession
);
router.get('/available-dates/:tourId', bookingcontroller.getAvailableDates);
router.use(authController.restrictTO('admin', 'lead-guide'));
router
  .route('/')
  .get(bookingcontroller.sendTourandUserId, bookingcontroller.getAllbookings)
  .post(bookingcontroller.createBooking);
router
  .route('/:id')
  .get(bookingcontroller.getbooking)
  .patch(bookingcontroller.updatebooking)
  .delete(bookingcontroller.deletebooking);
module.exports = router;
