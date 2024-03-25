"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const { NotFoundError, BadRequestError } = require("../expressError");

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {

    const hashed_password = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    let result;

    try {
      result = await db.query(
        `INSERT INTO users (username,
                            password,
                            first_name,
                            last_name,
                            phone,
                            join_at)
           VALUES
             ($1, $2, $3, $4, $5, current_timestamp)
           RETURNING username, first_name, last_name, phone`,
        [username, hashed_password, first_name, last_name, phone]);
    } catch (err) {
      throw new BadRequestError();
    }

    const userData = result.rows[0];
    userData.password = password;
    return userData;
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
      FROM users
      WHERE username = $1`, [username]
    );

    if (!result.rows[0]) throw new NotFoundError("User not found.");

    const hashed_password = result.rows[0].password;

    return (await bcrypt.compare(password, hashed_password)) === true;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1
      RETURNING username`, [username]
    );

    if (!result.rows[0]) throw new NotFoundError("User not found.");
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const results = await db.query(
      `SELECT username, first_name, last_name
      FROM users
      ORDER BY username`
    );

    return results.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {

    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users
      WHERE username = $1`, [username]
    );

    if (!result.rows[0]) throw new NotFoundError("User not found.");

    return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}, ...]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {

    // Check that user with specified username exists in database
    const user_result = await db.query(
      `SELECT username FROM users WHERE username = $1`, [username]
    );
    if (!user_result.rows[0]) throw new NotFoundError("User not found.");

    // Get messages from database
    const messages_results = await db.query(
      `SELECT m.id,
              m.body,
              m.sent_at,
              m.read_at,
              u.username,
              u.first_name,
              u.last_name,
              u.phone
      FROM messages m JOIN users u ON u.username = m.to_username
      WHERE from_username = $1`, [username]
    );

    const formattedMessagesData = messages_results.rows.map(message => {
      return {
        id: message.id,
        to_user: {
          username: message.username,
          first_name: message.first_name,
          last_name: message.last_name,
          phone: message.phone,
        },
        body: message.body,
        sent_at: message.sent_at,
        read_at: message.read_at,
      };
    });

    return formattedMessagesData;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}, ...]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {

    // Check that user with specified username exists in database
    const user_result = await db.query(
      `SELECT username FROM users WHERE username = $1`, [username]
    );
    if (!user_result.rows[0]) throw new NotFoundError("User not found.");

    // Get messages from database
    const messages_results = await db.query(
      `SELECT m.id,
              m.body,
              m.sent_at,
              m.read_at,
              u.username,
              u.first_name,
              u.last_name,
              u.phone
      FROM messages m JOIN users u ON u.username = m.from_username
      WHERE to_username = $1`, [username]
    );

    const formattedMessagesData = messages_results.rows.map(message => {
      return {
        id: message.id,
        from_user: {
          username: message.username,
          first_name: message.first_name,
          last_name: message.last_name,
          phone: message.phone,
        },
        body: message.body,
        sent_at: message.sent_at,
        read_at: message.read_at,
      };
    });

    return formattedMessagesData;
  }
}


module.exports = User;
