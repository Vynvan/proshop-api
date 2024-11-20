import jwt from 'jsonwebtoken';
import 'dotenv/config';

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
