"use strict";

const jwt = require("jsonwebtoken");
const { NotFoundError, BadRequestError, UnauthorizedError } = require("../expressError");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");

const Router = require("express").Router;
const router = new Router();

/** POST /login: {username, password} => {token} */

router.post('/login', async function (req, res, next) {
  if (!req.body) throw new BadRequestError();

  const { username, password } = req.body;

  const isValid = await User.authenticate(username, password);
  if (!isValid) throw new UnauthorizedError("Invalid credentials.");

  User.updateLoginTimestamp(username);

  const token = jwt.sign({ username }, SECRET_KEY);

  res.json({ token });
});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post('/register', async function (req, res, next) {
  if (!req.body) throw new BadRequestError();

  const newUserData = req.body;
  const newUser = await User.register(newUserData);

  const username = newUser.username;

  User.updateLoginTimestamp(username);

  const token = jwt.sign({ username }, SECRET_KEY);

  res.json({ token });
});



module.exports = router;