// const { CommandType } = require("wokcommands");
// const { PermissionFlagsBits, ActionRowBuilder } = require("discord.js");
// const { createDynamicEmbed } = require("../../utils/components/embed");
// const { createDynamicButton } = require("../../utils/components/button");
// const {
//   handleInteractionError,
//   replyOrEditInteraction,
// } = require("../../utils/interaction");
// const { Panels } = require("shared-models");

// module.exports = {
//   // Command configuration
//   description: "Open a ticket support system",
//   guildOnly: true,
//   permissions: [PermissionFlagsBits.Administrator], // Change to the correct permissions
//   type: CommandType.SLASH,
//   options: [
//     {
//       name: "name",
//       description: "panel name",
//       type: 3,
//       required: true,
//     },
//   ],

//   callback: async ({ interaction }) => {
//     try {
//       await interaction.deferReply({ ephemeral: true });

//       const panelName = interaction.options.getString("name");

//       const guildDoc = await Guilds.findOne({ guildId: guild.id });

//       if (!guildDoc)
//         throw new Error("Something went wrong, try re inviting the bot");

//       // Create a dynamic embed and button with custom data
//       const embed = createDynamicEmbed({
//         title: `Ticket creation`,
//         description: "To create ticket react with 🎫",
//         color: guildDoc.discordSettings.embedColor,
//         footer: { text: guildDoc.discordSettings.embedFooter },
//       });

//       const button = createDynamicButton({
//         customId: "openTicket",
//         label: "Open Ticket",
//         emoji: "🎫",
//         style: "Primary",
//       });

//       const panel = new Panels({ panelName, guildId: interaction.guild.id });

//       const row = new ActionRowBuilder().addComponents(button);

//       await replyOrEditInteraction(interaction, "Done");

//       await interaction.channel.send({
//         embeds: [embed],
//         components: [row],
//       });
//     } catch (err) {
//       await handleInteractionError(err, interaction);
//     }
//   },
// };
