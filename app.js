const API = "https://dummyjson.com/";

const $form = document.querySelector("#form_login");
const $boton = document.querySelector("#enviar_form");
const $mensaje = document.querySelector("#mensaje");

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