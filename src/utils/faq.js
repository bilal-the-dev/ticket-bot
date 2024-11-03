const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const getDatabaseConnection = require("./SqliteConnect");

async function getFAQs(limit = 25) {
  const db = await getDatabaseConnection();
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM faqs LIMIT ?`, [limit], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

function createFAQDropdown(faqs, customId) {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder("Choose a FAQ")
    .addOptions(
      faqs.map((faq) => ({
        label: faq.question,
        description: faq.description.substring(0, 100),
        value: faq.id.toString(),
      }))
    );

  const actionRow = new ActionRowBuilder().addComponents(selectMenu);

  return actionRow;
}

module.exports = {
  getFAQs,
  createFAQDropdown,
};
