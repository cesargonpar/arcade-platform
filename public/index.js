// --------------------------
// index.js - Arcade
// --------------------------

// --------------------------
// VARIABLES PRINCIPALES
// --------------------------
const listaJuegos = document.getElementById("juegos-container");
const header = document.querySelector("header");

// --------------------------
// COMPROBAR SESIÓN
// --------------------------
async function checkSesion() {
  try {
    const res = await fetch("/check-session");
    const data = await res.json();

    // Si hay usuario logueado, mostrar su nombre y botón logout
    if (data.loggedIn) {
      mostrarUsuario(data.usuario);

      // Mostrar botón admin si es admin
      mostrarBotonAdmin(data.rol); // <-- añadimos esto
    }
  } catch (error) {
    console.error("Error comprobando sesión:", error);
  }
}
// --------------------------
// CONTROL BOTÓN MI CUENTA
// --------------------------

async function controlarBotonCuenta() {

  const botonCuenta = document.getElementById("btn-cuenta");

  try {

    const res = await fetch("/check-session");
    const data = await res.json();

    if (data.loggedIn) {

      // Si está logueado mostramos su nombre
      botonCuenta.textContent = `👤 ${data.usuario}`;

      // Cambiamos el enlace a la página de cuenta
      botonCuenta.href = "cuenta.html";

    }

  } catch (error) {

    console.error("Error comprobando sesión:", error);

  }

}
// --------------------------
// MOSTRAR USUARIO LOGUEADO
// --------------------------
function mostrarUsuario(nombre) {
  // Crear contenedor
  let infoDiv = document.createElement("div");
  infoDiv.id = "usuario-logueado";
  infoDiv.style.marginLeft = "10px";

  infoDiv.innerHTML = `
    <span>👤 ${nombre}</span>
    <button id="btn-logout">Cerrar sesión</button>
  `;

  // Añadir al header
  header.appendChild(infoDiv);

  // Manejar logout
  const btnLogout = document.getElementById("btn-logout");
  btnLogout.addEventListener("click", async () => {
    try {
      await fetch("/logout", { method: "POST" });
      // Recargar la página tras logout
      location.reload();
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  });
}
// --------------------------
// MOSTRAR BOTÓN ADMIN SI EL USUARIO ES ADMIN
// --------------------------
function mostrarBotonAdmin(rol) {
  if (rol === "admin") {
    const container = document.getElementById("admin-btn-container");

    // Crear botón
    const btnAdmin = document.createElement("a");
    btnAdmin.href = "admin.html";       // enlace al panel admin
    btnAdmin.className = "cuenta-btn admin-btn";  // para diferenciar btn mi cuenta de admin
    btnAdmin.textContent = "🛠 Panel Admin";

    container.appendChild(btnAdmin);
  }
}

// --------------------------
// CARGAR JUEGOS
// --------------------------
async function cargarJuegos() {
  try {
    const res = await fetch("/juegos");
    const juegos = await res.json();

    listaJuegos.innerHTML = "";

    juegos.forEach(juego => {

      // NUEVO: crear enlace que envuelve toda la card
      const link = document.createElement("a");
      link.href = `juego.html?id=${juego.id}`;
      link.style.textDecoration = "none";
      link.style.color = "inherit";

      const card = document.createElement("div");
      card.className = "card-juego";

      card.innerHTML = `
        <img src="${juego.imagen}" alt="${juego.nombre}" class="juego-imagen">
        <h3>${juego.nombre}</h3>
        <p>${juego.anio || ""}</p>
        <p>${juego.genero || ""}</p>
      `;

      // meter card dentro del link
      link.appendChild(card);

      listaJuegos.appendChild(link);
    });

  } catch (error) {
    console.error("Error cargando juegos:", error);
  }
}

// --------------------------
// INICIAR APP
// --------------------------
function iniciarApp() {
  checkSesion();   // Comprobar si hay usuario logueado
  controlarBotonCuenta(); //controlar boton mi cuenta cuando existe login
  cargarJuegos();  // Cargar todos los juegos
}

// --------------------------
// LLAMAR A INICIAR APP AL CARGAR
// --------------------------

document.addEventListener("DOMContentLoaded", iniciarApp);
// --------------------------
// BUSCADOR DE JUEGOS
// --------------------------
const buscador = document.getElementById("buscador");

buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase();

    const cards = document.querySelectorAll(".card-juego");
    cards.forEach(card => {
        const nombre = card.querySelector("h3").textContent.toLowerCase();
        const descripcion = card.querySelector("p").textContent.toLowerCase();
        if (nombre.includes(texto) || descripcion.includes(texto)) {
            card.style.display = "block"; // Mostrar card
        } else {
            card.style.display = "none";  // Ocultar card
        }
    });
});