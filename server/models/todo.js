const mongoose = require("mongoose");
const Todo = mongoose.model("Todo", {
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

// const todo = new Todo({
//   text: "Learn node security"
// });

// todo
//   .save()
//   .then(doc => {
//     console.log("saved todo: ", doc);
//   })
//   .catch(err => {
//     console.error("unable to save todo");
//   });

module.exports = {
  Todo
};
