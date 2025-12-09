const getToken = (req) => {
  const token = req.cookies.token;
  return token || null;
};

export default getToken;
