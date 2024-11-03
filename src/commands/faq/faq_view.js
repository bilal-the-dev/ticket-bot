const { CommandType } = require("wokcommands");
const { getFAQs, createFAQDropdown } = require("../../utils/faq");
const {
  handleInteractionError,
  replyOrEditInteraction,
} = require("../../utils/interaction");
const { hasAdminPerms } = require("../../utils/misc");

module.exports = {
  description: "View FAQs",

  type: CommandType.SLASH,

  callback: async ({ interaction }) => {
    try {
      if (!hasAdminPerms(interaction.member))
        throw new Error("Only admins and mods can do that");

      await interaction.deferReply();

      const faqs = await getFAQs();

      console.log(faqs);

      if (faqs.length === 0)
        return replyOrEditInteraction(interaction, "No FAQs found.");

      const dropdownMenu = createFAQDropdown(faqs, "view_faq");

      await replyOrEditInteraction(interaction, {
        content: "Select the category of your issue:",
        components: [dropdownMenu],
      });
    } catch (err) {
      handleInteractionError(err, interaction);
    }
  },
};
