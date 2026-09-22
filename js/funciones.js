document.addEventListener("DOMContentLoaded", function () {
  iniciarFormularioLogin();
  iniciarFormularioRegistro();
  iniciarVistaInicio();
  iniciarVistaHijos();
  iniciarVistaRuta();
  iniciarVistaChat();
});

function iniciarFormularioLogin() {
  const formulario = document.querySelector(".formulario-inicio-sesion");

  if (!formulario) {
    return;
  }

  const cedula = document.getElementById("cedula");
  const contrasena = document.getElementById("contrasena");
  const recordarme = document.querySelector(".casilla-recordarme");
  const botonMostrar = document.querySelector(".boton-mostrar-contrasena");
  const iconoOjo = document.querySelector(".icono-ojo");
  const mensaje = document.getElementById("mensaje-formulario");
  const cedulaGuardada = localStorage.getItem("cedulaTransikids");

  if (cedulaGuardada) {
    cedula.value = cedulaGuardada;
    recordarme.checked = true;
  }

  botonMostrar.addEventListener("click", function () {
    const mostrarContrasena = contrasena.type === "password";

    contrasena.type = mostrarContrasena ? "text" : "password";
    botonMostrar.setAttribute(
      "aria-label",
      mostrarContrasena ? "Ocultar contrasena" : "Mostrar contrasena"
    );
    iconoOjo.src = mostrarContrasena
      ? "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/icons/eye-fill.svg"
      : "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/icons/eye-slash-fill.svg";
  });

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (cedula.value.trim() === "" || contrasena.value.trim() === "") {
      mensaje.textContent = "Por favor complete todos los campos.";
      return;
    }

    if (recordarme.checked) {
      localStorage.setItem("cedulaTransikids", cedula.value.trim());
    } else {
      localStorage.removeItem("cedulaTransikids");
    }

    mensaje.textContent = "Ingreso correcto. Redirigiendo...";

    setTimeout(function () {
      window.location.href = "inicio.html";
    }, 700);
  });
}

function iniciarFormularioRegistro() {
  const formulario = document.getElementById("formulario-registro");

  if (!formulario) {
    return;
  }

  const nombre = document.getElementById("nombre-registro");
  const correo = document.getElementById("correo-registro");
  const telefono = document.getElementById("telefono-registro");
  const contrasena = document.getElementById("contrasena-registro");
  const confirmar = document.getElementById("confirmar-registro");
  const terminos = document.getElementById("terminos-registro");
  const mensaje = document.getElementById("mensaje-registro");

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (
      nombre.value.trim() === "" ||
      correo.value.trim() === "" ||
      telefono.value.trim() === "" ||
      contrasena.value.trim() === "" ||
      confirmar.value.trim() === ""
    ) {
      mensaje.textContent = "Por favor complete todos los campos.";
      return;
    }

    if (contrasena.value !== confirmar.value) {
      mensaje.textContent = "Las contrasenas no coinciden.";
      return;
    }

    if (!terminos.checked) {
      mensaje.textContent = "Debe aceptar los terminos y condiciones.";
      return;
    }

    localStorage.setItem("nombreTransikids", nombre.value.trim());
    localStorage.setItem("correoTransikids", correo.value.trim());

    mensaje.style.color = "#0875d1";
    mensaje.textContent = "Cuenta creada correctamente.";

    setTimeout(function () {
      window.location.href = "login.html";
    }, 900);
  });
}

function iniciarVistaInicio() {
  const barraProgreso = document.querySelector(".barra-progreso-inicio");
  const contador = document.querySelector(".contador-ruta-inicio");
  const estado = document.querySelector(".estado-ruta-inicio");
  const alerta = document.querySelector(".texto-alerta-inicio");

  if (!barraProgreso || !contador) {
    return;
  }

  let progreso = 65;
  let segundos = 73;

  const intervaloInicio = setInterval(function () {
    if (progreso < 100) {
      progreso += 0.5;
      barraProgreso.style.width = progreso + "%";
    }

    if (segundos > 0) {
      segundos--;
      const minutos = String(Math.floor(segundos / 60)).padStart(2, "0");
      const segundosTexto = String(segundos % 60).padStart(2, "0");
      contador.textContent = "Faltan " + minutos + ":" + segundosTexto;
      return;
    }

    clearInterval(intervaloInicio);
    estado.textContent = "LLEGO";
    contador.textContent = "Ruta finalizada";
    alerta.textContent = "Mateo Perez ha llegado a la institucion";
  }, 1000);
}

function iniciarVistaHijos() {
  const tarjetaMateo = document.getElementById("tarjeta-mateo");
  const tarjetaSofia = document.getElementById("tarjeta-sofia");
  const botonEntrega = document.getElementById("boton-entrega");

  if (!tarjetaMateo || !tarjetaSofia || !botonEntrega) {
    return;
  }

  const hijos = {
    mateo: {
      inicial: "M",
      nombre: "Mateo Perez",
      grado: "3 primaria",
      estado: "EN CAMINO",
      hora: "7:00 AM",
      ruta: "Bus TKS-001",
      conductor: "Mario Jimenez",
      progreso: 25,
      llegada: "Llegada de Mateo Perez a la institucion en 01:08",
      boton: "Entregar nino",
      contador: "01:08",
    },
    sofia: {
      inicial: "S",
      nombre: "Sofia Perez",
      grado: "5 primaria",
      estado: "EN CLASE",
      hora: "6:30 AM",
      ruta: "Bus TKS-002",
      conductor: "Laura Rodriguez",
      progreso: 75,
      llegada: "Sofia Perez se encuentra en clase",
      boton: "Ver estado",
      contador: "En clase",
    },
  };

  tarjetaMateo.addEventListener("click", function () {
    cambiarHijo("mateo", hijos);
  });

  tarjetaSofia.addEventListener("click", function () {
    cambiarHijo("sofia", hijos);
  });

  botonEntrega.addEventListener("click", function () {
    if (botonEntrega.textContent.trim() !== "Entregar nino") {
      return;
    }

    botonEntrega.textContent = "Nino entregado";
    document.getElementById("estado-hijo").textContent = "ENTREGADO";
    document.getElementById("barra-hijo").style.width = "100%";
    document.getElementById("texto-llegada-hijo").textContent =
      "Mateo Perez fue entregado correctamente";
    document.getElementById("contador-hijo").textContent = "Finalizado";
  });

  cambiarHijo("mateo", hijos);
}

function cambiarHijo(nombreHijo, hijos) {
  const hijo = hijos[nombreHijo];

  document.getElementById("avatar-hijo").textContent = hijo.inicial;
  document.getElementById("nombre-hijo").textContent = hijo.nombre;
  document.getElementById("grado-hijo").textContent = hijo.grado;
  document.getElementById("estado-hijo").textContent = hijo.estado;
  document.getElementById("hora-hijo").textContent = hijo.hora;
  document.getElementById("ruta-hijo").textContent = hijo.ruta;
  document.getElementById("conductor-hijo").textContent = hijo.conductor;
  document.getElementById("barra-hijo").style.width = hijo.progreso + "%";
  document.getElementById("texto-llegada-hijo").textContent = hijo.llegada;
  document.getElementById("contador-hijo").textContent = hijo.contador;
  document.getElementById("boton-entrega").textContent = hijo.boton;

  document
    .querySelectorAll(".tarjeta-hijo")
    .forEach(function (tarjeta) {
      tarjeta.classList.remove("activa");
    });

  document.getElementById("tarjeta-" + nombreHijo).classList.add("activa");
}

function iniciarVistaRuta() {
  const botonDetalles = document.querySelector(".boton-detalles-ruta");
  const avance = document.getElementById("avance-ruta");
  const tiempo = document.querySelector(".tiempo-restante-ruta");

  if (!botonDetalles || !avance || !tiempo) {
    return;
  }

  let porcentaje = 10;
  let segundos = 70;

  setInterval(function () {
    if (porcentaje < 100) {
      porcentaje++;
      avance.textContent = porcentaje + "%";
    }

    if (segundos > 0) {
      segundos--;
      const minutos = String(Math.floor(segundos / 60)).padStart(2, "0");
      const segundosTexto = String(segundos % 60).padStart(2, "0");
      tiempo.textContent = minutos + ":" + segundosTexto;
    }
  }, 1000);

  botonDetalles.addEventListener("click", function () {
    alert("Cargando detalles del recorrido de Mateo...");
  });
}

function iniciarVistaChat() {
  const formulario = document.getElementById("formulario-chat");
  const entrada = document.getElementById("entrada-chat");
  const mensajes = document.getElementById("mensajes-chat");
  const indicador = document.getElementById("indicador-escribiendo");
  const botonPreguntas = document.getElementById("boton-preguntas");
  const cerrarPreguntas = document.getElementById("cerrar-preguntas");
  const panelPreguntas = document.getElementById("panel-preguntas");

  if (!formulario || !entrada || !mensajes) {
    return;
  }

  const respuestas = [
    {
      claves: ["hora", "llega", "llegada", "tiempo"],
      texto: "La ruta TKS-001 tiene llegada estimada a las 07:17 AM.",
    },
    {
      claves: ["conductor", "mario", "chofer"],
      texto: "El conductor asignado es Mario Jimenez.",
    },
    {
      claves: ["ubicacion", "ubicación", "mapa", "ruta"],
      texto: "Puedes consultar la ubicacion en la vista Ruta.",
    },
    {
      claves: ["emergencia", "urgente", "llamo"],
      texto: "En emergencia comunicate con la central: (+57) 601 555 0199.",
    },
  ];

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    enviarMensajeChat(entrada.value, "usuario", mensajes);
    responderChat(entrada.value, respuestas, mensajes, indicador);
    entrada.value = "";
  });

  document
    .querySelectorAll(".boton-respuesta-rapida[data-respuesta]")
    .forEach(function (boton) {
      boton.addEventListener("click", function () {
        const texto = boton.dataset.respuesta;
        enviarMensajeChat(texto, "usuario", mensajes);
        responderChat(texto, respuestas, mensajes, indicador);
      });
    });

  document.querySelectorAll(".boton-pregunta").forEach(function (boton) {
    boton.addEventListener("click", function () {
      entrada.value = boton.dataset.pregunta;
      entrada.focus();
      panelPreguntas.hidden = true;
    });
  });

  botonPreguntas.addEventListener("click", function () {
    panelPreguntas.hidden = !panelPreguntas.hidden;
  });

  cerrarPreguntas.addEventListener("click", function () {
    panelPreguntas.hidden = true;
  });
}

function enviarMensajeChat(texto, tipo, contenedor) {
  const mensajeLimpio = texto.trim();

  if (!mensajeLimpio) {
    return;
  }

  const burbuja = document.createElement("div");
  const parrafo = document.createElement("p");
  const hora = document.createElement("span");

  burbuja.className =
    tipo === "usuario" ? "mensaje-chat mensaje-usuario" : "mensaje-chat mensaje-bot";
  parrafo.textContent = mensajeLimpio;
  hora.className = "hora-mensaje";
  hora.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  burbuja.appendChild(parrafo);
  burbuja.appendChild(hora);
  contenedor.appendChild(burbuja);
  contenedor.scrollTop = contenedor.scrollHeight;
}

function responderChat(textoUsuario, respuestas, mensajes, indicador) {
  const texto = textoUsuario.toLowerCase();
  const encontrada = respuestas.find(function (respuesta) {
    return respuesta.claves.some(function (clave) {
      return texto.includes(clave);
    });
  });

  indicador.hidden = false;

  setTimeout(function () {
    indicador.hidden = true;
    enviarMensajeChat(
      encontrada
        ? encontrada.texto
        : "No entendi tu consulta. Prueba con hora, conductor, ruta o emergencia.",
      "bot",
      mensajes
    );
  }, 700);
}
