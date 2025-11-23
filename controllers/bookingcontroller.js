const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

///////////////////
exports.checkifBoooking = catchAsync(async (req, res, next) => {
  const tourId = req.body.tour;
  const userId = req.user.id;

  const booking = await Booking.findOne({
    tour: tourId,
    user: userId,
    paid: true,
  });

  if (!booking) {
    return next(
      new AppError(
        'You can only review a tour that you have successfully booked and paid for.',
        403
      )
    );
  }
  next();
});

exports.sendTourandUserId = catchAsync(async (req, res, next) => {
  //tours/45454545445(:tourId)/Booking
  //console.log('TourID:', req.params.tourId);
  //console.log('UserID:', req.params.userId);

  if (req.params.tourId) {
    req.filter = { tour: req.params.tourId };
  }
  //users/45454545445(:userId)/Booking
  else if (req.params.userId) {
    req.filter = { user: req.params.userId };
  }
  if (!req.filter) {
    req.filter = {};
  }
  next();
});

exports.checkoutsession = catchAsync(async (req, res, next) => {
  //1)Get current booked tour
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return next(new AppError('Tour not found ', 404));
  }
  const dateobj = tour.startDates.id(req.params.dateId);
  if (!dateobj) {
    return next(new AppError('Selected date not found', 404));
  }

  if (dateobj.date < Date.now()) {
    return next(new AppError('Cannot book a past date', 400));
  }
  if (dateobj.soldOut || dateobj.participants >= tour.maxGroupSize) {
    return next(new AppError('This date is fully booked', 400));
  }
  const existingBooking = await Booking.findOne({
    tour: req.params.tourId,
    user: req.user.id,
    date: dateobj.date,
  });

  if (existingBooking) {
    return next(
      new AppError('You have already booked this tour for this date.', 400)
    );
  }
  //2) create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-booking?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: `${req.params.tourId}_${req.user.id}_${tour.price}_${req.params.dateId}`,
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
            ],
          },
        },
      },
    ],
  });
  //3) create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // console.log('createBookingCheckout START');
  /* eslint-disable-next-line camelcase*/
  const { session_id } = req.query;
  // console.log(session_id);
  /* eslint-disable-next-line camelcase*/
  if (!session_id) return next();

  const session = await stripe.checkout.sessions.retrieve(session_id);
  // console.log('Client Reference ID:', session.client_reference_id);
  // const { tour, user, price, dateId } = session.client_reference_id.split('_');
  const [tour, user, price, dateId] = session.client_reference_id.split('_');
  if (session.payment_status !== 'paid') {
    return next(new AppError('Payment not successful.', 400));
  }

  if (!tour || !user || !price || !dateId) return next();
  const tourDoc = await Tour.findById(tour);
  if (!tourDoc) {
    return next(new AppError('Tour not found ', 404));
  }
  const dateobj = tourDoc.startDates.id(dateId);
  if (!dateobj) {
    return next(new AppError('Selected date not found', 404));
  }
  // Check sold out
  if (dateobj.soldOut || dateobj.participants >= tourDoc.maxGroupSize) {
    // dateobj.soldOut = true;
    // await tourDoc.save();
    return next(new AppError('This date is fully booked', 400));
  }
  // Check if user already booked this date
  // const alreadyBook = await Booking.findOne({
  //   tour,
  //   user,
  //   date: dateobj.date,
  // });

  // if (alreadyBook) {
  //   return next(new AppError('You already booked this tour on this date', 400));
  // }
  // Increase participants
  // dateobj.participants += 1;

  // if (dateobj.participants >= tourDoc.maxGroupSize) {
  //   dateobj.soldOut = true;
  // }
  // await tourDoc.save({ validateBeforeSave: false });

  const updatetour = await Tour.findOneAndUpdate(
    {
      _id: tour,
      'startDates._id': dateId,
      'startDates.participants': { $lt: tourDoc.maxGroupSize },
    },

    {
      $inc: { 'startDates.$.participants': 1 },
    },
    {
      new: true,
      runValidators: false,
    }
  );
  if (!updatetour) {
    return next(new AppError('The date was just fully booked!', 400));
  }

  await Booking.create({ tour, user, price, date: dateobj.date, paid: true });
  res.redirect(`${req.originalUrl.split('?')[0]}?alert=booking_success`);
});

exports.getAvailableDates = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }
  //console.log(tour.startDates);
  const availableDate = tour.startDates
    .filter(
      dateobj =>
        !dateobj.soldOut &&
        dateobj.participants < tour.maxGroupSize &&
        dateobj.date > Date.now()
    )
    .map(dateobj => ({
      id: dateobj._id,
      date: dateobj.date,
      availableSeats: tour.maxGroupSize - dateobj.participants,
      participants: dateobj.participants,
    }));

  res.status(200).json({
    status: 'success',
    result: availableDate.length,
    data: {
      availableDate,
    },
  });
});
exports.deletebooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }
  const tour = await Tour.findById(booking.tour);
  if (tour) {
    const dateobj = tour.startDates.find(
      d => d.date.toISOString() === new Date(booking.date).toISOString()
    );
    if (dateobj) {
      dateobj.participants = Math.max(0, dateobj.participants - 1);
      dateobj.soldOut = false;
      await tour.save({ validateBeforeSave: false });
    }
  }
  await Booking.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createBooking = factory.createone(Booking);
exports.getAllbookings = factory.getAll(Booking);
exports.getbooking = factory.getone(Booking);
exports.updatebooking = factory.updateone(Booking);
