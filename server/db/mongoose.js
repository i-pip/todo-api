const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
const dbUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/TodoApp";
mongoose.connect(
  dbUrl,
  { useNewUrlParser: true }
);

module.exports = {
  mongoose
};
