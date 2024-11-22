import express from "express";
import getConnection from '../db.js';
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();
router.use(authenticate);

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
