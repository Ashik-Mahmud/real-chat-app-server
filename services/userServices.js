const Users = require("../models/userModel");

/* register user services */
exports.registerUserService = async (data) => {
  try {
    const user = await Users.create(data);
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};

/* find single user service */
exports.findUserByEmailService = async (email) => {
  const result = await Users.findOne({ email }).select("-password -__v");
  return result;
};
exports.findUserByIdService = async (id) => {
  const result = await Users.findById(id).select("-password -__v");;
  return result;
};

/* find all the users service */
exports.findAllUsersService = async()=>{
    const result = await Users.find({}).select("-password -__v");
    return result;
}