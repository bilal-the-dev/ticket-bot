const { CommandType } = require("wokcommands");
const { PermissionFlagsBits, ActionRowBuilder } = require("discord.js");
const { createDynamicEmbed } = require("../../utils/components/embed");
const { createDynamicButton } = require("../../utils/components/button");
const {
  handleInteractionError,
  replyOrEditInteraction,
} = require("../../utils/interaction");

module.exports = {
  // Command configuration
  description: "Open a ticket support system",
  guildOnly: true,
  permissions: [PermissionFlagsBits.Administrator],
  type: CommandType.SLASH,

  callback: async ({ interaction }) => {
    try {
      await interaction.deferReply({ ephemeral: true });

      // Create a dynamic embed and button with custom data
      const embed = createDynamicEmbed({
        title: `Ticket creation`,
        description: "To create ticket react with 🎫",
        footer: {
          text: interaction.guild.members.me.displayName,
          iconURL: interaction.guild.members.me.displayAvatarURL(),
        },
      });

      const button = createDynamicButton({
        customId: "create_ticket",
        label: "Create Ticket",
        emoji: "🎫",
        style: "Primary",
      });

      const row = new ActionRowBuilder().addComponents(button);

      await replyOrEditInteraction(interaction, "Done");

      await interaction.channel.send({
        embeds: [embed],
        components: [row],
      });
    } catch (err) {
      await handleInteractionError(err, interaction);
    }
  },
};
