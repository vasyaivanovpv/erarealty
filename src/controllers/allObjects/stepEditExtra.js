const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const { typesQuery, textBlockLimits } = require("../../constants");
const { checkJSONmw } = require("../../helpers");
const { escapeRegExp } = require("../../utils");

const ObjectRe = require("../../models/ObjectRe");

const stepEditExtra = new Scene("step_edit_extra");

stepEditExtra.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `➕ *Редактировать описание* \n\nОпишите подробно объект недвижимости.`
  );
});

stepEditExtra.start((ctx) => {
  return ctx.scene.enter("main_menu");
});

stepEditExtra.on("text", async (ctx) => {
  const { text } = ctx.message;

  if (text.length > textBlockLimits.EXTRA) {
    ctx.session.editObjectRe.extra = text.slice(0, textBlockLimits.EXTRA);
    return ctx.replyWithMarkdown(
      `❗️ *Превышение лимита символов* \n\nНе более *${
        textBlockLimits.EXTRA
      }*\\. \nТак выглядит укороченный вариант\\. \n\n_${escapeRegExp(
        ctx.session.editObjectRe.extra
      )}_ \n\n*Введите новое значение, чтобы исправить\\.* \n\n_Продолжить_ \\- оставить укороченный вариант и перейти к следующему пункту\\. \n_Отменить_ \\- выйти в меню Все объекты\\.`,
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
    await ObjectRe.updateOne(
      { point: ctx.session.editObjectRe.point },
      {
        extra: text,
      }
    );

    return ctx.scene.enter("step_edit_object_re");
  }
});

stepEditExtra.on("callback_query", checkJSONmw, async (ctx) => {
  const { type } = JSON.parse(ctx.callbackQuery.data);

  switch (type) {
    case typesQuery.CONTINUE:
      if (ctx.session.editObjectRe.extra) {
        await ctx.answerCbQuery();
        return ctx.scene.enter("step_edit_object_re");
      } else {
        await ctx.replyWithMarkdown(
          `❗️ Введите пожалуйста дополнительное описание!`
        );
        return ctx.answerCbQuery();
      }

    case typesQuery.LEAVE:
      await ctx.answerCbQuery();
      return ctx.scene.enter("step_object_list");

    default:
      await ctx.replyWithMarkdown(
        `❗️ Введите пожалуйста дополнительное описание!`
      );
      return ctx.answerCbQuery();
  }
});

stepEditExtra.use(async (ctx) =>
  ctx.replyWithMarkdown(`❗️ Введите пожалуйста дополнительное описание!`)
);

module.exports = stepEditExtra;
