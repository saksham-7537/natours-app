// import fs from "fs"; 
// import { fileURLToPath } from 'url'; // For __dirname equivalent
// import { dirname, join } from 'path';   // For __dirname equivalent
import TourModel from '../models/tourModel.js';
import AppError from '../utils/appError.js';

// Define __filename and __dirname for ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// Load tours data
// const tours = JSON.parse(
//   fs.readFileSync(join(__dirname, '../dev-data/tours-simple.json'))
// );

// check id fxn
// const checkId = (req, res, next, val) => {
//   console.log(`tour id : ${val}`)
//   if (req.params.id > tours.length) {
//     return res.status(404).json({
//       status: "failed",
//       message: "invalid id",
//     });
//   }
//   next();
// }

// check body functiuon
// const checkBody = (req, res, next) => {
//   const { name, price } = req.body

//   if(!name || !price) {
//     return res.status(400).json({
//       status: "failed",
//       message: "either name or price doesn't exist"
//     })
//   }
//   next()
// }

const aliasTopTours = (req, res, next) => {
  req.url =
    '/?sort=-ratingsAverage,price&fields=ratingsAverage,price,name,difficulty,summary&limit=5';
  next();
};

const getTourData = async (req, res, next) => {
  try {
    // building the query
    // 1A) filtering
    // cloning req.query
    const queryObj = { ...req.query };
    // excluding all the below fields from the queryObj
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) advance filtering
    let queryString = JSON.stringify(queryObj);
    // Convert special operators (gte, gt, lte, lt) to MongoDB format
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    const filters = JSON.parse(queryString);
    let query = TourModel.find(filters);

    // 2) Sorting:
    if (req.query.sort) {
      // chaining the sort method to the
      // if the value of one field is same, then it will move to next
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      // default sort
      query = query.sort('-createdAt');
    }

    // 3) Limiting fields:
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      // only these particular fields will be shown
      query = query.select(fields);
    } else {
      // prefixing by '-', by default it will be removed(__v)
      query = query.select('-__v');
    }

    // 4) pagination:
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // page=2&limit=10; 1-10: page-1 & 11-20: page-2 ...
    query = query.skip(skip).limit(limit);

    // if page exceed the limit
    if (req.query.page) {
      const numTours = await TourModel.countDocuments();
      if (skip >= numTours) throw new Error("page doesn't exist");
    }

    // executing the query
    const tours = await query;

    // another method to filter data (using .where() & .equals())
    // const tours = await TourModel.find()
    //   .where('duration')
    //   .equals(duration)
    //   .where('difficulty')
    //   .equals(difficulty);

    // send response
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    return next(AppError(error.message, 400));
  }
};

const newTour = async (req, res, next) => {
  try {
    // creating new tour using .create()
    const newTour = await TourModel.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    return next(error);
  }
  // console.log(req.body)
  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);
  // tours.push(newTour);

  // fs.writeFile(
  //   `${__dirname}/../dev-data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {
  //     res.status(201).json({
  //       status: "success",
  //       data: {
  //         tour: newTour,
  //       },
  //     });
  //   }
  // );
};

const getTourById = async (req, res, next) => {
  try {
    // populate : replace a referenced document’s ID with the actual document data
    // path : which fields to populate
    // select : which field to show/hide in output using +/-
    const tour = await TourModel.findById(req.params.id).populate('reviews');

    if (!tour) {
      return next(AppError('no tour found with that id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getTourBySlug = async (req, res, next) => {
  try {
    const tour = await TourModel.findOne({ slug: req.params.slug })
      .populate('reviews')
      // .populate({
      //   path: 'guides',
      //   select: '-__v -passwordChangedAt',
      // });

    if (!tour) {
      return next(AppError('tour not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateTour = async (req, res, next) => {
  try {
    const tour = await TourModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tour) {
      return next(AppError('no tour found with that id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const deleteTour = async (req, res, next) => {
  try {
    const tour = await TourModel.findByIdAndDelete(req.params.id);

    if (!tour) {
      return next(AppError('no tour found with that id', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    return next(AppError(error.message, 400));
  }
};

const getTourStats = async (req, res, next) => {
  try {
    //each stage is an object
    const stats = await TourModel.aggregate([
      {
        // will give only rating >= 4.5
        $match: { ratingsAverage: { $gte: 3.9 } },
      },
      {
        // document layout
        $group: {
          _id: { $toUpper: '$difficulty' },
          num: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        // sorting
        $sort: { avgPrice: 1 },
      },
      // {
      //   // will not include 'EASY'
      //   $match: { _id: { $ne: 'EASY' } },
      // },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (error) {
    return next(AppError(error.message, 400));
  }
};

const getMonthlyPlan = async (req, res, next) => {
  try {
    const { year } = req.params;

    const plan = await TourModel.aggregate([
      {
        // will give one document for each of the dates
        $unwind: '$startDates',
      },
      {
        $match: {
          // this will give only tours that are starting in that year
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numToursStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0, // will delete id field
        },
      },
      {
        $sort: { numToursStarts: -1 },
      },
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
  } catch (error) {
    return next(AppError(error.message, 400));
  }
};

// get tours within a specific distance/radius
const getToursWithin = async (req, res, next) => {
  try {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
      return next(AppError('pls provide latitude and longitude', 400));
    }

    const tours = await TourModel.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDistance = async (req, res, next) => {
  try {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
      return next(AppError('pls provide latitude and longitude', 400));
    }

    const distance = await TourModel.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
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
  } catch (error) {
    next(error);
  }
};

export {
  aliasTopTours,
  getTourData,
  getTourById,
  getTourBySlug,
  newTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistance,
};
