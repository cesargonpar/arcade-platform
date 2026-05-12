const mysql = require('mysql2');
require('dotenv').config();

// Config de la base de datos (local y producción)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'arcade_db',
  port: process.env.DB_PORT || 3306,
  // Usar pool para que no se caiga la conexión en Render/TiDB
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // SSL solo para producción (TiDB)
  ...(process.env.NODE_ENV === 'production' && {
    ssl: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: false
    }
  })
};

// Crear el pool de conexiones
const connection = mysql.createPool(dbConfig);

// Verificar que conecta bien al arrancar
connection.getConnection((err, conn) => {
  if (err) {
    console.error('Error en la conexión:', err.message);
  } else {
    console.log('Conectado a MySQL correctamente');
    conn.release(); 
  }
});

module.exports = connection;
