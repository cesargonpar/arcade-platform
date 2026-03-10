// ---------------------------------------------------
// juego.js
// Controla la página de un juego concreto:
//
// Comprueba si el usuario está logueado
// Carga los datos del juego
// Muestra el Top 10 de puntuaciones
// Permite insertar puntuación SOLO si hay sesión
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


// --------------------------
// OBTENER ID DEL JUEGO DESDE LA URL
// ejemplo: juego.html?id=3
// --------------------------
const urlParams = new URLSearchParams(window.location.search);
const juegoId = urlParams.get('id');


// Variable que guardará el usuario si está logueado
let usuarioLogueado = null;


// ---------------------------------------------------
// COMPROBAR SESIÓN DE USUARIO
// ---------------------------------------------------
async function comprobarSesion() {

  try {

    // Pedimos al servidor si existe una sesión activa
    const res = await fetch('/check-session');
    const data = await res.json();

    // Si el usuario está logueado
    if (data.loggedIn) {

      usuarioLogueado = data.usuario;

      // Mostrar el nombre del usuario en la cabecera
      usuarioInfo.textContent = `👤 ${usuarioLogueado} | `;

      // Crear botón de logout
      const btnLogout = document.createElement('button');
      btnLogout.textContent = 'Cerrar sesión';

      // Evento para cerrar sesión
      btnLogout.addEventListener('click', async () => {

        await fetch('/logout', { method: 'POST' });

        // Recargar página después del logout
        window.location.reload();
      });

      usuarioInfo.appendChild(btnLogout);

      // Mostrar formulario para insertar puntuación
      formPuntuacion.style.display = 'block';
      mensajeLogin.textContent = "";

    } else {

      // Si no hay sesión:
      // ocultamos el formulario
      formPuntuacion.style.display = 'none';

      // mostramos mensaje informativo
      mensajeLogin.textContent = "Debes iniciar sesión para añadir puntuaciones";
    }

  } catch (error) {

    console.error("Error comprobando sesión:", error);
  }
}



// ---------------------------------------------------
// CARGAR INFORMACIÓN DEL JUEGO Y TOP 10
// ---------------------------------------------------
async function cargarJuego() {

  try {

    // --------------------------
    // Cargar lista de juegos
    // --------------------------
    const resJuego = await fetch('/juegos');
    const juegos = await resJuego.json();

    // Buscar el juego actual por su ID
    const juego = juegos.find(j => j.id == juegoId);

    if (!juego) {
      nombreJuegoEl.textContent = "Juego no encontrado";
      return;
    }

    // Mostrar nombre del juego
    nombreJuegoEl.textContent = juego.nombre;



    // --------------------------
    // Cargar Top 10 puntuaciones
    // --------------------------
    const resTop = await fetch(`/puntuaciones/top/${juegoId}`);
    const top10 = await resTop.json();

    // Limpiar ranking antes de volver a cargarlo
    rankingEl.innerHTML = "";

    // Crear un <li> por cada puntuación
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

  // Evitar que el formulario recargue la página
  e.preventDefault();

  // Seguridad extra: si no hay usuario logueado no hace nada
  if (!usuarioLogueado) return;

  // Obtener puntuación introducida
  const puntos = puntosInput.value;

  try {

    // Enviar puntuación al servidor
    const res = await fetch('/puntuaciones', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      // El backend identificará al usuario por la sesión
      body: JSON.stringify({
        juego_id: juegoId,
        puntos
      })
    });

    if (res.ok) {

      // Limpiar campo
      puntosInput.value = "";

      // Recargar ranking actualizado
      cargarJuego();

    } else {

      console.error("Error guardando puntuación");
    }

  } catch (error) {

    console.error("Error guardando puntuación:", error);
  }

});



// ---------------------------------------------------
// INICIAR LA PÁGINA
// ---------------------------------------------------
// Cuando se carga juego.html:
//
// comprobamos sesión
// cargamos datos del juego
// ---------------------------------------------------

comprobarSesion();
cargarJuego();