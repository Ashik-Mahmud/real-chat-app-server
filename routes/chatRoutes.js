const router  = require("express").Router();

const AuthGuard = require("./../middlewares/AuthGuard")
// import controllers
const chatController = require("./../controllers/chatController")


/* routes */

// @route POST /api/chat/create
// @desc Create chat for one-to-one
// @access secure
router.post("/create", AuthGuard, chatController.createChat)

// @route POST /api/chat/message
// @desc Send Message to a chat
// @access secure
router.post("/message", AuthGuard, chatController.sendMessage)

// @route GET /api/chat/:id
// @desc Get all messages of a chat
// @access secure
router.get("/:chatId", AuthGuard, chatController.getMessages)


//import
module.exports = router;