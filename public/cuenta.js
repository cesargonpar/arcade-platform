// --------------------------
// CARGAR DATOS DEL USUARIO
// --------------------------

async function cargarUsuario() {

const res = await fetch("/check-session");
const data = await res.json();

if (!data.loggedIn) {

window.location.href = "login.html";
return;

}

document.getElementById("usuario").textContent = data.usuario;
document.getElementById("email").textContent = data.email || "";

}


// --------------------------
// CARGAR PUNTUACIONES
// --------------------------

async function cargarPuntuaciones() {

const res = await fetch("/mis-puntuaciones");
const puntuaciones = await res.json();

const tabla = document.getElementById("tabla-puntuaciones");

tabla.innerHTML = "";

puntuaciones.forEach(p => {

const fila = document.createElement("tr");

fila.innerHTML = `
<td>${p.juego}</td>
<td>${p.puntos}</td>
`;

tabla.appendChild(fila);

});

}


// --------------------------
// LOGOUT
// --------------------------

document.getElementById("logout").addEventListener("click", async () => {

await fetch("/logout", {
method: "POST"
});

window.location.href = "index.html";

});


// --------------------------
// INICIAR
// --------------------------

cargarUsuario();
cargarPuntuaciones();