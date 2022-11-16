const Users = require("../models/userModel");
const {
  registerUserService,
  findUserByEmailService,
  findAllUsersService,
  findUserByIdService,
} = require("../services/userServices");
const GenerateToken = require("../Utils/GenerateToken");

/* register users */
const registerUser = async (req, res) => {
  const data = req.body;
  if (!data.name || !data.email || !data.password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }
  try {
    /* check user is exist or not */
    const isExist = await findUserByEmailService(data?.email);
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

    const isMatchPassword = await isHasUser.comparePassword(
      data?.password,
      isHasUser?.password
    );

    if (!isMatchPassword) {
      return res.status(404).send({
        success: false,
        message: "Incorrect credentials",
      });
    }

    /* made it online */
    await Users.findByIdAndUpdate(
      isHasUser?._id,
      {
        $set: {
          isOnline: true,
        },
      },
      { new: true }
    );

    const token = await GenerateToken(isHasUser);
    const { password, __v, ...others } = isHasUser.toObject();
    res.status(202).send({
      success: true,
      message: "User logged in",
      user: others,
      token,
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: `Server Error` + error?.message,
    });
  }
};

/* logout users */
const logoutUser = async (req, res) => {
  const user = req.user;
  try {
    /* made it offline */
    await Users.findByIdAndUpdate(
      user.id,
      {
        $set: {
          isOnline: false,
        },
      },
      {
        new: true,
      }
    );
    res.status(200).send({
      success: true,
      message: "User logged out",
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: `Server Error` + error?.message,
    });
  }
};

/* Get user by ID */
const getUserById = async (req, res) => {
  try {
    const user = await findUserByIdService(req.user?.id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: `User not found by this Id`,
      });
    }
    res.status(202).send({
      success: true,
      message: "found",
      user,
    });
  } catch (err) {
    res.status(404).send({
      success: false,
      message: `Error occurred to single user by id` + err.message,
    });
  }
};

/* get all the users */
const getAllUsers = async (req, res) => {
  const { q } = req.query;
  try {
    let filter = {};

    if (q) {
      filter.name = new RegExp(q, "i");
      filter.email = new RegExp(q, "i");
    }

    const users = await findAllUsersService(filter);
    res.json({
      success: true,
      message: "All users",
      users,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* imports controller */
module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  getUserById,
  logoutUser,
};
