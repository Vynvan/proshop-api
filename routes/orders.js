/**
 * @module Orders
 */
import express from "express";
import getConnection from '../db.js';
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();
router.use(authenticate);

/**
 * Retrieves the details of a specific order for the authenticated user.
 * 
 * @function
 * @name orders/:orderId
 * @route GET /:orderId
 * @param {string} req.params The request param.
 * @param {number} req.params.orderId ID of the order to retrieve.
 * @returns {Object} 200 - An object containing the order details.
 * @throws {500} If there is an error accessing the database.
 */
router.get('/:orderId([0-9]+)', async (req, res) => {
   const orderId = parseInt(req.params.orderId);
   let conn;

   try {
      conn = await getConnection();

      const [order] = await conn.query(
         `SELECT o.sum_price, o.state, o.createdAt,
          a.address_name, a.street, a.city, a.postal_code, a.state, a.country,
          p.product_id AS id, p.title, i.price, i.quantity
          FROM 'order' o
          JOIN address a ON a.address_id = o.address_id
          JOIN order_item i ON i.order_id = o.order_id
          JOIN product p ON p.product_id = i.product_id
          WHERE o.user_id = ? AND o.order_id = ?`,
         [req.user.id, orderId]
      );
      res.status(200).json({ order });
   } catch (err) {
      console.log(`##### ERROR DURING ORDER.JS/ (POST): ${err} #####`);
      return res.status(500).json({ message: 'Fehler beim Zugriff auf die Datenbank.' });
   } finally {
      if (conn) conn.release();
   }
});

/**
 * Creates a new order for the authenticated user using the provided address and articles.
 * 
 * @function
 * @name orders/POST
 * @route POST /
 * @param {Object} req.body The request body JSON object.
 * @param {number} req.body.addressId The ID of the address for the order.
 * @param {Array} req.body.articles An array of articles to be included in the order.
 * @param {number} req.body.sumPrice The total price of the order.
 * @returns {Object} 201 - JSON object containing the new order ID.
 * @returns {400} An error message in JSON format if the request is invalid or address not found.
 * @throws {500} An error message in JSON format if there is an error accessing the database.
 */
router.post('/', async (req, res) => {
   let conn;
   const { addressId, articles, sumPrice } = req.body;

   if (!addressId || !articles || articles.length === 0)
      return res.status(400).json({ message: 'Anfrage ungültig!'});

   try {
      conn = await getConnection();

      const [{ adressCount }] = await conn.query(
         'SELECT COUNT(*) AS addressCount FROM address WHERE user_id = ?',
         [req.user.id]
      );
      if (adressCount === 0)
         return res.status(400).json({ message: 'Adresse nicht gefunden.'});

      const { insertId } = await conn.query('INSERT INTO order (address_id, sum_price, user_id) VALUES (?, ?, ?)',
         [addressId, sumPrice, req.user.id]);
      const orderId = parseInt(insertId);

      articles.forEach(async article => {
         await conn.query('INSERT INTO order_item (product_id, order_id, price, quantity) VALUES (?, ?, ?, ?)',
            [article.id, orderId, article.price, article.quantity ?? 1]
         );
      });

      res.status(201).json({ orderId });
   } catch (err) {
      console.log(`##### ERROR DURING ORDER.JS/ (POST): ${err} #####`);
      return res.status(500).json({ message: 'Fehler beim Zugriff auf die Datenbank.' });
   } finally {
      if (conn) conn.release();
   }
});

export default router;
