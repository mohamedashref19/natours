const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// const sendEmail = require('../utils/email');
const Email = require('../utils/email');

//const signAsync = promisify(jwt.sign);
const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
const createandsentToken = (user, statuscode, res) => {
  const token = signToken(user._id);
  // const token = await signAsync({ id: newUser._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRES_IN,
  // });
  const cookieOpetions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOpetions.secure = true;
  res.cookie('jwt', token, cookieOpetions);
  user.password = undefined;
  res.status(statuscode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
// exports.signup = catchAsync(async (req, res, next) => {
//   const newUser = await User.create({
//     name: req.body.name,
//     email: req.body.email,
//     password: req.body.password,
//     passwordconfirm: req.body.passwordconfirm,
//     // changepasswordAt: req.body.changepasswordAt,
//     role: req.body.role,
//   });
//   const url = `${req.protocol}://${req.get('host')}/me`;
//   await new Email(newUser, url).sendwelcome();
//   createandsentToken(newUser, 201, res);
// });

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordconfirm: req.body.passwordconfirm,
    // changepasswordAt: req.body.changepasswordAt,
    role: req.body.role,
  });
  // createandsentToken(newUser, 201, res);
  const validateToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: '30m',
  });
  // const validatedURL = `${req.protocol}://${req.get('host')}/api/v1/users/signup/${validateToken}`;

  // const message = `please validation your account click to URL ${validatedURL}`;
  try {
    // await sendEmail({
    //   email: newUser.email,
    //   subject: 'confirm your account. Vaild for 30 minute only',
    //   message,
    // });
    const validatedURL = `${req.protocol}://${req.get('host')}/confirmEmail/${validateToken}`;
    await new Email(newUser, validatedURL).sendemailconfirm();
    res.status(200).json({
      status: 'success',
      message: 'Validation token sent to email!',
    });
  } catch (err) {
    // console.error('--- 📧 SENDGRID FAILED! ---', err);
    return next(new AppError('Error sending email. Try again later.', 500));
  }

  // const token = await signAsync({ id: newUser._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRES_IN,
  // });
});
exports.signupconfirm = catchAsync(async (req, res, next) => {
  //1)get token and vailated it
  const decode = await promisify(jwt.verify)(
    req.params.token,
    process.env.JWT_SECRET
  );
  //2)check and search user
  const user = await User.findById(decode.id).select('+validated');
  if (!user) {
    return next(new AppError('User for this Token not exsit', 401));
  }
  if (user.validated) {
    return next(new AppError('This account has already been validated', 400));
  }
  //3)Validation account
  user.validated = true;
  await user.save({ validateBeforeSave: false });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(user, url).sendwelcome();
  createandsentToken(user, 200, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const MAX_LOGIN_ATTEMPTS = 10;
  const LOCK_TIME = 60 * 1000 * 60;
  if (!email || !password) {
    return next(new AppError('provide email or password', 400));
  }
  const user = await User.findOne({ email }).select(
    '+password +passwordAttempts +lockUntil +validated'
  );
  //const correct = await user.correctpassword(password, user.password);
  if (!user) {
    return next(new AppError('email or password is worng', 401));
  }
  if (!user.validated) {
    return next(
      new AppError(
        'Please check your email to validate your account first ',
        401
      )
    );
  }

  if (user.lockUntil && user.lockUntil > Date.now()) {
    return next(
      new AppError('Account locked. Please try again in an hour.', 401)
    );
  }
  if (!(await user.correctpassword(password))) {
    user.passwordAttempts += 1;
    if (user.passwordAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = Date.now() + LOCK_TIME;
    }
    await user.save({ validateModifiedOnly: true });
    return next(new AppError('email or password is worng', 401));
  }
  user.lockUntil = undefined;
  user.passwordAttempts = 0;
  await user.save({ validateModifiedOnly: true });
  createandsentToken(user, 200, res);
});

exports.logout = (req, res) => {
  // res.cookie('jwt', 'loggout', {
  //   expires: new Date(Date.now() + 10 * 1000),
  //   httpOnly: true,
  // });
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  // res.clearCookie('jwt');
  res.status(200).json({
    status: 'success',
  });
};
exports.protect = catchAsync(async (req, res, next) => {
  //Noise Filter
  if (
    req.originalUrl.endsWith('.map') ||
    req.originalUrl.endsWith('.js') ||
    req.originalUrl.endsWith('.css') ||
    req.originalUrl.startsWith('/.well-known') ||
    req.originalUrl.endsWith('.ico')
  ) {
    return res.status(404).end();
  }
  //1)getting token and check if there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // if (!token) {
  //   return next(new AppError('you are not logged in please log in', 401));
  // }
  if (!token || token === 'loggout') {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  //2) verifiaction token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3)check user is exists
  const currentuser = await User.findById(decode.id);
  if (!currentuser) {
    return next(
      new AppError('user is belogging token is deleted and not exsits', 401)
    );
  }
  //4)check user change password after token is issued
  if (currentuser.changepassword(decode.iat)) {
    return next(
      new AppError('you recently change password please log in again', 401)
    );
  }
  req.user = currentuser;
  res.locals.user = currentuser;
  next();
});
//for user only , no errors

exports.isLoggin = async (req, res, next) => {
  if (!req.cookies.jwt || req.cookies.jwt === 'loggout') {
    return next();
  }
  try {
    const decode = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    const currentUser = await User.findById(decode.id);
    if (!currentUser) return next();

    if (currentUser.changepassword(decode.iat)) return next();

    res.locals.user = currentUser;
    next();
  } catch (err) {
    return next();
  }
};

exports.restrictTO =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError('You are not logged in to access this feature.', 401)
      );
    }
    // roles['admin','lead-guid'] role['user']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you do not have permission to do this action', 403)
      );
    }
    next();
  };

exports.forgetpassword = catchAsync(async (req, res, next) => {
  //1)get user based on post email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there is no user with email user enter', 404));
  }
  //2)generate random reset token
  const randomToken = user.createresetpasswordToken();
  await user.save({ validateModifiedOnly: true });
  //3)send it user email
  // const message = `forget your password? not problem submit patch request to link and enter password and confirm password to ${ResetURL}\nif you do not forget ignore this message`;
  try {
    const ResetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${randomToken}`;
    // await sendEmail({
    //   email: user.email,
    //   subject: 'reset password url vaild to 10 minute',
    //   message,
    // });
    await new Email(user, ResetURL).sendpasswordResent();
    res.status(200).json({
      status: 'success',
      message: 'reset token sent to your email',
    });
  } catch (err) {
    // console.error('--- 📧 EMAIL SENDING FAILED! ---', err);
    user.passwordresetToken = undefined;
    user.resetpasswordTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('some thing is error on server', 500));
  }
});
exports.resetpassword = catchAsync(async (req, res, next) => {
  //1)get user based Token
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordresetToken: hashToken,
    resetpasswordTokenExpire: { $gt: Date.now() },
  });
  //2)check if vaild token and token expired ,then set password
  if (!user) {
    return next(new AppError('Token it invaild or Token is expired', 400));
  }
  user.password = req.body.password;
  user.passwordconfirm = req.body.passwordconfirm;
  user.passwordresetToken = undefined;
  user.resetpasswordTokenExpire = undefined;
  await user.save();

  //3)update ChangepasswordAT
  //4)log user, and sent jwt
  createandsentToken(user, 200, res);
});
exports.updatepassword = catchAsync(async (req, res, next) => {
  //1)get user from collecction
  const user = await User.findById(req.user.id).select('+password');
  //2)check if user provid correct password
  if (!(await user.correctpassword(req.body.currentpassword))) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  //3)if so update password
  user.password = req.body.password;
  user.passwordconfirm = req.body.passwordconfirm;
  await user.save();

  //4)log user again and sent JWT
  createandsentToken(user, 200, res);
});
/////////////
exports.renderConfirmEmail = async (req, res, next) => {
  try {
    const response = await fetch(
      `${req.protocol}://${req.get('host')}/api/v1/users/signup/${req.params.token}`
    );

    const data = await response.json();

    if (data.status === 'success') {
      res.status(200).render('confirmSuccess', {
        title: 'Account Confirmed',
        message: '✅ Your email has been confirmed successfully!',
      });
    } else {
      res.status(400).render('confirmFail', {
        title: 'Confirmation Failed',
        message:
          data.message || '❌ The confirmation link is invalid or expired.',
      });
    }
  } catch (err) {
    res.status(500).render('confirmFail', {
      title: 'Server Error',
      message: '❌ Something went wrong. Please try again later.',
    });
  }
};
