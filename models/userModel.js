const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bycrpt = require('bcryptjs');
const { type } = require('os');
// const { parse } = require('dotenv');
// const { type } = require('os');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: [true, 'you must enter email'],
    unique: true,
    validate: [validator.isEmail, 'enter correct Email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'must enter passwoerd'],
    minlength: 8,
    select: false,
  },
  passwordconfirm: {
    type: String,
    required: [true, 'must enter confirm passwoerd'],
    validate: {
      // This only works on .Create and .Save Only
      validator: function (el) {
        return el === this.password;
      },
      message: 'must password and passwordconfirm matched',
    },
  },
  changepasswordAt: Date,
  passwordresetToken: String,
  resetpasswordTokenExpire: Date,
  active: {
    type: Boolean,
    default: true,
    // select: false,
  },
  passwordAttempts: {
    type: Number,
    default: 0,
    select: false,
  },
  lockUntil: {
    type: Date,
    select: false,
  },
  validated: {
    type: Boolean,
    default: false,
    select: false,
  },
});
userSchema.pre('save', async function (next) {
  //password is hash if it modfied
  if (!this.isModified('password')) return next();

  this.password = await bycrpt.hash(this.password, 12);
  this.passwordconfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.changepasswordAt = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, function (next) {
  this.find({
    active: { $ne: false },
    // , validated: { $ne: false }
  });
  next();
});
userSchema.methods.correctpassword = async function (userpassword) {
  return await bycrpt.compare(userpassword, this.password);
};
userSchema.methods.changepassword = function (JWTTimeStam) {
  if (this.changepasswordAt) {
    const changetimes = parseInt(this.changepasswordAt.getTime() / 1000, 10);
    //console.log(changetimes, JWTTimeStam);
    return JWTTimeStam < changetimes;
  }
  //password NOT change
  return false;
};
userSchema.methods.createresetpasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordresetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetpasswordTokenExpire = Date.now() + 10 * 60 * 1000;
  // console.log({ resetToken }, this.passwordresetToken);
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
