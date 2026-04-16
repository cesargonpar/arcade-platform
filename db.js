const mysql = require('mysql2');
require('dotenv').config();

// Conexión a MySQL (local + online)
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'arcade_db',
  port: process.env.DB_PORT || 3306
});

// Conectar
connection.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
  } else {
    console.log('Conexión a MySQL exitosa!');
  }
});

module.exports = connection;