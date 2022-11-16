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

// @route GET api/user/logout
// @desc Logout user
// @access Public
router.get("/logout/:id",  userController.logoutUser)

// @route   GET api/users
// @desc    Get all users
// @access  secure
router.get("/all", AuthGuard,  userController.getAllUsers);

// @route GET api/user/block/:id
// @desc Block user
// @access secure
router.get("/block/:userId", AuthGuard, userController.blockUser);

// @route GET api/user/:id
// @desc Get Single User By ID
// @access secure
router.get("/me", AuthGuard, userController.getUserById)





module.exports = router;
