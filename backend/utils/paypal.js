import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

const environment = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  return process.env.NODE_ENV === 'production'
    ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
    : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

const client = () => {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

export default client