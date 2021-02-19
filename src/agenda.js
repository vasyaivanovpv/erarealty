const {
  TOKEN,
  DB_USER,
  DB_PASSWORD,
  DB_URL,
  MAIN_CHANNEL,
} = require("./config");
const Agenda = require("agenda");
const Telegram = require("telegraf/telegram");

const { createCaption, getNearestTime } = require("./helpers");

const ObjectRe = require("./models/ObjectRe");
const Options = require("./models/Options");

const telegram = new Telegram(TOKEN);

const agenda = new Agenda({
  processEvery: "1 second",
  db: {
    address: DB_URL,
    collection: "jobsqueue",
    options: {
      user: DB_USER,
      password: DB_PASSWORD,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
});

agenda.define("init_post", async (job, done) => {
  const optionsDB = await Options.findOne();
  const countObjectRes = await ObjectRe.countDocuments({ isArchived: false });

  let nearestTime = getNearestTime(optionsDB.autopostingTime);
  if (!nearestTime) {
    nearestTime = optionsDB.autopostingTime[0] + " at tomorrow";
    optionsDB.activePost.nextTime = optionsDB.autopostingTime[0];
  } else {
    if (optionsDB.activePost.nextTime === nearestTime) {
      nearestTime =
        optionsDB.autopostingTime[
          optionsDB.autopostingTime.indexOf(nearestTime) + 1
        ] || optionsDB.autopostingTime[0];
    }
    optionsDB.activePost.nextTime = nearestTime;
  }

  const objectReDB = await ObjectRe.findOne({ isArchived: false }, "point", {
    skip: optionsDB.autopostingSkip,
    sort: {
      date: 1,
    },
  });

  optionsDB.activePost.nextPoint = objectReDB.point;
  optionsDB.autopostingSkip =
    optionsDB.autopostingSkip < countObjectRes - 1
      ? optionsDB.autopostingSkip + 1
      : 0;
  await optionsDB.save();

  agenda.schedule(nearestTime, "send_post", { point: objectReDB.point });

  await job.remove();
  await done();
});

agenda.define("send_post", async (job, done) => {
  const { point } = job.attrs.data;

  const objectReDB = await ObjectRe.findOne({ point: point }).populate(
    "district"
  );

  const caption = await createCaption(objectReDB);

  if (Array.isArray(objectReDB.photo)) {
    const photosObj = objectReDB.photo.map((photo) => ({
      type: "photo",
      media: photo,
    }));
    photosObj[0].caption = caption;
    photosObj[0].parse_mode = "MarkdownV2";
    await telegram.sendMediaGroup(MAIN_CHANNEL, photosObj);
  } else if (typeof objectReDB.photo === "string") {
    await telegram.sendPhoto(MAIN_CHANNEL, objectReDB.photo, {
      caption: caption,
      parse_mode: "MarkdownV2",
    });
  }

  await agenda.now("init_post");

  await job.remove();
  await done();
});

module.exports = agenda;
