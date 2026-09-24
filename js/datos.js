const datosTransikidsIniciales = {
  usuario: {
    nombre: "Brayan Teran",
    correo: "brayanteran@gmail.com",
    telefono: "300 000 0000",
    documento: "1.000.000.000",
    rol: "Padre / Acudiente",
  },
  conductores: [
    { id: 1, nombre: "Mario Jimenez", telefono: "310 555 0101", licencia: "C2" },
    { id: 2, nombre: "Laura Rodriguez", telefono: "311 555 0102", licencia: "C2" },
    { id: 3, nombre: "Carlos Medina", telefono: "312 555 0103", licencia: "C1" },
    { id: 4, nombre: "Diana Ruiz", telefono: "313 555 0104", licencia: "C2" },
    { id: 5, nombre: "Andres Lopez", telefono: "314 555 0105", licencia: "C1" },
  ],
  rutas: [
    { id: 1, codigo: "TKS-001", estudianteId: 1, conductorId: 1, estado: "EN CAMINO", recogida: "7:00 AM", llegada: "07:17 AM", progreso: 65, tiempo: 73, colegio: "Inem" },
    { id: 2, codigo: "TKS-002", estudianteId: 2, conductorId: 2, estado: "EN CLASE", recogida: "6:30 AM", llegada: "06:58 AM", progreso: 100, tiempo: 0, colegio: "Inem" },
    { id: 3, codigo: "TKS-003", estudianteId: 3, conductorId: 3, estado: "PENDIENTE", recogida: "12:10 PM", llegada: "12:42 PM", progreso: 10, tiempo: 120, colegio: "Colegio Norte" },
    { id: 4, codigo: "TKS-004", estudianteId: 4, conductorId: 4, estado: "RETRASADA", recogida: "6:45 AM", llegada: "07:30 AM", progreso: 45, tiempo: 180, colegio: "Liceo Central" },
    { id: 5, codigo: "TKS-005", estudianteId: 5, conductorId: 5, estado: "FINALIZADA", recogida: "6:20 AM", llegada: "06:50 AM", progreso: 100, tiempo: 0, colegio: "Instituto Sur" },
  ],
  hijos: [
    { id: 1, inicial: "M", nombre: "Mateo Perez", grado: "3 primaria", estado: "EN CAMINO", rutaId: 1 },
    { id: 2, inicial: "S", nombre: "Sofia Perez", grado: "5 primaria", estado: "EN CLASE", rutaId: 2 },
    { id: 3, inicial: "L", nombre: "Luciana Torres", grado: "2 primaria", estado: "PENDIENTE", rutaId: 3 },
    { id: 4, inicial: "J", nombre: "Juan Esteban Rios", grado: "4 primaria", estado: "RETRASADA", rutaId: 4 },
    { id: 5, inicial: "V", nombre: "Valeria Gomez", grado: "1 primaria", estado: "FINALIZADA", rutaId: 5 },
  ],
  historial: [
    { id: 1, fecha: "2026-09-24", ruta: "TKS-001", estudiante: "Mateo Perez", estado: "En camino" },
    { id: 2, fecha: "2026-09-23", ruta: "TKS-001", estudiante: "Mateo Perez", estado: "Finalizada" },
    { id: 3, fecha: "2026-09-23", ruta: "TKS-002", estudiante: "Sofia Perez", estado: "Finalizada" },
    { id: 4, fecha: "2026-09-22", ruta: "TKS-004", estudiante: "Juan Esteban Rios", estado: "Retrasada" },
    { id: 5, fecha: "2026-09-21", ruta: "TKS-003", estudiante: "Luciana Torres", estado: "Pendiente" },
    { id: 6, fecha: "2026-09-20", ruta: "TKS-005", estudiante: "Valeria Gomez", estado: "Finalizada" },
  ],
  novedades: [
    { id: 1, titulo: "Alto flujo vehicular", descripcion: "La ruta TKS-004 presenta retraso de 8 minutos." },
    { id: 2, titulo: "Llegada confirmada", descripcion: "Sofia Perez ingreso a clase correctamente." },
    { id: 3, titulo: "Revision diaria", descripcion: "Todos los buses completaron chequeo de seguridad." },
  ],
};

function clonarDatosTransikids(datos) {
  return JSON.parse(JSON.stringify(datos));
}

function combinarDatosTransikids(guardados) {
  const base = clonarDatosTransikids(datosTransikidsIniciales);

  if (!guardados || typeof guardados !== "object") {
    return base;
  }

  return {
    ...base,
    ...guardados,
    usuario: {
      ...base.usuario,
      ...(guardados.usuario || {}),
    },
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
