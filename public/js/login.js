/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  //   console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'log in successful');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
    // console.log(res);
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      location.reload(true);
      location.assign('/');
    }
  } catch (err) {
    console.log(err);
    showAlert('error', 'some thing is worng try again later');
  }
};

export const signup = async (email, name, password, passwordconfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        email,
        name,
        password,
        passwordconfirm,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Validation email sent! Please check your inbox.');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// document.querySelector('.form').addEventListener('submit', e => {
//   e.preventDefault();
//   const email = document.getElementById('email').value;
//   const password = document.getElementById('password').value;
//   login(email, password);
// });
