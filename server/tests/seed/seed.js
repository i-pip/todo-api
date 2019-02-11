const { ObjectID } = require("mongodb");
const { Todo } = require("../../models/todo");
const { User } = require("../../models/user");
const jwt = require("jsonwebtoken");
const SECRET = "some_secret";

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [
  {
    _id: userOneId,
    email: "phillip@example.com",
    password: "userOnePassword",
    tokens: [
      {
        access: "auth",
        token: jwt.sign({ _id: userOneId, access: "auth" }, SECRET).toString()
      }
    ]
  },
  {
    _id: userTwoId,
    email: "john@example.com",
    password: "userTwoPassword"
  }
];
const todos = [
  {
    text: "First test todo",
    _id: new ObjectID()
  },
  {
    text: "Second test todo",
    _id: new ObjectID()
  }
];

const populateTodos = done => {
  Todo.deleteMany({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => done());
};

const populateUsers = done => {
  //delete man doesn't work here because middleware won't run
  User.remove({})
    .then(() => {
      const userOne = new User(users[0]).save();
      const userTwo = new User(users[1]).save();

      return Promise.all([userOne, userTwo]);
    })
    .then(() => done())
    .catch(err => console.error("error: ", err));
};

module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers
};
