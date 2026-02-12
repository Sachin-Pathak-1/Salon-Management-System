const authMiddleware = require('./auth');

const staffAuth = authMiddleware(['staff']);

module.exports = staffAuth;
