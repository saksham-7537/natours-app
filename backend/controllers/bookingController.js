import UserModel from '../models/userModel.js';
import BookingModel from '../models/bookingModel.js';
import TourModel from '../models/tourModel.js';
import client from '../utils/paypal.js';
import paypal from '@paypal/checkout-server-sdk';

// Handing Payment
const createPayPalOrder = async (req, res, next) => {
  try {
    const { tour } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: tour.price,
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: tour.price,
              },
            },
          },
          items: [
            {
              name: tour.name,
              description: `Tour to ${tour.name}`,
              quantity: '1',
              unit_amount: {
                currency_code: 'USD',
                value: tour.price,
              },
            },
          ],
        },
      ],
    });

    const order = await client().execute(request);
    res.status(200).json({
      status: 'success',
      orderID: order.result.id,
    });
  } catch (err) {
    next(err);
  }
};

const createBookingCheckout = async (paypalOrder) => {
  // Extract necessary data from PayPal order
  const tourName = paypalOrder.purchase_units[0].items[0].name;
  const userEmail = paypalOrder.payer.email_address;
  const amount = paypalOrder.purchase_units[0].amount.value;
  const paymentId = paypalOrder.id;

  // Find the tour and user in database
  const tour = await TourModel.findOne({ name: tourName });
  const user = await UserModel.findOne({ email: userEmail });

  if (!tour || !user) {
    throw new Error('Tour or user not found');
  }

  // Create the booking
  await BookingModel.create({
    tour: tour._id,
    user: user._id,
    price: amount,
    paymentMethod: 'paypal',
    paymentId: paymentId,
    paid: true,
    createdAt: new Date(),
  });
};

// Add new controller for capturing PayPal order
const capturePayPalOrder = async (req, res, next) => {
  try {
    const { orderID } = req.params;

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await client().execute(request);

    // Create booking here
    const session = {
      client_reference_id: capture.result.purchase_units[0].items[0].name,
      customer_email: capture.result.payer.email_address,
      amount_total: capture.result.purchase_units[0].amount.value * 100,
    };

    await this.createBookingCheckout(session);

    res.status(200).json({
      status: 'success',
      message: 'Payment captured and booking created',
    });
  } catch (err) {
    next(err);
  }
};

export { createPayPalOrder, createBookingCheckout, capturePayPalOrder };
