import express from "express";
import getConnection from '../db.js';
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
   let conn, total;
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 20;
   const offset = (page - 1) * limit;

   try {
      conn = await getConnection();
      const products = await conn.query(
         `SELECT product_id AS id, title, SUBSTRING(description, 1, 50) AS text, price, image FROM product 
          WHERE is_active = TRUE LIMIT ? OFFSET ?`,
         [limit, offset]
      );

      if (page > 1) total = undefined;
      else {
         const [{ totalCount }] = await conn.query(
            'SELECT COUNT(*) AS totalCount FROM product WHERE is_active = TRUE');
         total = parseInt(totalCount);
      }

      res.status(200).json({ products, total, page, limit });
   } catch (err) {
      console.log(`##### ERROR DURING PRODUCTS.JS/ (GET): ${err} #####`);
      return res.status(500).json({ message: 'Fehler beim Zugriff auf die Datenbank.' });
   } finally {
      if (conn) conn.release();
   }
});

router.get('/:id', async (req, res) => {
   let conn;
   const update = !!req.query.update;
   console.log(update)
   // const id = parseInt(req.params.id);

   try {
      conn = await getConnection();
      const product = await conn.query(
         `SELECT product_id AS id, description AS text${update ? '' : ', title, price, image'} FROM product 
          WHERE is_active = TRUE AND product_id = ?`,
         [req.params.id]
      );

      res.status(200).json({ product });
   } catch (err) {
      console.log(`##### ERROR DURING PRODUCTS.JS/:id (GET): ${err} #####`);
      return res.status(500).json({ message: 'Fehler beim Zugriff auf die Datenbank.' });
   } finally {
      if (conn) conn.release();
   }
});

export default router;
