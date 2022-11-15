const router  = require("express").Router();


// import controllers
const chatController = require("./../controllers/chatController")


/* routes */

// @route POST /api/chat/create
// @desc Create chat for one-to-one
// @access secure
router.get("/create", chatController.createChat)


//import
module.exports = router;