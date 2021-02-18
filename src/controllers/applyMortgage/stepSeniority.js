const { Markup } = require("telegraf");
const Scene = require("telegraf/scenes/base");
const { seniorityTypes } = require("../../constants");

const seniorityTypesKeys = Object.keys(seniorityTypes);

const stepSeniority = new Scene("step_seniority");

stepSeniority.enter(async (ctx) => {
  const ik = seniorityTypesKeys.map((key) =>
    Markup.callbackButton(seniorityTypes[key], key)
  );

  return ctx.replyWithMarkdown(
    `🧰 *Стаж на последнем месте работы* \n\nВыберите ваш стаж на последнем месте работы.`,
    Markup.inlineKeyboard(ik, { columns: 2 }).extra()
  );
});

stepSeniority.start(async (ctx) => {
  await ctx.scene.enter("public_main_menu");
});

stepSeniority.action(seniorityTypesKeys, async (ctx) => {
  const { data } = ctx.callbackQuery;

  ctx.session.applyMortgage.seniority = seniorityTypes[data];

  await ctx.answerCbQuery(seniorityTypes[data]);
  return ctx.scene.enter("step_phone");
});

stepSeniority.use(async (ctx) =>
  ctx.replyWithMarkdown(`❗️ Выберите пожалуйста стаж!`)
);

module.exports = stepSeniority;
