const bcrypt = require('bcrypt');

const hashedpwd = async (pwd) => await bcrypt.hash(pwd, 12);
const authenticate = async (user, pwd) => await bcrypt.compare(pwd, user.password);

module.exports = { hashedpwd, authenticate };