const express = require('express');
const tourControll = require('../controllers/tourControlles');
const authController = require('../controllers/authController');
// const reviewControl = require('../controllers/reviewController');
const revierRouter = require('./reviewRouter');
const AppError = require('../utils/appError');
const bookingRouter = require('./bookingRouter');
//Routes

// app.get('/api/v1/tours', tourControll.);
// app.post('/api/v1/tours', CreateTour);
// app.get('/api/v1/tours/:id', Tour);
// app.patch('/api/v1/tours/:id', UpdateTour);
// app.delete('/api/v1/tours/:id', DeleteTour);

const router = express.Router();
//POST tour/tourID/review
//get tour/tourID/review
//get tour/tourID/review/reviewID
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTO('user'),
//     reviewControl.createReview
//   );

router.use('/:tourId/reviews', revierRouter);
router.use('/:tourId/bookings', bookingRouter);

// router.param('id', tourControll.checkid);
// router.route('/error-test').get((req, res, next) => {
//   next(new AppError('This is a test error 💥', 400));
// });
router.get('/error-test', (req, res, next) => {
  next(new AppError('This is a forced error 💥', 400));
});

router
  .route('/top5-cheap')
  .get(tourControll.aliasToTour, tourControll.Alltours);

router.route('/month-plan/:year').get(tourControll.getMonthplan);

router
  .route('/tour-stats')
  .get(
    authController.protect,
    authController.restrictTO('admin', 'lead-guide', 'guide'),
    tourControll.getTourStats
  );
// /tours-within/:distance/center/:latlng/unit/:unit'
// /tours-within/:400/center/:33.776793, -118.376505/unit/:mi'
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourControll.gettourwithin);
// distance/33.779531, -118.373213/unit/mi
router.route('/distance/:latlng/unit/:unit').get(tourControll.getdistance);

router
  .route('/')
  .get(tourControll.Alltours)
  .post(
    authController.protect,
    authController.restrictTO('admin', 'lead-guide'),
    tourControll.uploadimage,
    tourControll.reszieimage,
    tourControll.formatCreateTourData,
    tourControll.CreateTour
  );
//.post(tourControll.checkbody, tourControll.CreateTour);
router
  .route('/:id')
  .get(tourControll.Tour)
  .patch(
    authController.protect,
    authController.restrictTO('admin', 'lead-guide'),
    tourControll.uploadimage,
    tourControll.reszieimage,
    tourControll.UpdateTour
  )
  .delete(
    authController.protect,
    authController.restrictTO('admin', 'lead-guide'),
    tourControll.DeleteTour
  );

module.exports = router;
