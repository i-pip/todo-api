const { MongoClient, ObjectID } = require("mongodb");

MongoClient.connect(
  "mongodb://localhost:27017/TodoApp",
  (err, client) => {
    if (err) {
      return console.error("Unable to connect to MongoDB server");
    }

    console.log("Connect to MongoDB server");
    const db = client.db("TodoApp");

    //Use the MongoDB update operators to update
    //https://docs.mongodb.com/manual/reference/operator/update/
    db.collection("Todos")
      .findOneAndUpdate(
        {
          _id: new ObjectID("5c52b458d4f3875bd60be304")
        },
        {
          $set: {
            text: "First todo"
          }
        },
        {
          returnOriginal: false
        }
      )
      .then(result => {
        console.log(JSON.stringify(result, undefined, 2));
      });
  }
);
