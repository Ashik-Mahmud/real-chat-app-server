const router  = require("express").Router();

const AuthGuard = require("./../middlewares/AuthGuard")
// import controllers
const chatController = require("./../controllers/chatController")


/* routes */

// @route POST /api/chat/create
// @desc Create chat for one-to-one
// @access secure
router.post("/create", AuthGuard, chatController.createChat)

// @route POST /api/chat/group/create
// @desc Create chat for group
// @access secure
router.post("/group/create", AuthGuard, chatController.createGroupChat);

// @route PATCH /api/chat/group/edit/:chatId
// @desc Edit group chat
// @access secure
router.patch("/group/edit/:chatId", AuthGuard, chatController.editGroupChat);

// @route GET/api/chat/group/join-by-link
// @desc Joining Group By Link
// @access secure 
router.post("/group/join-by-code",AuthGuard, chatController.joinGroupByLink)

// @route POST /api/chat/message
// @desc Send Message to a chat
// @access secure
router.post("/message", AuthGuard, chatController.sendMessage)

// @route DELETE /api/chat/message/remove/:id
// @desc Delete Message by user
// @access secure
router.delete("/message/remove/:messageId", AuthGuard, chatController.deleteMessage)

// @route GET /api/chat/user
// @desc Get all chats of a user
// @access secure
router.get("/user", AuthGuard, chatController.getAllChatsOfUser)




// @route GET /api/chat/remove/:id
// @desc Remove a chat
// @access secure
router.delete("/delete/:chatId", AuthGuard, chatController.removeChat)

// @route GET /api/chat/:id
// @desc Get all messages of a chat
// @access secure
router.get("/:chatId", AuthGuard, chatController.getMessages);




//import
module.exports = router;