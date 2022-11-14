const router = require('express').Router();

// import controllers
const  userController  = require('../controllers/userController');



// @route   GET api/users
// @desc    Get all users
// @access  Public
router.get('/users/all', userController.getAllUsers);


module.exports = router;