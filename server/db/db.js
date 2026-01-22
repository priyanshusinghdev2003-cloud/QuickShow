import mongoose from "mongoose";
import "dotenv/config";

const connectToDB = async () => {
  try {
    mongoose.connect(`${process.env.MONGODB_URI}`).then(() => {
      console.log(
        "Connected to MongoDB successfully",
        mongoose.connection.host,
      );
    });
  } catch (error) {
    console.log("Error connecting to MongoDB", error);
    throw error;
  }
};

export default connectToDB;
