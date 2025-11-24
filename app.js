const path = require('path');
// const fs = require('fs');
const express = require('express');
//const app= require('express')()
const cookiePareser = require('cookie-parser');

const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongosanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const ErrorcontrolHandel = require('./controllers/errorControl');

const app = express();

const TourRouter = require('./routes/tourRouter');
const UserRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const bookingRouter = require('./routes/bookingRouter');
const viewRouter = require('./routes/viewRouter');

app.set('trust proxy', 1);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//1)Global Middlware

//Serving static file
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));
//set security HTTP Header
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        'https://api.mapbox.com',
        'https://events.mapbox.com',
        'ws://127.0.0.1:*',
        'https://bundle.js.map',
        'https://checkout.stripe.com',
        'https://q.stripe.com',
      ],
      frameSrc: [
        "'self'",
        'https://js.stripe.com',
        'https://checkout.stripe.com',
      ],
      scriptSrc: [
        "'self'",
        'https://api.mapbox.com',
        'https://cdnjs.cloudflare.com',
        "'unsafe-inline'",
        'https://js.stripe.com',
      ],

      styleSrc: [
        "'self'",
        'https://api.mapbox.com',
        'https://fonts.googleapis.com',
        "'unsafe-inline'",
      ],
      workerSrc: ["'self'", 'blob:'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    },
  })
);
// console.log(process.env.NODE_ENV)
// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//limit request from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'to Many request from same IP try again later after One hour',
});
app.use('/api', limiter);
//Body Parse, reading data from body req.body
app.use(express.json({ limit: '10kb' })); //middleware
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// data sanitize aganist NOSql query injection
app.use(mongosanitize());
// data sanitize aganist XSS
app.use(xss());
//prevent paramter pollution
app.use(
  hpp({
    whitelist: [
      'ratingsAvrage',
      'ratingsQuantity',
      'duration',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//for Cookies
app.use(cookiePareser());
//Test middleware
app.use((req, res, next) => {
  console.log('hello from middleware');
  next();
});

app.use(compression());
app.use((req, res, next) => {
  req.requsetTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.cookies);

  next();
});
//3)Router

app.use('/api/v1/tours', TourRouter);
app.use('/api/v1/users', UserRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/', viewRouter);
// app.use('/', UserRouter);
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Url you search it ${req.originalUrl} is wrong`,
  // });
  // const err = new Error(`Url you search it ${req.originalUrl} is wrong`);
  // err.status = 'fail';
  // err.statuscode = 404;
  next(new AppError(`Url you search it ${req.originalUrl} is wrong`, 404));
});

app.use(ErrorcontrolHandel);

module.exports = app;
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );
//2)Route Hander
// exports.checkid = (req, res, next, val) => {
//   console.log(`tour id is :${val}`);
//   if (req.params.id * 1 > tours.length - 1) {
//     return res.status(404).json({
//       status: 'faild',
//       message: 'invaild ID',
//     });
//   }
//   next();
// };
// exports.checkbody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'faild',
//       message: 'invaild name or prcie',
//     });
//   }
//   next();
// };
// exports.Alltours = (req, res) => {
//   console.log(req.requsetTime);
//   res.status(200).json({
//     status: 'sucess',
//     // result: tours.length,
//     // requestAT: req.requsetTime,
//     // data: {
//     //   tours: tours,
//     // },
//   });
// };
// exports.Tour = (req, res) => {
//   console.log(req.params);
//   // console.log(typeof req.params.id)
//   const id = req.params.id * 1;

//   res.status(200).json({
//     status: 'sucess',
//     // data: {
//     //   tour,
//     // },
//   });
// };
// exports.CreateTour = (req, res) => {
//   res.status(201).json({
//     status: 'sucess',
//     // data: {
//     //   tours: newtours,
//     // },
//   });
// };
// exports.UpdateTour = (req, res) => {
//   const id = req.params.id * 1;

//   res.status(200).json({
//     status: 'sucess',
//     // data: {
//     //   tour: updatetour,
//     // },
//   });
// };
// exports.DeleteTour = (req, res) => {
//   const id = req.params.id * 1;

//   res.status(204).json({
//     status: 'sucess',
//     data: null,
//   });
// };
