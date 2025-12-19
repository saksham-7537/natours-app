import UserModel from '../models/userModel.js';
import AppError from '../utils/appError.js';
// multer setup
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find();

    res.status(200).json({
      status: 'success',
      data: {
        users,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error.message,
    });
  }
};

const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// MULTER SETUP ->

// MEMORY storage
const multerStorage = multer.memoryStorage();

// Only allow images
const multerFilter = (req, file, cb) => {
  file.mimetype.startsWith('image')
    ? cb(null, true)
    : cb(new Error('Not an image! Please upload only images.'), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadUserPhoto = upload.single('photo');

// Resize and save the image
const resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpg`;

  const dir = path.join('public', 'img', 'users');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const outputPath = path.join(dir, req.file.filename);

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpg')
    .jpeg({ quality: 90 })
    .toFile(outputPath);

  next();
};

//-------- muler setup finished ---------

// current user updating his/her details
const updateMe = async (req, res, next) => {
  try {
    // 1) create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        AppError(
          'this route is not for password updates. please use /updateMyPassword',
          400
        )
      );
    }

    // 2) filtering out the unwanted field from req.body
    const filteredBody = filterObj(req.body, 'name', 'email');

    // 4) Add photo to body if uploaded
    if (req.file) filteredBody.photo = req.file.filename;

    // 5) update user document
    const user = await UserModel.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteMe = async (req, res, next) => {
  try {
    // setting the 'active' field to false for the deleted user
    const user = await UserModel.findByIdAndUpdate(req.user.id, {
      active: false,
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);

    if (!user) {
      return next(AppError('no user found with that id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const createUser = async (req, res, next) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not defined! use /signup instead',
  });
};

const updateUser = async (req, res, next) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(AppError('no user found with that id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(AppError('no user found with that id', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    return next(AppError(error.message, 400));
  }
};

export {
  getAllUsers,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
  updateMe,
  deleteMe,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
