const router = require("express").Router();
const AuthGuard = require("./../middlewares/AuthGuard")

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
// @access  secure
router.get("/all", AuthGuard,  userController.getAllUsers);

module.exports = router;
