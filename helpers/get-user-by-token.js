import jwt from "jsonwebtoken";
import getToken from "./get-token.js";
import User from "../models/Users.js";

const getUserByToken = async (token) => {
  if (!token) {
    return res.status(401).json({ message: "Acesso negado" });
  }

  const decoded = jwt.verify(token, "segredo");
  const userId = decoded.id;

  const user = await User.findOne({ _id: userId });

  return user;
};

export default getUserByToken;
