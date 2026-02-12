# ProSalud Gold

Aplicación web para la gestión integral de clínicas dentales. Incluye landing de producto y un dashboard con módulos de agenda, pacientes, atención clínica, caja, inventario, laboratorios, reportes y más.

## Requisitos

- Node.js 18+ y npm (o [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) para instalarlo)

## Instalación y ejecución

```bash
# Clonar el repositorio
git clone https://github.com/toyslatam/prosaludgold.git
cd prosaludgold

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (puerto 8080)
npm run dev
```

Abre [http://localhost:8080](http://localhost:8080) en el navegador.

**En PowerShell** (Windows), si `&&` no funciona, ejecuta los comandos por separado o usa `;`:

```powershell
npm install
npm run dev
```

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Build de producción |
| `npm run build:dev` | Build en modo development |
| `npm run preview` | Vista previa del build de producción |
| `npm run lint` | Ejecutar ESLint |
| `npm run test` | Ejecutar tests (Vitest) |
| `npm run test:watch` | Tests en modo watch |

## Estructura del proyecto

```
src/
├── components/
│   ├── landing/     # Secciones de la landing (Hero, FAQ, Precios, etc.)
│   └── ui/          # Componentes shadcn/ui
├── data/
│   └── mockData.ts  # Datos de demo para el dashboard
├── integrations/
│   └── supabase/    # Cliente y tipos de Supabase
├── pages/
│   ├── Index.tsx    # Landing pública
│   ├── NotFound.tsx
│   └── dashboard/   # Vistas del panel (Agenda, Pacientes, Caja, etc.)
├── hooks/
├── lib/
├── App.tsx
└── main.tsx
```

## Rutas principales

- **`/`** — Landing (producto, precios, FAQ, seguridad)
- **`/demo`** — Dashboard (requiere ir a esta ruta desde el menú o enlace)
  - Inicio, Agenda, Pacientes, Atención Clínica, Doctores, Caja, Remuneraciones, Inventario, Laboratorios, Gastos, Reportes, Experiencia Paciente, Hub IA, Configuración

## Tecnologías

- **Build:** Vite 5, React 18, TypeScript
- **UI:** shadcn/ui (Radix UI), Tailwind CSS, Framer Motion, Lucide React
- **Routing:** React Router v6
- **Formularios:** React Hook Form, Zod, @hookform/resolvers
- **Datos:** TanStack React Query, Supabase (cliente configurado)
- **Tests:** Vitest, Testing Library

## Variables de entorno

Crea un archivo `.env` en la raíz con las variables de Supabase (cuando vayas a conectar el backend):

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_clave_publica
```

El proyecto incluye un `.env.example` opcional como referencia; no subas `.env` al repositorio.

## Despliegue

- **Build:** `npm run build` — la salida queda en `dist/`.
- Puedes desplegar en Vercel, Netlify, o cualquier host estático usando la carpeta `dist/`.

## Licencia

Proyecto privado.
