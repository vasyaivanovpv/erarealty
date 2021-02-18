const Scene = require("telegraf/scenes/base");

const limitEmailSymbols = 40;

const stepEmail = new Scene("step_email");

stepEmail.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `📧 *Email* \n\nВведите электронную почту для обратной связи. \n\nНапример: ivanovvasiliy@gmail.com`
  );
});

stepEmail.start(async (ctx) => {
  await ctx.scene.enter("public_main_menu");
});

stepEmail.on("text", async (ctx) => {
  if (ctx.message.text.length > limitEmailSymbols)
    return ctx.replyWithMarkdown(
      `❗️ Вы превысили лимит символов! Попробуйте ввести снова.`
    );

  ctx.session.applyMortgage.email = ctx.message.text;

  return ctx.scene.enter("step_agreement");
});

stepEmail.use(async (ctx) =>
  ctx.replyWithMarkdown(`❗️ Введите пожалуйста электронную почту!`)
);

module.exports = stepEmail;
