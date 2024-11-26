import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import getConnection from '../db.js';

function getSignedToken(res, id) {
   const token = jwt.sign({ id }, process.env.TOKEN_KEY, {
      expiresIn: '2h',
   });
   return res.status(201).json({ userId: id, token });
}

const router = express.Router();

/**
 * Logs in a user by validating the provided username and password.
 * Returns userId and JWT token if the user is valid.
 * 
 * @function
 * @name login
 * @route {POST} /users
 * @param {Object} req.body The request body JSON object.
 * @param {string} req.body.username - The username of the user.
 * @param {string} req.body.password - The password of the user.
 * @returns {Object} JSON object with userId and token if login is successful.
 * @throws {403} If the password does not match.
 * @throws {404} If the username or password is incorrect.
 * @throws {500} If there is an error accessing the database.
 */
router.post('/', async (req, res) => {
   const { username, password } = req.body;
   let conn, user;

   try {
      conn = await getConnection();
      [user] = await conn.query('SELECT user_id AS id, password_hash FROM user WHERE username = ?', [username]);
   } catch (err) {
      console.log(`##### ERROR DURING USER.JS/ (POST): ${err} #####`);
      return res.status(500).json({ message: 'Fehler beim Zugriff auf die Datenbank.' });
   } finally {
      if (conn) conn.release();
   }

   if (!user) {
      return res.status(404).json({ message: 'Benutzername oder Passwort falsch.' });
   }

   const isMatch = await bcrypt.compare(password, user.password_hash);
   if (!isMatch) {
      return res.status(403).json({ message: 'Benutzername oder Passwort falsch.' });
   }
   return getSignedToken(res, user.id);
});

/**
 * Logs out a user by returning a 204 No Content response.
 * 
 * @function
 * @name logout
 * @route {POST} /users/logout
 * @returns {204} Returns a No Content response.
 */
router.post('/logout', (req, res) => {
   return res.status(204);
});

/**
 * Registers a new user by creating an account with provided details.
 * Returns userId and JWT token upon successful registration.
 * 
 * @function
 * @name register
 * @route {POST} /users/register
 * @param {Object} req.body The request body JSON object.
 * @param {string} req.body.email Required - The users email address.
 * @param {string} req.body.name Required - The users full name.
 * @param {string} req.body.password Required - The password of the user.
 * @param {string} req.body.username Required - The username of the user.
 * @returns {Object} JSON object with userId and token if registration is successful.
 * @throws {400} An error message in JSON format if the email or password don't matches the configurable regex.
 * @throws {403} An error message in JSON format if the email or username is already taken.
 * @throws {500} An error message in JSON format if there is an error accessing the database.
 */
router.post('/register', async (req, res) => {
   const { email, name, username, password } = req.body;
   let conn;

   try {
      conn = await getConnection();

      const emailRegex = new RegExp(process.env.EMAIL_REGEX);
      if (!emailRegex.test(email)) {
         res.status(400).json({ message: 'Die E-Mail-Adresse entspricht nicht den Anforderungen!' });
      }

      const passwordRegex = new RegExp(process.env.PASSWORD_REGEX);
      if (!passwordRegex.test(password)) {
          res.status(400).json({
            message: 'Das Passwort ist ungültig. Es muss mindestens 8 Zeichen lang sein und mindestens einen Großbuchstaben, eine Zahl und ein Sonderzeichen enthalten.'
         });
      }

      const [{ emailCount }] = await conn.query(
         'SELECT COUNT(*) AS emailCount FROM user WHERE email=?', [email]);
      if (emailCount != 0) {
         return res.status(403).json({ message: 'Ein Benutzerkonto mit dieser E-Mail-Adresse existiert bereits!' });
      }

      const [{ usernameCount }] = await conn.query(
         'SELECT COUNT(*) AS usernameCount FROM user WHERE username=?', [username]);
      if (usernameCount != 0) {
         return res.status(403).json({ message: 'Dieser Benutzername ist schon vergeben!' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const { insertId } = await conn.query(
         'INSERT INTO user (username, name, email, password_hash) VALUES (?, ?, ?, ?)',
         [username, name, email, hashedPassword]
      );

      return getSignedToken(res, parseInt(insertId));
   } catch (err) {
      console.log(`##### ERROR DURING USER.JS/register: ${err} #####`);
      return res.status(500).json({ message: 'Fehler beim Zugriff auf die Datenbank.' });
   } finally {
      if (conn !== undefined) conn.release();
   }
});

export default router;
