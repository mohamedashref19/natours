/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const tourbook = async (tourid, dateId) => {
  const stripe = Stripe(
    'pk_test_51SUqhpCEsT2n5ixkKhJbBopDmx0PfSjZ7ewiKNZL29WXB9GZebFQHFbwwekVJYBFL81w0Hx65kE9XSSAMvdAzZ9n00wlKYE7tj'
  );
  try {
    //1)get checkout session from api
    const session = await axios({
      method: 'GET',
      url: `/api/v1/bookings/checkout-session/${tourid}/${dateId}`,
    });
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
