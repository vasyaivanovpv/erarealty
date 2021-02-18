const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const { typesQuery, textBlockLimits } = require("../../constants");
const { escapeRegExp } = require("../../utils");
const { checkJSONmw } = require("../../helpers");

const stepAddress = new Scene("step_address");

stepAddress.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `➕ *Адрес* \n\nВведите адрес, по которому продается недвижимость. \n\nНапример: улица Терновского 214`
  );
});

stepAddress.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepAddress.on("text", async (ctx) => {
  const { text } = ctx.message;

  if (text.length > textBlockLimits.ADDRESS) {
    ctx.session.post.address = text.slice(0, textBlockLimits.ADDRESS);
    return ctx.replyWithMarkdown(
      `❗️ *Превышение лимита символов* \n\nНе более *${
        textBlockLimits.ADDRESS
      }*\\. \nТак выглядит укороченный вариант\\. \n\n_${escapeRegExp(
        ctx.session.post.address
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
    ctx.session.post.address = text;
    return ctx.scene.enter("step_mortgage");
  }
});

stepAddress.on("callback_query", checkJSONmw, async (ctx) => {
  const { type } = JSON.parse(ctx.callbackQuery.data);

  switch (type) {
    case typesQuery.CONTINUE:
      if (ctx.session.post.address) {
        await ctx.answerCbQuery();
        return ctx.scene.enter("step_mortgage");
      } else {
        await ctx.replyWithMarkdown(`❗️ Введите пожалуйста адрес!`);
        break;
      }
    case typesQuery.LEAVE:
      ctx.scene.enter("main_menu");
      break;
    default:
      await ctx.replyWithMarkdown(`❗️ Введите пожалуйста адрес!`);
      break;
  }

  await ctx.answerCbQuery();
});

stepAddress.use(async (ctx) =>
  ctx.replyWithMarkdown(`❗️ Введите пожалуйста дополнительное описание!`)
);

module.exports = stepAddress;
