const {
  ActionRowBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const {
  handleInteractionError,
  replyOrEditInteraction,
} = require("../../utils/interaction");
const { createDynamicEmbed } = require("../../utils/components/embed");
const { createDynamicButton } = require("../../utils/components/button");
const { isAdminAndCanReplyTickets } = require("../../utils/misc");

const {
  MODERATOR_ROLE_ID_CAN_VIEW,
  MODERATOR_ROLE_ID_CAN_REPLY,
  TICKET_CATEGORY_ID,
} = process.env;
module.exports = async (interaction) => {
  try {
    if (!interaction.isButton()) return;

    const { user, guild, customId, member } = interaction;

    if (customId === "create_ticket") {
      await interaction.deferReply({ ephemeral: true });

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

      const ch = await ticketChannel.send({
        content: `<@&${MODERATOR_ROLE_ID_CAN_REPLY}>`,
        embeds: [ticketEmbed],
        components: [row],
      });

      await replyOrEditInteraction(interaction, {
        content: `Your ticket has been created ${ch}`,
        ephemeral: true,
      });
    }

    if (customId === "close_ticket") {
      await interaction.deferReply({ ephemeral: true });

      // Check if the user has admin permissions
      if (!isAdminAndCanReplyTickets(member))
        throw new Error("Only admins or mods can perform this task");

      const confirmationEmbed = createDynamicEmbed({
        title: "Confirm Ticket Closure",
        description: "Are you sure you want to close this ticket?",
      });

      const yesButton = createDynamicButton({
        customId: "confirm_close_ticket_yes",
        label: "Yes",
        style: ButtonStyle.Danger,
      });

      const noButton = createDynamicButton({
        customId: "confirm_close_ticket_no",
        label: "No",
        style: ButtonStyle.Secondary,
      });

      const row = new ActionRowBuilder().addComponents(yesButton, noButton);

      await replyOrEditInteraction(interaction, {
        embeds: [confirmationEmbed],
        components: [row],
      });
    }
  } catch (error) {
    await handleInteractionError(error, interaction);
  }
};
