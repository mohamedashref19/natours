const PDFDocument = require('pdfkit');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Review = require('../models/reviewModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  //1)get Tours from Collection
  const tours = await Tour.find();
  //2)Build templet
  // tours.forEach(tour => {
  //   console.log(`--- ${tour.name} Dates:`, tour.startDates);
  // });
  //3)Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tour',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1)Get Tour based slug and get review and user
  const tour = await Tour.findOne({ slug: req.params.slug })
    .populate({
      path: 'guides',
      select: 'name role photo',
    })
    .populate({
      path: 'reviews',
      select: 'review rating user',
    });
  //2)build templet
  if (!tour) {
    return next(new AppError('there is no tour with that name', 404));
  }
  let dateId = '';
  if (tour.startDates && tour.startDates.length > 0) {
    dateId = tour.startDates[0]._id;
  }
  let isBooked = false;

  if (res.locals.user) {
    const existingBooking = await Booking.findOne({
      tour: tour._id,
      user: res.locals.user.id,
    });

    if (existingBooking) {
      isBooked = true;
    }
  }

  //3)render templet
  // console.log(firstDateAvailable);
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
    dateId,
    isBooked,
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log In',
  });
});

exports.getSignForm = catchAsync(async (req, res, next) => {
  res.status(200).render('signup', {
    title: 'Create yout Account',
  });
});

exports.getuserAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'your Account',
  });
};

exports.getmyBooking = catchAsync(async (req, res, next) => {
  //1find all booking
  const bookings = await Booking.find({ user: req.user.id });
  //2)find tours with the return IDS
  // console.log(bookings);
  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  res.status(200).render('overview', {
    title: 'My booking',
    tours,
  });
});

exports.getmyReview = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user.id }).populate({
    path: 'tour',
    select: 'name imageCover',
  });

  res.status(200).render('myReviews', {
    title: 'My review',
    reviews,
  });
});

exports.updateuserdata = catchAsync(async (req, res, next) => {
  // console.log('UDDATE USER:', req.body);
  const updateuser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'your Account',
    user: updateuser,
  });
});

exports.mangetour = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('manageTours', {
    title: 'manage Tours',
    tours,
  });
});

exports.mangeuser = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).render('manageUsers', {
    title: 'manage Users',
    users,
  });
});

exports.getManageReviewsTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('manageReviewsTours', {
    title: 'Manage Reviews - Select Tour',
    tours,
  });
});

exports.getTourReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ tour: req.params.tourId }).populate({
    path: 'user',
    select: 'name photo',
  });

  const tour = await Tour.findById(req.params.tourId);
  res.status(200).render('manageReviews', {
    title: `Reviews: ${tour.name}`,
    reviews,
    tourName: tour.name,
  });
});

exports.mangebooking = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find()
    .populate({
      path: 'user',
      select: 'name email photo',
    })
    .populate({
      path: 'tour',
      select: 'name imageCover price',
    });
  res.status(200).render('manageBookings', {
    title: 'Manage Bookings',
    bookings,
  });
});

exports.getBilling = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id }).populate('tour');

  res.status(200).render('billing', {
    title: 'My Billing',
    bookings,
  });
});

exports.downloadInvoice = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId).populate('tour user');

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  if (booking.user.id !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to access this invoice', 403)
    );
  }

  const doc = new PDFDocument({ margin: 50 });

  const invoiceNumber = `INV-${booking.id.substring(0, 8).toUpperCase()}`;
  const filename = `invoice-${invoiceNumber}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  doc.pipe(res);
  // Header - Logo and Company Info
  doc
    .fontSize(20)
    .fillColor('#55c57a')
    .text('NATOURS', 50, 50, { align: 'left' })
    .fontSize(10)
    .fillColor('#333333')
    .text('Feature Travel Company', 50, 75)
    .text('123 BabSharq', 50, 90)
    .text('Alexandria, CA 94102', 50, 105)
    .text('mohamedashref2003195@gmail.com', 50, 120);

  // Invoice Title
  doc
    .fontSize(28)
    .fillColor('#55c57a')
    .text('INVOICE', 400, 50, { align: 'right' });

  // Invoice Details (Right Side)
  doc
    .fontSize(10)
    .fillColor('#333333')
    .text(`Invoice Number: ${invoiceNumber}`, 400, 85, { align: 'right' })
    .text(
      `Date: ${booking.createdAt.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}`,
      400,
      100,
      { align: 'right' }
    )
    .text(`Status: PAID`, 400, 115, { align: 'right' });

  // Horizontal Line
  doc
    .strokeColor('#55c57a')
    .lineWidth(2)
    .moveTo(50, 160)
    .lineTo(550, 160)
    .stroke();

  // Bill To Section
  doc
    .fontSize(12)
    .fillColor('#55c57a')
    .text('BILL TO:', 50, 180)
    .fontSize(10)
    .fillColor('#333333')
    .text(booking.user.name, 50, 200)
    .text(booking.user.email, 50, 215);

  // Tour Details Section
  doc
    .fontSize(12)
    .fillColor('#55c57a')
    .text('TOUR DETAILS:', 50, 260)
    .fontSize(10)
    .fillColor('#333333');

  // Table Header
  const tableTop = 290;
  doc
    .fontSize(10)
    .fillColor('#ffffff')
    .rect(50, tableTop, 500, 25)
    .fill('#55c57a');

  doc
    .fillColor('#ffffff')
    .text('Description', 60, tableTop + 8)
    .text('Date', 320, tableTop + 8)
    .text('Amount', 450, tableTop + 8);

  // Table Row
  const rowTop = tableTop + 30;
  doc
    .fontSize(10)
    .fillColor('#333333')
    .text(booking.tour.name, 60, rowTop)
    .text(
      booking.createdAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      320,
      rowTop
    )
    .text(`$${booking.price}`, 450, rowTop);

  // Horizontal Line After Table
  doc
    .strokeColor('#dddddd')
    .lineWidth(1)
    .moveTo(50, rowTop + 25)
    .lineTo(550, rowTop + 25)
    .stroke();

  // Total Section
  const totalTop = rowTop + 40;
  doc
    .fontSize(10)
    .fillColor('#333333')
    .text('Subtotal:', 400, totalTop)
    .text(`$${booking.price}`, 480, totalTop, { align: 'right' });

  doc
    .text('Tax (0%):', 400, totalTop + 20)
    .text('$0.00', 480, totalTop + 20, { align: 'right' });

  doc
    .fontSize(12)
    .fillColor('#55c57a')
    .text('Total:', 400, totalTop + 45)
    .text(`$${booking.price}`, 480, totalTop + 45, { align: 'right' });

  // Footer
  doc
    .fontSize(10)
    .fillColor('#999999')
    .text(
      'Thank you for choosing Natours! We hope you enjoy your adventure.',
      50,
      700,
      { align: 'center', width: 500 }
    )
    .text('For questions, contact us at support@natours.com', 50, 720, {
      align: 'center',
      width: 500,
    });

  // Payment Status Badge
  doc
    .fontSize(16)
    .fillColor('#55c57a')
    .text('✓ PAID IN FULL', 50, 650, { align: 'center', width: 500 });

  doc.end();
});
