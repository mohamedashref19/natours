/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
//type is password or data
export const updateSettings = async (data, type) => {
  const url =
    type === 'password'
      ? 'http://127.0.0.1:3000/api/v1/users/updatepassword'
      : 'http://127.0.0.1:3000/api/v1/users/updatemyDate';
  try {
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    // console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} date successfuly`);
      // window.setTimeout(() => {
      //   location.reload();
      // }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
