# 🎅 Intercambio de Amigo Invisible

¡Una aplicación web festiva para administrar intercambios de Amigo Invisible! Los participantes pueden crear y administrar sus listas de deseos, y los Amigos Invisibles pueden dejar pistas misteriosas sobre su identidad.

## Características

- 🎁 **Administración de Lista de Deseos**: Los participantes pueden agregar, editar y eliminar regalos que quieren recibir
- 🔍 **Pistas del Amigo Invisible**: Los Amigos Invisibles pueden dejar pistas sobre su identidad
- 🎄 **Tema Navideño**: Hermoso esquema de colores rojo, verde y blanco
- 💾 **Almacenamiento Persistente**: Todos los datos se guardan en una base de datos SQLite
- 👥 **Múltiples Participantes**: Precargado con 5 participantes (Emma Wilson, James Anderson, Sophia Martinez, Oliver Johnson, Isabella Brown)

## Instalación

1. Cloná este repositorio
2. Instalá las dependencias:
   ```bash
   npm install
   ```

## Uso

1. Iniciá el servidor:
   ```bash
   npm start
   ```

2. Abrí tu navegador y navegá a:
   ```
   http://localhost:3000
   ```

3. ¡Empezá a administrar listas de deseos y dejar pistas!

## Stack Tecnológico

- **Backend**: Node.js con Express
- **Base de Datos**: SQLite3
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Estilos**: CSS personalizado con colores navideños

## Esquema de Base de Datos

### Tablas

1. **participants**: Almacena información de los participantes
   - id (PRIMARY KEY)
   - name

2. **gifts**: Almacena items de la lista de deseos
   - id (PRIMARY KEY)
   - participant_id (FOREIGN KEY)
   - gift_description

3. **clues**: Almacena pistas del Amigo Invisible
   - id (PRIMARY KEY)
   - participant_id (FOREIGN KEY)
   - clue_text
   - created_at

## Endpoints de la API

- `GET /api/participants` - Obtener todos los participantes con sus regalos y pistas
- `POST /api/participants/:id/gifts` - Agregar un regalo a la lista de deseos de un participante
- `PUT /api/gifts/:id` - Actualizar un regalo
- `DELETE /api/gifts/:id` - Eliminar un regalo
- `POST /api/participants/:id/clues` - Agregar una pista para un participante
- `DELETE /api/clues/:id` - Eliminar una pista

## Licencia

ISC