const router = require("express").Router();

// import controllers
const userController = require("../controllers/userController");


//@route POST api/users/register
//@desc Register user
//@access Public
router.post("/register", userController.registerUser);

// @route POST api/user/login
// @desc Login user
// @access Public
router.post("/login", userController.loginUser)


// @route   GET api/users
// @desc    Get all users
// @access  Public
router.get("/all", userController.getAllUsers);

module.exports = router;
