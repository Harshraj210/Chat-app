import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully ✅");
  } catch (error) {
    // handling errors
    console.error("Something wrong happended!!", error);
    // exit application witherror
    process.exit(1);
  }
};

export default connectDB;
