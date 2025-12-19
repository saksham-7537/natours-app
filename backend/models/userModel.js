import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please provide your name'],
  },
  email: {
    type: String,
    required: [true, 'please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please provide confirmation password'],
    validate: {
      // works only on .create() and .save()
      validator: function (val) {
        return val === this.password;
      },
      message: 'both password should be same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
 
// encrypting password using 'bcrypt'
// using document pre middleware
userSchema.pre('save', async function (next) {
  // only run this fxn if password was modified
  if (!this.isModified('password')) return next();

  // hashing password with code of 12
  this.password = await bcrypt.hash(this.password, 12);
  //deleting password confirm field
  this.passwordConfirm = undefined;
  next();
});

// changing paswordChangedAt property if password is modified
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this: points to curr query
  // display only those users which have active set to false
  this.find({ active: { $ne: false } });
  next();
});

// instance methods :
// checking if logged password == user password stored in db
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // bcrypt.compare()
  return await bcrypt.compare(candidatePassword, userPassword);
};

// handling if password is changed after token is issued
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // converting the passwordChanged timestap to jwt timestamp
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  // returning false if password not changed
  return false;
};

// reset password token
userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  // expire time : 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
