import express from "express";
import connectDB from "./db/conn.js";
import cors from "cors";
import UserRouter from "./routes/UserRoutes.js";
import PetRoutes from "./routes/PetsRoutes.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(cors({ credentials: true, origin: "https://clickcat.vercel.app" }));

app.use("/users", UserRouter);
app.use("/pets", PetRoutes);

app.use(express.static("public"));

connectDB();

app.listen(5000);
