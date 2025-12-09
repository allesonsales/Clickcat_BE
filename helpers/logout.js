const logoutFunction = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameStrict: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json({ message: "Logout realizado com sucesso!" });
};

export default logoutFunction;
