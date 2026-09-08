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

El acceso requiere un correo con dominio `@superwagen.es`. El usuario administrador del panel se toma de la variable de entorno `ADMIN_EMAIL` definida en `.env` (por ejemplo `ADMIN_EMAIL=admin@superwagen.es`).

El inventario se persiste en Cloudflare D1. El esquema está en `migrations/0001_initial.sql` y los datos iniciales en `seed.sql`.

## Configurar D1 en local y producción

1. Instala dependencias y autentica Wrangler:

```bash
npm install
npx wrangler login
```

2. Crea la base de datos una sola vez:

```bash
npx wrangler d1 create mini-stock
```

Wrangler devolverá un `database_id`. Sustituye
`REPLACE_WITH_D1_DATABASE_ID` por ese valor en [`wrangler.toml`](./wrangler.toml).

3. Crea el esquema y carga los datos iniciales en la base local:

```bash
npm run db:migrate:local
npm run db:seed:local
```

4. Ejecuta la aplicación con el runtime de Cloudflare y la D1 local:

```bash
npm run dev:cloudflare
```

La aplicación estará disponible en `http://localhost:8788`. `npm run dev` sirve Nuxt directamente y no proporciona el binding D1; para esta integración usa `dev:cloudflare`.

5. Antes del primer despliegue, aplica la migración y el seed en la base remota:

```bash
npm run db:migrate:remote
npm run db:seed:remote
```

Ejecuta el seed remoto una sola vez: utiliza `INSERT OR IGNORE`, pero no es necesario repetirlo en cada despliegue.

6. Despliega Pages:

```bash
npm run deploy
```

Si usas la integración Git de Cloudflare Pages, configura el comando de build
`npm run build:cloudflare` y el directorio de salida `dist`. El binding `DB` debe
estar configurado para el proyecto Pages en producción y apuntar a la base D1
`mini-stock`; Wrangler lo toma de `wrangler.toml` cuando despliegas desde CLI.

7. Verifica la producción:

```bash
npx wrangler d1 execute mini-stock --remote --command="SELECT COUNT(*) AS products FROM products"
```

Después comprueba desde la interfaz que una solicitud, un movimiento y una
aprobación sobreviven a una recarga. Las lecturas y escrituras de D1 tienen los
límites diarios del plan gratuito; si se alcanza uno, Cloudflare devuelve error
hasta el siguiente reinicio diario.

## API persistente

- `GET /api/inventory`: productos, solicitudes y actividad reciente.
- `POST /api/movements`: registra entradas y salidas por ubicación.
- `POST /api/requests`: crea una solicitud y bloquea el producto.
- `PATCH /api/requests/:id`: aprueba o rechaza una solicitud.

Las operaciones de cada acción se envían agrupadas a D1 para que la actualización
de stock, el estado de la solicitud y el movimiento de auditoría no queden
desincronizados.

### Configurar Cloudflare Access para producción

La aplicación valida en el servidor el JWT que Cloudflare Access envía en
`Cf-Access-Jwt-Assertion`. Las rutas protegidas son `POST /api/movements`,
`POST /api/requests` y `PATCH /api/requests/:id`.

1. Despliega primero la aplicación en Pages y asígnale un dominio propio, por
   ejemplo `stock.example.com`.

2. En Cloudflare Zero Trust ve a **Access > Applications > Add an application**,
   elige **Self-hosted** y crea una aplicación para `stock.example.com`. Añade una
   política **Allow** para los usuarios o grupos corporativos autorizados. Access
   deniega por defecto a quien no coincide con una política.

3. En los detalles de la aplicación copia el **Application Audience (AUD)**.

4. En Cloudflare Pages añade estas variables de entorno para **Production**:
   - `ACCESS_TEAM_DOMAIN`: `https://TU-EQUIPO.cloudflareaccess.com`
   - `ACCESS_AUD`: el Application Audience copiado en el paso anterior

   No las pongas en el código ni en `.env` del repositorio. El servidor consulta
   automáticamente las claves públicas de Access y verifica firma, emisor,
   audiencia, expiración y algoritmo del token.

5. Vuelve a desplegar y prueba una operación desde la interfaz. Una petición sin
   JWT debe responder `401`; una petición con un token caducado o de otra
   aplicación también debe responder `401`.

Para desarrollo local, si necesitas escribir en la D1 local sin pasar por Access,
puedes definir temporalmente `ACCESS_ALLOW_INSECURE_LOCAL=true` en el entorno de
Wrangler. No configures esa variable en Production.

El acceso visual de la aplicación es una capa de interfaz; la seguridad real la
proporciona ahora la política de Cloudflare Access y la validación del JWT en el
servidor. Cloudflare recomienda validar el token en el origen para rechazar
peticiones que puedan saltarse el proxy por una configuración incorrecta.

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
