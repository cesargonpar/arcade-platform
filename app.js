// --------------------------
// Arcade - app.js
// Servidor Node.js con Express y MySQL
// --------------------------

require("dotenv").config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const connection = require('./db');

const app = express();
const port = process.env.PORT || 3000;

// --------------------------
// Middleware
// --------------------------

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(express.static('public'));
// --------------------------
// Middleware ADMIN
// --------------------------

function requireAdmin(req, res, next) {

  // comprobar que está logueado
  if (!req.session.usuario_id) {
    return res.status(401).json({ error: "Debes iniciar sesión" });
  }

  // comprobar que es admin
  if (req.session.usuario_rol !== "admin") {
    return res.status(403).json({ error: "No tienes permisos de administrador" });
  }

  next();
}


// --------------------------
// Ruta de prueba
// --------------------------

app.get('/', (req, res) => {
  res.send('Servidor de Arcade funcionando!');
});


// --------------------------
// LOGIN
// --------------------------

app.post('/login', (req, res) => {

  const { nombre, password } = req.body;

  if (!nombre || !password) {
    return res.status(400).json({ campo: "general", error: "Faltan datos" });
  }

  const sql = 'SELECT * FROM usuarios WHERE nombre = BINARY ?';

  connection.query(sql, [nombre], async (err, results) => {

    if (err) return res.status(500).json({ error: "Error en la base de datos" });

    if (results.length === 0) {
      return res.status(404).json({ campo: "nombre", error: "Usuario incorrecto" });
    }

    const user = results[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ campo: "password", error: "Contraseña incorrecta" });
    }

    req.session.usuario_id = user.id;
    req.session.usuario_nombre = user.nombre;
    req.session.usuario_email = user.email;
    req.session.usuario_rol = user.rol;

    res.json({ mensaje: `Bienvenido ${user.nombre} (${user.rol})` });

  });

});


// --------------------------
// REGISTRO
// --------------------------

app.post('/register', async (req, res) => {

  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ campo: "general", error: "Faltan datos" });
  }

  connection.query('SELECT * FROM usuarios WHERE nombre = BINARY ?', [nombre], (errNom, resultsNom) => {

    if (resultsNom.length > 0) {
      return res.status(400).json({ campo: "nombre", error: "Nombre de usuario ya existe" });
    }

    connection.query('SELECT * FROM usuarios WHERE email = ?', [email], async (errEmail, resultsEmail) => {

      if (resultsEmail.length > 0) {
        return res.status(400).json({ campo: "email", error: "Email ya registrado" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const rol = 'user';

      connection.query(
        'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
        [nombre, email, hashedPassword, rol],
        (errInsert, result) => {

          if (errInsert) return res.status(500).json({ error: "Error al crear usuario" });

          req.session.usuario_id = result.insertId;
          req.session.usuario_nombre = nombre;
          req.session.usuario_rol = rol;

          res.json({ mensaje: 'Usuario creado y logeado', usuario: nombre, rol });

        }
      );

    });

  });

});


// --------------------------
// CHECK SESSION
// --------------------------

app.get('/check-session', (req, res) => {

  if (req.session.usuario_id) {

    res.json({
      loggedIn: true,
      usuario: req.session.usuario_nombre,
      email: req.session.usuario_email,
      rol: req.session.usuario_rol
    });

  } else {

    res.json({ loggedIn: false });

  }

});


// --------------------------
// LOGOUT
// --------------------------

app.post('/logout', (req, res) => {

  req.session.destroy((err) => {

    if (err) {
      return res.status(500).json({ error: "No se pudo cerrar la sesión" });
    }

    res.clearCookie('connect.sid');

    res.json({ mensaje: "Sesión cerrada" });

  });

});


// --------------------------
// JUEGOS
// --------------------------

app.post('/juegos', requireAdmin, (req, res) => {

  const { nombre, genero, anio, descripcion, imagen } = req.body;

  const sql = 'INSERT INTO juegos (nombre, genero, anio, descripcion, imagen) VALUES (?, ?, ?, ?, ?)';

  connection.query(sql, [nombre, genero, anio, descripcion, imagen], (err) => {

    if (err) return res.status(500).send('Error al crear juego');

    res.send('Juego creado correctamente');

  });

});
//MOSTRAR JUEGOS 
app.get('/juegos', (req, res) => {

  const sql = 'SELECT * FROM juegos';

  connection.query(sql, (err, results) => {

    if (err) return res.status(500).send('Error al obtener juegos');

    res.json(results);

  });

});

//ACTUALIZAR JUEGO
app.put('/juegos/:id', requireAdmin, (req, res) => {

  const { id } = req.params;
  const { nombre, genero, anio, descripcion } = req.body;

  const sql = `
    UPDATE juegos 
    SET nombre = ?, genero = ?, anio = ?, descripcion = ?
    WHERE id = ?
  `;

  connection.query(sql, [nombre, genero, anio, descripcion, id], (err, result) => {

    if (err) return res.status(500).send('Error al actualizar juego');

    if (result.affectedRows === 0) {
      return res.status(404).send('Juego no encontrado');
    }

    res.send('Juego actualizado correctamente');

  });

});

// BORRAR JUEGO
app.delete('/juegos/:id', requireAdmin, (req, res) => {

  const { id } = req.params;

  const sql = 'DELETE FROM juegos WHERE id = ?';

  connection.query(sql, [id], (err, result) => {

    if (err) return res.status(500).send('Error al eliminar juego');

    if (result.affectedRows === 0) {
      return res.status(404).send('Juego no encontrado');
    }

    res.send('Juego eliminado correctamente');

  });

});


// --------------------------
// GUARDAR PUNTUACIÓN
// --------------------------

app.post("/puntuaciones", (req, res) => {

  if (!req.session.usuario_id) {
    return res.status(401).json({ error: "Debes iniciar sesión" });
  }

  const { juego_id, puntos } = req.body;

  const usuario_id = req.session.usuario_id;

  const sql = `
  INSERT INTO puntuaciones (usuario_id, juego_id, puntos)
  VALUES (?, ?, ?)
  `;

  connection.query(sql, [usuario_id, juego_id, puntos], (err) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }

    res.json({ mensaje: "Puntuación guardada" });

  });

});


// --------------------------
// TOP 10 DE UN JUEGO
// --------------------------

app.get('/puntuaciones/top/:id', (req, res) => {

  const juegoId = req.params.id;

  const sql = `
    SELECT u.nombre AS usuario, p.puntos, p.fecha
    FROM puntuaciones p
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE p.juego_id = ?
    ORDER BY p.puntos DESC
    LIMIT 10
  `;

  connection.query(sql, [juegoId], (err, results) => {

    if (err) return res.status(500).send('Error al obtener top puntuaciones');

    res.json(results);

  });

});


// --------------------------
// PUNTUACIONES DEL USUARIO
// --------------------------

app.get("/mis-puntuaciones", (req, res) => {

  if (!req.session.usuario_id) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const sql = `
  SELECT juegos.nombre AS juego, MAX(puntos) AS puntos
  FROM puntuaciones
  JOIN juegos ON juegos.id = puntuaciones.juego_id
  WHERE usuario_id = ?
  GROUP BY juego_id
  ORDER BY puntos DESC
  `;

  connection.query(sql, [req.session.usuario_id], (err, result) => {

    if (err) return res.status(500).json({ error: "Error BD" });

    res.json(result);

  });

});


// --------------------------
// INICIAR SERVIDOR
// --------------------------

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});