// let env = process.env.NODE_ENV || "test";
const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");
const { Todo } = require("../models/todo");
const { User } = require("../models/user");

const { app } = require("../server");
const { todos, populateTodos, populateUsers, users } = require("./seed/seed");

beforeEach(populateUsers);
beforeEach(populateTodos);

describe("POST /todos", () => {
  it("should create a new todo", done => {
    var text = "Test todo text";

    request(app)
      .post("/todos")
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({ text })
          .then(todos => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch(e => done(e));
      });
  });

  it("Should not create todo with invalid body data", done => {
    request(app)
      .post("/todos")
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch(e => done(e));
      });
  });
});

describe("GET /todos", () => {
  it("should get all todos", done => {
    request(app)
      .get("/todos")
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe("GET /todos/:id", () => {
  it("should return todo doc", done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it("should return 404 if todo not found", done => {
    const fakeId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${fakeId}`)
      .expect(404)
      .end(done);
  });

  it("should return 404 for invalid urls", done => {
    request(app)
      .get("/todos/1234")
      .expect(404)
      .end(done);
  });
});

describe("DELETE /todos/:id", () => {
  it("should remove a todo", done => {
    const id = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(id);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        // query database using findById toNotExist
        Todo.findById(id)
          .then(todo => {
            expect(todo).toNotExist();
            done();
          })
          .catch(e => done(e));
        // request(app)
        //   .get(`/todos/${id}`)
        //   .expect(404)
        //   .expect(res => {
        //     expect(res.body.todo).toNotExist();
        //   })
        //   .end((err, res) => {
        //     if (err) {
        //       return done(err);
        //     }
        //     done(res);
        //   });
        //expect(null).toNotExist();
      });
  });
});

describe("PATCH /todos/:id", () => {
  it("should update a todo", done => {
    const id = todos[0]._id.toHexString();
    const todoUpdate = { text: "Some new text", completed: true };

    request(app)
      .patch(`/todos/${id}`)
      .send(todoUpdate)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todoUpdate.text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA("number");
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        done();
      });
  });

  it("should clear completedAt when todo is not completed", done => {
    const id = todos[1]._id.toHexString();
    const todoUpdate = { text: "Some updated todo", completed: false };

    request(app)
      .patch(`/todos/${id}`)
      .send(todoUpdate)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toEqual(todoUpdate.text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end((err, result) => {
        if (err) {
          return done(err);
        }
        done();
      });
  });
});

describe("Get /users/me", () => {
  it("should return user if authenticatedd ", done => {
    request(app)
      .get("/users/me")
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it("should return a 401 if not authenticated", done => {
    request(app)
      .get("/users/me")
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe("POST /users", () => {
  it("should create a user", done => {
    const email = "example@example.com";
    const password = "1234nmb!";

    request(app)
      .post("/users")
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers["x-auth"]).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end(err => {
        if (err) {
          return done(err);
        }

        //Query the database for the new user
        User.findOne({ email })
          .then(user => {
            expect(user).toExist(0);
            expect(user.password).toNotBe(password); //New password should be hashed and salted
            done();
          })
          .catch(err => done(err));
      });
  });

  it("should return validation errors if request invalid", done => {
    const email = "wrongexample.com";
    const password = "ba";

    request(app)
      .post("/users")
      .send({ email, password })
      .expect(400)
      .expect(res => {
        expect(res.headers["x-auth"]).toNotExist();
      })
      .end(done);
  });

  it("should not create user if email in use", done => {
    const email = "phillip@example.com";
    const password = "someLongPassword";

    request(app)
      .post("/users")
      .send({ email, password })
      .expect(400)
      .expect(res => {
        expect(res.headers["x-auth"]).toNotExist();
      })
      .end(done);
  });
});

describe("POST /users/login", () => {
  it("should login user and return auth token", done => {
    request(app)
      .post("/users/login")
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect(res => {
        expect(res.headers["x-auth"]).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens[0]).toInclude({
              access: "auth",
              token: res.headers["x-auth"]
            });
            done();
          })
          .catch(e => done(e));
      });
  });

  it("should reject invalid login", done => {
    request(app)
      .post("/users/login")
      .send({
        email: users[1].email,
        password: "some wrong password"
      })
      .expect(400)
      .expect(res => {
        expect(res.headers["x-auth"]).toNotExist();
      })
      .end((err, res) => {
        if (err) {
          return done();
        }

        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch(e => done(e));
      });
  });
});
