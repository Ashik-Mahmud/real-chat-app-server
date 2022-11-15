const jwt = require("jsonwebtoken");
const GenerateToken = async (data) => {
  const token = await jwt.sign(
    { id: data?._id, email: data?.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  return token;
};

module.exports = GenerateToken;
