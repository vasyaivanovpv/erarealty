const Scene = require("telegraf/scenes/base");
const { isInteger } = require("../../utils");

const minAge = 18;
const maxAge = 75;

const stepAge = new Scene("step_age");

stepAge.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `🎂 *Возраст* \n\nВведите количество полных лет. \n\nНапример: 30`
  );
});

stepAge.start(async (ctx) => {
  await ctx.scene.enter("public_main_menu");
});

stepAge.on("text", async (ctx) => {
  const age = Number(ctx.message.text);

  if (!isInteger(age))
    return ctx.replyWithMarkdown(
      `❗️ Введите целочисленное значение как указано в примере!`
    );

  if (age < minAge)
    return ctx.replyWithMarkdown(
      `❗️ Извините, но для оформления заявки вам должно быть больше 18 лет.`
    );
  if (age > maxAge)
    return ctx.replyWithMarkdown(
      `❗️ Извините, но для оформления заявки вам должно быть меньше 75 лет.`
    );

  ctx.session.applyMortgage.age = age;

  return ctx.scene.enter("step_number_family_members");
});

stepAge.use(async (ctx) =>
  ctx.replyWithMarkdown(`❗️ Введите пожалуйста возраст!`)
);

module.exports = stepAge;
