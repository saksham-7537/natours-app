import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({
  dest: path.join(__dirname, 'public', 'img', 'users')
});

const userRouter = express.Router();

import {
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
} from '../controllers/userController.js';

import {
  signup,
  login,
  protect,
  isLoggedIn,
  forgotPassword,
  resetPassword,
  updatePassword,
  restrictTo,
  logout,
} from '../controllers/authController.js';

userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.get('/isLoggedIn', isLoggedIn);
userRouter.post('/logout', logout);
userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:token', resetPassword);

// Protect all routes after this middleware
userRouter.use(protect);

userRouter.patch('/updateMyPassword', updatePassword);
userRouter.get('/me', getMe, getUserById);
userRouter.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
userRouter.delete('/deleteMe', deleteMe);

// restricing all routes after this for 'admin' only
userRouter.use(restrictTo('admin'));

userRouter.route('/').get(getAllUsers).post(createUser);

userRouter.route('/:id').get(getUserById).patch(updateUser).delete(deleteUser);

export default userRouter;
