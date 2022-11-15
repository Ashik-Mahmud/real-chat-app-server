const router = require("express").Router();

// import controllers
const userController = require("../controllers/userController");


//@route POST api/users/register
//@desc Register user
//@access Public
router.post("/register", userController.registerUser);


// @route   GET api/users
// @desc    Get all users
// @access  Public
router.get("/all", userController.getAllUsers);

module.exports = router;
