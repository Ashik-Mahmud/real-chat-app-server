const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const Users = require("../models/userModel");

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
      res.status(200).send({
        success: true,
        message: "Chat already exists",
        chatId: chat._id,
      });
      return;
    }

    /* send receiver Id as friend */
    await Users.findByIdAndUpdate(
      receiverId,
      {
        $push: {
          friends: user.id,
        },
      },
      { new: true }
    );
    /* send sender id as friend */
    await Users.findByIdAndUpdate(
      user.id,
      {
        $push: {
          friends: receiverId,
        },
      },
      { new: true }
    );

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
};

/* create group chat */
const createGroupChat = async (req, res) => {
  const user = req.user;
  const { name, members } = req.body;
  if (!name || !members) {
    return res.status(401).send({
      success: false,
      message: "Please fill up all the fields",
    });
  }

  /* check if members is less then 2 */
  if (members.length < 2) {
    return res.status(401).send({
      success: false,
      message: "Please add atleast 2 members",
    });
  }

  try {
    const newChat = new Chat({
      creator: user.id,
      groupName: name,
      isGroup: true,
      users: [...members, user.id],
    });
    const savedChat = await newChat.save();
    res.status(200).send({
      success: true,
      message: "Group chat created successfully",
      chatId: savedChat._id,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Server Error",
    });
    console.log(err);
  }
};

/* remove Chat */
const removeChat = async (req, res) => {
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
    if (chat.users.includes(user.id)) {
      await Message.deleteMany({ chat: chatId });
      await chat.remove();
      return res.status(200).send({
        success: true,
        message: "Chat removed successfully",
      });
    }

    res.status(401).send({
      success: false,
      message: "Unauthorized",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Server Error",
    });
    console.log(err);
  }
};

/* get all chats by user */
const getAllChatsOfUser = async (req, res) => {
  const user = req.user;
  try {
    const chats = await Chat.find({
      users: {
        $in: [user.id],
      },
    })
      .populate("users", "-password -__v")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "-password -__v",
        },
      });

    /* get only receiver users */
    let chatsWithReceiver = chats.map((c) => {
      const receiver = c.users.find((u) => u._id != user.id);
      return receiver;
    });

    /* search receivers by name and email */
    const { search } = req.query;
    if (search) {
      chatsWithReceiver = chatsWithReceiver.filter((c) => {
        const regex = new RegExp(search, "gi");
        return c.name.match(regex) || c.email.match(regex);
      });
    }

    res.status(200).send({
      success: true,
      message: "Chats fetched successfully outside if",
      chats,
      receivers: chatsWithReceiver,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Server Error",
    });
  }
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

/* remove message by user */
const deleteMessage = async (req, res) => {
  const user = req.user;
  const { messageId } = req.params;
  if (!messageId) {
    return res.status(401).send({
      success: false,
      message: "Please fill up all the fields",
    });
  }
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).send({
        success: false,
        message: "Message not found",
      });
    }
    if (message.sender != user.id) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized",
      });
    }
    await message.remove();
    res.status(200).send({
      success: true,
      message: "Message removed successfully",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Server Error",
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

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email")
      .populate("receiver", "name email");

    /* code for isRead or not */
    const unreadMessages = messages.filter(
      (m) => m.receiver._id == user.id && !m.isRead
    );
    if (unreadMessages.length > 0) {
      unreadMessages.forEach(async (m) => {
        m.isRead = true;
        await m.save();
      });
    }

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
module.exports = {
  createChat,
  createGroupChat,
  removeChat,
  sendMessage,
  getMessages,
  getAllChatsOfUser,
  deleteMessage,
};
