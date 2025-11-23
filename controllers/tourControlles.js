//npm i express-async-errors
//require('express-async-errors');
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

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

exports.uploadimage = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);
//upload.single('photo');req.file
//upload.array('photo');req.files

exports.reszieimage = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover && !req.files.images) return next();

  req.body = { ...req.body };
  const tourId = req.params.id || 'new';
  //imagecover
  if (req.files.imageCover) {
    const imageCoverFilename = `tour-${tourId}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${imageCoverFilename}`);
    req.body.imageCover = imageCoverFilename;
  }

  //images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${tourId}-${Date.now()}-${i + 1}.jpeg`;
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`);
        req.body.images.push(filename);
      })
    );
  }

  next();
});

exports.aliasToTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAvrage,price';
  req.query.fields = 'name,price,ratingsAvrage,summary';
  next();
};
exports.Alltours = factory.getAll(Tour);
exports.Tour = factory.getone(Tour, { path: 'reviews' });
exports.CreateTour = factory.createone(Tour);
exports.UpdateTour = factory.updateone(Tour);
exports.DeleteTour = factory.deleteone(Tour);

// exports.Alltours = catchAsync(async (req, res, next) => {
//   //Execute Query
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitfields()
//     .Pagination();
//   const tours = await features.query;
//   //const tours = await Tour.find(req.query); //Modren Mongoose not need filter
//   // send Respone
//   res.status(200).json({
//     status: 'sucess',
//     result: tours.length,
//     data: {
//       tours: tours,
//     },
//   });
// });
// exports.Tour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   //const tour= findone({_id:req.params.id})
//   if (!tour) {
//     return next(new AppError('this tour id not found', 404));
//   }

//   res.status(200).json({
//     status: 'sucess',
//     data: {
//       tour,
//     },
//   });
// });
// exports.CreateTour = catchAsync(async (req, res, next) => {
//   // const newtour=new Tour({})
//   // newtour.save()
//   const newtours = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'sucess',
//     data: {
//       tour: newtours,
//     },
//   });
// });
// exports.UpdateTour = catchAsync(async (req, res, next) => {
//   //const id = req.params.id * 1;

//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError('this tour id not found', 404));
//   }
//   res.status(200).json({
//     status: 'sucess',
//     data: {
//       tour,
//     },
//   });
// });

// exports.DeleteTour = catchAsync(async (req, res, next) => {
//   //const id = req.params.id * 1;
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('this tour id not found', 404));
//   }
//   res.status(204).json({
//     status: 'sucess',
//     data: null,
//   });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAvrage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTour: { $sum: 1 },
        avgRating: { $avg: '$ratingsAvrage' },
        numRating: { $sum: '$ratingsQuantity' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgRating: 1,
      },
    },
    // {
    //   $match: {
    //     _id: { $ne: 'easy' },
    //   },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthplan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      //Where in sql
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      //Group By in sql
      $group: {
        _id: { $month: '$startDates' },
        numTour: { $sum: 1 },
        Tour: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: {
          $arrayElemAt: [
            [
              '',
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'May',
              'Jun',
              'Jul',
              'Aug',
              'Sep',
              'Oct',
              'Nov',
              'Dec',
            ],
            '$_id',
          ],
        },
      },
    },
    // {
    //   $project: {
    //     _id: 0,
    //   },
    // },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
// /tours-within/:distance/center/:latlng/unit/:unit'
// /tours-within/:400/center/:33.776793, -118.376505/unit/:mi'
exports.gettourwithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  const latitudeNum = parseFloat(lat);
  const longitudeNum = parseFloat(lng);
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[longitudeNum, latitudeNum], radius] },
    },
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
exports.getdistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multipler = unit === 'mi' ? 0.000621371192 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }
  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multipler,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',

    data: {
      data: distance,
    },
  });
});

exports.formatCreateTourData = (req, res, next) => {
  if (!req.body.latitude || !req.body.longitude) return next();

  req.body.startLocation = {
    type: 'Point',
    coordinates: [
      parseFloat(req.body.longitude),
      parseFloat(req.body.latitude),
    ],
    description: 'Created via Admin Panel',
    address: 'Unknown Address',
  };

  next();
};
