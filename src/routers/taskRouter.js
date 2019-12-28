const express = require("express");
const Task = require("../models/Task");
const requireAuth = require("../middleware/requireAuth");

const app = new express.Router();

app.post("/tasks", requireAuth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });
  try {
    await task.save();
    res.send(task);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

app.get("/tasks", requireAuth, async (req, res) => {
  try {
    const match = {};
    const sort = {};
    if (req.query.completed) {
      match.isComplete = req.query.completed === "true";
    }
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split("_");
      console.log(parts);
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort
        }
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

app.get("/task/:id", requireAuth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send("You haven't created any tasks :|");
    }
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

app.patch("/task/:id", requireAuth, async (req, res) => {
  const _id = req.params.id;
  const validOperations = ["desc", "isComplete"];
  const updates = Object.keys(req.body);
  const isValid = updates.every(update => validOperations.includes(update));
  if (!isValid) {
    return res.status(400).send({ error: "Invalid Updates" });
  }
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    updates.forEach(update => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

app.delete("/task/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).send();
    }
    return res.send(task);
  } catch (error) {
    return res.status(500).send();
  }
});

module.exports = app;
