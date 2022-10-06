const mongoose = require("mongoose");

const PlanetSchema = new mongoose.Schema({
  keplerName: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("Planets", PlanetSchema);
