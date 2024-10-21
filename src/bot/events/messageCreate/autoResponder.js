const { Guilds, Tickets } = require("shared-models");

module.exports = async (message) => {
  try {
    const {
      content,
      guild: { id: guildId },
      author: { bot },
      channel: { id: channelId },
    } = message;

    if (bot || !content) return;

    const guild = await Guilds.findOne({ guildId });

    if (!guild || guild?.autoResponders?.length === 0) return;

    console.log(guild);

    const responder = guild.autoResponders.find(
      (a) =>
        content.includes(a.trigger) && !a.ignoredChannels.includes(channelId)
    );

    console.log(responder);

    if (!responder) return;

    const {
      reply,
      deleteAfterSeconds,
      deleteTriggerMessage,
      applyOnTicketOnly,
    } = responder;

    if (applyOnTicketOnly) {
      const ticket = await Tickets.findOne({ channelId });
      console.log("NOT A TICKET");

      if (!ticket) return;
    }

    const m = await message.reply(reply);

    if (deleteTriggerMessage)
      setTimeout(async () => {
        await m.delete().catch(console.log);
      }, deleteAfterSeconds * 1000);
  } catch (error) {
    console.log(error);
  }
};
