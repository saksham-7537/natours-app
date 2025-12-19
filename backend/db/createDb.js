import mongoose from "mongoose";

const connectDb = async (DATABASE) => {
  try {
    await mongoose.connect(DATABASE)
    console.log('database connected..')
  } catch (error) {
    console.log(error);
  }
}

export default connectDb