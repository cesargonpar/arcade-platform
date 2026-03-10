// --------------------------
// Arcade - app.js
// Servidor Node.js con Express y MySQL
// --------------------------

const express = require('express');         // Servidor web
const session = require('express-session');
const bodyParser = require('body-parser');  // Para leer datos de formularios/JSON
const bcrypt = require('bcryptjs');         // Para encriptar contraseñas
const connection = require('./db');         // Conexión MySQL

const app = express();
const port = 3000;

// --------------------------
// Middleware
// --------------------------

// Leer datos de formularios HTML
app.use(bodyParser.urlencoded({ extended: false }));

//leer JSON del frontend
app.use(express.json());

// Middleware para sesiones
// Esto permite guardar usuario_id y usuario_nombre en req.session
app.use(session({
    secret: 'arcade_secreto',  // Clave secreta para firmar la sesión
    resave: false,              // No guardar sesión si no ha cambiado
    saveUninitialized: true     // Crear sesión aunque no haya datos
}));


//Servir archivos estáticos en Express
app.use(express.static('public'));


// --------------------------
// Rutas
// --------------------------

// --- Ruta de prueba para asegurarnos de que el servidor funciona ---
app.get('/', (req, res) => {
  res.send('Servidor de Arcade funcionando!');
});
// --------------------------
// LOGIN DE USUARIO (solo usuario y contraseña)
// --------------------------
app.post('/login', (req, res) => {
  const { nombre, password } = req.body; // eliminamos email

  if (!nombre || !password) {
    return res.status(400).json({ campo: "general", error: "Faltan datos" });
  }

  // Buscar usuario por nombre EXACTO (case-sensitive)
  const sql = 'SELECT * FROM usuarios WHERE nombre = BINARY ?';
  connection.query(sql, [nombre], async (err, results) => {
    if (err) return res.status(500).json({ campo: "general", error: "Error en la base de datos" });

    if (results.length === 0) {
      // Usuario no encontrado
      return res.status(404).json({ campo: "nombre", error: "Usuario incorrecto" });
    }

    const user = results[0];

    // Comparar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ campo: "password", error: "Contraseña incorrecta" });
    }

    // Guardar en sesión
    req.session.usuario_id = user.id;
    req.session.usuario_nombre = user.nombre;
    req.session.usuario_email = user.email;
    req.session.usuario_rol = user.rol;

    res.json({ mensaje: `Bienvenido ${user.nombre} (${user.rol})` });
  });
});
// --------------------------
// REGISTRO DE USUARIO
// Crea usuario nuevo con rol 'user' y verifica duplicados
// --------------------------
app.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ campo: "general", error: "Faltan datos" });
  }

  // Verificar que el nombre no exista (case-sensitive)
  connection.query('SELECT * FROM usuarios WHERE nombre = BINARY ?', [nombre], (errNom, resultsNom) => {
    if (errNom) return res.status(500).json({ campo: "general", error: "Error en la DB" });
    if (resultsNom.length > 0) {
      return res.status(400).json({ campo: "nombre", error: "Nombre de usuario ya existe" });
    }

    // Verificar que el email no exista
    connection.query('SELECT * FROM usuarios WHERE email = ?', [email], async (errEmail, resultsEmail) => {
      if (errEmail) return res.status(500).json({ campo: "general", error: "Error en la DB" });
      if (resultsEmail.length > 0) {
        return res.status(400).json({ campo: "email", error: "Email ya registrado" });
      }

      // Crear usuario nuevo
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const rol = 'user';

        connection.query(
          'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
          [nombre, email, hashedPassword, rol],
          (errInsert, result) => {
            if (errInsert) return res.status(500).json({ campo: "general", error: "Error al crear usuario" });

            // Guardar sesión
            req.session.usuario_id = result.insertId;
            req.session.usuario_nombre = nombre;
            req.session.usuario_rol = rol;

            res.json({ mensaje: 'Usuario creado y logeado', usuario: nombre, rol });
          }
        );

      } catch (error) {
        console.error(error);
        res.status(500).json({ campo: "general", error: "Error interno" });
      }
    });
  });
});
// --------------------------
// COMPROBAR SESIÓN
// Devuelve si el usuario está logeado
// --------------------------
app.get('/check-session', (req, res) => {

  if (req.session.usuario_id) {

    res.json({
      loggedIn: true,
      usuario: req.session.usuario_nombre,
      email: req.session.usuario_email
    });

  } else {

    res.json({
      loggedIn: false
    });

  }

});


// --------------------------
// CERRAR SESIÓN
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
// Crear juego
app.post('/juegos', (req, res) => {
  const { nombre, genero, anio, descripcion, imagen } = req.body;

  const sql = 'INSERT INTO juegos (nombre, genero, anio, descripcion, imagen) VALUES (?, ?, ?, ?, ?)';

  connection.query(sql, [nombre, genero, anio, descripcion, imagen], (err, result) => {
    if (err) return res.status(500).send('Error al crear juego');
    res.send('Juego creado correctamente');
  });
});
// Listar juegos
app.get('/juegos', (req, res) => {
  const sql = 'SELECT * FROM juegos';

  connection.query(sql, (err, results) => {
    if (err) return res.status(500).send('Error al obtener juegos');
    res.json(results);
  });
});
// Actualizar juego
app.put('/juegos/:id', (req, res) => {
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
// Eliminar juego
app.delete('/juegos/:id', (req, res) => {
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

  // comprobar que el usuario esté logueado
  if (!req.session.usuario_id) {
    return res.status(401).json({ error: "Debes iniciar sesión" });
  }

  // datos enviados desde juego.js
  const { juego_id, puntos } = req.body;

  // usuario desde la sesión
  const usuario_id = req.session.usuario_id;

  const sql = `
  INSERT INTO puntuaciones (usuario_id, juego_id, puntos)
  VALUES (?, ?, ?)
  `;

  connection.query(sql, [usuario_id, juego_id, puntos], (err, result) => {

    if (err) {
      console.error("Error guardando puntuación:", err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }

    res.json({ mensaje: "Puntuación guardada" });

  });

});
// Listar puntuaciones
app.get('/puntuaciones', (req, res) => {
  const sql = `
    SELECT p.id, u.nombre AS usuario, j.nombre AS juego, p.puntos, p.fecha
    FROM puntuaciones p
    JOIN usuarios u ON p.usuario_id = u.id
    JOIN juegos j ON p.juego_id = j.id
  `;

  connection.query(sql, (err, results) => {
    if (err) return res.status(500).send('Error al obtener puntuaciones');
    res.json(results);
  });
});
// Actualizar puntuación
app.put('/puntuaciones/:id', (req, res) => {
  const { id } = req.params;
  const { puntos } = req.body;

  const sql = 'UPDATE puntuaciones SET puntos = ? WHERE id = ?';
  connection.query(sql, [puntos, id], (err, result) => {
    if (err) return res.status(500).send('Error al actualizar puntuación');
    if (result.affectedRows === 0) return res.status(404).send('Puntuación no encontrada');
    res.send('Puntuación actualizada correctamente');
  });
});
// Eliminar puntuación
app.delete('/puntuaciones/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM puntuaciones WHERE id = ?';
  connection.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send('Error al eliminar puntuación');
    if (result.affectedRows === 0) return res.status(404).send('Puntuación no encontrada');
    res.send('Puntuación eliminada correctamente');
  });
});
// Listar puntuaciones de un usuario específico
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

if (err) {
console.error(err);
return res.status(500).json({ error: "Error BD" });
}

res.json(result);

});

});
// Listar puntuaciones de un juego específico
app.get('/puntuaciones/juego/:id', (req, res) => {
  const juegoId = req.params.id;

  const sql = `
    SELECT p.id, u.nombre AS usuario, j.nombre AS juego, p.puntos, p.fecha
    FROM puntuaciones p
    JOIN usuarios u ON p.usuario_id = u.id
    JOIN juegos j ON p.juego_id = j.id
    WHERE p.juego_id = ?
  `;

  connection.query(sql, [juegoId], (err, results) => {
    if (err) return res.status(500).send('Error al obtener puntuaciones del juego');
    res.json(results);
  });
});
// Obtener top 10 puntuaciones de un juego
app.get('/puntuaciones/top/:id', (req, res) => {
  const juegoId = req.params.id;

  const sql = `
    SELECT p.id, u.nombre AS usuario, j.nombre AS juego, p.puntos, p.fecha
    FROM puntuaciones p
    JOIN usuarios u ON p.usuario_id = u.id
    JOIN juegos j ON p.juego_id = j.id
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
// Iniciar servidor
// --------------------------
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});