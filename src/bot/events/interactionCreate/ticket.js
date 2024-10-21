const {
  ActionRowBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  EmbedBuilder,
  ButtonBuilder,
} = require("discord.js");
const {
  handleInteractionError,
  replyOrEditInteraction,
} = require("../../utils/interaction");
const { createDynamicEmbed } = require("../../utils/components/embed");
const { createDynamicButton } = require("../../utils/components/button");
const { isAdminAndCanReplyTickets } = require("../../utils/misc");
const { Panels, Tickets, Guilds } = require("shared-models");

module.exports = async (interaction) => {
  try {
    if (!interaction.isButton()) return;

    const {
      user,
      guild,
      customId,
      member,
      message: { id: panelMessageId },
      channel,
    } = interaction;

    if (customId === "openTicket") {
      await interaction.deferReply({ ephemeral: true });

      const panel = await Panels.findOne({ panelMessageId }).lean();

      if (!panel)
        throw new Error("The panel does not work any more (deleted by admin)");

      const {
        ticketSettings: { ticketCap, name },
        openedTickets,
        panelName,
        ticketOpenCategoryId,
        rolesToPing,
        ticketEmbed,
        ticketCloseButton,
      } = panel;

      const userOpenedTickets = await Tickets.countDocuments({
        panelId: panel._id,
        userId: user.id,
      });

      if (userOpenedTickets >= ticketCap)
        throw new Error(
          `You can not have more than ${ticketCap} ticket(s) opened at a time`
        );

      const { discordSettings } = await Guilds.findOne({ guildId: guild.id });

      const embed = new EmbedBuilder(ticketEmbed);

      console.log(ticketCloseButton);

      ticketCloseButton.style = ButtonStyle[ticketCloseButton.style];
      console.log(ticketCloseButton);

      const closeButton = new ButtonBuilder(ticketCloseButton);

      const row = new ActionRowBuilder().addComponents(closeButton);

      const channelName = name
        .replace("{ticketnum}", openedTickets)
        .replace("{username}", user.username)
        .replace("{panel}", panelName);

      const permOverwrites = rolesToPing.map((r) => ({
        id: r,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
        ],
      }));

      const ticketChannel = await interaction.guild.channels.create({
        name: channelName,
        parent: ticketOpenCategoryId,
        permissionOverwrites: [
          {
            id: user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          },
          ...(discordSettings.adminRoleId && {
            id: discordSettings.adminRoleId,
            allow: [PermissionFlagsBits.ViewChannel],
            deny: [PermissionFlagsBits.SendMessages],
          }),
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          ...permOverwrites,
        ],
      });

      const sendP = ticketChannel.send({
        content: `${rolesToPing.reduce((acc, cur) => acc + `<@&${cur}> `, "")}`,
        embeds: [embed],
        components: [row],
      });

      // await ticketChannel.send("Hello, how may i assist you today?");

      const replyP = replyOrEditInteraction(interaction, {
        content: `Your ticket has been created ${ticketChannel}`,
        ephemeral: true,
      });

      // panel.openedTickets++;

      const addP = Guilds.findOneAndUpdate(
        { guildId: guild.id },
        { $push: { openedTickets: new Date() } }
      );

      const newTicketP = Tickets.create({
        userId: user.id,
        creatorName: user.username,
        guildId: guild.id,
        panelId: panel._id,
        channelId: ticketChannel.id,
      });
      const panelSaveP = Panels.findByIdAndUpdate(panel._id, {
        $inc: { openedTickets: 1 },
      });

      await Promise.all([sendP, replyP, newTicketP, panelSaveP, addP]);
    }

    if (customId === "closeTicket") {
      await interaction.deferReply({ ephemeral: true });

      const ticket = await Tickets.findOne({
        channelId: channel.id,
        status: "active",
      }).populate("panelId");

      if (!ticket) throw new Error("Ticket is already closed");

      const {
        panelId: { rolesToPing, _id },
      } = ticket;
      // Check if the user has admin permissions
      if (!isAdminAndCanReplyTickets(member, rolesToPing))
        throw new Error("Only admins or mods can perform this task");

      const { discordSettings } = await Guilds.findOne({ guildId: guild.id });

      const confirmationEmbed = createDynamicEmbed({
        title: "Confirm Ticket Closure",
        description: "Are you sure you want to close this ticket?",
        color: discordSettings.embedColor,
        footer: { text: discordSettings.embedFooter },
      });

      const yesButton = createDynamicButton({
        customId: `confirm_close_ticket_yes-${_id}`,
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
