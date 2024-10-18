const { Guilds } = require("shared-models");

module.exports = async (guild) => {
  try {
    const d = await Guilds.findOneAndUpdate(
      { guildId: guild.id },
      { guildId: guild.id },
      { upsert: true, new: true }
    );

    console.log(d);
  } catch (err) {
    console.log(err);
  }
};
