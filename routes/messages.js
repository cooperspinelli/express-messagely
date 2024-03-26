"use strict";

const Router = require("express").Router;
const { ForbiddenError } = require("../expressError");
const Message = require("../models/message");

const router = new Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", async function (req, res, next) {
  // TODO: const user = res.locals.user
  const message = await Message.get(req.params.id);
  const isFromUser = res.locals.user.username === message.from_user.username;
  const isToUser = res.locals.user.username === message.to_user.username;

  if (!(isFromUser || isToUser)) throw new ForbiddenError();

  res.json({ message });
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", async function (req, res, next) {
  const { to_username, body } = req.body;
  const from_username = res.locals.user.username;

  const message = await Message.create({ from_username, to_username, body });

  res.json({ message });
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", async function (req, res, next) {
  let message = await Message.get(req.params.id);
  if (res.locals.user.username !== message.to_user.username) {
    throw new ForbiddenError();
  }

  message = await Message.markRead(req.params.id);
  res.json({ message });
});


module.exports = router;