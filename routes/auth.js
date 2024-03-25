"use strict";

const jwt = require("jsonwebtoken");
const { NotFoundError } = require("../expressError");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");

const Router = require("express").Router;
const router = new Router();

/** POST /login: {username, password} => {token} */

router.post('/login', async function (req, res, next) {
  const { username, password } = req.body;

  const isValid = User.authenticate(username, password);
  if (!isValid) throw new NotFoundError("Invalid credentials.");

  User.updateLoginTimestamp(username);

  const payload = await User.get(username);
  const token = jwt.sign(payload, SECRET_KEY);

  res.json({ token });
});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post('/register', async function (req, res, next) {
  console.log("*************** inside /register");
  const newUserData = req.body;
  const newUser = User.register(newUserData);

  User.updateLoginTimestamp(newUser.username);

  delete newUser.password;
  const token = jwt.sign(newUser, SECRET_KEY);

  res.json({ token });
});



module.exports = router;