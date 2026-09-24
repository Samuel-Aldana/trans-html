const datosTransikidsIniciales = {
  usuarios: [
    {
      id: 1,
      usuario: "1001",
      contrasena: "familia123",
      nombre: "Brayan Teran",
      correo: "brayanteran@gmail.com",
      telefono: "300 000 0000",
      documento: "1.000.000.001",
      rol: "Padre / Acudiente",
    },
    {
      id: 2,
      usuario: "1002",
      contrasena: "ruta456",
      nombre: "Diana Gomez",
      correo: "dianagomez@gmail.com",
      telefono: "301 000 0000",
      documento: "1.000.000.002",
      rol: "Madre / Acudiente",
    },
  ],
  usuario: {
    nombre: "Brayan Teran",
    correo: "brayanteran@gmail.com",
    telefono: "300 000 0000",
    documento: "1.000.000.001",
    rol: "Padre / Acudiente",
  },
  conductores: [
    { id: 1, nombre: "Mario Jimenez", telefono: "310 555 0101", licencia: "C2" },
    { id: 2, nombre: "Laura Rodriguez", telefono: "311 555 0102", licencia: "C2" },
    { id: 3, nombre: "Carlos Medina", telefono: "312 555 0103", licencia: "C1" },
    { id: 4, nombre: "Diana Ruiz", telefono: "313 555 0104", licencia: "C2" },
  ],
  rutas: [
    { id: 1, codigo: "TKS-001", estudianteId: 1, conductorId: 1, estado: "EN CAMINO", recogida: "7:00 AM", llegada: "07:17 AM", progreso: 65, tiempo: 73, colegio: "Inem" },
    { id: 2, codigo: "TKS-002", estudianteId: 2, conductorId: 2, estado: "EN CLASE", recogida: "6:30 AM", llegada: "06:58 AM", progreso: 100, tiempo: 0, colegio: "Liceo Central" },
  ],
  hijos: [
    { id: 1, padreId: 1, inicial: "M", nombre: "Mateo Perez", grado: "3 primaria", estado: "EN CAMINO", rutaId: 1 },
    { id: 2, padreId: 2, inicial: "S", nombre: "Sofia Rojas", grado: "5 primaria", estado: "EN CLASE", rutaId: 2 },
  ],
  historial: [
    { id: 1, padreId: 1, fecha: "2026-09-24", ruta: "TKS-001", estudiante: "Mateo Perez", estado: "En camino" },
    { id: 2, padreId: 1, fecha: "2026-09-23", ruta: "TKS-001", estudiante: "Mateo Perez", estado: "Finalizada" },
    { id: 3, padreId: 2, fecha: "2026-09-24", ruta: "TKS-002", estudiante: "Sofia Rojas", estado: "En clase" },
    { id: 4, padreId: 2, fecha: "2026-09-23", ruta: "TKS-002", estudiante: "Sofia Rojas", estado: "Finalizada" },
  ],
  novedades: [
    { id: 1, titulo: "Alto flujo vehicular", descripcion: "La ruta TKS-001 avanza con trafico moderado." },
    { id: 2, titulo: "Llegada confirmada", descripcion: "Sofia Rojas ingreso a clase correctamente." },
    { id: 3, titulo: "Revision diaria", descripcion: "Todos los buses completaron chequeo de seguridad." },
  ],
};

function clonarDatosTransikids(datos) {
  return JSON.parse(JSON.stringify(datos));
}

function combinarDatosTransikids(guardados) {
  const base = clonarDatosTransikids(datosTransikidsIniciales);

  if (!guardados || typeof guardados !== "object" || !Array.isArray(guardados.usuarios)) {
    return base;
  }

  return {
    ...base,
    ...guardados,
    usuario: {
      ...base.usuario,
      ...(guardados.usuario || {}),
    },
    usuarios: Array.isArray(guardados.usuarios) ? guardados.usuarios : base.usuarios,
    conductores: Array.isArray(guardados.conductores) ? guardados.conductores : base.conductores,
    rutas: Array.isArray(guardados.rutas) ? guardados.rutas : base.rutas,
    hijos: Array.isArray(guardados.hijos) ? guardados.hijos : base.hijos,
    historial: Array.isArray(guardados.historial) ? guardados.historial : base.historial,
    novedades: Array.isArray(guardados.novedades) ? guardados.novedades : base.novedades,
  };
}

window.TransiKidsDatos = {
  obtener() {
    const guardados = localStorage.getItem("datosTransikids");
    if (!guardados) {
      return clonarDatosTransikids(datosTransikidsIniciales);
    }

    try {
      return combinarDatosTransikids(JSON.parse(guardados));
    } catch (error) {
      return clonarDatosTransikids(datosTransikidsIniciales);
    }
  },
  guardar(datos) {
    localStorage.setItem("datosTransikids", JSON.stringify(datos));
  },
  reiniciar() {
    localStorage.removeItem("datosTransikids");
    return clonarDatosTransikids(datosTransikidsIniciales);
  },
};
