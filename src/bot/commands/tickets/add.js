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

      if (channel.parentId !== process.env.TICKET_CATEGORY_ID)
        throw new Error("This is not a ticket");

      if (!isAdminAndCanReplyTickets(member))
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
