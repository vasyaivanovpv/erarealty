const config = {
  TOKEN: process.env.TOKEN_TEST,
  MAIN_CHANNEL: process.env.CHANNEL_TEST,
  ADMIN_CHAT: process.env.TEST_ADMIN_CHAT,
  DB_URL: "mongodb://localhost:27017/" + process.env.DB_NAME,
  DB_HOST: "localhost:27017",
  DB_NAME: process.env.DB_NAME,
  DB_USER: "",
  DB_PASSWORD: "",
  BOT_USERNAME: "veshanieBot",
};

if (process.env.NODE_ENV === "production") {
  config.TOKEN = process.env.TOKEN;
  config.MAIN_CHANNEL = process.env.MAIN_CHANNEL;
  config.ADMIN_CHAT = process.env.ADMIN_CHAT;
  config.DB_URL = process.env.DB_URL;
  config.DB_HOST = process.env.DB_HOST;
  config.DB_USER = process.env.DB_USER;
  config.DB_PASSWORD = process.env.DB_PASSWORD;
  config.BOT_USERNAME = "testserverbybot";
}

module.exports = config;
