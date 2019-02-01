const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("../server");
const { Todo } = require("../models/todo");

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

beforeEach(done => {
  Todo.deleteMany({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => done());
});

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
