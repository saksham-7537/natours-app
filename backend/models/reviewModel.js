import mongoose from 'mongoose';
import TourModel from './tourModel.js';

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review cannot be empty'],
    },
    rating: {
      type: Number,
      required: [true, 'rating is required'],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // PARENT REFERENCING : (tour & user are parent)
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// each combination of tour and user should be unique
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'tour',
    select: 'name _id',
  }).populate({
    path: 'user',
    select: 'name _id photo',
  });

  next();
});

// .statics can be called on the model itself
// instance method : called on the document

// calculating the avg rating for a particular tour (using tourId)
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // this : points to the model not the doc
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      // grouping by tour
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);

  // updating the avgRating and quantity of the curr tour
  if (stats.length > 0) {
    await TourModel.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await TourModel.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// regex : .save() & findOneAndUpdate or findOneAndDelete
reviewSchema.post(/save|^findOneAnd/, async function (doc) {
  // doc : curr review
  // doc.constructor : points to model
  await doc.constructor.calcAverageRatings(doc.tour);
});

const ReviewModel = mongoose.model('Review', reviewSchema);

export default ReviewModel;
