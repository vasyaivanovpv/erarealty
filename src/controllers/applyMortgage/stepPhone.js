const Scene = require("telegraf/scenes/base");

const limitPhoneSymbols = 20;

const stepPhone = new Scene("step_phone");

stepPhone.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `☎️ *Телефон* \n\nВведите номер телефона для обратной связи. \n\nНапример: 79521639633`
  );
});

stepPhone.start(async (ctx) => {
  await ctx.scene.enter("public_main_menu");
});

stepPhone.on("text", async (ctx) => {
  if (ctx.message.text.length > limitPhoneSymbols)
    return ctx.replyWithMarkdown(
      `❗️ Вы превысили лимит символов! Попробуйте ввести снова.`
    );

  ctx.session.applyMortgage.phone = ctx.message.text;

  return ctx.scene.enter("step_convenient_time");
});

stepPhone.use(async (ctx) =>
  ctx.replyWithMarkdown(`❗️ Введите пожалуйста номер телефона!`)
);

module.exports = stepPhone;
