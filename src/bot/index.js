const { Client, IntentsBitField, Partials } = require("discord.js");
const WOK = require("wokcommands");
const path = require("path");

const getDatabaseConnection = require("./utils/SqliteConnect");

const { TOKEN } = process.env;

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildInvites,
  ],
  partials: [Partials.Channel],
});

client.on("ready", async (readyClient) => {
  console.log(`${readyClient.user.username} is running 🥗`);

  // client.application.commands.set([])
  getDatabaseConnection();
  const { DefaultCommands } = WOK;
  new WOK({
    client,
    commandsDir: path.join(__dirname, "./commands"),
    events: {
      dir: path.join(__dirname, "events"),
    },
    disabledDefaultCommands: [
      DefaultCommands.ChannelCommand,
      DefaultCommands.CustomCommand,
      DefaultCommands.Prefix,
      DefaultCommands.RequiredPermissions,
      DefaultCommands.RequiredRoles,
      DefaultCommands.ToggleCommand,
    ],
    cooldownConfig: {
      errorMessage: "Please wait {TIME} before doing that again.",
      botOwnersBypass: false,
      dbRequired: 300,
    },
  });
});

client.login(TOKEN);

module.exports = client;
