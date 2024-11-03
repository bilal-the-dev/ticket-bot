const { CommandType } = require("wokcommands");
const isValidURL = require("validator/lib/isURL");
const {
  handleInteractionError,
  replyOrEditInteraction,
} = require("../../utils/interaction");
const getDatabaseConnection = require("../../utils/SqliteConnect");
const { hasAdminPerms } = require("../../utils/misc");

module.exports = {
  description: "Manage FAQs",

  type: CommandType.SLASH,

  options: [
    {
      name: "link",
      description: "link that will be added",
      type: 3,
      required: true,
    },
  ],

  callback: async ({ interaction }) => {
    try {
      const link = interaction.options.getString("link");

      if (!hasAdminPerms(interaction.member))
        throw new Error("Only admins and mods can do that");

      if (!isValidURL(link ?? "https://www.example.com"))
        throw new Error("Invalid link");

      await interaction.deferReply();

      const db = await getDatabaseConnection();

      db.run(`UPDATE faqs SET link = ?`, [link], function (err) {
        if (err) throw err;
      });

      await replyOrEditInteraction(interaction, "Link has been edited");
    } catch (err) {
      handleInteractionError(err, interaction);
    }
  },
};
