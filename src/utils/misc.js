const { PermissionFlagsBits } = require("discord.js");

const { MODERATOR_ROLE_ID_CAN_REPLY } = process.env;

const isAdmin = (member) =>
  member.permissions.has(PermissionFlagsBits.Administrator);

exports.isAdminAndCanReplyTickets = (member) =>
  member.roles.cache.has(MODERATOR_ROLE_ID_CAN_REPLY) || isAdmin(member);
