// util.promisify :
// It converts a function that uses a callback into one that returns a Promise, so you can use async/await.
import { promisify } from 'util';
import UserModel from '../models/userModel.js';
import AppError from '../utils/appError.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/email.js';
import crypto from 'crypto';

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  // sending cookie response
  res.cookie('jwt', token, cookieOptions);
  // removing password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

const signup = async (req, res, next) => {
  try {
    // creating a new user
    const newUser = await UserModel.create({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
      passwordResetToken: req.body.passwordResetToken,
    });

    // making a jwt token for new user
    // jwt.sign(payload, secretOrPrivateKey, [options, callback])
    createSendToken(newUser, 201, res);
  } catch (error) {
    return next(error);
  }
};

// login the user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) check if email and password exist
    if (!email || !password) {
      return next(AppError('please provide email & password', 400));
    }
    // 2) check if user exist && password is correct
    // .select('+') : will include the password field in user
    const user = await UserModel.findOne({ email: email }).select('+password');
    // const correct = await user.correctPassword(password, user.password)
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(AppError('incorrect email or password', 401));
    }
    // 3) if everything ok, send token to client
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// authorizing only the logged users to get access to tour data
const protect = async (req, res, next) => {
  try {
    // 1) get the token and check if it
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    // console.log(token);
    // if token doesn't exists
    if (!token) {
      return next(
        AppError('you are not logged in! please login to get access', 401)
      );
    }

    // 2) verify the token
    // using jwt.verify()
    // using promisify so that we can use async/await as a callback is passed
    // it converts jwt.verify to a promise based fxn instead of callback based
    const verifyAsync = promisify(jwt.verify);
    // decoded data
    const decoded = await verifyAsync(token, process.env.JWT_SECRET);

    // 3) check if user still exists
    const currUser = await UserModel.findById(decoded.id).select(
      '+passwordChangedAt'
    );
    console.log(currUser);
    if (!currUser) {
      return next(AppError('user belonging to this token does not exist'), 401);
    }

    // 4) check if user change password after token was issued
    if (currUser.changePasswordAfter(decoded.iat)) {
      return next(
        AppError('user recently changed password, please login again!', 401)
      );
    }

    // grant access to protected route
    req.user = currUser;
    next();
  } catch (error) {
    next(error);
  }
};

const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ isAuthenticated: false });
    }

    // 1. Verify token
    const verifyAsync = promisify(jwt.verify);
    // decoded data
    const decoded = await verifyAsync(token, process.env.JWT_SECRET);

    // 2. Check if user still exists
    const currUser = await UserModel.findById(decoded.id).select('-password');
    if (!currUser) {
      return res.status(401).json({ isAuthenticated: false });
    }

    // 3. Check if user changed password after token was issued
    // if (currUser.changedPasswordAfter(decoded.iat)) {
    //   return res.status(401).json({ isAuthenticated: false });
    // }

    // ✅ Valid user
    return res.status(200).json({
      status: 'success',
      isAuthenticated: true,
      data: {
        user: currUser,
      },
    });
  } catch (error) {
    console.log('catch error', error);
    return res.status(200).json({ isAuthenticated: false });
  }
};

// restricting delete tour only to the admin and lead guides
const restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles: is an array i.e. ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        AppError('you do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

// implementing forgot password functionality
// 1) forgot password :
const forgotPassword = async (req, res, next) => {
  try {
    // A) get user based on POSTed email
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return next(AppError('there is no user with that email address', 404));
    }
    // B) generate the random reset token
    const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // C) send it to user's email
    const resetURL = `http://localhost:5173/resetPassword/${resetToken}`;

    const message = `forgot your password ? submit a PATCH req with your new password and passwordConfirm to : ${resetURL}. 
                     \n If you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'your password reset token (valid for 10 min)',
        message,
      });
    } catch (error) {
      (user.passwordResetToken = undefined),
        (user.passwordResetExpires = undefined),
        await user.save({ validateBeforeSave: false });

      return next(
        AppError('there was an error sending the email. try again letter', 500)
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'token sent to mail!',
    });
  } catch (error) {
    next(error);
  }
};

// 2) reset password :
const resetPassword = async (req, res, next) => {
  try {
    // 1) get user based on token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) if token has not expired, and there is user, set the new password
    if (!user) return next(AppError('token is invalid or has expired', 400));

    user.password = req.body.password;
    (user.passwordConfirm = req.body.passwordConfirm),
      (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined);
    await user.save();

    // 3) update the changedPasswordAt property for the currUser
    // 4) log the user again (send jwt token)
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// updating password only for logged in users
const updatePassword = async (req, res, next) => {
  try {
    // 1) get user from collection
    const user = await UserModel.findById(req.user.id).select('+password');

    // 2) check if POSTed current password is correct
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(AppError('password does not match', 401));
    }

    // 3) if so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) log user in, send jwt
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

const logout = (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({ status: 'success' });
};

export {
  signup,
  login,
  protect,
  isLoggedIn,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout,
};
