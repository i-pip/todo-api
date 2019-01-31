const { MongoClient, ObjectID } = require("mongodb");

MongoClient.connect(
  "mongodb://localhost:27017/TodoApp",
  (err, client) => {
    if (err) {
      return console.error("Unable to connect to MongoDB server");
    }

    const db = client.db("TodoApp");

    //deleteMany
    db.collection("Todos")
      .deleteOne({ text: "Eat lunch" })
      .then(result => console.log("result: ", result));
  }
);
