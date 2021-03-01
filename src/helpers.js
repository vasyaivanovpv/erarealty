const { BOT_USERNAME } = require("./config");
const Markup = require("telegraf/markup");
const {
  escapeRegExp,
  isJSONString,
  formatPrice,
  escapeChar,
  splitArray,
  getLocalTime,
} = require("./utils");
const {
  objectReTypes,
  objectReFilters,
  emptyPhrase,
  markSymbol,
  markdownParseMode,
  autopostingStatuses,
} = require("./constants");

const Options = require("./models/Options");
const User = require("./models/User");

const getAutopostingStatusStr = (autopostingStatus) =>
  autopostingStatuses[autopostingStatus].text +
  " " +
  autopostingStatuses[autopostingStatus].emoji;

const createCaption = async (post) => {
  const options = await Options.findOne({}, "contact");

  const escapeObjectReType = escapeRegExp(post.objectReType.toUpperCase());
  const escapeTotalArea = escapeRegExp(post.totalArea);
  const escapeAddress = escapeRegExp(post.address);
  const linkAddress = getLinkAddress(post.address);
  const addressStr = `• ${escapeAddress}, [на карте](${linkAddress})`;
  const priceStr = formatPrice(post.price);
  const escapeExtra = escapeRegExp(post.extra);
  const mortgageStr = post.mortgage
    ? `\n[оформить заявку на ипотеку](t.me/${BOT_USERNAME}?start=${post.point})`
    : "";
  const districtStr =
    typeof post.district === "string" ? post.district : post.district.name;

  const escapeNameCompany = escapeRegExp(options.contact.name);
  const escapeEmail = escapeRegExp(options.contact.email);
  const escapePhones = escapeRegExp(post.phones.join(", "));

  let apartExtraStr = addressStr;

  if (post.objectReType === objectReTypes.apart) {
    const numberRoomsStr =
      typeof post.numberRooms === "string"
        ? `*${post.numberRooms.toLowerCase()}*`
        : `*${post.numberRooms}\\-комн* квартира`;
    const escapeLivingArea = escapeRegExp(post.livingArea);
    const escapeKitchenArea = escapeRegExp(post.kitchenArea);

    apartExtraStr = `• ${numberRoomsStr}\n• жилая площадь: *${escapeLivingArea} м²*\n• площадь кухни: *${escapeKitchenArea} м²*\n• *${post.floor.current} этаж* из ${post.floor.total}\n${addressStr}`;
  }

  return `*${escapeObjectReType}, ${escapeTotalArea} м²*\n${districtStr} \n\n_${apartExtraStr}_\n\nЦЕНА: *${priceStr} ₽* ${mortgageStr}\n\n${escapeExtra}\n_№ ${post.point}_\n\n*${escapeNameCompany}*\n${escapeEmail}\n${escapePhones}`;
};

const createMiniCaption = (objectRe) => {
  const priceStr = formatPrice(objectRe.price);
  const archiveStr = objectRe.isArchived ? `🗄` : "";

  return `№ ${objectRe.point} ${archiveStr} \n*${objectRe.objectReType}, ${objectRe.totalArea} м²* \nЦЕНА: *${priceStr} ₽*  \n${objectRe.address}`;
};

const getNumbersIK = (items, itemsType, moreBtns) => {
  const timeBtns = items.map((item, i) => {
    const index = typeof item === "object" ? item.telegramId : i;
    return Markup.callbackButton(
      i + 1,
      JSON.stringify({
        type: itemsType,
        index: index,
      })
    );
  });

  const ik = splitArray(timeBtns);

  ik.push(moreBtns);

  return Markup.inlineKeyboard(ik).extra(markdownParseMode);
};

const getItemList = (allItems, activeItems) =>
  allItems.reduce((acc, item, i, items) => {
    const lineBreak = items.length === i + 1 ? "" : `\n`;
    const markStr =
      activeItems && activeItems.indexOf(item) !== -1 ? markSymbol : "";

    acc += `${i + 1}) ${escapeChar(item)} ${markStr}${lineBreak}`;
    return acc;
  }, "");

const getLinkAddress = (address) => {
  const baseLink = "https://yandex.ru/maps/";
  const params = {
    z: 16,
    text: `Пенза ${address}`.split(" ").join("%20"),
  };
  return baseLink + "?z=" + params.z + "&text=" + params.text;
};

const checkJSONmw = async (ctx, next) => {
  if (!isJSONString(ctx.callbackQuery.data)) {
    await ctx.answerCbQuery();
    return ctx.replyWithMarkdown(`❗️ Это действие сейчас не актуально!`);
  }

  return next();
};

const getContact = (contact) => {
  const { name, email, phones } = contact;

  const emptyStr = `_${emptyPhrase}_`;
  const companyNameStr = name ? `*${escapeChar(name)}*` : emptyStr;
  const emailStr = email ? escapeChar(email) : emptyStr;
  const phonesStr = phones.length
    ? phones.map((phone) => escapeChar(phone)).join(", ")
    : emptyStr;

  return { name: companyNameStr, email: emailStr, phones: phonesStr };
};

const getFilterObject = (filter) => {
  let filterDB = {};

  switch (filter) {
    case objectReFilters.all:
      filterDB = {};
      break;
    case objectReFilters.isActived:
      filterDB.isArchived = false;
      break;
    case objectReFilters.isArchived:
      filterDB.isArchived = true;
      break;
    default:
      break;
  }

  return filterDB;
};

const getNearestTime = (times) => {
  const currentTime = getLocalTime();

  return [...times]
    .filter((time) => {
      if (time <= currentTime) return;
      return time;
    })
    .sort()[0];
};

const accessMainMenuMW = async (ctx, next) => {
  const userDB = await User.findOne({ telegramId: ctx.from.id });
  if (userDB) return next();

  return ctx.scene.enter("public_main_menu");
};

const accessPublicMenuMW = async (ctx, next) => {
  const userDB = await User.findOne({ telegramId: ctx.from.id });
  if (!userDB) return next();

  return ctx.scene.enter("main_menu");
};

module.exports = {
  createCaption,
  checkJSONmw,
  getFilterObject,
  createMiniCaption,
  getContact,
  getItemList,
  getNumbersIK,
  getAutopostingStatusStr,
  getNearestTime,
  accessMainMenuMW,
  accessPublicMenuMW,
};
