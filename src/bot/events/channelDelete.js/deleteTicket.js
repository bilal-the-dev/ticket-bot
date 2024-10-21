const { Tickets } = require("shared-models");

module.exports = async (channel) => {
  await Tickets.findOneAndDelete({ channelId: channel.id }).catch(console.log);
};
