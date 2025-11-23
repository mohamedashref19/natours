const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// const multerstorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerstorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('please upload only image.', 400), false);
  }
};
const upload = multer({
  storage: multerstorage,
  fileFilter: multerFilter,
  //limits option and the fileSize in bytes (10 * 1024 * 1024 = 10MB)
  // limits: { fileSize: 10 * 10 * 1024 },
});

exports.uploadimage = upload.single('photo');

exports.rezieuserimage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});
const fillterobj = (obj, ...allowed) => {
  const newobj = {};
  Object.keys(obj).forEach(el => {
    if (allowed.includes(el)) newobj[el] = obj[el];
  });
  return newobj;
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     data: req.user,
  //   },
  // });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);
  //1)sure user not update password and confirm
  if (req.body.password || req.body.passwordconfirm) {
    return next(
      new AppError(
        'not allowed to update password here. please go to /updateMypassword',
        400
      )
    );
  }
  //2) fillter post date from user
  const fillterBody = fillterobj(req.body, 'name', 'email');
  if (req.file) fillterBody.photo = req.file.filename;
  //3)updatee user document
  const updateuser = await User.findByIdAndUpdate(req.user.id, fillterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updateuser,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.Allusers = factory.getAll(User);
exports.getUser = factory.getone(User);
exports.UpdateUser = factory.updateone(User);
exports.DeleteUser = factory.deleteone(User);
exports.CreateUser = factory.createone(User);
// exports.Allusers = catchAsync(async (req, res, next) => {
//   const users = await User.find();
//   // send Respone
//   res.status(200).json({
//     status: 'sucess',
//     result: users.length,
//     data: {
//       users,
//     },
//   });
// });
