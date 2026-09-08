# Stock F1

Aplicación interna para consultar el catálogo de regalos del equipo, solicitar artículos y gestionar el inventario por ubicación.

## Funcionalidades

- Catálogo público de productos con imágenes, disponibilidad y ubicaciones.
- Solicitudes de artículos asociadas al correo corporativo.
- Bloqueo temporal de artículos mientras una solicitud está pendiente.
- Panel de Operations para aprobar o rechazar solicitudes.
- Registro de entradas y salidas de stock en SC y SBD.
- Resumen de unidades, solicitudes pendientes, artículos bloqueados y valor del inventario.

## Requisitos

- Node.js 18 o superior.
- npm.

## Instalación

```bash
npm install
```

## Desarrollo local

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Compilación

```bash
npm run build
```

Para generar específicamente la versión de Cloudflare Pages:

```bash
npm run build:cloudflare
```

## Despliegue

El proyecto está preparado para Cloudflare Pages mediante Wrangler:

```bash
npm run deploy
```

Si conectas el repositorio mediante la integración Git de Cloudflare Pages, configura únicamente:

- Comando de build: `npm run build:cloudflare`
- Directorio de salida: `dist`

Cloudflare Pages publicará automáticamente el contenido de `dist` al terminar el
build. No configures `npm run deploy` ni `npx wrangler pages deploy dist` como
comando de build o de despliegue dentro de ese flujo: eso inicia un segundo
despliegue y requiere que exista previamente un proyecto Pages con ese nombre.

Para usar subida directa con Wrangler desde una terminal o CI, crea primero el
proyecto Pages una sola vez y después ejecuta `npm run deploy`:

```bash
npx wrangler pages project create mini-stock
npm run deploy
```

No uses `wrangler deploy`, porque ese comando corresponde a Workers y requiere
un entry point de Worker distinto al generado por este proyecto.

La configuración de despliegue se encuentra en [`wrangler.toml`](./wrangler.toml).

## Acceso

El acceso requiere un correo con dominio `@superwagen.es`. El usuario administrador configurado para el panel es `admin@superwagen.es` durante el desarrollo.

La aplicación utiliza actualmente datos de inventario en memoria; los cambios se pierden al reiniciar la sesión o el servidor.

## Estructura principal

```text
app/
├── app.vue                    # Layout, acceso y navegación principal
├── components/                # Catálogo, tablas, solicitudes y movimientos
├── composables/useInventory.ts # Estado y operaciones del inventario
└── assets/css/main.css        # Estilos globales
public/assets/products/        # Imágenes de los productos
nuxt.config.ts                 # Configuración de Nuxt y Cloudflare
wrangler.toml                  # Configuración de despliegue
```

## Variables de entorno

Consulta [`.env.example`](./.env.example) para las variables previstas para futuras integraciones. Actualmente no es necesario configurar ninguna variable para ejecutar la aplicación localmente.
