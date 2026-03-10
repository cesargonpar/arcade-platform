const mysql = require('mysql2');

// Conexión a MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',       // tu usuario de MySQL
  password: '',       // tu contraseña de MySQL
  database: 'arcade_db'
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