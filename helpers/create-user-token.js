import jwt from "jsonwebtoken";

const createUserToken = async (user, req, res) => {
  const token = jwt.sign(
    {
      nome: user.nome,
      id: user._id,
      foto: user.foto,
    },
    "segredo"
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24, // 1 dia
  });

  return res.status(200).json({
    message: `Seja bem-vindo ${user.nome.split(` `)[0]}`,
    user: {
      name: user.nome,
      userId: user._id,
      foto: user.foto,
    },
  });
};

export default createUserToken;
