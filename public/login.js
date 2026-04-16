// --------------------------
// login.js
// Controla login
// --------------------------

// Obtener elementos del DOM
const form = document.getElementById("form-login");
const mensajeDiv = document.getElementById("mensaje-error");

// --------------------------
// EVENTO SUBMIT DEL FORM
// --------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Evitar que el formulario se envíe por defecto

  // Recoger datos del formulario
  const nombre = document.getElementById("nombre").value.trim();
  const password = document.getElementById("password").value;

  // Limpiar mensajes previos
  mensajeDiv.textContent = "";

  try {
    // Llamada al backend
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email: nombre + "@example.com", password })
      // Usamos un email temporal para login, porque backend pide nombre + email
    });

    // Recibir respuesta JSON
    const data = await res.json();

    if (res.ok) {
      // Login correcto → redirigir a index.html
      window.location.href = "index.html";
    } else {
      // Mostrar mensaje según el campo
      if (data.campo === "nombre/email") mensajeDiv.textContent = "Usuario o email incorrecto";
      else if (data.campo === "password") mensajeDiv.textContent = "Contraseña incorrecta";
      else mensajeDiv.textContent = data.error || "Error en login";
    }

  } catch (error) {
    console.error("Error login:", error);
    mensajeDiv.textContent = "Error en la conexión con el servidor";
  }
});