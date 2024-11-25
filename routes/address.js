/**
 * @module Address
 */
import express from "express";
import getConnection from '../db.js';
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();
router.use(authenticate);

/**
 * Retrieves a list of addresses for the authenticated user.
 * 
 * @function
 * @name address/GET
 * @route GET /
 * @returns {Object} 200 - An array of addresses in JSON format.
 * @throws {500} An error message in JSON format if there is an error accessing the database.
 */
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

/**
 * Creates a new address for the authenticated user.
 * 
 * @function
 * @name address/POST
 * @route POST /
 * @param {Object} req.body The request body JSON object.
 * @param {string} req.body.name Required - The name of the address.
 * @param {string} req.body.street Required - The street of the address.
 * @param {string} req.body.city Required - The city of the address.
 * @param {string} req.body.state - The state of the address.
 * @param {string} req.body.postal Required - The postal code of the address.
 * @param {string} req.body.country Required - The country of the address.
 * @param {boolean} req.body.isDefault - Indicates if this address is the default.
 * @returns {Object} 201 - The ID of the newly created address.
 * @throws {400} An error message in JSON format if the request is invalid.
 * @throws {500} An error message in JSON format if there is an internal server error.
 * @description Creates a new address for the authenticated user.
 */
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

/**
 * Updates an existing address for the authenticated user.
 * 
 * @function
 * @name address/PUT
 * @route PUT /
 * @param {Object} req.body The request body JSON object.
 * @param {integer} req.body.id Required - The ID of the address to update
 * @param {string} req.body.name The new name of the address
 * @param {string} req.body.street The new street of the address
 * @param {string} req.body.city The new city of the address
 * @param {string} req.body.state The new state of the address
 * @param {string} req.body.postal The new postal code of the address
 * @param {string} req.body.country The new country of the address
 * @param {boolean} req.body.isDefault Indicates if this address is the default
 * @returns {Object} 200 - Success status
 * @throws {400} An error message in JSON format if the request is invalid
 * @throws {500} An error message in JSON format if there is an internal server error
 */
router.put('/', async (req, res) => {
   const { id, name, street, city, state, postal, country, isDefault } = req.body;
   const isDefaultChanges = isDefault === 0 || isDefault === 1;
   const columns = [], values = [];
   let conn;

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
