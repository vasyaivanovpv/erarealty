const { MAIN_CHANNEL } = require("../../config");

const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const { typesQuery, markSymbol } = require("../../constants");
const { createCaption } = require("../../helpers");

const ObjectRe = require("../../models/ObjectRe");

const editObjectReBtnValues = [
  {
    nameBtn: "Ред. стоимость",
    type: typesQuery.EDIT_PRICE,
  },
  {
    nameBtn: "Ред. описание",
    type: typesQuery.EDIT_EXTRA,
  },
  {
    nameBtn: "Ред. телефон",
    type: typesQuery.EDIT_PHONE,
  },
  {
    nameBtn: "Ипотека",
    type: typesQuery.EDIT_MORTGAGE,
  },
  {
    nameBtn: "Опубликовать",
    type: typesQuery.PUBLISH,
  },
  {
    nameBtn: "В архив",
    type: typesQuery.ADD_TO_ARCHIVE,
  },
  {
    nameBtn: "Удалить объект",
    type: typesQuery.DELETE,
  },
  {
    nameBtn: "Все объекты",
    type: typesQuery.ALL_OBJECTS,
  },
];

const getIkEditObjectRe = (btnValues, objectReDB) =>
  btnValues.map((btn) => {
    if (btn.type === typesQuery.ADD_TO_ARCHIVE) {
      const nameBtn = objectReDB.isArchived
        ? `${markSymbol} ${btn.nameBtn}`
        : btn.nameBtn;
      return Markup.callbackButton(nameBtn, JSON.stringify({ type: btn.type }));
    }
    if (btn.type === typesQuery.EDIT_MORTGAGE) {
      const nameBtn = objectReDB.mortgage
        ? `${markSymbol} ${btn.nameBtn}`
        : btn.nameBtn;
      return Markup.callbackButton(nameBtn, JSON.stringify({ type: btn.type }));
    }
    return Markup.callbackButton(
      btn.nameBtn,
      JSON.stringify({ type: btn.type })
    );
  });

const sendPhotoMedia = async (ctx, channel, photos, caption) => {
  if (Array.isArray(photos)) {
    const photosObj = photos.map((photo) => ({
      type: "photo",
      media: photo,
    }));
    photosObj[0].caption = caption;
    photosObj[0].parse_mode = "MarkdownV2";
    channel
      ? await ctx.telegram.sendMediaGroup(channel, photosObj)
      : await ctx.replyWithMediaGroup(photosObj);
  } else if (typeof photos === "string") {
    channel
      ? await ctx.telegram.sendPhoto(channel, photos, {
          caption: caption,
          parse_mode: "MarkdownV2",
        })
      : await ctx.replyWithPhoto(photos, {
          caption: caption,
          parse_mode: "MarkdownV2",
        });
  }
};

const stepEditObjectRe = new Scene("step_edit_object_re");

stepEditObjectRe.enter(async (ctx) => {
  const { point } = ctx.session.editObjectRe;

  const objectReDB = await ObjectRe.findOne({ point: point }).populate(
    "district"
  );

  const caption = await createCaption(objectReDB);

  await sendPhotoMedia(ctx, null, objectReDB.photo, caption);

  const ik = getIkEditObjectRe(editObjectReBtnValues, objectReDB);

  return ctx.replyWithMarkdown(
    `⚙️ *Редактирование* \n\nВозможно изменить только часть информации в объявлении. \n_Добавить в архив_ - это значит, что объявление не будет публиковаться в канал. \n\n_Вернуться в Главное меню /start_`,
    Markup.inlineKeyboard(ik, { columns: 2 }).extra()
  );
});

stepEditObjectRe.start(async (ctx) => {
  await ctx.scene.enter("main_menu");
});

stepEditObjectRe.on("callback_query", async (ctx) => {
  const { type } = JSON.parse(ctx.callbackQuery.data);
  const { inline_keyboard } = ctx.callbackQuery.message.reply_markup;
  const { editObjectRe } = ctx.session;

  const objectReDB = await ObjectRe.findOne({
    point: editObjectRe.point,
  }).populate("district");
  if (!objectReDB) return ctx.answerCbQuery("Объект не найден!");

  let updateIK;

  switch (type) {
    case typesQuery.EDIT_PRICE:
      await ctx.deleteMessage();
      await ctx.answerCbQuery("Редактировать стоимость");
      return ctx.scene.enter("step_edit_price");

    case typesQuery.EDIT_EXTRA:
      await ctx.deleteMessage();
      await ctx.answerCbQuery("Редактировать описание");
      return ctx.scene.enter("step_edit_extra");

    case typesQuery.EDIT_PHONE:
      await ctx.deleteMessage();
      await ctx.answerCbQuery("Редактировать контакты");
      return ctx.scene.enter("step_edit_phones");

    case typesQuery.EDIT_MORTGAGE:
      objectReDB.mortgage = !objectReDB.mortgage;
      await objectReDB.save();

      updateIK = inline_keyboard.flat().map((btn) => {
        const parseData = JSON.parse(btn.callback_data);
        if (parseData.type === typesQuery.EDIT_MORTGAGE) {
          return btn.text.match(markSymbol)
            ? Markup.callbackButton(btn.text.slice(2), btn.callback_data)
            : Markup.callbackButton(
                `${markSymbol} ${btn.text}`,
                btn.callback_data
              );
        }
        return Markup.callbackButton(btn.text, btn.callback_data);
      });

      await ctx.answerCbQuery();
      return ctx.editMessageReplyMarkup(
        Markup.inlineKeyboard(updateIK, {
          columns: 2,
        })
      );

    case typesQuery.ADD_TO_ARCHIVE:
      objectReDB.isArchived = !objectReDB.isArchived;
      await objectReDB.save();

      updateIK = inline_keyboard.flat().map((btn) => {
        const parseData = JSON.parse(btn.callback_data);
        if (parseData.type === typesQuery.ADD_TO_ARCHIVE) {
          return btn.text.match(markSymbol)
            ? Markup.callbackButton(btn.text.slice(2), btn.callback_data)
            : Markup.callbackButton(
                `${markSymbol} ${btn.text}`,
                btn.callback_data
              );
        }
        return Markup.callbackButton(btn.text, btn.callback_data);
      });

      await ctx.editMessageReplyMarkup(
        Markup.inlineKeyboard(updateIK, {
          columns: 2,
        })
      );
      return ctx.answerCbQuery();

    case typesQuery.PUBLISH:
      await ctx.editMessageReplyMarkup(
        Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              "ОПУБЛИКОВАТЬ СЕЙЧАС",
              JSON.stringify({ type: typesQuery.PUBLISH_YES })
            ),
          ],
          [
            Markup.callbackButton(
              "Назад",
              JSON.stringify({ type: typesQuery.BACK })
            ),
          ],
        ])
      );

      return ctx.answerCbQuery();

    case typesQuery.PUBLISH_YES:
      updateIK = getIkEditObjectRe(editObjectReBtnValues, objectReDB);

      const caption = await createCaption(objectReDB);

      await sendPhotoMedia(ctx, MAIN_CHANNEL, objectReDB.photo, caption);

      await ctx.editMessageReplyMarkup(
        Markup.inlineKeyboard(updateIK, {
          columns: 2,
        })
      );

      return ctx.answerCbQuery("Объект опубликован!");

    case typesQuery.DELETE:
      await ctx.editMessageReplyMarkup(
        Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              "УДАЛИТЬ БЕЗВОЗВРАТНО",
              JSON.stringify({ type: typesQuery.DELETE_YES })
            ),
          ],
          [
            Markup.callbackButton(
              "Назад",
              JSON.stringify({ type: typesQuery.BACK })
            ),
          ],
        ])
      );

      return ctx.answerCbQuery();

    case typesQuery.DELETE_YES:
      await ObjectRe.deleteOne({
        point: editObjectRe.point,
      });

      await ctx.deleteMessage();
      await ctx.answerCbQuery("Объект удален!");
      return ctx.scene.enter("step_object_list");

    case typesQuery.BACK:
      updateIK = getIkEditObjectRe(editObjectReBtnValues, objectReDB);

      await ctx.editMessageReplyMarkup(
        Markup.inlineKeyboard(updateIK, {
          columns: 2,
        })
      );
      return ctx.answerCbQuery("");

    case typesQuery.ALL_OBJECTS:
      await ctx.deleteMessage();
      await ctx.answerCbQuery("Все объекты");
      return ctx.scene.enter("step_object_list");

    default:
      await ctx.replyWithMarkdown(
        `❗️ Используйте кнопки в меню _Редактирование_.`
      );
      return ctx.answerCbQuery();
  }
});

stepEditObjectRe.use(async (ctx) => {
  return ctx.replyWithMarkdown(
    `❗️ Используйте кнопки в меню _Редактирование_.`
  );
});

module.exports = stepEditObjectRe;
