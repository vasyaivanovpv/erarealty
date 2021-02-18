const { Schema, model } = require("mongoose");

const schema = new Schema({
  name: String,
});

const District = model("District", schema);

module.exports = District;
