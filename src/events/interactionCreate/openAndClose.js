const { handleInteractionError } = require("../../utils/interaction");
const { createDynamicEmbed } = require("../../utils/components/embed");
const { createTranscript } = require("discord-html-transcripts");

const { LOGS_CHANNEL_ID, CLOSE_TICKET_CATEGORY_ID } = process.env;
module.exports = async (interaction) => {
  try {
    if (!interaction.isButton()) return;

    const { guild, channel, user } = interaction;

    if (interaction.customId === "confirm_close_ticket_no") {
      await interaction.update({
        content: "Cancelled",
        components: [],
        embeds: [],
      });
    }

    if (interaction.customId === "confirm_close_ticket_yes") {
      if (channel.parentId === CLOSE_TICKET_CATEGORY_ID)
        throw new Error("Ticket is already closed");

      const closingEmbed = createDynamicEmbed({
        title: "Ticket Closing",
        description: "This ticket will close in a few seconds.",
      });
      await interaction.update({
        content: "Closing",
        embeds: [],
        components: [],
      });

      await channel.send({ embeds: [closingEmbed] });

      console.log(channel.name);

      setTimeout(async () => {
        try {
          const transcript = await createTranscript(channel, {
            limit: -1,
            returnType: "attachment",
            filename: `${channel.name}.html`,
            poweredBy: false,
          });

          console.log(transcript);

          const logsChannel = guild.channels.cache.get(LOGS_CHANNEL_ID);

          await channel.setParent(CLOSE_TICKET_CATEGORY_ID, {
            lockPermissions: true,
          });

          await logsChannel.send({
            content: `Transcript for ticket ${channel.name}, closed by ${user}`,
            files: [transcript],
          });
        } catch (error) {
          console.log(error);
        }
      }, 3000);
    }
  } catch (error) {
    await handleInteractionError(error, interaction);
  }
};
