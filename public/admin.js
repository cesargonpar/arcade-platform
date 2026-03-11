// --------------------------
// Admin.js - Crear / Editar / Eliminar juegos
// --------------------------
const formJuego = document.getElementById("formJuego");
const mensaje = document.getElementById("mensaje");
const listaJuegosAdmin = document.getElementById("listaJuegosAdmin");
const buscadorAdmin = document.getElementById("buscadorAdmin");
const btnCancelar = document.getElementById("btnCancelar");
let editando = false;

// --------------------------
// Cargar juegos
// --------------------------
async function cargarJuegosAdmin() {
  try {
    const res = await fetch("/juegos");
    const juegos = await res.json();
    listaJuegosAdmin.innerHTML = "";

    juegos.forEach(juego => {
      const card = document.createElement("div");
      card.className = "card-juego";

      card.innerHTML = `
        <img src="${juego.imagen}" alt="${juego.nombre}" class="juego-imagen">
        <h3>${juego.nombre}</h3>
        <p>${juego.genero || ""} | ${juego.anio || ""}</p>
        <p>${juego.descripcion || ""}</p>
        <button onclick="editarJuego(${juego.id})">Editar</button>
        <button onclick="eliminarJuego(${juego.id})">Eliminar</button>
      `;

      listaJuegosAdmin.appendChild(card);
    });

  } catch (error) {
    console.error("Error cargando juegos:", error);
  }
}

// --------------------------
// Crear o actualizar juego
// --------------------------
formJuego.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("juegoId").value;
  const nombre = document.getElementById("nombre").value;
  const genero = document.getElementById("genero").value;
  const anio = document.getElementById("anio").value;
  const descripcion = document.getElementById("descripcion").value;
  const imagen = document.getElementById("imagen").value;

  const juegoData = { nombre, genero, anio, descripcion, imagen };

  try {
    let res;
    if (editando) {
      // Actualizar juego
      res = await fetch(`/juegos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(juegoData)
      });
      mensaje.textContent = "Juego actualizado correctamente";
    } else {
      // Crear juego
      res = await fetch("/juegos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(juegoData)
      });
      mensaje.textContent = "Juego creado correctamente";
    }

    formJuego.reset();
    editando = false;
    btnCancelar.style.display = "none";
    cargarJuegosAdmin();

  } catch (error) {
    console.error(error);
    mensaje.textContent = "Error al guardar juego";
  }
});

// --------------------------
// Editar juego
// --------------------------
async function editarJuego(id) {
  try {
    const res = await fetch("/juegos");
    const juegos = await res.json();
    const juego = juegos.find(j => j.id === id);

    document.getElementById("juegoId").value = juego.id;
    document.getElementById("nombre").value = juego.nombre;
    document.getElementById("genero").value = juego.genero;
    document.getElementById("anio").value = juego.anio;
    document.getElementById("descripcion").value = juego.descripcion;
    document.getElementById("imagen").value = juego.imagen;

    editando = true;
    btnCancelar.style.display = "inline-block";
    mensaje.textContent = "Editando juego...";
  } catch (error) {
    console.error(error);
  }
}

// --------------------------
// Cancelar edición
// --------------------------
btnCancelar.addEventListener("click", () => {
  formJuego.reset();
  editando = false;
  btnCancelar.style.display = "none";
  mensaje.textContent = "";
});

// --------------------------
// Eliminar juego
// --------------------------
async function eliminarJuego(id) {
  if (!confirm("¿Seguro que quieres eliminar este juego?")) return;

  try {
    await fetch(`/juegos/${id}`, { method: "DELETE" });
    mensaje.textContent = "Juego eliminado";
    cargarJuegosAdmin();
  } catch (error) {
    console.error(error);
    mensaje.textContent = "Error al eliminar juego";
  }
}

// --------------------------
// Buscador admin
// --------------------------
buscadorAdmin.addEventListener("input", () => {
  const texto = buscadorAdmin.value.toLowerCase();
  const cards = document.querySelectorAll(".card-juego");
  cards.forEach(card => {
    const nombre = card.querySelector("h3").textContent.toLowerCase();
    const descripcion = card.querySelector("p").textContent.toLowerCase();
    if (nombre.includes(texto) || descripcion.includes(texto)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});

// --------------------------
// Iniciar panel
// --------------------------
document.addEventListener("DOMContentLoaded", cargarJuegosAdmin);