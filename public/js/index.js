/* eslint-disable */
import '@babel/polyfill';
import { displaymap } from './mapbox';
import { login, logout, signup } from './login';
import { updateSettings } from './updateSettings';
import { tourbook } from './stripe';
import { submitReview } from './submitReview';
import { updateReview } from './updateReview';
import {
  deleteTour,
  deleteUser,
  edituser,
  createUser,
  EditTour,
  createTour,
  deleteReviewAdmin,
  updateReviewAdmin,
  deleteMangebooking,
} from './admin';

const loginForm = document.querySelector('.form--login');
const mapBox = document.getElementById('map');
const logoutBtn = document.querySelector('.nav__el--logout');
const signupForm = document.querySelector('.form--signup');
const updateuserForm = document.querySelector('.form-user-data');
const updateuserpassword = document.querySelector('.form-user-password');
const bookbtn = document.getElementById('book-tour');
const reviewForm = document.querySelector('.form--review');
const editButtons = document.querySelectorAll('.edit-review-btn');
const deleteTourBtns = document.querySelectorAll('.btn--delete-tour');
const deleteUserBtns = document.querySelectorAll('.btn--delete-user');
const editUserBtns = document.querySelectorAll('.btn--edit-user');
const editUserForm = document.querySelector('.form--edit-user');
const modal = document.querySelector('.modal');
const closeModalBtn = document.querySelector('.btn--close-modal');
const btnAddUser = document.querySelector('.btn--add-user');
const modalCreateUser = document.querySelector('.modal--create');
const btnCloseModalCreate = document.querySelector('.btn--close-modal-create');
const formCreateUser = document.querySelector('.form--create-user');
const editTourBtns = document.querySelectorAll('.btn--edit-tour');
const editTourForm = document.querySelector('.form--edit-tour');
const createTourForm = document.querySelector('.form--create-tour');
const modalEdit = document.querySelector('.modal--edit');
const modalCreateTour = document.querySelector('.modal--create');

if (mapBox) {
  const locationsData = mapBox.dataset.locations;
  const locations = JSON.parse(locationsData);
  displaymap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
if (signupForm) {
  signupForm.addEventListener('submit', e => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;
    const passwordconfirm = document.getElementById('passwordConfirm').value;
    signup(email, name, password, passwordconfirm);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (updateuserForm) {
  updateuserForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-settings').textContent = 'Updating....';
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    await updateSettings(form, 'data');
    document.querySelector('.btn--save-settings').textContent = 'Save settings';
    location.reload();
  });
}

if (updateuserpassword) {
  updateuserpassword.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save').textContent = 'Updating...';
    const currentpassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordconfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { currentpassword, password, passwordconfirm },
      'password'
    );
    document.querySelector('.btn--save').textContent = 'Save Password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

const filetag = document.querySelector('#photo');
const preview = document.querySelector('.form__user-photo');
const readURL = input => {
  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = e => {
      preview.setAttribute('src', e.target.result);
    };

    reader.readAsDataURL(input.files[0]);
  }
};

if (filetag && preview) {
  filetag.addEventListener('change', function () {
    readURL(this);
  });
}

if (bookbtn)
  bookbtn.addEventListener('click', e => {
    e.target.textContent = 'processing...';
    const { tourId, dateId } = e.target.dataset;
    tourbook(tourId, dateId);
  });

if (reviewForm) {
  reviewForm.addEventListener('submit', e => {
    e.preventDefault();

    const tourId = document.getElementById('submit-review').dataset.tourId;

    const rating = document.getElementById('rating').value;
    const review = document.getElementById('review').value;

    submitReview(tourId, review, rating);
  });
}

if (editButtons) {
  editButtons.forEach(btn => {
    btn.addEventListener('click', e => {
      const reviewId = e.target.dataset.reviewId;
      const currentReview = e.target.dataset.reviewText;
      const currentRating = e.target.dataset.reviewRating;

      const newReview = prompt('Update your review:', currentReview);
      const newRating = prompt('Update your rating (1-5):', currentRating);

      if (newReview && newRating) {
        updateReview(reviewId, newReview, Number(newRating));
      }
    });
  });
}

if (deleteTourBtns) {
  deleteTourBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      const tourId = e.target.dataset.tourId;
      if (confirm('Are you sure you want to delete this tour?')) {
        deleteTour(tourId);
      }
    });
  });
}

if (deleteUserBtns) {
  deleteUserBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      const userId = e.target.dataset.userId;
      if (confirm('Are you sure you want to delete this user?')) {
        deleteUser(userId);
      }
    });
  });
}

if (editUserBtns) {
  editUserBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const { userId, userName, userEmail, userRole } = e.target.dataset;
      document.getElementById('edit-user-id').value = userId;
      document.getElementById('edit-name').value = userName;
      document.getElementById('edit-email').value = userEmail;
      document.getElementById('edit-role').value = userRole;

      modal.classList.remove('hidden');
    });
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
}
if (editUserForm) {
  editUserForm.addEventListener('submit', e => {
    e.preventDefault();

    const userId = document.getElementById('edit-user-id').value;
    const name = document.getElementById('edit-name').value;
    const email = document.getElementById('edit-email').value;
    const role = document.getElementById('edit-role').value;

    edituser(userId, { name, email, role });
  });
}

if (btnAddUser) {
  btnAddUser.addEventListener('click', e => {
    e.preventDefault();
    modalCreateUser.classList.remove('hidden');
  });
}

if (btnCloseModalCreate) {
  btnCloseModalCreate.addEventListener('click', () => {
    modalCreateUser.classList.add('hidden');
  });
}

if (formCreateUser) {
  formCreateUser.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('create-name').value;
    const email = document.getElementById('create-email').value;
    const role = document.getElementById('create-role').value;
    const password = document.getElementById('create-password').value;
    const passwordconfirm = document.getElementById(
      'create-password-confirm'
    ).value;

    createUser({ name, email, role, password, passwordconfirm });
  });
}

if (editTourBtns) {
  editTourBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();

      const {
        tourId,
        tourName,
        tourPrice,
        tourDifficulty,
        tourDuration,
        tourGroup,
        tourSummary,
      } = e.target.dataset;

      document.getElementById('edit-tour-id').value = tourId;
      document.getElementById('edit-tour-name').value = tourName;
      document.getElementById('edit-tour-price').value = tourPrice;
      document.getElementById('edit-tour-difficulty').value = tourDifficulty;
      document.getElementById('edit-tour-duration').value = tourDuration;
      document.getElementById('edit-tour-group').value = tourGroup;
      document.getElementById('edit-tour-summary').value = tourSummary;

      modalEdit.classList.remove('hidden');
    });
  });
}

if (editTourForm) {
  editTourForm.addEventListener('submit', e => {
    e.preventDefault();

    const id = document.getElementById('edit-tour-id').value;

    const form = new FormData();

    form.append('name', document.getElementById('edit-tour-name').value);
    form.append('price', document.getElementById('edit-tour-price').value);
    form.append(
      'duration',
      document.getElementById('edit-tour-duration').value
    );
    form.append(
      'maxGroupSize',
      document.getElementById('edit-tour-group').value
    );
    form.append(
      'difficulty',
      document.getElementById('edit-tour-difficulty').value
    );
    form.append('summary', document.getElementById('edit-tour-summary').value);
    const coverImage = document.getElementById('edit-image-cover').files[0];
    if (coverImage) {
      form.append('imageCover', coverImage);
    }

    const images = document.getElementById('edit-images').files;
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        form.append('images', images[i]);
      }
    }

    EditTour(id, form);
  });
}

const btnAddTour = document.querySelector('.btn--add-tour');
if (btnAddTour) {
  btnAddTour.addEventListener('click', () => {
    modalCreateTour.classList.remove('hidden');
  });
}

if (createTourForm) {
  createTourForm.addEventListener('submit', e => {
    e.preventDefault();

    const form = new FormData();

    form.append('name', document.getElementById('create-tour-name').value);
    form.append('price', document.getElementById('create-tour-price').value);
    form.append(
      'duration',
      document.getElementById('create-tour-duration').value
    );
    form.append(
      'maxGroupSize',
      document.getElementById('create-tour-group').value
    );
    form.append(
      'difficulty',
      document.getElementById('create-tour-difficulty').value
    );
    form.append(
      'summary',
      document.getElementById('create-tour-summary').value
    );
    form.append('latitude', document.getElementById('create-tour-lat').value);
    form.append('longitude', document.getElementById('create-tour-lng').value);
    form.append(
      'description',
      document.getElementById('create-tour-desc').value
    );

    const imageCover = document.getElementById('create-image-cover').files[0];
    if (imageCover) {
      form.append('imageCover', imageCover);
    }

    const images = document.getElementById('create-images').files;
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        form.append('images', images[i]);
      }
    }

    createTour(form);
  });
}

const closeBtns = document.querySelectorAll(
  '.btn--close-modal-edit, .btn--close-modal-create'
);
if (closeBtns) {
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (modalEdit) modalEdit.classList.add('hidden');
      if (modalCreateTour) modalCreateTour.classList.add('hidden');
    });
  });
}
if (deleteReviewBtns) {
  deleteReviewBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      if (confirm('Are you sure you want to delete this review?')) {
        const { reviewId } = e.target.dataset;
        deleteReview(reviewId);
      }
    });
  });
}

const deleteReviewBtns = document.querySelectorAll('.btn--delete-review');
if (deleteReviewBtns) {
  deleteReviewBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      if (confirm('Delete this review?')) {
        deleteReviewAdmin(e.target.dataset.reviewId);
      }
    });
  });
}

const editReviewBtns = document.querySelectorAll('.btn--edit-review');
const modalReview = document.querySelector('.modal--edit-review');
const formEditReview = document.querySelector('.form--edit-review-admin');
const btnCloseReview = document.querySelector('.btn--close-modal-review');

if (editReviewBtns) {
  editReviewBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      const { reviewId, reviewText, reviewRating } = e.target.dataset;

      document.getElementById('admin-edit-review-id').value = reviewId;
      document.getElementById('admin-edit-text').value = reviewText;
      document.getElementById('admin-edit-rating').value = reviewRating;

      modalReview.classList.remove('hidden');
    });
  });
}

if (btnCloseReview) {
  btnCloseReview.addEventListener('click', () =>
    modalReview.classList.add('hidden')
  );
}

if (formEditReview) {
  formEditReview.addEventListener('submit', e => {
    e.preventDefault();
    const id = document.getElementById('admin-edit-review-id').value;
    const review = document.getElementById('admin-edit-text').value;
    const rating = document.getElementById('admin-edit-rating').value;

    updateReviewAdmin(id, { review, rating });
  });
}

const deleteBookingBtns = document.querySelectorAll('.btn--delete-booking');

if (deleteBookingBtns) {
  deleteBookingBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const { bookingId } = e.target.dataset;

      if (confirm('Are you sure you want to delete this booking?')) {
        deleteMangebooking(bookingId);
      }
    });
  });
}
