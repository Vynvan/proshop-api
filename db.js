import mariadb from 'mariadb';
import 'dotenv/config';

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
});

async function getConnection() {
  try {
      const conn = await pool.getConnection();
      return conn;
  } catch (err) {
      console.error("##### Fehler bei der Verbindung zur Datenbank:", err);
      throw err;
  }
}

export default getConnection;
