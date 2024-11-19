import app from './index.js';

const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});

export default server;
