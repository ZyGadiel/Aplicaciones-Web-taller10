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

//crud
async function agregarTarea(texto) {
    try {
        const respuesta = await fetch(`${API}todos/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                todo: texto,
                completed: false,
                userId: usuarioActual.id,
            }),
        });

        if (!respuesta.ok) {
            document.querySelector("#aviso").textContent = "No se pudo agregar la tarea";
            return;
        }

        const nueva = await respuesta.json();

        // el servidor siempre regresa el mismo id, asi que le pongo uno propio
        const idNuevo = tareas.reduce((max, t) => (t.id > max ? t.id : max), 0) + 1;

        tareas.push({
            id: idNuevo,
            todo: nueva.todo,
            completed: false,
            local: true, // marca para saber que no existe en el servidor
        });

        pintarTareas();
    } catch (error) {
        console.error(error);
        document.querySelector("#aviso").textContent = "No se pudo conectar con el servidor";
    }
}

document.querySelector("#form_tarea").addEventListener("submit", (evento) => {
    evento.preventDefault();

    const texto = document.querySelector("#texto_tarea").value.trim();

    // si esta vacio, aviso y no agrego
    if (texto === "") {
        document.querySelector("#aviso").textContent = "Escribe una tarea";
        return;
    }

    document.querySelector("#aviso").textContent = "";
    agregarTarea(texto);
    document.querySelector("#form_tarea").reset();
});

async function borrarTarea(id) {
    const tarea = tareas.find((t) => t.id === id);

    if (tarea.local) {
        tareas = tareas.filter((t) => t.id !== id);
        pintarTareas();
        return;
    }

    try {
        const respuesta = await fetch(`${API}todos/${id}`, {
            method: "DELETE",
        });

        if (!respuesta.ok) {
            document.querySelector("#aviso").textContent = "No se pudo eliminar la tarea";
            return;
        }

        // filter: dejo todas menos la borrada
        tareas = tareas.filter((t) => t.id !== id);
        pintarTareas();
    } catch (error) {
        console.error(error);
        document.querySelector("#aviso").textContent = "No se pudo conectar con el servidor";
    }
}

async function cambiarEstado(id) {
   //busco la tarea en mi arreglo
    const tarea = tareas.find((t) => t.id === id);

    if (tarea.local) {
        tarea.completed = !tarea.completed;
        pintarTareas();
        return;
    }

    try {
        const respuesta = await fetch(`${API}todos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: !tarea.completed }),
        });

        if (!respuesta.ok) {
            document.querySelector("#aviso").textContent = "No se pudo actualizar la tarea";
            return;
        }

        tarea.completed = !tarea.completed;
        pintarTareas();
    } catch (error) {
        console.error(error);
        document.querySelector("#aviso").textContent = "No se pudo conectar con el servidor";
    }
}

document.querySelector("#lista_tareas").addEventListener("click", (evento) => {
    const id = Number(evento.target.dataset.id);
    const accion = evento.target.dataset.accion;

    if (accion === "completar") cambiarEstado(id);
    if (accion === "borrar") borrarTarea(id);
});

// guardo aqui las tareas
let tareas = [];

async function cargarTareas() {
  try{
    const respuesta = await fetch(`${API}todos/user/${usuarioActual.id}`);

    if (!respuesta.ok){ //osea que si es negativo a respuesa. me estoy muriendo de sueno
      console.error("No se pudieron cargar las tareas")
      return;
    }

    const datos = await respuesta.json();
    tareas = datos.todos; //api manda las tareas en 'todos' c: ayuda
    pintarTareas();
  }catch (error){
    console.log(error);
  }
}

function pintarTareas(){
  const filtro = document.querySelector("#filtro").value;
  const texto = document.querySelector("#buscador").value.toLowerCase();

  const visibles = tareas
    .filter((t) => {
      if (filtro === "pendientes") return !t.completed;
      if (filtro === "completadas") return t.completed;
      return true;
    })
    .filter((t) => t.todo.toLowerCase().includes(texto));

  // contadores completos
  const total = tareas.length;
  const completadas = tareas.reduce((suma, t) => (t.completed ? suma + 1 : suma), 0);
  const pendientes = total - completadas;
  const porcentaje = total === 0 ? 0 : Math.round((completadas / total) * 100);
  document.querySelector("#contadores").textContent =
    `Total: ${total} | Completadas: ${completadas} | Pendientes: ${pendientes} | Avance: ${porcentaje}%`;

  // map onvierto cada tarea en un <li>
  if (visibles.length === 0) {
    document.querySelector("#lista_tareas").innerHTML = "<li>No hay tareas</li>";
    return;
  }

  document.querySelector("#lista_tareas").innerHTML = visibles
    .map((t) => `
        <li>
            ${t.completed ? "check" : "checknt"} ${t.todo}
            <button data-id="${t.id}" data-accion="completar">${t.completed ? "Pendiente" : "Completar"}</button>
            <button data-id="${t.id}" data-accion="borrar">Eliminar</button>
        </li>
    `)
    .join("");
}

document.querySelector("#filtro").addEventListener("change", pintarTareas);
document.querySelector("#buscador").addEventListener("input", pintarTareas);

// cargar perfil xd
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
        cargarTareas();
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