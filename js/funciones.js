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

function obtenerPadreActivo(datos) {
  const usuarioId = Number(sessionStorage.getItem("usuarioTransikidsId")) || datos.usuarios[0].id;
  return buscarPorId(datos.usuarios, usuarioId) || datos.usuarios[0];
}

function obtenerDatosPadre(datos) {
  const padre = obtenerPadreActivo(datos);
  const hijos = datos.hijos.filter(function (hijo) {
    return Number(hijo.padreId) === Number(padre.id);
  });
  const rutas = datos.rutas.filter(function (ruta) {
    return hijos.some(function (hijo) {
      return Number(hijo.id) === Number(ruta.estudianteId);
    });
  });
  const historial = datos.historial.filter(function (viaje) {
    return Number(viaje.padreId) === Number(padre.id);
  });

  return { padre, hijos, rutas, historial };
}

function limitarNumero(numero, minimo, maximo) {
  return Math.min(maximo, Math.max(minimo, Number(numero) || 0));
}

function obtenerEstadosTiempoRutas() {
  try {
    return JSON.parse(localStorage.getItem("estadoTiempoRutasTransikids")) || {};
  } catch (error) {
    return {};
  }
}

function guardarEstadosTiempoRutas(estados) {
  localStorage.setItem("estadoTiempoRutasTransikids", JSON.stringify(estados));
}

function reiniciarEstadoTiempoRuta(idRuta) {
  const estados = obtenerEstadosTiempoRutas();
  delete estados[String(idRuta)];
  guardarEstadosTiempoRutas(estados);
}

function obtenerFirmaTiempoRuta(ruta) {
  return [ruta.id, ruta.estado, ruta.tiempo, ruta.progreso].join("|");
}

function formatearTiempoRuta(segundos) {
  if (segundos <= 0) return "00:00";
  return String(Math.floor(segundos / 60)).padStart(2, "0") + ":" + String(segundos % 60).padStart(2, "0");
}

function calcularEstadoRuta(ruta) {
  if (!ruta) {
    return { progreso: 0, tiempo: 0, estado: "SIN RUTA" };
  }

  const estados = obtenerEstadosTiempoRutas();
  const clave = String(ruta.id);
  const firma = obtenerFirmaTiempoRuta(ruta);
  const tiempoBase = Math.max(0, Number(ruta.tiempo) || 0);
  const progresoBase = limitarNumero(ruta.progreso, 0, 100);
  const estadosFinales = ["FINALIZADA", "ENTREGADO", "EN CLASE"];

  if (tiempoBase <= 0 || progresoBase >= 100 || estadosFinales.includes(ruta.estado)) {
    delete estados[clave];
    guardarEstadosTiempoRutas(estados);
    return { progreso: 100, tiempo: 0, estado: ruta.estado };
  }

  if (!estados[clave] || estados[clave].firma !== firma) {
    estados[clave] = {
      firma,
      inicio: Date.now(),
      tiempoBase,
      progresoBase,
    };
    guardarEstadosTiempoRutas(estados);
  }

  const estadoGuardado = estados[clave];
  const segundosPasados = Math.max(0, Math.floor((Date.now() - estadoGuardado.inicio) / 1000));
  const tiempoRestante = Math.max(0, estadoGuardado.tiempoBase - segundosPasados);
  const proporcion = estadoGuardado.tiempoBase > 0 ? segundosPasados / estadoGuardado.tiempoBase : 1;
  const progreso = limitarNumero(
    estadoGuardado.progresoBase + (100 - estadoGuardado.progresoBase) * proporcion,
    estadoGuardado.progresoBase,
    100
  );

  return {
    progreso: tiempoRestante <= 0 ? 100 : Math.round(progreso),
    tiempo: tiempoRestante,
    estado: tiempoRestante <= 0 ? "FINALIZADA" : ruta.estado,
  };
}

function iniciarCierreSesion() {
  document.querySelectorAll("[data-cerrar-sesion]").forEach(function (enlace) {
    enlace.addEventListener("click", function () {
      sessionStorage.removeItem("rolTransikids");
      sessionStorage.removeItem("usuarioTransikidsId");
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
    const datos = obtenerDatos();
    const padre = datos.usuarios.find(function (item) {
      return item.usuario === usuario && item.contrasena === clave;
    });

    if (!esAdmin && !padre) {
      mensaje.textContent = "Usuario o contrasena incorrectos.";
      return;
    }

    if (recordarme.checked) {
      localStorage.setItem("cedulaTransikids", usuario);
    } else {
      localStorage.removeItem("cedulaTransikids");
    }

    localStorage.removeItem("rolTransikids");
    sessionStorage.setItem("rolTransikids", esAdmin ? "admin" : "padre");
    if (padre) {
      sessionStorage.setItem("usuarioTransikidsId", padre.id);
    } else {
      sessionStorage.removeItem("usuarioTransikidsId");
    }
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
    const idUsuario = Date.now();
    datos.usuarios.push({
      id: idUsuario,
      usuario: telefono.value.trim(),
      contrasena: contrasena.value.trim(),
      nombre: nombre.value.trim(),
      correo: correo.value.trim(),
      telefono: telefono.value.trim(),
      documento: telefono.value.trim(),
      rol: "Padre / Acudiente",
    });
    guardarDatos(datos);

    mensaje.style.color = "#0875d1";
    mensaje.textContent = "Cuenta creada correctamente. Usa tu telefono como usuario.";

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
  const datosPadre = obtenerDatosPadre(datos);
  const ruta = datosPadre.rutas.find(function (item) {
    return item.estado !== "FINALIZADA";
  }) || datosPadre.rutas[0];

  if (!ruta) {
    saludo.textContent = "Buenos dias, " + datosPadre.padre.nombre;
    document.getElementById("resumen-inicio").textContent = "No tienes hijos vinculados todavia.";
    codigoRuta.textContent = "Sin ruta asignada";
    document.getElementById("conductor-ruta-inicio").textContent = "Pendiente";
    document.getElementById("estado-ruta-inicio").textContent = "SIN RUTA";
    document.getElementById("llegada-ruta-inicio").textContent = "--";
    document.querySelector(".barra-progreso-inicio").style.width = "0%";
    document.querySelector(".texto-alerta-inicio").textContent = "Administracion debe vincular un estudiante a tu cuenta.";
    renderizarHistorialInicio([]);
    return;
  }

  const hijo = obtenerHijo(datos, ruta);
  const conductor = obtenerConductor(datos, ruta);
  const estadoActual = calcularEstadoRuta(ruta);

  saludo.innerHTML = "Buenos dias, " + datosPadre.padre.nombre + " <span>👋</span>";
  document.getElementById("resumen-inicio").textContent =
    datosPadre.rutas.length + " ruta registrada y " + datosPadre.hijos.length + " hijo vinculado";
  codigoRuta.textContent = "Ruta " + ruta.codigo;
  document.getElementById("conductor-ruta-inicio").textContent = conductor.nombre;
  document.getElementById("estado-ruta-inicio").textContent = estadoActual.estado;
  document.getElementById("llegada-ruta-inicio").textContent = ruta.llegada;
  document.querySelector(".barra-progreso-inicio").style.width = estadoActual.progreso + "%";
  document.querySelector(".texto-alerta-inicio").textContent = "Llegada de " + hijo.nombre + " a la institucion";

  iniciarContadorInicio(ruta);
  renderizarHistorialInicio(datosPadre.historial);

  document.getElementById("buscar-historial").addEventListener("input", function (evento) {
    const texto = evento.target.value.toLowerCase();
    const filtrados = datosPadre.historial.filter(function (viaje) {
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

  function actualizarContador() {
    const estadoActual = calcularEstadoRuta(ruta);
    document.querySelector(".barra-progreso-inicio").style.width = estadoActual.progreso + "%";
    document.getElementById("estado-ruta-inicio").textContent = estadoActual.estado;
    contador.textContent = estadoActual.tiempo > 0 ? "Faltan " + formatearTiempoRuta(estadoActual.tiempo) : "Ruta finalizada";
  }

  actualizarContador();
  setInterval(actualizarContador, 1000);
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
  let datosPadre = obtenerDatosPadre(datos);
  let hijoSeleccionadoId = datosPadre.hijos[0] ? datosPadre.hijos[0].id : null;
  const buscador = document.getElementById("buscar-hijo");

  function renderizarLista() {
    const texto = buscador.value.toLowerCase();
    const hijosFiltrados = datosPadre.hijos.filter(function (hijo) {
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

    renderizarDetalle(buscarPorId(datosPadre.hijos, hijoSeleccionadoId));
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
    const estadoActual = calcularEstadoRuta(ruta);
    document.getElementById("avatar-hijo").textContent = hijo.inicial;
    document.getElementById("nombre-hijo").textContent = hijo.nombre;
    document.getElementById("grado-hijo").textContent = hijo.grado;
    document.getElementById("estado-hijo").textContent = estadoActual.estado;
    document.getElementById("hora-hijo").textContent = ruta.recogida;
    document.getElementById("contador-hijo").textContent =
      estadoActual.tiempo > 0 ? formatearTiempoRuta(estadoActual.tiempo) : "Finalizado";
    document.getElementById("ruta-hijo").textContent = "Bus " + ruta.codigo;
    document.getElementById("conductor-hijo").textContent = conductor.nombre;
    document.getElementById("barra-hijo").style.width = estadoActual.progreso + "%";
    document.getElementById("texto-llegada-hijo").textContent =
      estadoActual.tiempo <= 0 ? hijo.nombre + " ya llego correctamente" : "Llegada de " + hijo.nombre + " a la institucion";
  }

  buscador.addEventListener("input", renderizarLista);

  renderizarLista();
  setInterval(function () {
    if (hijoSeleccionadoId) {
      renderizarDetalle(buscarPorId(datosPadre.hijos, hijoSeleccionadoId));
    }
  }, 1000);
}

function iniciarVistaRuta() {
  const selector = document.getElementById("selector-rutas");
  if (!selector) return;

  const datos = obtenerDatos();
  const datosPadre = obtenerDatosPadre(datos);
  let rutaSeleccionadaId = Number(localStorage.getItem("rutaSeleccionadaId")) || (datosPadre.rutas[0] ? datosPadre.rutas[0].id : 0);

  if (!buscarPorId(datosPadre.rutas, rutaSeleccionadaId) && datosPadre.rutas[0]) {
    rutaSeleccionadaId = datosPadre.rutas[0].id;
  }

  function renderizarSelector() {
    if (!datosPadre.rutas.length) {
      selector.innerHTML = '<p class="mensaje-vacio">No hay rutas asignadas.</p>';
      return;
    }

    selector.innerHTML = datosPadre.rutas
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
    const ruta = buscarPorId(datosPadre.rutas, rutaSeleccionadaId) || datosPadre.rutas[0];
    if (!ruta) {
      document.getElementById("titulo-ruta").textContent = "Sin ruta asignada";
      document.getElementById("avance-ruta").textContent = "0%";
      document.getElementById("estado-ruta-detalle").textContent = "SIN RUTA";
      document.getElementById("estudiante-ruta").textContent = "Pendiente";
      document.getElementById("colegio-ruta").textContent = "Administracion";
      document.getElementById("llegada-ruta").textContent = "--";
      return;
    }
    const hijo = obtenerHijo(datos, ruta);
    const estadoActual = calcularEstadoRuta(ruta);
    document.getElementById("avance-ruta").textContent = estadoActual.progreso + "%";
    document.getElementById("titulo-ruta").textContent = "Ruta de " + hijo.nombre;
    document.querySelector(".tiempo-restante-ruta").textContent = formatearTiempoRuta(estadoActual.tiempo);
    document.getElementById("estado-ruta-detalle").textContent = estadoActual.estado;
    document.getElementById("estudiante-ruta").textContent = hijo.nombre;
    document.getElementById("colegio-ruta").textContent = ruta.colegio;
    document.getElementById("llegada-ruta").textContent = ruta.llegada;
  }

  document.querySelector(".boton-detalles-ruta").addEventListener("click", function () {
    const ruta = buscarPorId(datosPadre.rutas, rutaSeleccionadaId) || datosPadre.rutas[0];
    if (!ruta) return;
    alert("Ruta " + ruta.codigo + " - Estado: " + ruta.estado);
  });

  renderizarSelector();
  renderizarRuta();
  setInterval(renderizarRuta, 1000);
}

function iniciarVistaPerfil() {
  const lista = document.getElementById("lista-datos-perfil");
  if (!lista) return;

  const datos = obtenerDatos();
  const usuario = obtenerPadreActivo(datos);

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
  const campoPadre = document.getElementById("admin-padre");
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

  function renderizarOpcionesPadres() {
    campoPadre.innerHTML = datos.usuarios
      .map(function (usuario) {
        return '<option value="' + usuario.id + '">' + escaparHtml(usuario.nombre) + "</option>";
      })
      .join("");
  }

  function limpiarFormulario(textoMensaje) {
    campoId.value = "";
    formulario.reset();
    campoEstado.value = "PENDIENTE";
    if (datos.usuarios[0]) {
      campoPadre.value = datos.usuarios[0].id;
    }
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
      const padre = buscarPorId(datos.usuarios, hijo.padreId) || datos.usuarios[0];
      return (
        hijo.nombre.toLowerCase().includes(texto) ||
        hijo.grado.toLowerCase().includes(texto) ||
        hijo.estado.toLowerCase().includes(texto) ||
        padre.nombre.toLowerCase().includes(texto) ||
        ruta.codigo.toLowerCase().includes(texto)
      );
    });

    const rutasEnCamino = datos.rutas.filter(function (ruta) {
      return calcularEstadoRuta(ruta).estado === "EN CAMINO";
    });
    const rutasFinalizadas = datos.rutas.filter(function (ruta) {
      const estadoRuta = calcularEstadoRuta(ruta).estado;
      return estadoRuta === "FINALIZADA" || estadoRuta === "EN CLASE" || estadoRuta === "ENTREGADO";
    });
    const porcentajeEnCamino = datos.rutas.length ? Math.round((rutasEnCamino.length / datos.rutas.length) * 100) : 0;
    const porcentajeFinalizadas = datos.rutas.length ? Math.round((rutasFinalizadas.length / datos.rutas.length) * 100) : 0;

    document.getElementById("total-padres-admin").textContent = datos.usuarios.length;
    document.getElementById("total-hijos-admin").textContent = datos.hijos.length;
    document.getElementById("total-rutas-admin").textContent = datos.rutas.length;
    document.getElementById("total-en-camino-admin").textContent = rutasEnCamino.length;
    document.getElementById("total-finalizadas-admin").textContent = rutasFinalizadas.length;
    document.getElementById("barra-en-camino-admin").style.width = porcentajeEnCamino + "%";
    document.getElementById("barra-finalizadas-admin").style.width = porcentajeFinalizadas + "%";
    document.getElementById("alerta-admin").textContent =
      rutasEnCamino.length > 0
        ? "Hay " + rutasEnCamino.length + " ruta en seguimiento activo."
        : "No hay rutas en camino en este momento.";

    if (!hijosFiltrados.length) {
      tabla.innerHTML = '<p class="mensaje-vacio">No hay registros para mostrar.</p>';
      return;
    }

    tabla.innerHTML = hijosFiltrados
      .map(function (hijo) {
        const ruta = obtenerRutaPorHijo(hijo);
        const conductor = obtenerConductor(datos, ruta);
        const padre = buscarPorId(datos.usuarios, hijo.padreId) || datos.usuarios[0];
        return (
          '<article class="fila-admin">' +
          '<div><strong>' +
          escaparHtml(hijo.nombre) +
          "</strong><span>" +
          escaparHtml(hijo.grado) +
          "</span><span>Acudiente: " +
          escaparHtml(padre.nombre) +
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
    campoPadre.value = hijo.padreId;
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
    const rutaEliminada = buscarPorId(datos.rutas, hijo.rutaId);
    datos.hijos = datos.hijos.filter(function (item) {
      return item.id !== idHijo;
    });
    datos.rutas = datos.rutas.filter(function (ruta) {
      return ruta.estudianteId !== idHijo;
    });
    datos.historial = datos.historial.filter(function (viaje) {
      return viaje.estudiante !== hijo.nombre;
    });
    if (rutaEliminada) {
      reiniciarEstadoTiempoRuta(rutaEliminada.id);
    }
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
      const nombreAnterior = hijo.nombre;
      hijo.nombre = nombre;
      hijo.inicial = nombre.charAt(0).toUpperCase();
      hijo.grado = grado;
      hijo.padreId = Number(campoPadre.value);
      hijo.estado = campoEstado.value;
      ruta.codigo = campoCodigo.value.trim();
      ruta.colegio = campoColegio.value.trim();
      ruta.recogida = campoRecogida.value.trim();
      ruta.llegada = campoLlegada.value.trim();
      ruta.progreso = Number(campoProgreso.value);
      ruta.tiempo = Number(campoTiempo.value);
      ruta.estado = campoEstado.value;
      ruta.conductorId = Number(campoConductor.value);
      reiniciarEstadoTiempoRuta(ruta.id);
      datos.historial.forEach(function (viaje) {
        if (viaje.estudiante === nombreAnterior) {
          viaje.estudiante = nombre;
          viaje.padreId = hijo.padreId;
          viaje.ruta = ruta.codigo;
        }
      });
      mensaje.textContent = "Registro actualizado correctamente.";
    } else {
      const idHijo = Date.now();
      const idRuta = idHijo + 1;
      datos.hijos.push({
        id: idHijo,
        padreId: Number(campoPadre.value),
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
      reiniciarEstadoTiempoRuta(idRuta);
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
    localStorage.removeItem("estadoTiempoRutasTransikids");
    renderizarOpcionesConductores();
    renderizarOpcionesPadres();
    limpiarFormulario("Datos restaurados.");
    renderizarTabla();
  });

  renderizarOpcionesConductores();
  renderizarOpcionesPadres();
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

  const datos = obtenerDatos();
  const datosPadre = obtenerDatosPadre(datos);
  const rutaPrincipal = datosPadre.rutas[0] || datos.rutas[0];
  const estadoRutaPrincipal = calcularEstadoRuta(rutaPrincipal);
  const conductorPrincipal = rutaPrincipal ? obtenerConductor(datos, rutaPrincipal) : datos.conductores[0];
  const primerMensaje = mensajes.querySelector(".mensaje-bot p");
  if (primerMensaje) {
    primerMensaje.textContent =
      "Hola, " + datosPadre.padre.nombre + ". Soy tu asistente de TransiKids. En que puedo ayudarte hoy?";
  }

  const respuestas = [
    {
      claves: ["hora", "llega", "llegada", "tiempo"],
      texto: rutaPrincipal
        ? "La ruta " +
          rutaPrincipal.codigo +
          " tiene llegada estimada a las " +
          rutaPrincipal.llegada +
          " y tiempo restante de " +
          formatearTiempoRuta(estadoRutaPrincipal.tiempo) +
          "."
        : "Aun no tienes ruta asignada.",
    },
    {
      claves: ["conductor", "mario", "chofer"],
      texto: conductorPrincipal ? "El conductor asignado es " + conductorPrincipal.nombre + "." : "Aun no hay conductor asignado.",
    },
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
