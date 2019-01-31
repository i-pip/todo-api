const express = require("express");
const bodyParser = require("body-parser");
const { ObjectID } = require("mongodb");

const { mongoose } = require("./db/mongoose");
const { User } = require("./models/user");
const { Todo } = require("./models/todo");

const app = express();

app.use(bodyParser.json());

app.post("/todos", (req, res) => {
  const todo = new Todo({
    text: req.body.text
  });

  todo
    .save()
    .then(doc => {
      res.send(doc);
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

app.get("/todos", (req, res) => {
  Todo.find()
    .then(todos => {
      res.send({ todos });
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

app.get("/todos/:id", (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    console.log("invalid object id: ", id);
    res.status(404).send({ error: "invalid id" });
  }

  //findById
  Todo.findById(id)
    .then(todo => {
      console.log("todo: ", todo);
      if (!todo) {
        res.status(400).send({ error: "no todo" });
      }

      res.send({ todo });
    })
    .catch(e => {
      res.status(400).send("Error getting todo");
    });
});

app.get("/users:id", (req, res) => {
  // req.params
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    res.status(404).send();
  }

  //findById
  User.findById(id)
    .then(user => {
      if (!user) {
        res.status(404).send();
      }

      res.status(200).send(user);
    })
    .catch(e => {
      res.status(400).send("Error getting user");
    });
  //success

  //error
});

app.listen(3000, () => {
  console.log("Started on port 3000");
});

module.exports = { app };
