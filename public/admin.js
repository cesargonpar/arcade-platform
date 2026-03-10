// ==============================
// ADMIN.JS
// Script para crear juegos desde el panel admin
// ==============================


// Obtener el formulario del HTML
const form = document.getElementById("formJuego");


// Detectar cuando el usuario envía el formulario
form.addEventListener("submit", async (e) => {

  // Evitar que la página se recargue
  e.preventDefault();


  // Obtener los valores introducidos en los inputs
  const nombre = document.getElementById("nombre").value;
  const genero = document.getElementById("genero").value;
  const anio = document.getElementById("anio").value;
  const descripcion = document.getElementById("descripcion").value;
  const imagen = document.getElementById("imagen").value;


  // Enviar los datos al backend usando fetch
  const res = await fetch("/juegos", {

    // Método POST porque estamos creando un juego
    method: "POST",

    // Indicamos que enviamos datos en formato JSON
    headers: {
      "Content-Type": "application/json"
    },

    // Convertimos los datos a JSON
    body: JSON.stringify({
      nombre,
      genero,
      anio,
      descripcion,
      imagen
    })

  });


  // Obtener respuesta del servidor
  const texto = await res.text();


  // Mostrar el mensaje del servidor en la página
  document.getElementById("mensaje").innerText = texto;

});