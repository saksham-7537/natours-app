import mongoose from 'mongoose';
import slugify from 'slugify';
import validator from 'validator';
import UserModel from './userModel.js';

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'a tour name must be included'],
      unique: true,
      trim: true,
      maxLength: [20, 'a tour name must have <= 20 characters'],
      minLength: [5, 'a tour must have >= 5 charactesrs '],
      // custom validation using validator library
      // validate: [validator.isAlpha, 'only A-Z char are allowed']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'duration is not included'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'tour must have group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'difficulty missing'],
      // allowed values: enum: {}
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty is either easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      require: [true, 'price must be included'],
    },
    priceDiscount: {
      type: Number,
      // custom validation
      validate: {
        validator: function (val) {
          // this only points to the curr document
          // will not work for update doc
          return val < this.price; // discount < price
        },
        message: 'discount price ({VALUE}) should be less then org price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'summary required'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'must have image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // will not be shown in output
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
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
          default: 'Point',
          // enum: ['Point'],
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
        // creating a reference to the user
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// indexing : It helps the database find data faster—instead of scanning every document,
// it jumps straight to the matching ones

// making index of price (ascending order)
// tourSchema.index({ price: 1 });

// compound index
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// virtual props
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// virtual populate (tour and reviews)
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  // console.log(this) // details about the document before saving it to db
  this.slug = slugify(this.name, { lower: true });
  next();
});

// embedding guides array with users
// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(
//     async (id) => await UserModel.findById(id)
//   );

//   this.guides = await Promise.all(guidesPromise)
//   next();
// });

// tourSchema.pre('save', function(next)  {
//   console.log('will save doc...')
//   next()
// })

// doc: saved document
// tourSchema.post('save', function(doc, next) {
//   console.log(doc)
//   next()
// })

// QUERY MIDDLEWARE
// will be executed for findOne, findMany, find
// all commands starting with 'find'
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
  next();
});

//AGGREGATION MIDDLEWARE:
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

// making a schema model
const TourModel = mongoose.model('Tour', tourSchema);

export default TourModel;
