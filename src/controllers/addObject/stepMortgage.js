const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const { typesQuery } = require("../../constants");
const { checkJSONmw } = require("../../helpers");

const stepMortgage = new Scene("step_mortgage");

stepMortgage.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `🧰 *Ипотека* \n\nПрикрепить ссылку к объявлеию на оформлению ипотеки?`,
    Markup.inlineKeyboard(
      [
        Markup.callbackButton(
          "Да",
          JSON.stringify({ type: typesQuery.MORTGAGE, value: true })
        ),
        Markup.callbackButton(
          "Нет",
          JSON.stringify({ type: typesQuery.MORTGAGE, value: false })
        ),
      ],
      { columns: 2 }
    ).extra()
  );
});

stepMortgage.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepMortgage.on("callback_query", checkJSONmw, async (ctx) => {
  const { type, value } = JSON.parse(ctx.callbackQuery.data);

  switch (type) {
    case typesQuery.MORTGAGE:
      ctx.session.post.mortgage = value;

      await ctx.answerCbQuery();
      return ctx.scene.enter("step_extra");
    default:
      await ctx.replyWithMarkdown(
        `❗️ Выберите пожалуйста возможность ипотеки!`
      );
      break;
  }
});

stepMortgage.use(async (ctx) => {
  return ctx.replyWithMarkdown(`❗️ Выберите пожалуйста возможность ипотеки!`);
});

module.exports = stepMortgage;
