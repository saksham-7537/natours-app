import express from 'express';
const tourRouter = express.Router();

import reviewRouter from './reviewRoutes.js';

import {
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
  getDistance
} from '../controllers/tourController.js';

import { protect, restrictTo } from '../controllers/authController.js';

import {
  createReview,
  getReviewById,
  getReviews,
  updateReview,
} from '../controllers/reviewController.js';

// will only run if url contain 'id'
// tourRouter.param('id', checkId)
tourRouter.route('/slug/:slug').get(getTourBySlug)
// implementing :
// 1) POST /tour/23gwdjo/reviews
// 2) GET /tour/23gwdjo/reviews
// 3) GET /tour/23gwdjo/reviews/ffefgrg3h

tourRouter.use('/:tourId/reviews', reviewRouter);

// custom route
tourRouter.route('/top-5-cheap').get(aliasTopTours, getTourData);

tourRouter.route('/tour-status').get(getTourStats);
tourRouter
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

// getting tours within a particular distance from a certain lat&long
tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

// distance of each tour from a point
tourRouter.route('/distance/:latlng/unit/:unit').get(getDistance)

tourRouter
  .route('/')
  .get(getTourData)
  .post(protect, restrictTo('admin', 'lead-guide'), newTour);

tourRouter
  .route('/:id')
  .get(getTourById)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  // protect : authorizing only logged users
  // restrictTo() : only users having 'admin' or 'lead-guide' roles can delete a tour
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);



export default tourRouter;
