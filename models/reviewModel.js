const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Review must belong tour'],
      ref: 'Tour',
    },
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Review must belong user'],
      ref: 'User',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  // .lean(); // get rid of fileds you don`t need
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});
reviewSchema.statics.avgandnumberRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAvrage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAvrage: 4.5,
    });
  }
};
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
// reviewSchema.post('save', function () {
//   //this points to current review model
//   this.constructor.avgandnumberRating(this.tour);
// });

// reviewSchema.post(/^findOneAnd/, async function (docs) {
//   // await docs.constructor.avgandnumberRating(docs.tour);
//   await this.model.avgandnumberRating(docs.tour);
// });
reviewSchema.post(/save|^findOneAnd/, async docs => {
  // await docs.constructor.avgandnumberRating(docs.tour);
  await docs.constructor.avgandnumberRating(docs.tour);
  //console.log(docs)
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne();
//   console.log(this.r);
//   next();
// });
// reviewSchema.post(/^findOneAnd/, async function () {
//   await this.r.constructor.avgandnumberRating(this.r.tour);
// });
