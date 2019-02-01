const { ObjectID } = require("mongodb");
const { mongoose } = require("../server/db/mongoose");
const { Todo } = require("../server/models/todo");
const { User } = require("../server/models/user");

// Todo.findOneAndRemove() //takes query object: Todo.findOneAndRemove({_id: "some_id"})
// Todo.findByIdAndRemove()

Todo.findByIdAndRemove("5c53e7ea32b85dd081e728b6").then(todo => {
  console.log("removed: ", todo);
});
