import ReviewModel from '../models/reviewModel.js';
import AppError from '../utils/appError.js';

const setTourUsersId = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
}

const getReviews = async (req, res, next) => {
  try {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const reviews = await ReviewModel.find(filter);

    res.status(200).json({
      status: 'success',
      data: {
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getReviewById = async (req, res, next) => {
  try {
    const review = await ReviewModel.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        review,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    // allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    req.body.user = req.user.id;

    const newReview = await ReviewModel.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview,
      },
    });
  } catch (error) { 
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const review = await ReviewModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!review) {
      return next(AppError('No review found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        review,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await ReviewModel.findByIdAndDelete(req.params.id);

    if (!review) {
      return next(AppError('No review found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export { setTourUsersId, getReviews, getReviewById, createReview, updateReview, deleteReview };
