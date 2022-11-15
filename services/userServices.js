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
