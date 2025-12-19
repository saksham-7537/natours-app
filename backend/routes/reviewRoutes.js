import express from 'express';

import {
  setTourUsersId,
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';

import { protect, restrictTo } from '../controllers/authController.js';

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(protect);

reviewRouter
  .route('/')
  .get(getReviews)
  .post(restrictTo('user'), setTourUsersId, createReview);

reviewRouter
  .route('/:id')
  .get(getReviewById)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

export default reviewRouter;
