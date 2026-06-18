const mysql = require('mysql2/promise');

const caCert = process.env.DB_CA_CERT
  ? process.env.DB_CA_CERT.replace(/\\n/g, '\n')
  : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 20000,

  ssl: process.env.DB_SSL === 'true'
    ? {
        ca: caCert,
        rejectUnauthorized: true
      }
    : undefined
});

module.exports = pool;