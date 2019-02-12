require("./config/config");
require("./db/mongoose");
const express = require("express");
const _ = require("lodash");
const bodyParser = require("body-parser");
const { ObjectID } = require("mongodb");

const { User } = require("./models/user");
const { authenticate } = require("./middleware/authenticate");
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

app.post("/todos", authenticate, (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
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

app.get("/todos", authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  })
    .then(todos => {
      res.send({ todos });
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

app.get("/todos/:id", authenticate, (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    console.log("invalid object id: ", id);
    return res.status(404).send("invalid object id");
  }

  //findById
  Todo.findOne({ _id: id, _creator: req.user._id })
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

app.delete("/todos/:id", authenticate, (req, res) => {
  //get id
  const { id } = req.params;
  //validate id
  if (!ObjectID.isValid(id)) {
    return res.status(400).send({ error: "invalid id" });
  }
  //remove todo
  Todo.findOneAndDelete({ _id: id, _creator: req.user._id })
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

app.patch("/todos/:id", authenticate, (req, res) => {
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

  Todo.findOneAndUpdate(
    { _id: id, _creator: req.user._id },
    { $set: body },
    { new: true }
  )
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

// app.get("/users/:id", (req, res) => {
//   const { id } = req.params;
//   if (!ObjectID.isValid(id)) {
//     console.log("invalid user id: ", id);
//     return res.status(404).send("invalid user id");
//   }

//   //findById
//   User.findById(id)
//     .then(user => {
//       if (!user) {
//         return res.status(404).send();
//       }

//       res.send({ user });
//     })
//     .catch(e => {
//       res.status(400).send("Error getting user");
//     });
// });

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

app.post("/users/login", (req, res) => {
  const { email, password } = req.body;

  User.findByCredentials(email, password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        res.header("x-auth", token).send(user.toJson());
      });
    })
    .catch(e => {
      res.status(400).send("incorrect email or password");
    });
});

app.delete("/users/me/token", authenticate, (req, res) => {
  req.user
    .removeToken(req.token)
    .then(() => {
      res.status(200).send();
    })
    .catch(err => {
      console.log("error: ", err);
      return res.status(400).send();
    });
});

app.listen(PORT, () => {
  console.log(`Started up at port ${PORT}`);
});

//Here we're creating a middleware
//processing won't continue until next is called

app.get("/users/me", authenticate, (req, res) => {
  res.send(req.user.toJson());
});

module.exports = { app };
