const { ButtonBuilder, ButtonStyle } = require("discord.js");

const createDynamicButton = ({ customId, label, style }) => {
  const button = new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(ButtonStyle[style]);
  return button;
};

module.exports = { createDynamicButton };
