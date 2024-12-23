import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import addressRouter from './routes/address.js';
import orderRouter from './routes/orders.js';
import productRouter from './routes/products.js';
import userRouter from './routes/users.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares:
app.use(express.json());
app.use(cors({ origin: process.env.HOST.split(',') }));
app.use('/docs', express.static(path.join(__dirname, 'docs')));
app.use('/', express.static(path.join(__dirname, 'public')));

// Routes:
app.use('/address', addressRouter);
app.use('/orders', orderRouter);
app.use('/products', productRouter);
app.use('/users', userRouter);

app.get('/', (_, res) => {
    res.status(200).json({ hello: 'world' });
});

export default app;
