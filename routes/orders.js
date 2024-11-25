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
         `SELECT o.sum_price, o.state AS status, o.createdAt,
          a.address_name, a.street, a.city, a.postal_code AS postal, a.state, a.country,
          GROUP_CONCAT(
            CONCAT(p.product_id, ':', p.title, ':', i.price, ':', i.quantity) 
            ORDER BY p.product_id SEPARATOR '; ') AS products
          FROM \`order\` o 
          JOIN address a ON a.address_id = o.address_id 
          JOIN order_item i ON i.order_id = o.order_id 
          JOIN product p ON p.product_id = i.product_id 
          WHERE o.user_id = ? AND o.order_id = ?`,
         [req.user.id, orderId]
      );

      const productsArray = order.products ? order.products.split('; ').map(product => {
         const [id, title, price, quantity] = product.split(':');
         return { id, title, price: parseFloat(price), quantity: parseInt(quantity) };
      }) : [];
      res.status(200).json({ order: { ...order, products: productsArray }});
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
   const { addressId, products, sumPrice } = req.body;

   if (!addressId || !products || products.length === 0 || !sumPrice)
      return res.status(400).json({ message: 'Anfrage ungültig!'});

   try {
      conn = await getConnection();

      const [{ addressCount }] = await conn.query(
         'SELECT COUNT(*) AS addressCount FROM address WHERE user_id = ?',
         [req.user.id]
      );
      if (addressCount === 0)
         return res.status(400).json({ message: 'Adresse nicht gefunden.'});

      const sumPriceClient = parseFloat(sumPrice).toFixed(2);
      let sumPriceDb = 0;
      for (const product of products) {
         const [{ price }] = await conn.query(
            'SELECT price FROM product WHERE product_id=?',
            [product.id]
         );         
         if (!price)
            return res.status(400).json({ message: `Produkt mit ID ${product.id} nicht gefunden.` });

         product.price = price;
         sumPriceDb += parseFloat(price) * product.quantity;
      }
      sumPriceDb = sumPriceDb.toFixed(2);

      if (sumPriceDb !== sumPriceClient)
         return res.status(400).json({ message: `Preis ${sumPriceClient} stimmt nicht mit ${sumPriceDb} überein.`});

      const { insertId } = await conn.query(
         'INSERT INTO `order` (address_id, sum_price, user_id) VALUES (?, ?, ?)',
         [addressId, sumPriceDb, req.user.id]);
      const orderId = parseInt(insertId);

      for (const product of products) {
         await conn.query(
            'INSERT INTO `order_item` (product_id, order_id, price, quantity) VALUES (?, ?, ?, ?)',
            [product.id, orderId, product.price, product.quantity ?? 1]
         );
      }

      res.status(201).json({ orderId });
   } catch (err) {
      console.log(`##### ERROR DURING ORDER.JS/ (POST): ${err} #####`);
      return res.status(500).json({ message: 'Fehler beim Zugriff auf die Datenbank.' });
   } finally {
      if (conn) conn.release();
   }
});

export default router;
