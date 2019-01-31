const { ObjectID } = require("mongodb");
const { mongoose } = require("../server/db/mongoose");
const { Todo } = require("../server/models/todo");
const { User } = require("../server/models/user");

// var id = "5c52e77a39356d667aa562f3-";

// if (!ObjectID.isValid(id)) {
//   return console.log("ID not valid");
// }

// Todo.find({
//   _id: id
// }).then(todos => {
//   console.log("Todos: ", todos);
// });

// Todo.findOne({
//   _id: id
// }).then(todo => {
//   console.log("Todo: ", todo);
// });

// Todo.findById(id)
//   .then(todo => {
//     if (!todo) {
//       return console.log("Id not found");
//     }
//     console.log("Todo by id: ", todo);
//   })
//   .catch(e => console.error(e));

const id = "5c52d442289c83622d08d53e";

User.findById(id)
  .then(user => {
    if (!user) {
      return console.log("unable to find user");
    }

    console.log(JSON.stringify(user, undefined, 2));
  })
  .catch(e => {
    console.error(e);
  });
