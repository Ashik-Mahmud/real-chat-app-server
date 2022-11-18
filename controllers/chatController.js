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
      creator: user.id,
      receiver: receiverId,
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
      message: "Server Error" + err,
    });
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

/* Edit Group name by chat id */
const editGroupChat = async (req, res) => {
  const user = req.user;
  const { name } = req.body;
  const { chatId } = req.params;

  if (!name) {
    return res.status(401).send({
      success: false,
      message: "Please fill up all the fields",
    });
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(401).send({
        success: false,
        message: "Chat not found",
      });
    }

    if (chat.creator.toString() !== user.id) {
      return res.status(401).send({
        success: false,
        message: "You are not authorized to edit this chat",
      });
    }

    chat.groupName = name;
    await chat.save();

    res.status(200).send({
      success: true,
      message: "Group name updated successfully",
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Server Error",
    });
    console.log(err);
  }
};

/* remove member to the chat group */
const removeMemberFromGroupChat = async (req, res) => {
    const user = req.user;
    const { chatId } = req.params;
    const { memberId } = req.body;

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(401).send({
                success: false,
                message: "Chat not found",
            });
        }

        if (chat.creator.toString() !== user.id) {
            return res.status(401).send({
                success: false,
                message: "You are not authorized to edit this chat",
            });
        }

        const newMembers = chat.users.filter((member) => member.toString() !== memberId);
        chat.users = newMembers;
        await chat.save();

        res.status(200).send({
            success: true,
            message: "Member removed successfully",
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: "Server Error",
        });
        console.log(err);
    }
};


/* join group by Link */
const joinGroupByLink = async (req, res) => {
  const { joinId } = req.body;
  const user = req.user;

  if (!joinId) {
    return res.status(401).send({
      success: false,
      message: "Please fill up all the fields",
    });
  }
  try {
    const chat = await Chat.findById(joinId);
    if (!chat) {
      return res.status(401).send({
        success: false,
        message: "Invalid Join Id",
      });
    }
    if (chat.users.includes(user.id)) {
      return res.status(401).send({
        success: false,
        message: "You are already a member of this group",
      });
    }
    await Chat.findByIdAndUpdate(
      joinId,
      {
        $push: {
          users: user.id,
        },
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "You have joined the group successfully",
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

    const receiverId = chat?.receiver.toString();

    /* remove receiver as friend */
    await Users.findByIdAndUpdate(
      receiverId,
      {
        $pull: {
          friends: user.id,
        },
      },
      { new: true }
    );
    /* remove sender as friend */
    await Users.findByIdAndUpdate(
      user.id,
      {
        $pull: {
          friends: receiverId,
        },
      },
      { new: true }
    );

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
          select: "-password -__v -blockedBy -friends",
        },
      })
      .populate({
        path: "receiver",
        select: "-password -__v",
        populate: {
          path: "friends",
          select: "name avatar email",
        },
      });

    const { search } = req.query;

    chats.map((chat) => {
      const receiver = chat.users.filter((user) => user._id != req.user.id)[0];
      chat.receiver = receiver;
    });

    /* search by name */
    const searchedResult = chats.filter((chat) =>
      chat.receiver?.name?.toLowerCase()?.includes(search?.toLowerCase())
    );

    const groupChats = await Chat.find({
      isGroup: true,
      users: {
        $in: [user.id],
      },
    })
      .populate("users", "-password -__v")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "-password -__v -blockedBy -friends",
        },
      })
      .populate({
        path: "receiver",
        select: "-password -__v",
        populate: {
          path: "friends",
          select: "name avatar email",
        },
      });

    res.status(200).send({
      success: true,
      message: "Chats fetched successfully outside if",
      chats: searchedResult,
      groupChats,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Server Error" + err,
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

    chat.lastMessage.msg = message;
    const newMessage = {
      chat: chatId,
      sender: user.id,
      receiver: chat.users.find((u) => u != user.id),
      message: message,
    };
    const saveMessage = await Message.create(newMessage);
    chat.lastMessage.sender = saveMessage?.sender;

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
      .populate("sender", "name email avatar")
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
  editGroupChat,
  removeChat,
  sendMessage,
  getMessages,
  getAllChatsOfUser,
  deleteMessage,
  joinGroupByLink,
  removeMemberFromGroupChat
};
