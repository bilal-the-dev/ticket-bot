const { Schema, model } = require("mongoose");

const schema = new Schema({
  channelId: { type: String, unique: true, required: true },
  messageHistory: {
    type: [],
    default: [],
  },
});

module.exports = model("AIMessages", schema);
