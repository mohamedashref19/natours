/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const submitReview = async (tourId, review, rating) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/tours/${tourId}/reviews`,
      data: {
        tour: tourId,
        review,
        rating,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Review submitted successfully!');
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    }
  } catch (err) {
    // console.log(err);
    showAlert('error', err.response.data.message);
  }
};
