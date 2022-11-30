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


// @route POST api/user/send-reset-password-link
// @desc Send reset password link
// @access Public
router.post("/send-reset-password-link", userController.sendResetPasswordLink)

// @route GET api/user/reset-password/:token
// @desc Verify And Reset Password
// @access Public

router.get("/reset-password/:token", userController.resetPasswordWithVerify)

// @route GET api/user/change-password
// @desc Change password
// @access public

router.post("/change-password", userController.changePassword)


// @route GET api/user/logout
// @desc Logout user
// @access Public
router.get("/logout/:id",  userController.logoutUser)

// @route   GET api/users
// @desc    Get all users
// @access  secure
router.get("/all", AuthGuard,  userController.getAllUsers);

// @route   GET api/users/all-of-them
// @desc    Get all users
// @access  secure
router.get("/all-of-them", AuthGuard,  userController.getAllOfThemUsers);

// @route   GET api/users/existing-users/:chatId
// @desc    Get all users which one is not in the chat
// @access  secure
router.get("/existing-users/:chatId", AuthGuard,  userController.getExistingUsers);


// @route GET api/user/block/:id
// @desc Block user
// @access secure
router.get("/block/:userId", AuthGuard, userController.blockUser);

// @route GET api/user/:id
// @desc Get Single User By ID
// @access secure
router.get("/me", AuthGuard, userController.getUserById)

// @route PUT api/user/change-photo
// @desc Update profile Image
// @access secured
router.put("/change-photo", AuthGuard, userController.changeProfileImage)

// @route GET api/user/:id
// @desc Get Single User By ID
// @access secure
router.get("/me/:id", AuthGuard, userController.getUserByUserId)





module.exports = router;
