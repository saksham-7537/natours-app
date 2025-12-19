import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Payment = () => {
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [tour, setTour] = useState(null);
  const { tourId } = useParams();

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/tours/${tourId}`
        );
        setTour(response.data.data.tour);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching tour details');
      }
    };

    fetchTour();
  }, [tourId]);

  const paypalOptions = {
    'client-id':
      'Ab16ez50enzf9ix3aeOuytV6grccsVmyM9R-mmce4ZJP1mg1yFchUxWDPfXxTPa8Uuy_ChByhXdBFtks',
    currency: 'USD',
    intent: 'capture',
  };

  const createOrder = () => {
    if (!tour) {
      setError('Tour information not available');
      return;
    }

    return axios
      .post('http://localhost:8000/api/v1/bookings/create-paypal-order', {
        tour,
      })
      .then((response) => response.data.orderID)
      .catch((err) => {
        setError(err.response?.data?.message || 'Error creating PayPal order');
        throw err;
      });
  };

  const onApprove = async (data, actions) => {
  try {
    console.log("Order approved. OrderID:", data.orderID);

    const capturedOrder = await actions.order.capture();
    console.log("Order captured:", capturedOrder);

    await axios.post(
      `http://localhost:8000/api/v1/bookings/capture-paypal-order/${data.orderID}`
    );

    setPaymentCompleted(true);
  } catch (err) {
    console.error("Error during onApprove:", err);
    setError(err.response?.data?.message || 'Error capturing payment');
  }
};


  const onError = (err) => {
    setError(err.toString());
  };

  if (error) return <div className="alert alert--error">{error}</div>;
  if (!tour) return <div className="alert alert--error">Tour not found</div>;

  if (paymentCompleted) {
    return (
      <div className="booking-success">
        <div className="booking-success__icon">
          <svg>
            <use xlinkHref="/img/icons.svg#icon-check"></use>
          </svg>
        </div>
        <h2 className="heading-secondary">Payment Successful!</h2>
        <p className="booking-success__text">
          Thank you for your booking. A confirmation email has been sent to your
          email address.
        </p>
        <a href="/my-tours" className="btn btn--green">
          View My Tours
        </a>
      </div>
    );
  }

  return (
    <div className="paypal-payment">
      <div className="paypal-payment__header">
        <h2 className="heading-secondary ma-bt-lg">Complete Your Booking</h2>
        <div className="paypal-payment__tour">
          <h3 className="heading-tertiary">{tour.name}</h3>
          <p className="paypal-payment__price">${tour.price}</p>
        </div>
      </div>

      <div className="paypal-payment__container">
        <PayPalScriptProvider options={paypalOptions}>
          <PayPalButtons
            style={{ layout: 'vertical' }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onError}
          />
        </PayPalScriptProvider>
      </div>
    </div>
  );
};

export default Payment;
