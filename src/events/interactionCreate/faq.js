const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { createFAQEmbed } = require("../../utils/faq");
const {
  handleInteractionError,
  replyOrEditInteraction,
} = require("../../utils/interaction");
const { createDynamicEmbed } = require("../../utils/components/embed");
const getDatabaseConnection = require("../../utils/SqliteConnect");
const { error } = require("console");

module.exports = async (interaction) => {
  try {
    if (!interaction.isStringSelectMenu()) return;

    await interaction.deferReply({ ephemeral: true });

    const db = await getDatabaseConnection();
    const {
      customId,
      values,
      message: { content },
    } = interaction;
    const selectedFAQId = values[0];

    if (customId === "delete_faq") {
      db.run(`DELETE FROM faqs WHERE id = ?`, [selectedFAQId], function (err) {
        if (err) throw err;

        if (this.changes === 0)
          return replyOrEditInteraction(interaction, "FAQ not found.");

        replyOrEditInteraction(interaction, "FAQ deleted successfully.");
      });
    }

    if (customId === "edit_faq") {
      const regex = /\[(.*?)\]\(<(.*?)>\)/;
      const match = content.match(regex);

      if (!match) throw new Error("Something went wrong");
      const url = match[2];

      db.run(
        `UPDATE faqs SET link = ? WHERE id =?`,
        [url, selectedFAQId],
        function (err) {
          if (err) throw err;

          if (this.changes === 0)
            return replyOrEditInteraction(interaction, "FAQ not edited.");

          replyOrEditInteraction(interaction, "FAQ edited successfully.");
        }
      );
    }
    if (customId === "view_faq") {
      db.get(`SELECT * FROM faqs WHERE id = ?`, [selectedFAQId], (err, row) => {
        if (err) throw err;

        if (!row) return replyOrEditInteraction(interaction, "FAQ not found.");

        const faqEmbed = createDynamicEmbed({
          title: "RPC",
          description: "Secure browser",
        });

        const button = new ButtonBuilder()
          .setLabel("Proceed")
          .setURL(row.link)
          .setStyle(ButtonStyle.Link);

        replyOrEditInteraction(interaction, {
          embeds: [faqEmbed],
          components: [new ActionRowBuilder().addComponents(button)],
        }).catch(() => null);
      });
    }
  } catch (err) {
    await handleInteractionError(err, interaction);
  }
};
