/**
 * @module Products
 */
import express from "express";
import getConnection from '../db.js';
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();
router.use(authenticate);

/**
 * Retrieves a paginated list of active products from the database. 
 * Products only come with the first 50 chars of the description. 
 * Use "products/:id&update=true" to get the full description of the one product with the given id.
 * 
 * @function
 * @name products/GET
 * @route GET /
 * @param {string} req.query The request querystring.
 * @param {number} [req.query.page=1] The page number for pagination.
 * @param {number} [req.query.limit=20] The number of products to return per page.
 * @returns {Object} 200 - JSON object containing an array of products and pagination details.
 * @throws {500} An error message in JSON format if there is an error accessing the database.
 */
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

/**
 * Retrieves the details of a specific active product by its ID. 
 * With the optional query param update=true, only the description is retrieved to update existing data on the client.
 * 
 * @function
 * @name products/:id
 * @route GET /:id
 * @param {Object} req.body The request body JSON object.
 * @param {number} req.body.id The ID of the product to retrieve.
 * @param {string} req.query The request querystring.
 * @param {boolean} [req.query.update=false] Indicates whether to return the full product details or just the description.
 * @returns {Object} 200 - JSON object containing the product. If req.query.update is true, only the id and full description is sent.
 * @throws {500} If there is an error accessing the database.
 */
router.get('/:id', async (req, res) => {
   let conn;
   const update = !!req.query.update;

   try {
      conn = await getConnection();
      const [product] = await conn.query(
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
