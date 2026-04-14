// --------------------------
// Admin.js - Panel de gestión de juegos
// Crear / Editar / Eliminar / Buscar
// --------------------------


// ==========================
// ELEMENTOS DEL DOM
// ==========================
const formJuego = document.getElementById("formJuego");
const mensaje = document.getElementById("mensaje");
const listaJuegosAdmin = document.getElementById("listaJuegosAdmin");
const buscadorAdmin = document.getElementById("buscadorAdmin");
const btnCancelar = document.getElementById("btnCancelar");


// ==========================
// CARGAR JUEGOS
// ==========================
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

        <p>${juego.genero || ""}</p>
        <p>${juego.descripcion || ""}</p>

        <button onclick="editarJuego(${juego.id})">✏️ Editar</button>
        <button onclick="eliminarJuego(${juego.id})">🗑 Eliminar</button>
      `;

      listaJuegosAdmin.appendChild(card);
    });

  } catch (error) {
    console.error("Error cargando juegos:", error);
    mensaje.textContent = "Error al cargar juegos";
  }
}


// ==========================
// CREAR / ACTUALIZAR JUEGO
// ==========================
formJuego.addEventListener("submit", async (e) => {
  e.preventDefault();

  // ID oculto (si existe → edición)
  const id = document.getElementById("juegoId").value;

  // Datos del formulario
  const juegoData = {
    nombre: document.getElementById("nombre").value,
    genero: document.getElementById("genero").value,
    anio: document.getElementById("anio").value,
    descripcion: document.getElementById("descripcion").value,
    imagen: document.getElementById("imagen").value
  };

  try {
    let url = "/juegos";
    let method = "POST";

    // Si hay ID → modo edición
    if (id) {
      url = `/juegos/${id}`;
      method = "PUT";
    }

    // Petición al backend
    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(juegoData)
    });

    // Mensaje según acción
    mensaje.textContent = id
      ? "Juego actualizado correctamente"
      : "Juego creado correctamente";

    // Reset formulario
    formJuego.reset();
    document.getElementById("juegoId").value = "";

    // Volver a modo "crear"
    document.getElementById("titulo-form").textContent = "➕ Crear nuevo juego";
    document.getElementById("btnCrear").textContent = "Crear Juego";

    btnCancelar.style.display = "none";

    // Recargar lista
    cargarJuegosAdmin();

  } catch (error) {
    console.error("Error guardando juego:", error);
    mensaje.textContent = "Error al guardar juego";
  }
});


// ==========================
// EDITAR JUEGO
// ==========================
async function editarJuego(id) {
  try {
    const res = await fetch("/juegos");
    const juegos = await res.json();

    const juego = juegos.find(j => j.id === id);

    // Rellenar formulario
    document.getElementById("juegoId").value = juego.id;
    document.getElementById("nombre").value = juego.nombre;
    document.getElementById("genero").value = juego.genero;
    document.getElementById("anio").value = juego.anio;
    document.getElementById("descripcion").value = juego.descripcion;
    document.getElementById("imagen").value = juego.imagen;

    // Cambiar UI a modo edición
    document.getElementById("titulo-form").textContent = "✏️ Editar juego";
    document.getElementById("btnCrear").textContent = "Actualizar Juego";

    btnCancelar.style.display = "inline-block";

    mensaje.textContent = "Editando juego...";

    //  Scroll automático al formulario
    document.getElementById("formJuego").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  } catch (error) {
    console.error("Error editando juego:", error);
    mensaje.textContent = "Error al editar juego";
  }
}


// ==========================
// CANCELAR EDICIÓN
// ==========================
btnCancelar.addEventListener("click", () => {
  formJuego.reset();
  document.getElementById("juegoId").value = "";

  // Volver a modo creación
  document.getElementById("titulo-form").textContent = "➕ Crear nuevo juego";
  document.getElementById("btnCrear").textContent = "Crear Juego";

  btnCancelar.style.display = "none";
  mensaje.textContent = "";
   //  RECARGAR LISTA DE JUEGOS
  cargarJuegosAdmin();
});


// ==========================
// ELIMINAR JUEGO
// ==========================
async function eliminarJuego(id) {
  if (!confirm("¿Seguro que quieres eliminar este juego?")) return;

  try {
    await fetch(`/juegos/${id}`, {
      method: "DELETE"
    });

    mensaje.textContent = "Juego eliminado correctamente";

    cargarJuegosAdmin();

  } catch (error) {
    console.error("Error eliminando juego:", error);
    mensaje.textContent = "Error al eliminar juego";
  }
}

// --------------------------
// Buscador admin 
// --------------------------

const btnBuscar = document.getElementById("btnBuscar");

function ejecutarBusqueda() {

  const texto = buscadorAdmin.value.toLowerCase().trim();
  const cards = document.querySelectorAll(".card-juego");

  let primerResultado = null;
  let resultados = 0;

  cards.forEach(card => {

    const contenido = card.textContent.toLowerCase();

    if (contenido.includes(texto)) {
      card.style.display = "block";
      resultados++;

      if (!primerResultado) {
        primerResultado = card;
      }

    } else {
      card.style.display = "none";
    }
  });

  //  scroll al primer resultado
  if (texto && primerResultado) {
    primerResultado.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  // mensaje si no hay resultados
  if (texto && resultados === 0) {
    mensaje.textContent = "No se encontraron juegos";
  } else {
    mensaje.textContent = "";
  }
}


//  ENTER activa búsqueda
buscadorAdmin.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    ejecutarBusqueda();
  }
});

//  BOTÓN LUPA activa búsqueda
btnBuscar.addEventListener("click", ejecutarBusqueda);

// ==========================
// INICIALIZAR PANEL
// ==========================
document.addEventListener("DOMContentLoaded", cargarJuegosAdmin);