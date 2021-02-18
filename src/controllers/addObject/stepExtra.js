const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const { typesQuery, textBlockLimits } = require("../../constants");
const { checkJSONmw } = require("../../helpers");
const { escapeRegExp } = require("../../utils");

const stepExtra = new Scene("step_extra");
const nextStep = "step_phones";

stepExtra.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `➕ *Дополнительное описание* \n\nОпишите подробно объект недвижимости.`
  );
});

stepExtra.start((ctx) => {
  return ctx.scene.enter("main_menu");
});

stepExtra.on("text", async (ctx) => {
  const { text } = ctx.message;

  if (text.length > textBlockLimits.EXTRA) {
    ctx.session.post.extra = text.slice(0, textBlockLimits.EXTRA);
    return ctx.replyWithMarkdown(
      `❗️ *Превышение лимита символов* \n\nНе более *${
        textBlockLimits.EXTRA
      }*\\. \nТак выглядит укороченный вариант\\. \n\n_${escapeRegExp(
        ctx.session.post.extra
      )}_ \n\n*Введите новое значение, чтобы исправить\\.* \n\n_Продолжить_ \\- оставить укороченный вариант и перейти к следующему пункту\\. \n_Отменить_ \\- выйти в Главное меню\\.`,
      Markup.inlineKeyboard([
        Markup.callbackButton(
          "Отменить",
          JSON.stringify({ type: typesQuery.LEAVE })
        ),
        Markup.callbackButton(
          "Продолжить",
          JSON.stringify({ type: typesQuery.CONTINUE })
        ),
      ]).extra({ parse_mode: "MarkdownV2" })
    );
  } else {
    ctx.session.post.extra = text;
    return ctx.scene.enter(nextStep);
  }
});

stepExtra.on("callback_query", checkJSONmw, async (ctx) => {
  const { type } = JSON.parse(ctx.callbackQuery.data);

  switch (type) {
    case typesQuery.CONTINUE:
      if (ctx.session.post.extra) {
        await ctx.answerCbQuery();
        return ctx.scene.enter(nextStep);
      } else {
        await ctx.replyWithMarkdown(
          `❗️ Введите пожалуйста дополнительное описание!`
        );
        break;
      }
    case typesQuery.LEAVE:
      ctx.scene.enter("main_menu");
      break;
    default:
      await ctx.replyWithMarkdown(
        `❗️ Введите пожалуйста дополнительное описание!`
      );
      break;
  }

  await ctx.answerCbQuery();
});

stepExtra.use(async (ctx) =>
  ctx.replyWithMarkdown(`❗️ Введите пожалуйста дополнительное описание!`)
);

module.exports = stepExtra;
