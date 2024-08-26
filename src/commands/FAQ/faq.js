const { CommandType } = require("wokcommands");
const { PermissionFlagsBits } = require("discord.js");
const isValidURL = require("validator/lib/isURL");
const { getFAQs, createFAQDropdown } = require("../../utils/faq");
const {
  handleInteractionError,
  replyOrEditInteraction,
} = require("../../utils/interaction");
const getDatabaseConnection = require("../../utils/SqliteConnect");

module.exports = {
  description: "Manage FAQs",

  type: CommandType.SLASH,
  options: [
    {
      name: "add",
      description: "Add a new FAQ",
      type: 1,
      options: [
        {
          name: "question",
          description: "FAQ question",
          type: 3,
          required: true,
        },
        {
          name: "description",
          description: "FAQ description",
          type: 3,
          required: true,
        },
        {
          name: "link",
          description: "link for more information",
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: "delete",
      description: "Delete an FAQ",
      type: 1,
    },
    {
      name: "view",
      description: "View FAQs",
      type: 1,
    },
    {
      name: "edit",
      description: "Edit an FAQ",
      type: 1,
      options: [
        {
          name: "link",
          description: "link that will be added",
          type: 3,
          required: true,
        },
      ],
    },
  ],

  callback: async ({ interaction }) => {
    try {
      const subcommand = interaction.options.getSubcommand();
      const question = interaction.options.getString("question");
      const description = interaction.options.getString("description");
      const link = interaction.options.getString("link");

      if (!isValidURL(link ?? "https://www.example.com"))
        throw new Error("Invalid link");

      await interaction.deferReply({ ephemeral: subcommand === "view" });

      if (subcommand === "add") {
        const db = await getDatabaseConnection();
        // Insert the FAQ into the database
        db.run(
          `INSERT INTO faqs (question, description, link) VALUES (?, ?, ?)`,
          [question, description, link],
          function (err) {
            if (err) throw err;

            replyOrEditInteraction(
              interaction,
              `FAQ added successfully with ID ${this.lastID}`
            );
          }
        );

        return;
      }

      const types = {
        delete: "delete_faq",
        edit: "edit_faq",
        view: "view_faq",
      };

      const type = types[subcommand];

      const faqs = await getFAQs();

      console.log(faqs);

      if (faqs.length === 0)
        return replyOrEditInteraction(interaction, "No FAQs found.");

      const dropdownMenu = createFAQDropdown(faqs, type);
      await replyOrEditInteraction(interaction, {
        content:
          subcommand === "edit"
            ? `[New link](<${link}>)`
            : "Select the category of your issue:",
        components: [dropdownMenu],
      });
    } catch (err) {
      handleInteractionError(err, interaction);
    }
  },
};
