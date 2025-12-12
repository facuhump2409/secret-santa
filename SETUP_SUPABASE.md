# Configuración de Supabase

## Pasos para configurar Supabase

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear las tablas en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `supabase-migration.sql`
4. Ejecuta el script

Esto creará las tablas:
- `participants` - Almacena los participantes
- `gifts` - Almacena los regalos de la lista de deseos
- `clues` - Almacena las pistas del Amigo Invisible

### 3. Configurar variables de entorno

#### Para desarrollo local:

Crea un archivo `.env` en la raíz del proyecto:

```env
SUPABASE_URL=https://coysqjkyyhuijwqebqmp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=AGREGAR_KEY
```

#### Para Vercel:

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Navega a **Settings** > **Environment Variables**
3. Agrega las siguientes variables:

### 4. Inicializar datos

La aplicación automáticamente inicializará los participantes cuando se inicie por primera vez. Los nombres precargados son:
- JuanFran, JuanMar, Karina, Jorge, Juani, Kazu, Abuela, Judit, Andres, Santiago, Facundo, Catalina, Lucas, Iara

### Notas importantes

- **Service Role Key**: Se usa para operaciones del servidor y bypassa Row Level Security (RLS). Mantené esta clave segura y nunca la expongas en el frontend.
- **Anon Key**: Si preferís usar la anon key, asegurate de configurar las políticas RLS correctamente en Supabase.
- **Row Level Security**: Las políticas están configuradas para permitir todas las operaciones. Ajustalas según tus necesidades de seguridad.

