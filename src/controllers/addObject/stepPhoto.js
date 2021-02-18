const Scene = require("telegraf/scenes/base");
const mediaGroup = require("telegraf-media-group");

const stepPhoto = new Scene("step_photo");

stepPhoto.use(mediaGroup());

stepPhoto.enter(async (ctx) => {
  return ctx.replyWithMarkdown(
    `📷 *Фотографии* \n\nПришлите несколько фотографий как альбом в одном сообщении при этом *не более 10 штук*.`
  );
});

stepPhoto.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepPhoto.on("media_group", async (ctx) => {
  ctx.session.post.photo = ctx.mediaGroup
    .filter((file) => file.photo)
    .map((file) => file.photo[0].file_id);

  return ctx.scene.enter(`step_price`);
});

stepPhoto.on("photo", async (ctx) => {
  ctx.session.post.photo = ctx.message.photo[0].file_id;

  return ctx.scene.enter(`step_price`);
});

stepPhoto.use((ctx) =>
  ctx.replyWithMarkdown(`❗️ Пришлите пожалуйста фотографии недвижимости!`)
);

module.exports = stepPhoto;
