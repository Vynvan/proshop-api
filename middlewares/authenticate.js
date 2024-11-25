/**
 * @module Middleware
 */
import jwt from 'jsonwebtoken';
import 'dotenv/config';

/**
 * Middleware that verifies the jwt in the header and throws 403 if this verification fails.
 * 
 * @function
 * @name authenticate
 * @param {string} req.header The request header.
 * @param {string} req.header.authorization Required - Holds the bearer token. 
 * @returns {Object} Adds req.user holding the user.id for usage in the authenticated routes.
 * @throws {403} An error message in JSON format with errorType: token.
 */
const authenticate = async (req, res, next) => {
   const token = req.headers.authorization?.split(' ')[1];
   if (!token) return res.status(401).json({ message: 'Nicht autorisiert!', errorType: 'token' });

   try {
      req.user = jwt.verify(token, process.env.TOKEN_KEY);
      next();
   } catch (error) {
      res.status(403).json({ message: 'Token ungültig!', errorType: 'token' });
   }
};

export default authenticate;
