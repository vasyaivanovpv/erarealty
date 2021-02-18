const { Schema, model } = require("mongoose");
const { objectReFilters } = require("../constants");

const schema = new Schema({
  contact: {
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    phones: {
      type: [String],
      default: [],
    },
  },
  allObjects: {
    currentPage: {
      type: Number,
      default: 1,
    },
    firstPage: {
      type: Number,
      default: 1,
    },
    limit: {
      type: Number,
      default: 3,
    },
    filter: {
      type: String,
      enum: Object.values(objectReFilters),
      default: objectReFilters.all,
    },
  },
  autopostingTime: {
    type: [String],
    default: [],
  },
  autopostingStatus: {
    type: String,
    default: "stop",
    enum: ["start", "pause", "stop"],
  },
  autopostingSkip: {
    type: Number,
    default: 0,
  },
  activePosts: {
    currentTime: String,
    currentPoint: String,
    nextTime: String,
    nextObjectRe: String,
  },
});

const Options = model("Options", schema);

module.exports = Options;
