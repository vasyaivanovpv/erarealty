const Scene = require("telegraf/scenes/base");

const Options = require("../../models/Options");

const limitNameCompanySymbols = 40;

const stepEditNameCompany = new Scene("step_edit_name_company");

stepEditNameCompany.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `🔡 *Наименование компании* \n\nВведите наименование вашей компании. \n\nНапример: «ЭРА» группа компаний`
  );
});

stepEditNameCompany.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepEditNameCompany.on("text", async (ctx) => {
  if (ctx.message.text.length > limitNameCompanySymbols)
    return ctx.replyWithMarkdown(
      `❗️ Вы превысили лимит символов! Попробуйте ввести снова.`
    );

  await Options.updateOne({}, { "contact.name": ctx.message.text });

  return ctx.scene.enter("step_edit_contact");
});

stepEditNameCompany.use(async (ctx) =>
  ctx.replyWithMarkdown(`❗️ Введите пожалуйста наименование компании!`)
);

module.exports = stepEditNameCompany;
