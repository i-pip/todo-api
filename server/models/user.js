const mongoose = require("mongoose");
const User = mongoose.model("User", {
  email: {
    type: String,
    require: true,
    trim: true,
    minlength: 1
  }
});

// const user = new User({ email: "phillip@example.com" });

// user
//   .save()
//   .then(doc => {
//     console.log("User saved: ", JSON.stringify(doc, undefined, 2));
//   })
//   .catch(err => console.log("error saving user: ", err));

module.exports = {
  User
};
