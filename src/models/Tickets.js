const { model, Schema } = require("mongoose");

const schema = new Schema({
  userId: { type: String, required: true },
  channelId: { type: String, required: true },
});

module.exports = model("Tickets", schema);
