const Scene = require("telegraf/scenes/base");

const limitFio = 100;

const stepFio = new Scene("step_fio");

stepFio.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `👤 *ФИО* \n\nВведите ваши фамилию, имя и отчество. \n\nНапример: Иванов Василий Данилович`
  );
});

stepFio.start(async (ctx) => {
  await ctx.scene.enter("public_main_menu");
});

stepFio.on("text", async (ctx) => {
  if (ctx.message.text.length > limitFio)
    return ctx.replyWithMarkdown(
      `❗️ Вы превысили лимит символов! Попробуйте ввести снова.`
    );

  ctx.session.applyMortgage.fio = ctx.message.text;

  return ctx.scene.enter("step_age");
});

stepFio.use(async (ctx) =>
  ctx.replyWithMarkdown(`❗️ Введите пожалуйста ФИО!`)
);

module.exports = stepFio;
