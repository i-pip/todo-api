const mongoose = require("mongoose");
const validator = require("validator");
const _ = require("lodash");
const jwt = require("jsonwebtoken");

//A schema allows you to add custom methods to your model
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not a valid email"
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

UserSchema.methods.generateAuthToken = function() {
  let user = this;
  let access = "auth";
  let token = jwt
    .sign({ id: user._id.toHexString(), access }, "somesecret")
    .toString();
  // user.tokens.push({ access, token }); // No longer works no new mongo
  user.tokens = user.tokens.concat([{ access, token }]);

  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.toJson = function() {
  let user = this;
  let userObject = user.toObject();
  return _.pick(userObject, ["_id", "email"]);
};

const User = mongoose.model("User", UserSchema);

module.exports = {
  User
};
