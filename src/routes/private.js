const Composer = require("telegraf/composer");
const Stage = require("telegraf/stage");
const session = require("telegraf/session");

const { escapeChar } = require("../utils");
const { accessMainMenuMW } = require("../helpers");

const User = require("../models/User");

const mainMenu = require("../controllers/mainMenu");
const addObject = require("../controllers/addObject");
const allObjects = require("../controllers/allObjects");
const settings = require("../controllers/settings");
const publicMainMenu = require("../controllers/publicMainMenu");
const applyMortgage = require("../controllers/applyMortgage");

const stage = new Stage(
  [
    mainMenu,
    addObject.stepObjectReType,
    addObject.stepTotalArea,
    addObject.stepApartAreas,
    addObject.stepNumberRooms,
    addObject.stepFloor,
    addObject.stepPhoto,
    addObject.stepPrice,
    addObject.stepDistrict,
    addObject.stepAddress,
    addObject.stepMortgage,
    addObject.stepExtra,
    addObject.stepPhones,
    addObject.stepSaveObjectRe,
    allObjects.stepObjectList,
    allObjects.stepFindByPoint,
    allObjects.stepEditObjectRe,
    allObjects.stepEditPrice,
    allObjects.stepEditExtra,
    allObjects.stepEditPhones,
    settings.mainSetting,
    settings.stepEditContact,
    settings.stepEditNameCompany,
    settings.stepEditEmail,
    settings.stepEditAllPhones,
    settings.stepEditAutoposting,
    settings.stepEditAdmins,
    publicMainMenu,
    applyMortgage.stepDownPayment,
    applyMortgage.stepFio,
    applyMortgage.stepAge,
    applyMortgage.stepNumberFamilyMembers,
    applyMortgage.stepSeniority,
    applyMortgage.stepPhone,
    applyMortgage.stepConvenientTime,
    applyMortgage.stepEmail,
    applyMortgage.stepAgreement,

    // banUser,
  ],
  {
    // ttl: 10,
    // default: "main_menu",
  }
);

const privateRoute = new Composer();
privateRoute.use(session());
privateRoute.use(stage.middleware());

privateRoute.start(accessMainMenuMW, async (ctx) => {
  const { first_name, last_name } = ctx.from;
  const userName = [first_name, last_name].filter((v) => v).join(" ");

  await ctx.replyWithMarkdown(
    `😎 Привет, ${escapeChar(
      userName
    )}! \n\nЕсли вы видите это сообщение, то это значит что вы являетесь администратором этого бота. С помощью бота вы можете управлять каналом "Недвижимость Пенза", а именно добавлять, редактировать и удалять объекты недвижимости в базе данных, а также настраивать частоту публикаций и другие возможности. \n\nЧитайте внимательно сообщения бота и у вас не появится вопросов что делать. \n\nУдачи!`
  );

  return ctx.scene.enter("main_menu");
});

privateRoute.use(async (ctx) => {
  await ctx.replyWithMarkdown(
    `❗️ Бот получил некоторые обновления. \nИспользуйте команду /start, чтобы возобновить работу.`
  );
});

module.exports = privateRoute;
