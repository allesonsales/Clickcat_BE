import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect("mongodb://localhost:27017/clickcat");
    console.log("Conectado ao banco de dados");
  } catch (err) {
    console.error(err);
  }
}

connectDB();

export default connectDB;
