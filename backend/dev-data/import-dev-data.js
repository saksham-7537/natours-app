import fs from 'fs';
import dotenv from 'dotenv';
import connectDb from '../db/createDb.js';
import TourModel from '../models/tourModel.js';
import UserModel from '../models/userModel.js';
import ReviewModel from '../models/reviewModel.js';
import { join } from 'path';

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD
);

connectDb(DB);

// reading json file
const tours = JSON.parse(
  fs.readFileSync(join(process.cwd(), '/dev-data/tours.json'), 'utf-8')
);

const users = JSON.parse(
  fs.readFileSync(join(process.cwd(), '/dev-data/users.json'), 'utf-8')
);

const reviews = JSON.parse(
  fs.readFileSync(join(process.cwd(), '/dev-data/reviews.json'), 'utf-8')
);

// importing data to db
const importData = async () => {
  try {
    await TourModel.create(tours);
    await UserModel.create(users, { validateBeforeSave: false });
    await ReviewModel.create(reviews);
    console.log('data loaded...');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// delete all data from collection
const deleteData = async () => {
  try {
    await TourModel.deleteMany();
    await UserModel.deleteMany();
    await ReviewModel.deleteMany();
    console.log('data deleted successfully!');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// script to import and delete using process.argv
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
