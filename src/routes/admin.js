const Composer = require("telegraf/composer");

const { escapeChar } = require("../utils");
const { typesQuery } = require("../constants");

const adminRoute = new Composer();

adminRoute.command("getTime", async (ctx) => {
  const d = new Date();
  const options = {
    timeZone: "Europe/Moscow",
    hour: "numeric",
    minute: "numeric",
  };

  await ctx.replyWithMarkdown(`❗️ ${d}`);
  await ctx.replyWithMarkdown(`❗️ ${d.toString()}`);
  await ctx.replyWithMarkdown(`❗️ ${d.toLocaleTimeString("ru-RU", options)}`);
});

adminRoute.on("callback_query", async (ctx) => {
  const { type } = JSON.parse(ctx.callbackQuery.data);
  const { id, first_name, last_name } = ctx.from;
  const adminName = [first_name, last_name].filter((v) => v).join(" ");
  const escapeAdminName = escapeChar(adminName);

  let moreSpace = 0;

  const entityText = ctx.callbackQuery.message.entities.reduce(
    (acc, entity) => {
      const offset = entity.offset + moreSpace;
      if (entity.type === "bold") {
        acc =
          acc.slice(0, offset) +
          "*" +
          acc.slice(offset, offset + entity.length) +
          "*" +
          acc.slice(offset + entity.length);

        moreSpace = moreSpace + 2;
      }

      if (entity.type === "text_mention") {
        const userName = [entity.user.first_name, entity.user.last_name]
          .filter((v) => v)
          .join(" ");
        const escapeUserName = escapeChar(userName);
        const userNameStr = `[${escapeUserName}](tg://user?id=${entity.user.id})`;
        acc =
          acc.substring(0, offset) +
          userNameStr +
          acc.substring(offset + entity.length, acc.length);
      }

      return acc;
    },
    ctx.callbackQuery.message.text
  );

  const cutText = "*НОВАЯ ЗАЯВКА*";
  const indexCutText = entityText.indexOf(cutText);
  const updatedText = entityText.slice(indexCutText + cutText.length);

  switch (type) {
    case typesQuery.ACCEPT:
      await ctx.answerCbQuery();
      return ctx.editMessageText(
        `✅ *ЗАЯВКУ ПРИНЯЛ!* \n[${escapeAdminName}](tg://user?id=${id})${updatedText}`,
        { parse_mode: "markdown" }
      );

    default:
      return ctx.answerCbQuery();
  }
});

module.exports = adminRoute;
