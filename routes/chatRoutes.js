const router  = require("express").Router();

const AuthGuard = require("./../middlewares/AuthGuard")
// import controllers
const chatController = require("./../controllers/chatController")


/* routes */

// @route POST /api/chat/create
// @desc Create chat for one-to-one
// @access secure
router.post("/create", AuthGuard, chatController.createChat)


//import
module.exports = router;