// ---------------------------------------------------
// juego.js
// Página de un juego específico
// ---------------------------------------------------

// --------------------------
// REFERENCIAS A ELEMENTOS HTML
// --------------------------
const nombreJuegoEl = document.getElementById("nombre-juego");
const rankingEl = document.getElementById("ranking");
const formPuntuacion = document.getElementById("form-puntuacion");
const puntosInput = document.getElementById("puntos");
const mensajeLogin = document.getElementById("mensaje-login");
const usuarioInfo = document.getElementById("usuario-info");
const imagenJuegoEl = document.getElementById("imagen-juego");

// --------------------------
// OBTENER ID DEL JUEGO DESDE LA URL
// --------------------------
const urlParams = new URLSearchParams(window.location.search);
const juegoId = urlParams.get('id');

// Usuario logueado
let usuarioLogueado = null;
let esAdmin = false;

// ---------------------------------------------------
// COMPROBAR SESIÓN
// ---------------------------------------------------
async function comprobarSesion() {
  try {
    const res = await fetch('/check-session');
    const data = await res.json();

    if (data.loggedIn) {
      usuarioLogueado = data.usuario;
      esAdmin = data.rol === "admin";

      // Mostrar nombre y botón logout
      usuarioInfo.textContent = `👤 ${usuarioLogueado} | `;
      const btnLogout = document.createElement('button');
      btnLogout.textContent = 'Cerrar sesión';
      btnLogout.addEventListener('click', async () => {
        await fetch('/logout', { method: 'POST' });
        window.location.reload();
      });
      usuarioInfo.appendChild(btnLogout);

      // Mostrar formulario
      formPuntuacion.style.display = 'block';
      mensajeLogin.textContent = "";

      // Si es admin, mostrar botón para panel admin
      if (esAdmin) {
        const btnAdmin = document.createElement('a');
        btnAdmin.href = 'admin.html';
        btnAdmin.textContent = '⚙️ Admin';
        btnAdmin.className = 'btn-admin';
        usuarioInfo.appendChild(btnAdmin);
      }

    } else {
      // No hay sesión
       formPuntuacion.style.display = 'none';
      mensajeLogin.innerHTML = 'Debes <a href="login.html">iniciar sesión</a> para añadir puntuaciones';
  }
  } catch (error) {
    console.error("Error comprobando sesión:", error);
  }
}

// ---------------------------------------------------
// CARGAR DATOS DEL JUEGO Y TOP 10 PUNTUACIONES
// ---------------------------------------------------
async function cargarJuego() {
  try {
    const resJuego = await fetch('/juegos');
    const juegos = await resJuego.json();
    const juego = juegos.find(j => j.id == juegoId);

    if (!juego) {
      nombreJuegoEl.textContent = "Juego no encontrado";
      return;
    }

    nombreJuegoEl.textContent = juego.nombre;
    const descripcionEl = document.getElementById("descripcion-juego");
    descripcionEl.textContent = juego.descripcion;
    // NUEVO: mostrar carátula del juego
    if (imagenJuegoEl) {
       imagenJuegoEl.src = juego.imagen;
    }

    // Cargar Top 10
    const resTop = await fetch(`/puntuaciones/top/${juegoId}`);
    const top10 = await resTop.json();

    rankingEl.innerHTML = "";
    top10.forEach(p => {
      const li = document.createElement('li');
      li.textContent = `${p.usuario}: ${p.puntos} puntos`;
      rankingEl.appendChild(li);
    });

  } catch (error) {
    console.error("Error cargando juego o puntuaciones:", error);
  }
}

// ---------------------------------------------------
// INSERTAR NUEVA PUNTUACIÓN
// ---------------------------------------------------
formPuntuacion.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!usuarioLogueado) return;

  const puntos = puntosInput.value;

  try {
    const res = await fetch('/puntuaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ juego_id: juegoId, puntos })
    });

    if (res.ok) {
      puntosInput.value = "";
      cargarJuego();
    } else {
      console.error("Error guardando puntuación");
    }
  } catch (error) {
    console.error("Error guardando puntuación:", error);
  }
});

// ---------------------------------------------------
// INICIAR PÁGINA
// ---------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  comprobarSesion();
  cargarJuego();
});