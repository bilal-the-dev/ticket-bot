const replyOrEditInteraction = async (interaction, reply) => {
  try {
    if (interaction.deferred || interaction.replied)
      return await interaction.editReply(reply);
    return await interaction.reply(reply);
  } catch (error) {}
};

const handleInteractionError = async (err, interaction) => {
  console.log(err);
  const content = `Err! \`${err.message}\`.`;

  await replyOrEditInteraction(interaction, { content, ephemeral: true });
};

module.exports = { replyOrEditInteraction, handleInteractionError };
