import express from 'express';

import {
  createPayPalOrder,
  capturePayPalOrder
} from '../controllers/bookingController.js';

import { protect } from '../controllers/authController.js';

const bookingRouter = express.Router();

// bookingRouter.use(protect)

bookingRouter.post(
  '/create-paypal-order',
  createPayPalOrder
);

bookingRouter.post(
  '/capture-paypal-order/:orderID',
  capturePayPalOrder
);

export default bookingRouter
