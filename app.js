const API = "https://dummyjson.com/";

const $form = document.querySelector("#form_login");
const $boton = document.querySelector("#enviar_form");
const $mensaje = document.querySelector("#mensaje");

let usuarioActual = null;

function mostrarLogin(){
  document.querySelector("#seccion_login").classList.remove("oculto");
  document.querySelector("#panel").classList.add("oculto")
}

function mostrarPanel(){
  document.querySelector("#seccion_login").classList.add("oculto");
  document.querySelector("#panel").classList.remove("oculto");
}

async function cargarPerfil() {
    const token = localStorage.getItem("token");

    try {
        const respuesta = await fetch(`${API}auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        // si el token ya no sirve lo borro y regreso al login
        if (respuesta.status === 401) {
            localStorage.removeItem("token");
            mostrarLogin();
            return;
        }

        const usuario = await respuesta.json();
        usuarioActual = usuario;

        document.querySelector("#foto").src = usuario.image;
        document.querySelector("#nombre").textContent = `Nombre: ${usuario.firstName} ${usuario.lastName}`;
        document.querySelector("#correo").textContent = `Correo: ${usuario.email}`;
        document.querySelector("#usuario_perfil").textContent = `Usuario: ${usuario.username}`;
        document.querySelector("#telefono").textContent = `Telefono: ${usuario.phone}`;
        document.querySelector("#edad").textContent = `Edad: ${usuario.age}`;

        mostrarPanel();
    } catch (error) {
        console.log(error);
        mostrarLogin();
    }
}

document.querySelector("#btn_salir").addEventListener("click", () =>{
  localStorage.removeItem("token");
  usuarioActual = null;
  mostrarLogin();
})

// Si hay un token guardado entra directo. por si quiere recargar la pagina o algo
if (localStorage.getItem("token")){
  cargarPerfil();
}

async function auth_login() {
    const usuario = document.querySelector("#texto_usuario").value;
    const contrasena = document.querySelector("#texto_contrasena").value;

    $boton.disabled = true;
    $boton.textContent = "Entrando…";
    $mensaje.textContent = "";

    try {
        const respuesta = await fetch(`${API}auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: usuario,
                password: contrasena,
            }),
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            localStorage.setItem("token", datos.accessToken);
            console.log("token guardado");
            cargarPerfil();
        } else {
            $mensaje.textContent = "Usuario o contraseña incorrectos";
        }
    } catch (error) {
        console.error(error);
        $mensaje.textContent = "No se pudo conectar con el servidor";
    }

    $boton.disabled = false;
    $boton.textContent = "Enviar";
}

$form.addEventListener("submit", (evento) => {
    evento.preventDefault(); // para que no se recargue la pagina
    auth_login();
});