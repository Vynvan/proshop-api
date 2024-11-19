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
* Takes username and password and returns userId and jwt, if the user is valid.
* @function
* @name login
* @route {POST} /users
* @returns {Object} JSON object with userId and token.
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

router.post('/logout', (req, res) => {
   return res.status(204);
});

router.post('/register', async (req, res) => {
   const { email, name, username, password } = req.body;
   let conn;

   try {
      conn = await getConnection();
      const [{ emailCount }] = await conn.query('SELECT COUNT(*) AS emailCount FROM user WHERE email=?', [email]);
      if (emailCount != 0) {
         return res.status(403).json({ message: 'Ein Benutzerkonto mit dieser Email-Adresse existiert bereits!' });
      }

      const [{ usernameCount }] = await conn.query('SELECT COUNT(*) AS usernameCount FROM user WHERE username=?', [username]);
      if (usernameCount != 0) {
         return res.status(403).json({ message: 'Dieser Benutzername ist schon vergeben!' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const { insertId } = await conn.query(
         'INSERT INTO user (username, name, email, password_hash) VALUES (?, ?, ?, ?)',
         [username, name, email, hashedPassword]
      );

      return getSignedToken(res, parseInt(insertId), username);
   } catch (err) {
      console.log(`##### ERROR DURING USER.JS/register: ${err} #####`);
      return res.status(500).json({ message: 'Fehler beim Zugriff auf die Datenbank.' });
   } finally {
      if (conn !== undefined) conn.release();
   }
});

export default router;
