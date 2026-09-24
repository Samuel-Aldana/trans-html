document.addEventListener("DOMContentLoaded", function () {
  iniciarCierreSesion();
  iniciarFormularioLogin();
  iniciarFormularioRegistro();
  iniciarVistaInicio();
  iniciarVistaHijos();
  iniciarVistaRuta();
  iniciarVistaPerfil();
  iniciarPanelAdmin();
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

function iniciarCierreSesion() {
  document.querySelectorAll("[data-cerrar-sesion]").forEach(function (enlace) {
    enlace.addEventListener("click", function () {
      sessionStorage.removeItem("rolTransikids");
    });
  });
}

function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

    const usuario = cedula.value.trim();
    const clave = contrasena.value.trim();
    const esAdmin = usuario === "12345" && clave === "contraseña";

    if (recordarme.checked) {
      localStorage.setItem("cedulaTransikids", usuario);
    } else {
      localStorage.removeItem("cedulaTransikids");
    }

    localStorage.removeItem("rolTransikids");
    sessionStorage.setItem("rolTransikids", esAdmin ? "admin" : "padre");
    mensaje.textContent = esAdmin ? "Ingreso administrador. Redirigiendo..." : "Ingreso correcto. Redirigiendo...";

    setTimeout(function () {
      window.location.href = esAdmin ? "admin.html" : "inicio.html";
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
  }

  buscador.addEventListener("input", renderizarLista);

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
  }

  renderizarPerfil();
}

function iniciarPanelAdmin() {
  const panel = document.getElementById("panel-admin");
  if (!panel) return;

  if (sessionStorage.getItem("rolTransikids") !== "admin") {
    window.location.href = "login.html";
    return;
  }

  let datos = obtenerDatos();
  const formulario = document.getElementById("formulario-admin");
  const tabla = document.getElementById("tabla-admin");
  const buscador = document.getElementById("buscar-admin");
  const mensaje = document.getElementById("mensaje-admin");
  const botonNuevo = document.getElementById("boton-nuevo-admin");
  const botonReiniciar = document.getElementById("boton-reiniciar-admin");
  const campoId = document.getElementById("admin-id-hijo");
  const campoNombre = document.getElementById("admin-nombre");
  const campoGrado = document.getElementById("admin-grado");
  const campoEstado = document.getElementById("admin-estado");
  const campoCodigo = document.getElementById("admin-codigo-ruta");
  const campoColegio = document.getElementById("admin-colegio");
  const campoRecogida = document.getElementById("admin-recogida");
  const campoLlegada = document.getElementById("admin-llegada");
  const campoProgreso = document.getElementById("admin-progreso");
  const campoTiempo = document.getElementById("admin-tiempo");
  const campoConductor = document.getElementById("admin-conductor");

  function renderizarOpcionesConductores() {
    campoConductor.innerHTML = datos.conductores
      .map(function (conductor) {
        return '<option value="' + conductor.id + '">' + escaparHtml(conductor.nombre) + "</option>";
      })
      .join("");
  }

  function limpiarFormulario(textoMensaje) {
    campoId.value = "";
    formulario.reset();
    campoEstado.value = "PENDIENTE";
    campoCodigo.value = "TKS-" + String(datos.rutas.length + 1).padStart(3, "0");
    campoColegio.value = "Inem";
    campoRecogida.value = "7:10 AM";
    campoLlegada.value = "07:40 AM";
    campoProgreso.value = "0";
    campoTiempo.value = "120";
    if (datos.conductores[0]) {
      campoConductor.value = datos.conductores[0].id;
    }
    mensaje.textContent = textoMensaje || "Listo para registrar un nuevo estudiante.";
  }

  function obtenerRutaPorHijo(hijo) {
    return buscarPorId(datos.rutas, hijo.rutaId) || datos.rutas[0];
  }

  function renderizarTabla() {
    const texto = buscador.value.toLowerCase();
    const hijosFiltrados = datos.hijos.filter(function (hijo) {
      const ruta = obtenerRutaPorHijo(hijo);
      return (
        hijo.nombre.toLowerCase().includes(texto) ||
        hijo.grado.toLowerCase().includes(texto) ||
        hijo.estado.toLowerCase().includes(texto) ||
        ruta.codigo.toLowerCase().includes(texto)
      );
    });

    document.getElementById("total-hijos-admin").textContent = datos.hijos.length;
    document.getElementById("total-rutas-admin").textContent = datos.rutas.length;
    document.getElementById("total-en-camino-admin").textContent = datos.rutas.filter(function (ruta) {
      return ruta.estado === "EN CAMINO";
    }).length;

    if (!hijosFiltrados.length) {
      tabla.innerHTML = '<p class="mensaje-vacio">No hay registros para mostrar.</p>';
      return;
    }

    tabla.innerHTML = hijosFiltrados
      .map(function (hijo) {
        const ruta = obtenerRutaPorHijo(hijo);
        const conductor = obtenerConductor(datos, ruta);
        return (
          '<article class="fila-admin">' +
          '<div><strong>' +
          escaparHtml(hijo.nombre) +
          "</strong><span>" +
          escaparHtml(hijo.grado) +
          "</span></div>" +
          '<div><strong>' +
          escaparHtml(ruta.codigo) +
          "</strong><span>" +
          escaparHtml(ruta.colegio) +
          "</span></div>" +
          '<div><strong>' +
          escaparHtml(hijo.estado) +
          "</strong><span>" +
          escaparHtml(conductor.nombre) +
          "</span></div>" +
          '<div class="acciones-admin-tabla">' +
          '<button type="button" data-editar="' +
          hijo.id +
          '">Editar</button>' +
          '<button class="boton-peligro-tabla" type="button" data-eliminar="' +
          hijo.id +
          '">Eliminar</button>' +
          "</div></article>"
        );
      })
      .join("");

    tabla.querySelectorAll("[data-editar]").forEach(function (boton) {
      boton.addEventListener("click", function () {
        cargarRegistro(Number(boton.dataset.editar));
      });
    });

    tabla.querySelectorAll("[data-eliminar]").forEach(function (boton) {
      boton.addEventListener("click", function () {
        eliminarRegistro(Number(boton.dataset.eliminar));
      });
    });
  }

  function cargarRegistro(idHijo) {
    const hijo = buscarPorId(datos.hijos, idHijo);
    if (!hijo) return;
    const ruta = obtenerRutaPorHijo(hijo);
    campoId.value = hijo.id;
    campoNombre.value = hijo.nombre;
    campoGrado.value = hijo.grado;
    campoEstado.value = hijo.estado;
    campoCodigo.value = ruta.codigo;
    campoColegio.value = ruta.colegio;
    campoRecogida.value = ruta.recogida;
    campoLlegada.value = ruta.llegada;
    campoProgreso.value = ruta.progreso;
    campoTiempo.value = ruta.tiempo;
    campoConductor.value = ruta.conductorId;
    mensaje.textContent = "Editando registro de " + hijo.nombre + ".";
  }

  function eliminarRegistro(idHijo) {
    const hijo = buscarPorId(datos.hijos, idHijo);
    if (!hijo) return;
    datos.hijos = datos.hijos.filter(function (item) {
      return item.id !== idHijo;
    });
    datos.rutas = datos.rutas.filter(function (ruta) {
      return ruta.estudianteId !== idHijo;
    });
    guardarDatos(datos);
    limpiarFormulario("Registro eliminado.");
    renderizarTabla();
  }

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const idExistente = Number(campoId.value);
    const nombre = campoNombre.value.trim();
    const grado = campoGrado.value.trim();
    if (!nombre || !grado) {
      mensaje.textContent = "Nombre y grado son obligatorios.";
      return;
    }

    if (idExistente) {
      const hijo = buscarPorId(datos.hijos, idExistente);
      const ruta = obtenerRutaPorHijo(hijo);
      hijo.nombre = nombre;
      hijo.inicial = nombre.charAt(0).toUpperCase();
      hijo.grado = grado;
      hijo.estado = campoEstado.value;
      ruta.codigo = campoCodigo.value.trim();
      ruta.colegio = campoColegio.value.trim();
      ruta.recogida = campoRecogida.value.trim();
      ruta.llegada = campoLlegada.value.trim();
      ruta.progreso = Number(campoProgreso.value);
      ruta.tiempo = Number(campoTiempo.value);
      ruta.estado = campoEstado.value;
      ruta.conductorId = Number(campoConductor.value);
      mensaje.textContent = "Registro actualizado correctamente.";
    } else {
      const idHijo = Date.now();
      const idRuta = idHijo + 1;
      datos.hijos.push({
        id: idHijo,
        inicial: nombre.charAt(0).toUpperCase(),
        nombre,
        grado,
        estado: campoEstado.value,
        rutaId: idRuta,
      });
      datos.rutas.push({
        id: idRuta,
        codigo: campoCodigo.value.trim(),
        estudianteId: idHijo,
        conductorId: Number(campoConductor.value),
        estado: campoEstado.value,
        recogida: campoRecogida.value.trim(),
        llegada: campoLlegada.value.trim(),
        progreso: Number(campoProgreso.value),
        tiempo: Number(campoTiempo.value),
        colegio: campoColegio.value.trim(),
      });
      mensaje.textContent = "Registro creado correctamente.";
    }

    const mensajeFinal = mensaje.textContent;
    guardarDatos(datos);
    renderizarTabla();
    limpiarFormulario(mensajeFinal);
  });

  buscador.addEventListener("input", renderizarTabla);
  botonNuevo.addEventListener("click", limpiarFormulario);
  botonReiniciar.addEventListener("click", function () {
    datos = window.TransiKidsDatos.reiniciar();
    renderizarOpcionesConductores();
    limpiarFormulario("Datos restaurados.");
    renderizarTabla();
  });

  renderizarOpcionesConductores();
  limpiarFormulario();
  renderizarTabla();
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
