const { handleInteractionError } = require("../../utils/interaction");
const { createDynamicEmbed } = require("../../utils/components/embed");
const { createTranscript } = require("discord-html-transcripts");
const { Guilds, Panels } = require("shared-models");

module.exports = async (interaction) => {
  try {
    if (!interaction.isButton()) return;

    const { guild, channel, user, customId } = interaction;

    const [type, panelId] = customId.split("-");

    if (type === "confirm_close_ticket_no") {
      await interaction.update({
        content: "Cancelled",
        components: [],
        embeds: [],
      });
    }

    if (type === "confirm_close_ticket_yes") {
      const doc = await Guilds.findOne({
        guildId: guild.id,
      });

      const { discordSettings } = doc;

      const panel = await Panels.findById(panelId);

      if (!panel)
        throw new Error(
          "Panel connected to this ticket seems to be deleted by admins"
        );

      const closingEmbed = createDynamicEmbed({
        title: "Ticket Closing",
        description: "This ticket will close in a few seconds.",
        color: discordSettings.embedColor,
        footer: { text: discordSettings.embedFooter },
      });
      await interaction.update({
        content: "Closing",
        embeds: [],
        components: [],
      });

      doc.closedTickets.push(new Date());
      await doc.save();

      const closeMsg = await channel.send({ embeds: [closingEmbed] });

      setTimeout(async () => {
        try {
          if (!panel.saveTranscripts) return;

          const logsChannel = guild.channels.cache.get(
            discordSettings.loggingChannelId
          );

          if (!logsChannel) return;

          const transcript = await createTranscript(channel, {
            limit: -1,
            returnType: "attachment",
            filename: `${channel.name}.html`,
            poweredBy: false,
          });

          await channel.setParent(panel.ticketCloseCategoryId, {
            lockPermissions: true,
          });

          await logsChannel.send({
            content: `Transcript for ${channel}, closed by ${user}`,
            files: [transcript],
          });

          await closeMsg.delete();
        } catch (error) {
          console.log(error);
        }
      }, 3000);
    }
  } catch (error) {
    await handleInteractionError(error, interaction);
  }
};
