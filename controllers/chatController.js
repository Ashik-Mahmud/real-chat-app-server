const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");

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

/* send message to the chat */
const sendMessage = async (req, res) => {
  const user = req.user;
  const { chatId, message } = req.body;
  if (!chatId || !message) {
    return res.status(401).send({
      success: false,
      message: "Please fill up all the fields",
    });
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).send({
        success: false,
        message: "Chat not found",
      });
    }
    if (!chat.users.includes(user.id)) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized",
      });
    }

    chat.lastMessage = message;
    const newMessage = {
      chat: chatId,
      sender: user.id,
      receiver: chat.users.find((u) => u != user.id),
      message: message,
    };
    const saveMessage = await Message.create(newMessage);
    await chat.save();
    res.status(200).send({
      success: true,
      message: "Message sent successfully",
      sentMessage: saveMessage,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Server Error" + err,
    });
    console.log(err);
  }
};

/* get all the messages for particular chat id */
const getMessages = async (req, res) => {
  const user = req.user;
  const { chatId } = req.params;
  if (!chatId) {
    return res.status(401).send({
      success: false,
      message: "Please fill up all the fields",
    });
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).send({
        success: false,
        message: "Chat not found",
      });
    }
    if (!chat.users.includes(user.id)) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized",
      });
    }

    const messages = await Message.find({ chat: chatId }).populate(
      "sender",
      "name email"
    ).populate("receiver", "name email");
    res.status(200).send({
      success: true,
      messages,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Server Error",
    });
    console.log(err);
  }
};

//import
module.exports = { createChat, sendMessage, getMessages };
