const express = require("express");
const User = require("../models/User");
const requireAuth = require("../middleware/requireAuth");
const multer = require("multer");
const sharp = require("sharp");
const app = new express.Router();
const { sendMail } = require("../emails/account");

const upload = multer({
  limits: { fileSize: 1000000 },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("File must be an image"));
    }
    cb(undefined, true);
  }
});

app.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.generateAuthToken();
    sendMail(req.body.email);
    await user.save();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get("/user/me", requireAuth, async (req, res) => {
  try {
    const users = await User.find({ _id: req.user._id });
    res.send(users);
  } catch (e) {
    res.status(500).send(e);
  }
});

app.get("/user/me", requireAuth, async (req, res) => {
  const _id = req.user._id;
  try {
    const user = await User.findById(_id);
    res.send(user);
  } catch (e) {
    res.status(404).send(e);
  }
});

app.patch("/user/me", requireAuth, async (req, res) => {
  const _id = req.user._id;
  const validOperations = ["name", "age", "email", "password"];
  const updates = Object.keys(req.body);
  const isValid = updates.every(update => validOperations.includes(update));
  if (!isValid) {
    return res.status(400).send({ error: "Invalid Updates" });
  }
  try {
    const user = await User.findById(_id);
    updates.forEach(update => (user[update] = req.body[update]));
    await user.save();
    // const user = await User.findByIdAndUpdate(_id, req.body, {
    //   new: true,
    //   runValidators: true
    // });
    if (!user) {
      res.status(404).send();
    }
    res.send(user);
  } catch (e) {
    res.status(400).send();
  }
});

app.delete("/user/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) {
      return res.status(404).send();
    }
    return res.send(user);
  } catch (error) {
    return res.status(500).send();
  }
});

app.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(404).send({ error: "Invalid Email or Password" });
  }
});

app.post("/users/logoutAll", requireAuth, async (req, res) => {
  const user = req.user;
  user.tokens = [];
  try {
    await user.save();
    res.send("Successfully Logged Out");
  } catch (error) {
    res.status(401).send("Please Authenticate Yourself");
  }
});

app.post("/users/logout", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    user.tokens = user.tokens.filter(token => token.token !== req.token);
    await user.save();
    res.send("Succesfully Logged Out");
  } catch (error) {
    res.status(500).send();
  }
});

app.post(
  "/users/me/avatar",
  requireAuth,
  upload.single("upload"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .png()
      .resize({ width: 640, height: 480 })
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

app.delete("/users/me/avatar", requireAuth, async (req, res) => {
  req.user.avatar = null;
  try {
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

app.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "png");
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

module.exports = app;
