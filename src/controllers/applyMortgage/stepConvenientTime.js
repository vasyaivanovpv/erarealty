const Scene = require("telegraf/scenes/base");

const limitTimeSymbols = 20;

const stepConvenientTime = new Scene("step_convenient_time");

stepConvenientTime.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `🕞 *Удобное время для звонка* \n\nНапишите удобное вам время для звонка. \n\nНапример: с 18:00 до 21:00`
  );
});

stepConvenientTime.start(async (ctx) => {
  await ctx.scene.enter("public_main_menu");
});

stepConvenientTime.on("text", async (ctx) => {
  if (ctx.message.text.length > limitTimeSymbols)
    return ctx.replyWithMarkdown(
      `❗️ Вы превысили лимит символов! Попробуйте ввести снова.`
    );

  ctx.session.applyMortgage.convenientTime = ctx.message.text;

  return ctx.scene.enter("step_email");
});

stepConvenientTime.use(async (ctx) =>
  ctx.replyWithMarkdown(`❗️ Введите пожалуйста удобное время для звонка!`)
);

module.exports = stepConvenientTime;
