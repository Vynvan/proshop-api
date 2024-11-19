import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import profileRouter from './routes/profile.js';
import userRouter from './routes/users.js';
import todoRouter from './routes/todos.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares:
app.use(express.json());
app.use(cors({ origin: process.env.HOST.split(',') }));
app.use('/docs', express.static(path.join(__dirname, 'docs')));

// Routes:
app.use('/orders', todoRouter);
app.use('/products', profileRouter);
app.use('/users', userRouter);

app.get('/', (_, res) => {
    res.status(200).json({ hello: 'world' });
});

export default app;
