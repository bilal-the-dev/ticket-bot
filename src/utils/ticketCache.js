const ticketCache = {};

exports.addToCache = (userId) => (ticketCache[userId] = true);
exports.removeFromCache = (userId) => (ticketCache[userId] = undefined);
exports.checkCache = (userId) => ticketCache[userId];
