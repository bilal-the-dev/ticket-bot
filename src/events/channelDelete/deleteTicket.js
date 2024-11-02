const Tickets = require("../../models/Tickets");

module.exports = async (channel) =>
  await Tickets.findOneAndDelete({ channelId: channel.id }).catch(
    console.error
  );
