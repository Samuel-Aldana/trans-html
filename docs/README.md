# TransiKids - Prototipo frontend

TransiKids es un prototipo web para que un acudiente pueda consultar el estado de la ruta escolar de sus hijos. El proyecto esta organizado en HTML, CSS y JavaScript separados para que sea facil de revisar, mantener y ampliar.

## Flujo principal

1. El usuario entra por `inicioPrincipal.html`.
2. Puede iniciar sesion desde `login.html` o registrarse en `registro.html`.
3. Despues del login navega entre cuatro vistas principales:
   - `inicio.html`: resumen de ruta, accesos rapidos e historial.
   - `ruta.html`: seguimiento de rutas y cambio entre estudiantes.
   - `hijos.html`: consulta y busqueda de hijos.
   - `perfil.html`: consulta de datos del acudiente.
4. El chatbot esta disponible en las cuatro vistas principales mediante el boton flotante.
5. El administrador entra desde `login.html` con usuario `12345` y contrasena `contraseña`, y se redirige a `admin.html`.

## Organizacion

- Archivos `.html` en la raiz: pantallas del prototipo.
- `css/estilos.css`: estilos visuales compartidos.
- `js/datos.js`: datos de prueba y persistencia con `localStorage`.
- `js/funciones.js`: navegacion, validaciones, filtros, panel admin y chatbot.
- `img/`: logo e imagenes usadas por las vistas.

## Datos de prueba

Los datos salen de arreglos y objetos definidos en `js/datos.js`:

- Acudiente: nombre, correo, telefono, documento y rol.
- Hijos: cinco estudiantes con grado, estado y ruta asignada.
- Rutas: codigo, conductor, colegio, hora de recogida, llegada, progreso y tiempo restante.
- Conductores: nombre, telefono y licencia.
- Historial: viajes recientes para filtrar desde la vista de inicio.
- Novedades: mensajes base para alimentar respuestas del chatbot.

## Funcionalidades

- Busqueda de historial por estudiante, ruta, estado o fecha.
- Busqueda de hijos por nombre, grado o estado.
- Acceso de padre a vistas de consulta.
- Acceso de administrador con usuario `12345` y contrasena `contraseña`.
- Agregar, editar y eliminar estudiantes/rutas desde `admin.html`.
- Restaurar datos de prueba desde el panel admin.
- Cambiar la ruta visible desde `Ruta`.
- Ver datos del acudiente en `Perfil` sin modificarlos.
- Chatbot con respuestas rapidas y preguntas frecuentes en carrusel.

## Como probar

Abre `inicioPrincipal.html` directamente en el navegador o ejecuta un servidor local desde la carpeta del proyecto:

```bash
python -m http.server 8000
```

Luego visita:

```text
http://localhost:8000/inicioPrincipal.html
```
