# 🎮 Arcade - Plataforma Web de Gestión y Ranking de Juegos

Proyecto web desarrollado con **Node.js, Express y MySQL** que permite gestionar juegos arcade y registrar puntuaciones de los usuarios.

---

## 📌 Funcionalidades

- Registro de usuarios
- Inicio y cierre de sesión
- Sistema de roles (usuario / administrador)
- Listado de juegos arcade
- Panel de administración para crear, editar y eliminar juegos
- Registro de puntuaciones
- Ranking **Top 10** de cada juego
- Consulta de mejores puntuaciones del usuario

---

## 🛠 Tecnologías utilizadas

- Node.js
- Express
- MySQL
- HTML
- CSS
- JavaScript
- bcrypt (hash de contraseñas)
- express-session (gestión de sesiones)

---

## 📁 Estructura del proyecto
# 🎮 Arcade - Plataforma Web de Gestión y Ranking de Juegos

Proyecto web desarrollado con **Node.js, Express y MySQL** que permite gestionar juegos arcade y registrar puntuaciones de los usuarios.

---

## 📌 Funcionalidades

- Registro de usuarios
- Inicio y cierre de sesión
- Sistema de roles (usuario / administrador)
- Listado de juegos arcade
- Panel de administración para crear, editar y eliminar juegos
- Registro de puntuaciones
- Ranking **Top 10** de cada juego
- Consulta de mejores puntuaciones del usuario

---

## 🛠 Tecnologías utilizadas

- Node.js
- Express
- MySQL
- HTML
- CSS
- JavaScript
- bcrypt (hash de contraseñas)
- express-session (gestión de sesiones)

---

## 📁 Estructura del proyecto
aRCADE
│
├── app.js
├── db.js
├── package.json
├── package-lock.json
├── README.md
└── public
├── index.html
├── juego.html
├── admin.html
├── cuenta.html
├── login.html
├── register.html
├── style.css
├── index.js
├── juego.js
├── admin.js
├── login.js
├── register.js
└── imagenes

---

## ⚙️ Instalación

1. Clonar el repositorio
git clone https://github.com/cesargonpar/arcade-platform.git

2. Instalar dependencias
npm install

3. crear base de datos en MySQL
arcade.db

4. Ejecutar el servidor
node app.js

5. Abrir en el navegador
http://localhost:3000


---

## 👤 Usuarios

Los usuarios pueden:

- registrarse
- iniciar sesión
- guardar puntuaciones
- ver rankings

Los administradores pueden además:

- crear juegos
- editar juegos
- eliminar juegos

---

## 📊 Base de datos


La aplicación utiliza una base de datos MySQL llamada **arcade_db**.

Está compuesta por tres tablas principales:

- **usuarios**
- **juegos**
- **puntuaciones**

---

## 🧑‍💻 Tabla: usuarios

Almacena la información de los usuarios registrados en la plataforma.

| Campo | Tipo | Descripción |
|------|------|-------------|
| id | INT (PK) | Identificador del usuario |
| nombre | VARCHAR | Nombre de usuario |
| email | VARCHAR | Correo electrónico |
| password | VARCHAR | Contraseña cifrada |
| rol | VARCHAR | Rol del usuario (user / admin) |

---

## 🎮 Tabla: juegos

Contiene los juegos disponibles en la plataforma.

| Campo | Tipo | Descripción |
|------|------|-------------|
| id | INT (PK) | Identificador del juego |
| nombre | VARCHAR | Nombre del juego |
| genero | VARCHAR | Género del juego |
| anio | INT | Año de lanzamiento |
| descripcion | TEXT | Descripción del juego |
| imagen | VARCHAR | Ruta o URL de la imagen |

---

## 🏆 Tabla: puntuaciones

Guarda las puntuaciones obtenidas por los usuarios en cada juego.

| Campo | Tipo | Descripción |
|------|------|-------------|
| id | INT (PK) | Identificador de la puntuación |
| usuario_id | INT (FK) | Usuario que obtuvo la puntuación |
| juego_id | INT (FK) | Juego al que pertenece la puntuación |
| puntos | INT | Puntuación obtenida |
| fecha | DATETIME | Fecha en la que se registró la puntuación |

---



## 📄 Autor
César González Parada
Proyecto desarrollado para DAW.


