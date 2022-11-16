const Chat = require("../models/chatModel");

/* create chat */
const createChat = async (req, res) => {
  const user = req.user;

  const { receiverId } = req.body;
  if (!receiverId) {
    return res.status(401).send({
      success: false,
      message: "Please fill up all the fields",
    });
  }



  try {

    const chat = await Chat.findOne({
      users: {
        $all: [user.id, receiverId],
      },
    });   
    if (chat) {
      return res.status(200).send({
        success: true,
        message: "Chat already exists",
        chatId: chat._id,
      });
    }

    const newChat = new Chat({
      users: [user.id, receiverId],
    });

    const savedChat = await newChat.save();
    res.status(200).send({
      success: true,
      message: "Chat created successfully",
      chatId: savedChat._id,
    });



  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Server Error",
    });
    console.log(err);
  }

  res.status(202).send({
    success: true,
    message: `Create chat route`,
    user,
  });
};

//import
module.exports = { createChat };
