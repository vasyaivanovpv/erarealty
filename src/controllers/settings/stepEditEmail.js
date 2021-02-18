const Scene = require("telegraf/scenes/base");
const { validateEmail } = require("../../utils");

const Options = require("../../models/Options");

const limitEmailSymbols = 32;

const stepEditEmail = new Scene("step_edit_email");

stepEditEmail.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `✉️ *Email* \n\nВведите электронную почту вашей компании. \n\nНапример: era.58penza@gmail.com`
  );
});

stepEditEmail.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepEditEmail.on("text", async (ctx) => {
  if (ctx.message.text.length > limitEmailSymbols)
    return ctx.replyWithMarkdown(
      `❗️ Вы превысили лимит символов! Попробуйте ввести снова.`
    );

  if (!validateEmail(ctx.message.text))
    return ctx.replyWithMarkdown("❗️ Неверный формат email!");

  await Options.updateOne({}, { "contact.email": ctx.message.text });

  return ctx.scene.enter("step_edit_contact");
});

stepEditEmail.use(async (ctx) =>
  ctx.replyWithMarkdown(`❗️ Введите пожалуйста email!`)
);

module.exports = stepEditEmail;
