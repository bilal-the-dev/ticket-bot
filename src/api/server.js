const http = require("node:http");

const discordClient = require("../bot");
const client = require("../bot");
const { URL } = require("node:url");
const { ChannelType } = require("discord.js");

const { BASE_URL, BOT_OUATH_URL, PORT = 8080 } = process.env;
http
  .createServer(function (req, res) {
    try {
      const { url, method } = req;

      if (!url.startsWith(BASE_URL) || !client.isReady()) return res.write();

      const slicedURL = url.split("/api")[1];

      // console.log(slicedURL);

      // console.log(req.headers);
      // console.log(req.trailers);

      req.on("error", console.log);
      res.on("error", console.log);

      if (method === "GET") {
        if (slicedURL.startsWith("/guilds")) {
          const [_, , guildId, action] = slicedURL.split("/");

          if (!action.startsWith("cache")) return;

          const queryParams = new URLSearchParams(url.split("?")[1]);
          console.log(queryParams);

          const data = {};

          const guild = client.guilds.cache.get(guildId);

          if (!guild) return res.end("{}");

          if (queryParams.get("withRoles") == "true") {
            const roles = guild.roles.cache.filter((r) => !r.managed) ?? [];

            data.roles = roles;
          }

          if (queryParams.get("withChannels") == "true") {
            const channels =
              guild.channels.cache.filter(
                (c) => c.type === ChannelType.GuildText
              ) ?? [];

            data.channels = channels;
          }

          if (queryParams.get("withCategories") == "true") {
            const categories =
              guild.channels.cache.filter(
                (c) => c.type === ChannelType.GuildCategory
              ) ?? [];

            data.categories = categories;
          }

          return res.end(JSON.stringify(data));
        }
      }
      if (method === "POST") {
        let body = [];
        req
          .on("data", (chunk) => {
            // console.log(chunk);

            body.push(chunk);
          })
          .on("end", () => {
            body = Buffer.concat(body).toString();
            console.log(body);

            const guilds = JSON.parse(body);

            const modifiedGuilds = guilds.map((g) => {
              client.guilds.cache.has(g.id) ? (g.isBotPresent = true) : null;

              return g;
            });
            res.end(
              JSON.stringify({ inviteURL: BOT_OUATH_URL, modifiedGuilds })
            );
          });
      }
    } catch (error) {
      console.log(error);
    }
  })
  .listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
  });
