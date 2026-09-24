document.addEventListener("DOMContentLoaded", function () {
  iniciarFormularioLogin();
  iniciarFormularioRegistro();
  iniciarVistaInicio();
  iniciarVistaHijos();
  iniciarVistaRuta();
  iniciarVistaPerfil();
  iniciarVistaChat();
});

function obtenerDatos() {
  return window.TransiKidsDatos.obtener();
}

function guardarDatos(datos) {
  window.TransiKidsDatos.guardar(datos);
}

function buscarPorId(lista, id) {
  return lista.find(function (item) {
    return Number(item.id) === Number(id);
  });
}

function obtenerConductor(datos, ruta) {
  return buscarPorId(datos.conductores, ruta.conductorId) || datos.conductores[0];
}

function obtenerHijo(datos, ruta) {
  return buscarPorId(datos.hijos, ruta.estudianteId) || datos.hijos[0];
}

function iniciarFormularioLogin() {
  const formulario = document.querySelector(".formulario-inicio-sesion");
  if (!formulario) return;

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
    botonMostrar.setAttribute("aria-label", mostrarContrasena ? "Ocultar contrasena" : "Mostrar contrasena");
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
  if (!formulario) return;

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

    const datos = obtenerDatos();
    datos.usuario.nombre = nombre.value.trim();
    datos.usuario.correo = correo.value.trim();
    datos.usuario.telefono = telefono.value.trim();
    guardarDatos(datos);

    mensaje.style.color = "#0875d1";
    mensaje.textContent = "Cuenta creada correctamente.";

    setTimeout(function () {
      window.location.href = "login.html";
    }, 900);
  });
}

function iniciarVistaInicio() {
  const saludo = document.getElementById("saludo-inicio");
  const codigoRuta = document.getElementById("codigo-ruta-inicio");
  if (!saludo || !codigoRuta) return;

  const datos = obtenerDatos();
  const ruta = datos.rutas.find(function (item) {
    return item.estado !== "FINALIZADA";
  }) || datos.rutas[0];
  const hijo = obtenerHijo(datos, ruta);
  const conductor = obtenerConductor(datos, ruta);

  saludo.innerHTML = "Buenos dias, " + datos.usuario.nombre + " <span>👋</span>";
  document.getElementById("resumen-inicio").textContent =
    datos.rutas.length + " rutas registradas y " + datos.hijos.length + " hijos vinculados";
  codigoRuta.textContent = "Ruta " + ruta.codigo;
  document.getElementById("conductor-ruta-inicio").textContent = conductor.nombre;
  document.getElementById("estado-ruta-inicio").textContent = ruta.estado;
  document.getElementById("llegada-ruta-inicio").textContent = ruta.llegada;
  document.querySelector(".barra-progreso-inicio").style.width = ruta.progreso + "%";
  document.querySelector(".texto-alerta-inicio").textContent = "Llegada de " + hijo.nombre + " a la institucion";

  iniciarContadorInicio(ruta);
  renderizarHistorialInicio(datos.historial);

  document.getElementById("buscar-historial").addEventListener("input", function (evento) {
    const texto = evento.target.value.toLowerCase();
    const filtrados = datos.historial.filter(function (viaje) {
      return (
        viaje.estudiante.toLowerCase().includes(texto) ||
        viaje.ruta.toLowerCase().includes(texto) ||
        viaje.estado.toLowerCase().includes(texto)
      );
    });
    renderizarHistorialInicio(filtrados);
  });
}

function iniciarContadorInicio(ruta) {
  const contador = document.querySelector(".contador-ruta-inicio");
  let segundos = ruta.tiempo;
  let progreso = ruta.progreso;

  const intervalo = setInterval(function () {
    if (segundos <= 0) {
      clearInterval(intervalo);
      contador.textContent = "Ruta finalizada";
      document.getElementById("estado-ruta-inicio").textContent = "LLEGO";
      return;
    }

    segundos--;
    progreso = Math.min(100, progreso + 0.5);
    document.querySelector(".barra-progreso-inicio").style.width = progreso + "%";
    contador.textContent =
      "Faltan " +
      String(Math.floor(segundos / 60)).padStart(2, "0") +
      ":" +
      String(segundos % 60).padStart(2, "0");
  }, 1000);
}

function renderizarHistorialInicio(historial) {
  const contenedor = document.getElementById("lista-historial");

  if (!historial.length) {
    contenedor.innerHTML = '<p class="mensaje-vacio">No hay viajes para mostrar.</p>';
    return;
  }

  contenedor.innerHTML = historial
    .map(function (viaje) {
      return (
        '<article class="item-historial">' +
        "<strong>" +
        viaje.estudiante +
        "</strong><span>" +
        viaje.ruta +
        " · " +
        viaje.fecha +
        "</span><p>" +
        viaje.estado +
        "</p></article>"
      );
    })
    .join("");
}

function iniciarVistaHijos() {
  const lista = document.getElementById("lista-hijos");
  if (!lista) return;

  let datos = obtenerDatos();
  let hijoSeleccionadoId = datos.hijos[0] ? datos.hijos[0].id : null;
  const buscador = document.getElementById("buscar-hijo");
  const formulario = document.getElementById("formulario-hijo");
  const botonEntrega = document.getElementById("boton-entrega");
  const botonEliminar = document.getElementById("boton-eliminar-hijo");

  function renderizarLista() {
    const texto = buscador.value.toLowerCase();
    const hijosFiltrados = datos.hijos.filter(function (hijo) {
      return hijo.nombre.toLowerCase().includes(texto) || hijo.grado.toLowerCase().includes(texto);
    });

    if (!hijosFiltrados.length) {
      lista.innerHTML = '<p class="mensaje-vacio">No hay hijos registrados.</p>';
      renderizarDetalle(null);
      return;
    }

    if (!buscarPorId(hijosFiltrados, hijoSeleccionadoId)) {
      hijoSeleccionadoId = hijosFiltrados[0].id;
    }

    lista.innerHTML = hijosFiltrados
      .map(function (hijo) {
        return (
          '<button class="tarjeta-hijo ' +
          (hijo.id === hijoSeleccionadoId ? "activa" : "") +
          '" type="button" data-id="' +
          hijo.id +
          '"><span class="avatar-hijo-pequeno">' +
          hijo.inicial +
          "</span>" +
          hijo.nombre +
          "</button>"
        );
      })
      .join("");

    lista.querySelectorAll(".tarjeta-hijo").forEach(function (boton) {
      boton.addEventListener("click", function () {
        hijoSeleccionadoId = Number(boton.dataset.id);
        renderizarLista();
      });
    });

    renderizarDetalle(buscarPorId(datos.hijos, hijoSeleccionadoId));
  }

  function renderizarDetalle(hijo) {
    if (!hijo) {
      document.getElementById("nombre-hijo").textContent = "Sin registros";
      document.getElementById("grado-hijo").textContent = "";
      document.getElementById("estado-hijo").textContent = "VACIO";
      return;
    }

    const ruta = buscarPorId(datos.rutas, hijo.rutaId) || datos.rutas[0];
    const conductor = obtenerConductor(datos, ruta);
    document.getElementById("avatar-hijo").textContent = hijo.inicial;
    document.getElementById("nombre-hijo").textContent = hijo.nombre;
    document.getElementById("grado-hijo").textContent = hijo.grado;
    document.getElementById("estado-hijo").textContent = hijo.estado;
    document.getElementById("hora-hijo").textContent = ruta.recogida;
    document.getElementById("contador-hijo").textContent =
      ruta.tiempo > 0
        ? "0" + Math.floor(ruta.tiempo / 60) + ":" + String(ruta.tiempo % 60).padStart(2, "0")
        : "Finalizado";
    document.getElementById("ruta-hijo").textContent = "Bus " + ruta.codigo;
    document.getElementById("conductor-hijo").textContent = conductor.nombre;
    document.getElementById("barra-hijo").style.width = ruta.progreso + "%";
    document.getElementById("texto-llegada-hijo").textContent =
      hijo.estado === "FINALIZADA" ? hijo.nombre + " ya llego correctamente" : "Llegada de " + hijo.nombre + " a la institucion";
    botonEntrega.textContent = hijo.estado === "ENTREGADO" || hijo.estado === "FINALIZADA" ? "Entregado" : "Entregar nino";
  }

  buscador.addEventListener("input", renderizarLista);

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const nombre = document.getElementById("nombre-nuevo-hijo").value.trim();
    const grado = document.getElementById("grado-nuevo-hijo").value.trim();
    if (!nombre || !grado) return;

    const idHijo = Date.now();
    const idRuta = idHijo + 1;
    datos.hijos.push({
      id: idHijo,
      inicial: nombre.charAt(0).toUpperCase(),
      nombre,
      grado,
      estado: "PENDIENTE",
      rutaId: idRuta,
    });
    datos.rutas.push({
      id: idRuta,
      codigo: "TKS-" + String(datos.rutas.length + 1).padStart(3, "0"),
      estudianteId: idHijo,
      conductorId: datos.conductores[0].id,
      estado: "PENDIENTE",
      recogida: "7:10 AM",
      llegada: "07:40 AM",
      progreso: 0,
      tiempo: 120,
      colegio: "Inem",
    });

    guardarDatos(datos);
    hijoSeleccionadoId = idHijo;
    formulario.reset();
    renderizarLista();
  });

  botonEntrega.addEventListener("click", function () {
    const hijo = buscarPorId(datos.hijos, hijoSeleccionadoId);
    if (!hijo) return;
    const ruta = buscarPorId(datos.rutas, hijo.rutaId);
    hijo.estado = "ENTREGADO";
    ruta.estado = "FINALIZADA";
    ruta.progreso = 100;
    ruta.tiempo = 0;
    datos.historial.unshift({
      id: Date.now(),
      fecha: new Date().toISOString().slice(0, 10),
      ruta: ruta.codigo,
      estudiante: hijo.nombre,
      estado: "Entregado",
    });
    guardarDatos(datos);
    renderizarLista();
  });

  botonEliminar.addEventListener("click", function () {
    const hijo = buscarPorId(datos.hijos, hijoSeleccionadoId);
    if (!hijo) return;
    datos.hijos = datos.hijos.filter(function (item) {
      return item.id !== hijoSeleccionadoId;
    });
    datos.rutas = datos.rutas.filter(function (ruta) {
      return ruta.estudianteId !== hijoSeleccionadoId;
    });
    guardarDatos(datos);
    hijoSeleccionadoId = datos.hijos[0] ? datos.hijos[0].id : null;
    renderizarLista();
  });

  renderizarLista();
}

function iniciarVistaRuta() {
  const selector = document.getElementById("selector-rutas");
  if (!selector) return;

  const datos = obtenerDatos();
  let rutaSeleccionadaId = Number(localStorage.getItem("rutaSeleccionadaId")) || datos.rutas[0].id;

  function renderizarSelector() {
    selector.innerHTML = datos.rutas
      .map(function (ruta) {
        return (
          '<button class="' +
          (ruta.id === rutaSeleccionadaId ? "activa" : "") +
          '" type="button" data-id="' +
          ruta.id +
          '">' +
          ruta.codigo +
          "</button>"
        );
      })
      .join("");

    selector.querySelectorAll("button").forEach(function (boton) {
      boton.addEventListener("click", function () {
        rutaSeleccionadaId = Number(boton.dataset.id);
        localStorage.setItem("rutaSeleccionadaId", rutaSeleccionadaId);
        renderizarRuta();
        renderizarSelector();
      });
    });
  }

  function renderizarRuta() {
    const ruta = buscarPorId(datos.rutas, rutaSeleccionadaId) || datos.rutas[0];
    const hijo = obtenerHijo(datos, ruta);
    document.getElementById("avance-ruta").textContent = ruta.progreso + "%";
    document.getElementById("titulo-ruta").textContent = "Ruta de " + hijo.nombre;
    document.querySelector(".tiempo-restante-ruta").textContent =
      ruta.tiempo > 0
        ? String(Math.floor(ruta.tiempo / 60)).padStart(2, "0") + ":" + String(ruta.tiempo % 60).padStart(2, "0")
        : "00:00";
    document.getElementById("estado-ruta-detalle").textContent = ruta.estado;
    document.getElementById("estudiante-ruta").textContent = hijo.nombre;
    document.getElementById("colegio-ruta").textContent = ruta.colegio;
    document.getElementById("llegada-ruta").textContent = ruta.llegada;
  }

  document.querySelector(".boton-detalles-ruta").addEventListener("click", function () {
    const ruta = buscarPorId(datos.rutas, rutaSeleccionadaId) || datos.rutas[0];
    alert("Ruta " + ruta.codigo + " - Estado: " + ruta.estado);
  });

  renderizarSelector();
  renderizarRuta();
}

function iniciarVistaPerfil() {
  const lista = document.getElementById("lista-datos-perfil");
  if (!lista) return;

  const datos = obtenerDatos();
  const usuario = datos.usuario;
  const formulario = document.getElementById("formulario-perfil");

  function renderizarPerfil() {
    document.getElementById("avatar-perfil").textContent = usuario.nombre.charAt(0).toUpperCase();
    document.getElementById("nombre-perfil").textContent = usuario.nombre;
    document.getElementById("rol-perfil").textContent = usuario.rol;
    lista.innerHTML = [
      ["Nombre", usuario.nombre],
      ["Correo electronico", usuario.correo],
      ["Telefono", usuario.telefono],
      ["Documento", usuario.documento],
      ["Rol", usuario.rol],
    ]
      .map(function (dato) {
        return '<article class="dato-perfil"><span>' + dato[0] + "</span><strong>" + dato[1] + "</strong></article>";
      })
      .join("");
    document.getElementById("editar-nombre").value = usuario.nombre;
    document.getElementById("editar-correo").value = usuario.correo;
    document.getElementById("editar-telefono").value = usuario.telefono;
  }

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    usuario.nombre = document.getElementById("editar-nombre").value.trim();
    usuario.correo = document.getElementById("editar-correo").value.trim();
    usuario.telefono = document.getElementById("editar-telefono").value.trim();
    guardarDatos(datos);
    renderizarPerfil();
  });

  renderizarPerfil();
}

function iniciarVistaChat() {
  const formulario = document.getElementById("formulario-chat");
  const entrada = document.getElementById("entrada-chat");
  const mensajes = document.getElementById("mensajes-chat");
  const indicador = document.getElementById("indicador-escribiendo");
  const botonPreguntas = document.getElementById("boton-preguntas");
  const cerrarPreguntas = document.getElementById("cerrar-preguntas");
  const panelPreguntas = document.getElementById("panel-preguntas");
  if (!formulario || !entrada || !mensajes) return;

  const respuestas = [
    { claves: ["hora", "llega", "llegada", "tiempo"], texto: "La ruta TKS-001 tiene llegada estimada a las 07:17 AM." },
    { claves: ["conductor", "mario", "chofer"], texto: "El conductor asignado es Mario Jimenez." },
    { claves: ["ubicacion", "ubicación", "mapa", "ruta"], texto: "Puedes consultar la ubicacion en la vista Ruta." },
    { claves: ["emergencia", "urgente", "llamo"], texto: "En emergencia comunicate con la central: (+57) 601 555 0199." },
  ];

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    enviarMensajeChat(entrada.value, "usuario", mensajes);
    responderChat(entrada.value, respuestas, mensajes, indicador);
    entrada.value = "";
  });

  document.querySelectorAll(".boton-respuesta-rapida[data-respuesta]").forEach(function (boton) {
    boton.addEventListener("click", function () {
      enviarMensajeChat(boton.dataset.respuesta, "usuario", mensajes);
      responderChat(boton.dataset.respuesta, respuestas, mensajes, indicador);
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
  if (!mensajeLimpio) return;

  const burbuja = document.createElement("div");
  const parrafo = document.createElement("p");
  const hora = document.createElement("span");
  burbuja.className = tipo === "usuario" ? "mensaje-chat mensaje-usuario" : "mensaje-chat mensaje-bot";
  parrafo.textContent = mensajeLimpio;
  hora.className = "hora-mensaje";
  hora.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
      encontrada ? encontrada.texto : "No entendi tu consulta. Prueba con hora, conductor, ruta o emergencia.",
      "bot",
      mensajes
    );
  }, 700);
}
