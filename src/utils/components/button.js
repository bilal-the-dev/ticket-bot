const { ButtonBuilder, ButtonStyle } = require("discord.js");

const createDynamicButton = ({ customId, label, style, emoji }) => {
  const button = new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(ButtonStyle[style]);

  emoji && button.setEmoji(emoji);
  return button;
};

module.exports = { createDynamicButton };
