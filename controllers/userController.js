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
      return res.status(200).json({
        message: "User registered successfully",
        token: token,
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* login users */
const loginUser = async (req, res) => {
  const data = req.body;
  if (!data?.email || !data?.password) {
    return res.status(401).send({
      message: "Please fill up all the fields",
    });
  }

  try {
    const isHasUser = await Users.findOne({ email: data?.email });

    if (!isHasUser) {
      return res.status(403).send({
        success: false,
        message: `${data?.email} is not register yet.`,
      });
    }

    const isMatchPassword = await isHasUser.comparePassword(data?.password, isHasUser?.password);
    console.log(isMatchPassword);

    res.status(202).send({
      success: true,
      message: "User logged in",
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: `Server Error` + error?.message,
    });
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
module.exports = { getAllUsers, registerUser, loginUser };
