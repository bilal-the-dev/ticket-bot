const { CommandType } = require("wokcommands");
const { PermissionFlagsBits } = require("discord.js");
const isValidURL = require("validator/lib/isURL");
const { getFAQs, createFAQDropdown } = require("../../utils/faq");
const {
  handleInteractionError,
  replyOrEditInteraction,
} = require("../../utils/interaction");
const getDatabaseConnection = require("../../utils/SqliteConnect");
const {
  isAdminAndCanChangeFAQ,
  canRunFAQListCommand,
  isAdminAndCanReplyTickets,
} = require("../../utils/misc");
const FAQS = require("../../../../faqs.json");
const { Tickets } = require("shared-models");

module.exports = {
  description: "Add a member to ticket",

  type: CommandType.SLASH,
  options: [
    {
      name: "user",
      description: "Add a new user",
      type: 6,
      required: true,
    },
  ],

  callback: async ({ interaction }) => {
    try {
      const { options, channel, member } = interaction;
      const user = options.getMember("user");

      await interaction.deferReply();

      const ticket = await Tickets.findOne({
        channelId: channel.id,
      }).populate("panelId");

      if (!ticket) throw new Error("Ticket is already closed");

      const {
        panelId: { rolesToPing },
      } = ticket;
      // Check if the user has admin permissions
      if (!isAdminAndCanReplyTickets(member, rolesToPing))
        throw new Error("Only admins or mods can perform this task");

      await channel.permissionOverwrites.create(user.id, {
        SendMessages: true,
        ViewChannel: true,
      });

      await replyOrEditInteraction(interaction, `Added ${user}`);
    } catch (err) {
      handleInteractionError(err, interaction);
    }
  },
};
