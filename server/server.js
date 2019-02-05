require("./config/config");
require("./db/mongoose");
const express = require("express");
const _ = require("lodash");
const bodyParser = require("body-parser");
const { ObjectID } = require("mongodb");

const { User } = require("./models/user");
const { Todo } = require("./models/todo");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  Todo.find()
    .then(todos => {
      res.send({ todos });
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

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
    return res.status(404).send("invalid object id");
  }

  //findById
  Todo.findById(id)
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }

      res.send({ todo });
    })
    .catch(e => {
      res.status(400).send("Error getting todo");
    });
});

app.delete("/todos/:id", (req, res) => {
  //get id
  const { id } = req.params;
  //validate id
  if (!ObjectID.isValid(id)) {
    return res.status(400).send({ error: "invalid id" });
  }
  //remove todo
  Todo.findByIdAndDelete(id)
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }

      res.send({ todo });
    })
    .catch(err => {
      res.status(400).send();
    });
});

app.patch("/todos/:id", (req, res) => {
  const { id } = req.params;
  //select properties that a user is allowd to update if they exist
  let body = _.pick(req.body, ["text", "completed"]);
  if (!ObjectID.isValid(id)) {
    return res.status(400).send({ error: "invalid id" });
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }
      res.send({ todo });
    })
    .catch(err => {
      console.log(err);
      res.status(400).send();
    });
});

app.post("/users", (req, res) => {
  const { email, password } = req.body;
  const user = new User({
    email,
    password
  });

  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then(token => {
      res.header("x-auth", token).send(user.toJson());
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

app.get("/users", (req, res) => {
  User.find()
    .then(users => {
      res.send({ users });
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    console.log("invalid user id: ", id);
    return res.status(404).send("invalid user id");
  }

  //findById
  User.findById(id)
    .then(user => {
      if (!user) {
        return res.status(404).send();
      }

      res.send({ user });
    })
    .catch(e => {
      res.status(400).send("Error getting user");
    });
});

app.delete("/users/:id", (req, res) => {
  //get id
  const { id } = req.params;
  //validate id
  if (!ObjectID.isValid(id)) {
    return res.status(400).send({ error: "invalid id" });
  }
  //remove todo
  User.findByIdAndDelete(id)
    .then(user => {
      if (!user) {
        return res.status(404).send();
      }

      res.send({ user });
    })
    .catch(err => {
      res.status(400).send();
    });
});

app.listen(PORT, () => {
  console.log(`Started up at port ${PORT}`);
});

module.exports = { app };
