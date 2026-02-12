const authMiddleware = require('./auth');

const adminMiddleware = authMiddleware(['admin']);

module.exports = adminMiddleware;
