const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');
const TourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'you should write name'],
      unique: true,
      trim: true,
      minlength: [10, 'name tour must more 10 character'],
      maxlength: [40, 'name tour must less 40 character'],
      // validate: [validator.isAlpha, 'name tour must contain only name'],
    },
    slug: String,
    ratingsAvrage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must more 1.0'],
      max: [5, 'rating must less 5.0'],
      set: val => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have maxGroupSize'],
    },
    difficulty: {
      type: String,
      trim: true,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty must have easy,medium, diffcult',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
    },
    images: [String],
    startDates: [
      {
        date: {
          type: Date,
          required: [true, 'A tour must have Date'],
        },
        participants: {
          type: Number,
          defualt: 0,
        },
        soldOut: {
          type: Boolean,
          default: false,
        },
      },
    ],

    secretTour: {
      type: Boolean,
      default: false,
    },
    createAt: {
      type: Date,
      default: Date.now,
    },
    price: {
      type: Number,
      required: [true, 'you shoule write price'],
    },
    Discountprice: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'disount price must less main price',
      },
    },
    startLocation: {
      //GEOJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: String,
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
TourSchema.index({ price: 1, ratingsAvrage: -1 });
TourSchema.index({ slug: 1 });
TourSchema.index({ startLocation: '2dsphere' });

TourSchema.virtual('durationWeeks').get(function () {
  if (this.duration) return this.duration / 7;
});
TourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
//Document Middelware : run before .save() and .create()
TourSchema.pre('save', function (next) {
  //console.log(this)
  this.slug = slugify(this.name, { lower: true });
  next();
});
//emding database user guide in tour set
// TourSchema.pre('save', async function (next) {
//   const guidePromise = this.guides.map(id => User.findById(id));
//   this.guides = await Promise.all(guidePromise);
//   next();
// });
// TourSchema.pre('save', function (next) {
//   console.log('will save document');
//   next();
// });

// TourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });
//Query Middelware
TourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
TourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -changepasswordAt',
  });
  next();
});

// TourSchema.post(/find/, (docs, next) => {
//   // console.log(`Query time ${Date.now() - this.start}`);
//   // console.log(docs);
//   next();
// });

//aggregate Middlware
TourSchema.pre('aggregate', function (next) {
  if (!this.pipeline().length && '$geoNear' in this.pipeline()[0]) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    // console.log(this.pipeline());
  }

  next();
});

const Tour = mongoose.model('Tour', TourSchema);

module.exports = Tour;
// const tourTest = new Tour({
//   name: 'cairo',
//   price: 300,
// });

// tourTest
//   .save()
//   .then(doc => {
//     console.log(doc);
//   })
//   .catch(err => {
//     console.log('Error', err);
//   });
