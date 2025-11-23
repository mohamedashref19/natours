/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const updateReview = async (reviewId, review, rating) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/reviews/${reviewId}`,
      data: {
        review,
        rating,
      },
    });
    // console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'Review updated successfully!');

      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
