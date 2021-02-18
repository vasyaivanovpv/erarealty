const { ADMIN_CHAT } = require("../config");
const Composer = require("telegraf/composer");

const adminRoute = require("./admin");
const defaultRoute = require("./default");

const groupChatRoute = new Composer();
groupChatRoute.use(
  Composer.lazy((ctx) => {
    const { chat } = ctx;

    switch (chat.id) {
      case +ADMIN_CHAT:
        return adminRoute;
      default:
        return defaultRoute;
    }
  })
);

module.exports = groupChatRoute;
