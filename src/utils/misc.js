const { PermissionFlagsBits } = require("discord.js");

const { MODERATOR_ROLE_ID_CAN_REPLY, FAQ_CHANGER_ROLE_ID } = process.env;

const isAdmin = (member) =>
  member.permissions.has(PermissionFlagsBits.Administrator);

exports.isAdminAndCanReplyTickets = (member) =>
  member.roles.cache.has(MODERATOR_ROLE_ID_CAN_REPLY) || isAdmin(member);

exports.isAdminAndCanChangeFAQ = (member) =>
  member.roles.cache.has(FAQ_CHANGER_ROLE_ID) || isAdmin(member);
