const { CommandType } = require("wokcommands");
const {
  handleInteractionError,
  replyOrEditInteraction,
} = require("../../utils/interaction");
const { isAdminAndCanReplyTickets } = require("../../utils/misc");

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
