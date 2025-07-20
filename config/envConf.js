const path = require("path");
function config() {
    if (process.env.NODE_ENV.toUpperCase() !== "PRODUCTION")
        require("dotenv").config({ path: path.join(__dirname, "../.env") });
}
module.exports = config;
