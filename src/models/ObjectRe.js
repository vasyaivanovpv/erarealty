const { Schema, model } = require("mongoose");

const schema = new Schema({
  date: Date,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  objectReType: String,
  totalArea: Number,
  livingArea: Number,
  kitchenArea: Number,
  numberRooms: Schema.Types.Mixed,
  floor: {
    current: Number,
    total: Number,
  },
  photo: Schema.Types.Mixed,
  price: Number,
  district: {
    type: Schema.Types.ObjectId,
    ref: "District",
  },
  address: String,
  mortgage: Boolean,
  extra: String,
  phones: [String],
  point: Number,
  isArchived: {
    type: Boolean,
    default: false,
  },
});

const ObjectRe = model("ObjectRe", schema);

module.exports = ObjectRe;
