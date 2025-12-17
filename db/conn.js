import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  try {
    await mongoose.connect(`${MONGO_URI}`);
    console.log("Conectado ao banco de dados");
  } catch (err) {
    console.error(err);
  }
}

connectDB();

export default connectDB;
