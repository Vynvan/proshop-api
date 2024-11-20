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

      res.status(201).json({ addresses });
   } catch (err) {
      console.log(`##### ERROR DURING ADDRESS.JS/ (GET): ${err} #####`);
      return res.status(500).json({ message: 'Fehler beim Zugriff auf die Datenbank.' });
   } finally {
      if (conn) conn.release();
   }
});

router.post('/', async (req, res) => {
   const { name, street, city, state, postal, country, defaultAddress } = req.body;
   let isDefault = defaultAddress && parseInt(defaultAddress) === 1 ? true : false;
   let conn;

   if (!addressName || !street || !city || !state || !postal || !country)
      return res.status(400).json({ message: 'Anfrage ungültig!'});

   try {
      conn = await getConnection();

      if (!isDefault) {
         const [{ adressCount }] = await conn.query(
            'SELECT COUNT(*) AS addressCount FROM address WHERE user_id = ? AND is_default = TRUE',
            [req.user.id]
         );
         isDefault = adressCount === 0;
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

export default router;
