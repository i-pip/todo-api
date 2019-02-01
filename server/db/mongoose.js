const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
const dbUrl = process.env.MONGODB_URI;
mongoose.connect(
  dbUrl,
  { useNewUrlParser: true }
);

module.exports = {
  mongoose
};
