const Composer = require("telegraf/composer");

const defaultRoute = new Composer();
defaultRoute.on("new_chat_members", async (ctx) => {
  await ctx.replyWithMarkdown(
    `Аренда жилья в СПБ @lvngrm и в МСК @lvngrm\\_msk. \nДобавить свое объявление можно через бота, сообщение которого вы сейчас читаете.`
  );
});

module.exports = defaultRoute;
