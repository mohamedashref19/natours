const express = require('express');
const userControll = require('../controllers/userController');
const authcontroller = require('../controllers/authController');
const bookingRouter = require('./bookingRouter');

const router = express.Router();
// router.use((req, res, next) => {
//   console.log('Middleware 2: Request reached userRouter');
//   next();
// });

router.use('/:userId/bookings', bookingRouter);
router.get('/confirmEmail/:token', authcontroller.signupconfirm);
// router.get('/api/v1/users/signup/:token', authcontroller.signupconfirm);

router.post('/signup', authcontroller.signup);
router.get('/signup/:token', authcontroller.signupconfirm);
router.post('/login', authcontroller.login);
router.get('/logout', authcontroller.logout);
router.post('/forgotpassword', authcontroller.forgetpassword);
router.patch('/resetpassword/:token', authcontroller.resetpassword);

router.use(authcontroller.protect);

router.patch(
  '/updatepassword',

  authcontroller.updatepassword
);
router.get(
  '/getMe',

  userControll.getMe,
  userControll.getUser
);
router.patch(
  '/updatemyDate',
  userControll.uploadimage,
  userControll.rezieuserimage,
  userControll.updateMe
);
router.delete('/deleteMe', authcontroller.protect, userControll.deleteMe);

router.use(authcontroller.restrictTO('admin'));

router.route('/').get(userControll.Allusers).post(userControll.CreateUser);
router
  .route('/:id')
  .get(userControll.getUser)
  .patch(userControll.UpdateUser)
  .delete(userControll.DeleteUser);

module.exports = router;
