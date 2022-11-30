const { sendMailWithGmail } = require("../Config/MailConfig");
const bcrypt = require("bcrypt");
const Chat = require("../models/chatModel");
const Users = require("../models/userModel");
const {
  registerUserService,
  findUserByEmailService,
  findAllUsersService,
  findUserByIdService,
} = require("../services/userServices");
const GenerateToken = require("../Utils/GenerateToken");
const { uploadImage } = require("../Utils/ImageManage");

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
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await registerUserService({ ...data, password: passwordHash });
    const token = await GenerateToken(user);

    if (user) {
      sendMailWithGmail(data.email, data.name, "welcome", null);
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

    const isMatch = await bcrypt.compare(data?.password, isHasUser?.password);
    if (!isMatch) {
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
    const { password, __v, blockedBy, friends, ...others } =
      isHasUser.toObject();
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
  const { id } = req.params;
  try {
    /* made it offline */
    await Users.findByIdAndUpdate(
      id,
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

/* block user */
const blockUser = async (req, res) => {
  const user = req.user;
  const { userId } = req.params;

  if (!userId) {
    return res.status(401).send({
      success: false,
      message: "Please fill up all the fields",
    });
  }
  try {
    const { block } = req.query;
    if (JSON.parse(block)) {
      /* send sender id as friend */
      await Users.findByIdAndUpdate(
        user.id,
        {
          $push: {
            blockedBy: userId,
          },
        },
        { new: true }
      );
      res.status(200).send({
        success: true,
        message: "User blocked",
      });
    } else {
      /* send sender id as friend */
      await Users.findByIdAndUpdate(
        user.id,
        {
          $pull: {
            blockedBy: userId,
          },
        },
        { new: true }
      );
      res.status(200).send({
        success: true,
        message: "User Unblocked",
      });
    }
  } catch (error) {
    res.status(404).send({
      success: false,
      message: `Server Error` + error?.message,
    });
  }
};

/* Send Reset Password Link */
const sendResetPasswordLink = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(401).send({
      success: false,
      message: "Please fill up all the fields",
    });
  }
  try {
    const isHasUser = await Users.findOne({ email });
    if (!isHasUser) {
      return res.status(403).send({
        success: false,
        message: `${email} is not register yet.`,
      });
    }
    const token = await GenerateToken(isHasUser);
    /* expiration time for 30 mins*/
    const expirationTime = new Date().getTime() + 30 * 60 * 1000;
    await Users.findByIdAndUpdate(
      isHasUser?._id,
      {
        $set: {
          resetPasswordToken: token,
          resetPasswordExpires: expirationTime,
        },
      },
      { new: true }
    );
    sendMailWithGmail(email, isHasUser.name, "forgotPassword", token);
    res.status(200).send({
      success: true,
      message: "Reset Password Link Sent",
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: `Server Error` + error?.message,
    });
  }
};

/* reset password with verify */
const resetPasswordWithVerify = async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.status(404).json({
      success: false,
      message: "Token is invalid",
    });
  }

  try {
    const user = await Users.findOne({ resetPasswordToken: token });
    const nowTime = new Date().getTime();
    const expireTime = user?.resetPasswordExpires?.getTime();

    if (nowTime > expireTime) {
      return res.status(403).send({
        success: false,
        message: "Link is expire send again.",
      });
    }
    user.resetPasswordExpires = null;
    user.resetPasswordToken = null;
    await user.save();
    res.redirect(`${process.env.CLIENT_URL}/change-password/${user?._id}`);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Already used this link sorry",
    });
  }
};

/* change Password */
const changePassword = async (req, res) => {
  const { user_id, password } = req.body;
  if (!user_id || !password) {
    return res.status(404).send({
      success: false,
      message: "all fields are required",
    });
  }

  try {
    const user = await Users.findById(user_id);
    if (!user)
      return res.status(404).send({
        success: false,
        message: "User not found.",
      });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    user.password = passwordHash;
    await user.save();
    res.status(202).send({
      success: true,
      message: "Password changed successfully done.",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error" + error,
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
      filter.$or = [
        { name: new RegExp(q, "i") },
        { email: new RegExp(q, "i") },
      ];
    }
    const mineInfo = await Users.findById(req.user?.id);

    /* if someone already add to my friends i don't show them  */
    filter.$and = [
      {
        _id: {
          $nin: mineInfo?.friends,
        },
      },
      {
        _id: {
          $nin: mineInfo?.blockedBy,
        },
      },
      {
        _id: {
          $ne: mineInfo?._id,
        },
      },
    ];
    const users = await Users.find(filter).select("-password -__v");
    res.json({
      success: true,
      message: "All users",
      users,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* get all of them users */
const getAllOfThemUsers = async (req, res) => {
  const user = req.user;
  try {
    const users = await Users.find({
      _id: { $ne: { _id: user?.id } },
    }).select("-password -__v");
    res.json({
      success: true,
      message: "All of them users",
      users,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* get all users which one is not in chat */
const getExistingUsers = async (req, res) => {
  const { chatId } = req.params;
  try {
    const chat = await Chat.findById(chatId).populate(
      "users",
      "-password -__v"
    );
    const users = await Users.find({
      _id: {
        $nin: chat?.users,
      },
    }).select("-password -__v");
    res.json({
      success: true,
      message: "All Existing users",
      users,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* get user by user id */
const getUserByUserId = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Users.findById(id)
      .select("-password -__v")
      .populate("friends", "-password -__v");
    if (user) {
      res.status(202).send({
        success: true,
        message: "User by user id",
        user,
      });
    }
  } catch (error) {
    res.status(404).send({
      success: false,
      message: "server error" + error,
    });
  }
};

/* change Profile Image */
const changeProfileImage = async (req, res) => {
  const userId = req.user.id;
  const { image } = req.body;
  try {
    if (!image) {
      return res.status(404).send({
        success: false,
        message: "Please select Image",
      });
    }
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "You have no permission to change image.",
      });
    }
    const upload = await uploadImage(image, req.user.email);
    user.avatar = upload?.secure_url;
    user.public_id = upload?.public_id;
    await user.save();

    res.status(202).send({
      success: true,
      message: "Update profile photo done",
      user,
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: "server error" + error,
    });
  }
};

/* imports controller */
module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  getUserById,
  logoutUser,
  blockUser,
  getUserByUserId,
  getAllOfThemUsers,
  getExistingUsers,
  sendResetPasswordLink,
  resetPasswordWithVerify,
  changePassword,
  changeProfileImage,
};
