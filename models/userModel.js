const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://www.vippng.com/png/full/416-4161690_empty-profile-picture-blank-avatar-image-circle.png",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    blockedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
      },
    ],

    isOnline: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
        type: String,
        default: null,
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* hashing password */
/* userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(this.password, salt);
    this.password = passwordHash;
    next();
  } catch (err) {
    next(err);
  }
}); */

/* match password */
userSchema.methods.comparePassword = async (password, hasPassword) => {
  const isMatch = await bcrypt.compare(password, hasPassword);
  return isMatch;
};

/* make password hash */
userSchema.methods.hashPassword = async(password) =>{
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    return passwordHash;
}

const Users = mongoose.model("Users", userSchema);

module.exports = Users;
