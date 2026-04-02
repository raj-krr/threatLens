import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    await mongoose.connect(mongoURI);
    console.log("MongoDB Atlas connected ✅");
  } catch (err) {
    console.error("DB connection failed ❌", err);
    process.exit(1);
  }
};

export default connectDB;