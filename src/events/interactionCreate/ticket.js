const {
  ActionRowBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const {
  handleInteractionError,
  replyOrEditInteraction,
} = require("../../utils/interaction");
const { createDynamicEmbed } = require("../../utils/components/embed");
const { createDynamicButton } = require("../../utils/components/button");
const { isAdminAndCanReplyTickets } = require("../../utils/misc");
const Tickets = require("../../models/Tickets");
const { createTranscript } = require("discord-html-transcripts");

const {
  MODERATOR_ROLE_ID_CAN_VIEW,
  MODERATOR_ROLE_ID_CAN_REPLY,
  TICKET_CATEGORY_ID,
  LOGS_CHANNEL_ID,
} = process.env;

module.exports = async (interaction) => {
  try {
    if (!interaction.isButton()) return;

    const { user, guild, customId, member, channel } = interaction;

    if (customId === "create_ticket") {
      await interaction.deferReply({ ephemeral: true });

      const userTickets = await Tickets.find({ userId: user.id });

      if (userTickets.length > 0)
        throw new Error("Your ticket is already open");

      const channelName = `ticket-${user.username}`;

      const category = guild.channels.cache.get(TICKET_CATEGORY_ID);

      const ticketChannel = await interaction.guild.channels.create({
        name: channelName,
        parent: category.id,
        permissionOverwrites: [
          {
            id: user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          },
          {
            id: MODERATOR_ROLE_ID_CAN_REPLY,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          },
          {
            id: MODERATOR_ROLE_ID_CAN_VIEW,
            allow: [PermissionFlagsBits.ViewChannel],
            deny: [PermissionFlagsBits.SendMessages],
          },
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
        ],
      });

      await Tickets.create({ userId: user.id, channelId: ticketChannel.id });

      const ticketEmbed = createDynamicEmbed({
        title: `Ticket Created`,
        description: `Thanks ${user} for contacting the support team.\nPlease explain your case so we can help you as quickly as possible.`,
        footer: {
          text: interaction.guild.members.me.displayName,
          iconURL: interaction.guild.members.me.displayAvatarURL(),
        },
      });

      const closeButton = createDynamicButton({
        customId: "close_ticket",
        label: "Close Ticket",
        emoji: "🔒",
        style: "Danger",
      });

      const row = new ActionRowBuilder().addComponents(closeButton);

      await ticketChannel.send({
        content: `<@&${MODERATOR_ROLE_ID_CAN_REPLY}>`,
        embeds: [ticketEmbed],
        components: [row],
      });

      await replyOrEditInteraction(interaction, {
        content: `Your ticket has been created ${ticketChannel}`,
        ephemeral: true,
      });
    }

    if (customId === "close_ticket") {
      await interaction.deferUpdate({});

      // Check if the user has admin permissions
      if (!isAdminAndCanReplyTickets(member))
        throw new Error("Only admins or mods can perform this task");

      const closingEmbed = createDynamicEmbed({
        title: "Ticket Closing",
        description: "This ticket will close in a few seconds.",
      });

      await Tickets.findOneAndDelete({ channelId: channel.id });

      await channel.send({ embeds: [closingEmbed] });

      const transcript = await createTranscript(channel, {
        limit: -1,
        returnType: "attachment",
        filename: `${channel.name}.html`,
        poweredBy: false,
      });

      const logsChannel = guild.channels.cache.get(LOGS_CHANNEL_ID);

      await logsChannel.send({
        content: `Transcript for ${channel}, closed by ${user}`,
        files: [transcript],
      });

      await channel.delete();
    }
  } catch (error) {
    await handleInteractionError(error, interaction);
  }
};
