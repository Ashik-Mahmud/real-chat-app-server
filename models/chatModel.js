const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "Users",
    },
    groupName: {
      type: String,
      trim: true,
    },
    groupImage: {
      type: String,
      default:
        "https://www.vippng.com/png/full/416-4161690_empty-profile-picture-blank-avatar-image-circle.png",
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: true,
      },
    ],
    lastMessage: {
      type: String,
      trim: true,
    },
  },

  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
