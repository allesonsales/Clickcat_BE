import jwt from "jsonwebtoken";
import getToken from "./get-token.js";

const COOKIE_SECRET = process.env.COOKIE_SECRET;

const checkToken = (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: "Acesso negado!" });
  }

  try {
    const verified = jwt.verify(token, COOKIE_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "token inválido" });
  }
};

export default checkToken;
