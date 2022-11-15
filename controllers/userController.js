const Users = require("../models/userModel");
const { registerUserService } = require("../services/userServices");
const GenerateToken = require("../Utils/GenerateToken");

/* register users */
const registerUser = async (req, res) => {
  const data = req.body;
  if (!data.name || !data.email || !data.password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }
  try {
    /* check user is exist or not */
    const isExist = await Users.findOne({ email: data.email });
    if (isExist) {
      return res.status(400).json({ message: "User already exist" });
    }

    const user = await registerUserService(data);
    const token = await GenerateToken(user);
    if (user) {
      return res
        .status(200)
        .json({
          message: "User registered successfully",
          token: token,
        });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* get all the users */
const getAllUsers = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "All users",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* imports controller */
module.exports = { getAllUsers, registerUser };
