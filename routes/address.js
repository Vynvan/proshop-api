import express from "express";
import getConnection from '../db.js';
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
   let conn;

   try {
      conn = await getConnection();

      const addresses = await conn.query(
         `SELECT address_id AS id, address_name AS name, street, city, state,
          postal_code AS postal, country, is_default AS isDefault FROM address WHERE user_id = ?`,
         [req.user.id]);

      res.status(200).json({ addresses });
   } catch (err) {
      console.log(`##### ERROR DURING ADDRESS.JS/ (GET): ${err} #####`);
      return res.status(500).json({ message: 'Fehler beim Zugriff auf die Datenbank.' });
   } finally {
      if (conn) conn.release();
   }
});

router.post('/', async (req, res) => {
   const { name, street, city, state, postal, country } = req.body;
   let isDefault = req.body.isDefault;
   let conn;

   if (!name || !street || !city || !postal || !country)
      return res.status(400).json({ message: 'Anfrage ungültig!'});

   try {
      conn = await getConnection();

      if (isDefault)
         await conn.query(`UPDATE address SET is_default = false WHERE user_id = ?`, [req.user.id]);
      else {
         const [{ addressCount }] = await conn.query(
            'SELECT COUNT(*) AS addressCount FROM address WHERE user_id = ? AND is_default = true',
            [req.user.id]
         );
         isDefault = addressCount === 0;
      }

      const { insertId } = await conn.query(
         `INSERT INTO address (address_name, street, city, state, postal_code, country, user_id, is_default)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
         [name, street, city, state, postal, country, req.user.id, isDefault]);

      res.status(201).json({ addressId: parseInt(insertId) });
   } catch (err) {
      console.log(`##### ERROR DURING ADDRESS.JS/ (POST): ${err} #####`);
      return res.status(500).json({ message: 'Fehler beim Zugriff auf die Datenbank.' });
   } finally {
      if (conn) conn.release();
   }
});

router.put('/', async (req, res) => {
   const { id, name, street, city, state, postal, country, isDefault } = req.body;
   const isDefaultChanges = isDefault === 0 || isDefault === 1;
   const columns = [], values = [];
   let conn;
   console.log('id:', id, ', isDefault:', isDefault)
   if (!id) return res.status(400).json({ message: 'Anfrage ungültig!'});

   try {
      conn = await getConnection();

      if (isDefaultChanges && isDefault) {
         await conn.query(
            `UPDATE address SET is_default = false WHERE user_id = ? AND address_id != ?`,
            [req.user.id, id]
         );
      }
   
      if (name) {
         columns.push('address_name=?');
         values.push(name);
      }
      if (street) {
         columns.push('street=?');
         values.push(street);
      }
      if (city) {
         columns.push('city=?');
         values.push(city);
      }
      if (state) {
         columns.push('state=?');
         values.push(state);
      }
      if (postal) {
         columns.push('postal_code=?');
         values.push(postal);
      }
      if (country) {
         columns.push('country=?');
         values.push(country);
      }
      if (isDefaultChanges) {
         columns.push('is_default=?');
         values.push(isDefault);
      }

      if (columns.length === 0) return res.status(400).json({ message: 'Anfrage ungültig!'});

      const { affectedRows } = await conn.query(
         `UPDATE address SET ${columns.join(',')} WHERE user_id = ? AND address_id = ?`,
         [...values, req.user.id, id]);
      res.status(200).json({ success: affectedRows });
   } catch (err) {
      console.log(`##### ERROR DURING ADDRESS.JS/ (PUT): ${err} #####`);
      return res.status(500).json({ message: 'Fehler beim Zugriff auf die Datenbank.' });
   } finally {
      if (conn) conn.release();
   }
});

export default router;
