# TransiKids - Prototipo frontend

TransiKids es un prototipo web para que un acudiente pueda consultar el estado de la ruta escolar de sus hijos. El proyecto esta organizado en HTML, CSS y JavaScript separados para que sea facil de revisar, mantener y ampliar.

## Flujo principal

1. El usuario entra por `vistas/inicioPrincipal.html`.
2. Puede iniciar sesion desde `vistas/login.html` o registrarse en `vistas/registro.html`.
3. Despues del login navega entre cuatro vistas principales:
   - `vistas/inicio.html`: resumen de ruta, accesos rapidos e historial.
   - `vistas/ruta.html`: seguimiento de rutas y cambio entre estudiantes.
   - `vistas/hijos.html`: consulta, busqueda, registro, entrega y eliminacion de hijos.
   - `vistas/perfil.html`: consulta y edicion de datos del acudiente.
4. El chatbot esta disponible en las cuatro vistas principales mediante el boton flotante.

## Organizacion

- `vistas/`: pantallas HTML del prototipo.
- `css/estilos.css`: estilos visuales compartidos.
- `js/datos.js`: datos de prueba y persistencia con `localStorage`.
- `js/funciones.js`: navegacion, validaciones, filtros, acciones CRUD y chatbot.
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
- Agregar hijos desde la vista `Hijos`.
- Marcar entrega de un hijo y actualizar su ruta como finalizada.
- Eliminar hijos y sus rutas asociadas.
- Cambiar la ruta visible desde `Ruta`.
- Editar datos del acudiente en `Perfil`.
- Chatbot con respuestas rapidas y preguntas frecuentes en carrusel.

## Como probar

Abre `vistas/inicioPrincipal.html` directamente en el navegador o ejecuta un servidor local desde la carpeta del proyecto:

```bash
python -m http.server 8000
```

Luego visita:

```text
http://localhost:8000/vistas/inicioPrincipal.html
```
