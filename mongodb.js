const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectID;

const connectionURL = "mongodb://127.0.0.1:27017";

const databaseName = "task-manager";
MongoClient.connect(
  connectionURL,
  { useUnifiedTopology: true },
  async (error, client) => {
    if (error) {
      return console.log("Unable to Connect to DB");
    }

    const db = client.db(databaseName);
    //     try {
    //       //   await db.collection("users").insertOne({ name: "Abit", age: 20 });
    //       await db.collection("tasks").insertMany([
    //         { desc: "Finish the Challenge", isComplete: false },
    //         { desc: "Find a new show to watch", isComplete: false },
    //         { desc: "Watch Node.js lectures", isComplete: true }
    //       ]);
    //     } catch (err) {
    //       console.log("Error");
    //     }
    // db.collection("tasks").findOne(
    //   {
    //     _id: ObjectId("5df350647286edb68a303119")
    //   },
    //   (error, task) => {
    //     console.log(task);
    //   }
    // );

    // db.collection("tasks")
    //   .find({ isComplete: false })
    //   .toArray((error, tasks) => {
    //     if (!error) {
    //       console.log(tasks);
    //     }
    //   });

    db.collection("tasks")
      .updateMany(
        { isComplete: false },
        {
          $set: {
            isComplete: true
          }
        }
      )
      .then(result => {
        console.log(result.matchedCount);
      })
      .catch(err => {
        console.log(err);
      });
  }
);
