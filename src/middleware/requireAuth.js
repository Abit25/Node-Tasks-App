const User = require("../models/User");
const jwt = require("jsonwebtoken");

const requireAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const userObject = jwt.verify(token, "MY_SECRET_KEY");
    const user = await User.findOne({
      _id: userObject._id.toString(),
      "tokens.token": token
    });
    if (user) {
      req.user = user;
      req.token = token;
      next();
    } else {
      throw new Error("Error in authentication");
    }
  } catch (error) {
    res.status(401).send({ error: "Please authenticate" });
  }
};

module.exports = requireAuth;
