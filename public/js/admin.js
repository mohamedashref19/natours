/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const deleteTour = async TourId => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/tours/${TourId}`,
    });
    if (res.status === 204) {
      showAlert('success', 'Tour deleted successfully!');
      window.setTimeout(() => {
        location.reload(true);
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const deleteUser = async UserId => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/users/${UserId}`,
    });
    if (res.status === 204) {
      showAlert('success', 'User deleted successfully!');
      window.setTimeout(() => {
        location.reload(true);
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const edituser = async (UserId, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${UserId}`,
      data,
    });
    if (res.status === 200) {
      showAlert('success', 'User Update successfully!');
      window.setTimeout(() => {
        location.reload(true);
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const createUser = async data => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/users/`,
      data,
    });
    if (res.status === 201) {
      showAlert('success', 'User Create successfully!');
      window.setTimeout(() => {
        location.reload(true);
      }, 1000);
    }
  } catch (err) {
    // console.log(err);
    showAlert('error', err.response.data.message);
  }
};

export const EditTour = async (TourId, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/tours/${TourId}`,
      data,
    });

    if (res.status === 200) {
      showAlert('success', 'Tour Update successfully!');
      window.setTimeout(() => {
        location.reload(true);
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const createTour = async data => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/tours/`,
      data,
    });
    if (res.status === 201) {
      showAlert('success', 'Tour Create successfully!');
      window.setTimeout(() => {
        location.reload(true);
      }, 1000);
    }
  } catch (err) {
    // console.log(err);
    showAlert('error', err.response.data.message);
  }
};

export const updateReviewAdmin = async (reviewId, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/reviews/${reviewId}`,
      data,
    });

    if (res.status === 200) {
      showAlert('success', 'Review updated successfully!');
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
export const deleteReviewAdmin = async reviewId => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/reviews/${reviewId}`,
    });
    if (res.status === 204) {
      showAlert('success', 'Review deleted!');
      window.setTimeout(() => location.reload(true), 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const deleteMangebooking = async bookingId => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/bookings/${bookingId}`,
    });
    if (res.status === 204) {
      showAlert('success', 'Booking deleted successfully!');
      window.setTimeout(() => location.reload(true), 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
