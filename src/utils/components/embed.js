const { EmbedBuilder } = require("discord.js");
const STATIC_EMBED_COLOR = "#5865F2";

const createDynamicEmbed = ({
  title,
  description,
  thumbnail,
  footer,
  image,
}) => {
  const embed = new EmbedBuilder().setColor(STATIC_EMBED_COLOR);

  if (description) embed.setDescription(description);
  if (title) embed.setTitle(title);
  if (thumbnail) embed.setThumbnail(thumbnail);
  if (footer) embed.setFooter({ text: footer });
  if (image) embed.setImage(image);

  return embed;
};

module.exports = { createDynamicEmbed };
