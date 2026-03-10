// --------------------------
// register.js
// Maneja registro de usuarios con email
// --------------------------

// Obtener formulario y mensaje de error
const formRegister = document.getElementById("form-register");
const mensajeDiv = document.getElementById("mensaje-error");

// Evento submit del formulario
formRegister.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Tomar valores del formulario
  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  mensajeDiv.textContent = "";

  // Validar que las contraseñas coincidan
  if (password !== confirmPassword) {
    mensajeDiv.textContent = "Las contraseñas no coinciden";
    return;
  }

  try {
    // Enviar datos al backend
    const res = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      // Registro correcto → redirigir al index
      alert(`Usuario ${nombre} registrado correctamente`);
      window.location.href = "index.html";
    } else {
      // Mostrar errores según campo
      if (data.campo === "nombre") mensajeDiv.textContent = "Nombre de usuario ya existe";
      else if (data.campo === "email") mensajeDiv.textContent = "Email ya registrado";
      else mensajeDiv.textContent = data.error || "Error en el registro";
    }

  } catch (error) {
    console.error("Error registrando usuario:", error);
    mensajeDiv.textContent = "Error en la conexión con el servidor";
  }
});