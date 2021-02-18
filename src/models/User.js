const { Schema, model } = require("mongoose");

const schema = new Schema({
  created: Date,
  telegramId: String,
  firstName: String,
  lastName: String,
  isBanned: {
    type: Boolean,
    default: false,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  isMainAdmin: {
    type: Boolean,
    default: false,
  },
});

const User = model("User", schema);

module.exports = User;
