const { CommandType } = require("wokcommands");
const isValidURL = require("validator/lib/isURL");
const {
  handleInteractionError,
  replyOrEditInteraction,
} = require("../../utils/interaction");
const getDatabaseConnection = require("../../utils/SqliteConnect");
const { hasAdminPerms } = require("../../utils/misc");
const FAQS = require("../../../faqs.json");

module.exports = {
  description: "Set FAQs",

  type: CommandType.SLASH,

  callback: async ({ interaction }) => {
    try {
      if (!hasAdminPerms(interaction.member))
        throw new Error("Only admins and mods can do that");

      await interaction.deferReply({ ephemeral: false });

      const db = await getDatabaseConnection();

      FAQS.forEach((faq) => {
        if (!isValidURL(faq.link))
          throw new Error(`Invalid link for FAQ: ${faq.question}`);

        db.run(
          `INSERT INTO faqs (question, description, link) VALUES (?, ?, ?)`,
          [faq.question, faq.description, faq.link],
          function (err) {
            if (err) throw err;
          }
        );
      });

      await replyOrEditInteraction(
        interaction,
        "FAQs have been successfully added."
      );
    } catch (err) {
      handleInteractionError(err, interaction);
    }
  },
};
