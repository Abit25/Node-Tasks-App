require("./db/mongoose");
const express = require("express");
const port = process.env.PORT || 3000;
const User = require("./models/User");
const Task = require("./models/Task");
const userRouter = require("./routers/userRouter");
const taskRouter = require("./routers/taskRouter");

const app = express();
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log("Server Running on Port " + port);
});
