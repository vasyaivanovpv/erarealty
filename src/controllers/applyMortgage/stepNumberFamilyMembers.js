const { Markup } = require("telegraf");
const Scene = require("telegraf/scenes/base");

const maxNumberFamilyMembers = 10;
const numberFamilyMembers = [];
for (let i = 0; i < maxNumberFamilyMembers; i++)
  numberFamilyMembers.push(`${i + 1}`);

const stepNumberFamilyMembers = new Scene("step_number_family_members");

stepNumberFamilyMembers.enter(async (ctx) => {
  const ik = numberFamilyMembers.map((key) => Markup.callbackButton(key, key));

  return ctx.replyWithMarkdown(
    `👨‍👩‍👦 *Количество членов семьи* \n\nВыберите количество членов вашей семьи.`,
    Markup.inlineKeyboard(ik, { columns: 5 }).extra()
  );
});

stepNumberFamilyMembers.start(async (ctx) => {
  await ctx.scene.enter("public_main_menu");
});

stepNumberFamilyMembers.action(numberFamilyMembers, async (ctx) => {
  const { data } = ctx.callbackQuery;

  ctx.session.applyMortgage.numberFamilyMembers = +data;

  await ctx.answerCbQuery(data);
  return ctx.scene.enter("step_seniority");
});

stepNumberFamilyMembers.use(async (ctx) =>
  ctx.replyWithMarkdown(
    `❗️ Выберите пожалуйста количество количество членов вашей семьи!`
  )
);

module.exports = stepNumberFamilyMembers;
