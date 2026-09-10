import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const workspaceDir = '/Users/david/repos/mini-stock';
const skillDir = '/Users/david/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const buildDir = path.join(workspaceDir, '.codex-presentation-build');
const outputDir = path.join(workspaceDir, 'presentation-output');
const candidatePath = path.join(buildDir, 'stock-f1-presentation-candidate.pptx');
const finalPath = path.join(outputDir, 'stock-f1-presentacion.pptx');
const runtimeNode = '/Users/david/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node';
const runtimePython = '/Users/david/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const runtimeModules = '/Users/david/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';

await fs.mkdir(buildDir, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });
const nm = path.join(buildDir, 'node_modules');
try { await fs.symlink(runtimeModules, nm, 'dir'); } catch {}

const { resolvePresentationFont, finalizePresentation } = await import(
  pathToFileURL(path.join(skillDir, 'container_tools/artifact_tool_utils.mjs')).href,
);
const family = resolvePresentationFont({ availableFonts: ['Aptos', 'Arial', 'DejaVu Sans'] });

const C = {
  ink: '#101820',
  muted: '#66737C',
  paper: '#F7F5F0',
  white: '#FFFFFF',
  orange: '#F05A28',
  orangeSoft: '#FDE5DB',
  blue: '#1B4965',
  blueSoft: '#DCEAF1',
  green: '#1D7A5D',
  greenSoft: '#DDEEE8',
  line: '#D8D5CE',
  dark: '#17242B',
};

const p = Presentation.create({ slideSize: { width: 1280, height: 720 } });

function rect(slide, left, top, width, height, fill, radius = 0, line = 'none') {
  return slide.shapes.add({
    geometry: radius ? 'roundRect' : 'rect',
    position: { left, top, width, height },
    fill,
    line: line === 'none' ? { fill: 'none', width: 0 } : { fill: line, width: 1 },
    borderRadius: radius || undefined,
  });
}

function text(slide, value, left, top, width, height, style = {}) {
  const s = slide.shapes.add({
    geometry: 'textbox',
    position: { left, top, width, height },
    fill: 'none',
    line: { fill: 'none', width: 0 },
  });
  s.text = value;
  s.text.style = {
    typeface: family,
    fontSize: style.fontSize ?? 20,
    color: style.color ?? C.ink,
    bold: style.bold ?? false,
    italic: style.italic ?? false,
    alignment: style.alignment ?? 'left',
    autoFit: 'shrinkTextOnOverflow',
    lineSpacing: style.lineSpacing ?? 1.05,
  };
  return s;
}

function label(slide, value, left, top, width, color = C.orange) {
  return text(slide, value.toUpperCase(), left, top, width, 20, { fontSize: 12, bold: true, color });
}

function title(slide, value, subtitle) {
  text(slide, value, 72, 58, 820, 56, { fontSize: 34, bold: true, color: C.ink });
  if (subtitle) text(slide, subtitle, 74, 120, 920, 28, { fontSize: 17, color: C.muted });
  rect(slide, 72, 164, 1136, 1, C.line);
}

function footer(slide, n) {
  text(slide, `STOCK F1  ·  MINI-STOCK`, 72, 684, 300, 16, { fontSize: 10, bold: true, color: C.muted });
  text(slide, String(n).padStart(2, '0'), 1160, 684, 48, 16, { fontSize: 10, bold: true, color: C.muted, alignment: 'right' });
}

async function imageBytes(file) { return new Uint8Array(await fs.readFile(file)); }
const productA = await imageBytes(path.join(workspaceDir, 'public/assets/products/KE7324.jpg'));
const productB = await imageBytes(path.join(workspaceDir, 'public/assets/products/KE9081.jpg'));
const productC = await imageBytes(path.join(workspaceDir, 'public/assets/products/KE9091.jpg'));

// 1. Cover
{
  const s = p.slides.add(); s.background.fill = C.dark;
  rect(s, 0, 0, 1280, 720, C.dark);
  rect(s, 840, 0, 440, 720, C.orange);
  rect(s, 910, 86, 264, 548, '#FF8A58', 24);
  s.images.add({ blob: productA, contentType: 'image/jpeg', alt: 'Producto del catálogo', fit: 'cover', position: { left: 934, top: 110, width: 216, height: 500 }, geometry: 'roundRect', borderRadius: 22 });
  rect(s, 72, 86, 72, 8, C.orange);
  label(s, 'Proyecto web · 2026', 72, 126, 260, '#FFB49A');
  text(s, 'Stock F1', 72, 188, 650, 90, { fontSize: 66, bold: true, color: C.white });
  text(s, 'Inventario y regalos\npara el equipo', 72, 294, 620, 130, { fontSize: 34, bold: true, color: C.white, lineSpacing: 0.96 });
  text(s, 'Un workspace interno para consultar, solicitar y gestionar stock por ubicación.', 76, 468, 550, 60, { fontSize: 21, color: '#D7E0E4' });
  text(s, 'Nuxt 4  ·  Cloudflare Pages  ·  D1', 76, 628, 520, 22, { fontSize: 14, bold: true, color: '#AEBBC2' });
  s.speakerNotes.textFrame.setText('Fuente: README.md y estructura del repositorio mini-stock.');
}

// 2. Product
{
  const s = p.slides.add(); s.background.fill = C.paper; title(s, 'Qué resuelve Stock F1', 'Una única vista para el catálogo, las solicitudes y el inventario operativo.');
  label(s, 'Contexto', 72, 202);
  text(s, 'El equipo necesita consultar regalos disponibles sin perder el control de las existencias ni de las solicitudes pendientes.', 72, 234, 420, 88, { fontSize: 25, bold: true, lineSpacing: 0.98 });
  text(s, 'Stock F1 conecta la experiencia del empleado con la operación de Operations y mantiene el stock sincronizado en D1.', 72, 344, 420, 72, { fontSize: 18, color: C.muted });
  rect(s, 590, 214, 250, 250, C.white, 22);
  s.images.add({ blob: productB, contentType: 'image/jpeg', alt: 'Producto del catálogo', fit: 'cover', position: { left: 612, top: 236, width: 206, height: 164 }, geometry: 'roundRect', borderRadius: 16 });
  text(s, 'Catálogo público', 612, 420, 206, 26, { fontSize: 18, bold: true });
  text(s, 'Disponibilidad por línea y ubicación', 612, 448, 206, 36, { fontSize: 14, color: C.muted });
  rect(s, 880, 214, 250, 250, C.blueSoft, 22);
  text(s, '02', 910, 244, 72, 60, { fontSize: 44, bold: true, color: C.blue });
  text(s, 'Solicitudes con bloqueo temporal', 910, 326, 180, 60, { fontSize: 21, bold: true, color: C.blue });
  text(s, 'El artículo queda reservado mientras Operations decide.', 910, 400, 180, 52, { fontSize: 14, color: C.blue });
  rect(s, 590, 492, 540, 100, C.greenSoft, 18);
  text(s, '03', 618, 512, 72, 60, { fontSize: 44, bold: true, color: C.green });
  text(s, 'Control operativo', 700, 510, 210, 28, { fontSize: 21, bold: true, color: C.green });
  text(s, 'Entradas, salidas, auditoría y métricas en un panel privado.', 700, 544, 370, 26, { fontSize: 15, color: C.green });
  footer(s, 2);
  s.speakerNotes.textFrame.setText('Fuente: README.md, funcionalidades y componentes PublicCatalog.vue, AdminRequests.vue e InventoryTable.vue.');
}

// 3. User journey
{
  const s = p.slides.add(); s.background.fill = C.white; title(s, 'Experiencia de solicitud', 'El flujo público reduce la fricción y deja claro cuándo interviene Operations.');
  const steps = [
    ['01', 'Acceso corporativo', 'El usuario entra con un correo @superwagen.es.'],
    ['02', 'Selección', 'Busca por producto, SKU o referencia y revisa stock por ubicación.'],
    ['03', 'Solicitud', 'Indica cantidad y envía la petición.'],
    ['04', 'Gestión', 'Operations aprueba o rechaza y el stock se actualiza.'],
  ];
  steps.forEach((item, i) => {
    const x = 72 + i * 286;
    rect(s, x, 232, 236, 250, i === 3 ? C.orangeSoft : C.paper, 20);
    text(s, item[0], x + 24, 256, 62, 45, { fontSize: 34, bold: true, color: i === 3 ? C.orange : C.blue });
    rect(s, x + 24, 318, 184, 2, i === 3 ? C.orange : C.line);
    text(s, item[1], x + 24, 344, 185, 52, { fontSize: 21, bold: true, color: C.ink });
    text(s, item[2], x + 24, 414, 184, 44, { fontSize: 14, color: C.muted });
  });
  text(s, 'La solicitud bloquea temporalmente el artículo para evitar reservas simultáneas.', 72, 548, 820, 30, { fontSize: 19, bold: true, color: C.blue });
  footer(s, 3);
  s.speakerNotes.textFrame.setText('Fuente: app/app.vue, app/components/PublicCatalog.vue y server/api/requests.post.ts.');
}

// 4. Operations
{
  const s = p.slides.add(); s.background.fill = C.paper; title(s, 'Panel de Operations', 'La operación trabaja sobre el mismo inventario que ve el catálogo público.');
  rect(s, 72, 212, 1136, 360, C.dark, 22);
  rect(s, 96, 238, 262, 308, '#22333C', 16);
  text(s, 'CENTRO DE CONTROL', 120, 264, 180, 18, { fontSize: 11, bold: true, color: '#9FB0B8' });
  text(s, 'Stock F1', 120, 302, 160, 34, { fontSize: 25, bold: true, color: C.white });
  ['Resumen', 'Solicitudes', 'Movimientos', 'Catálogo'].forEach((v, i) => {
    rect(s, 120, 370 + i * 40, 180, 28, i === 1 ? C.orange : 'none', 8);
    text(s, v, 134, 376 + i * 40, 160, 18, { fontSize: 14, color: i === 1 ? C.white : '#B9C6CB', bold: i === 1 });
  });
  text(s, 'Solicitudes pendientes', 400, 254, 220, 32, { fontSize: 21, bold: true, color: C.white });
  text(s, '3', 400, 304, 100, 70, { fontSize: 56, bold: true, color: C.orange });
  text(s, 'Unidades en stock', 760, 254, 280, 32, { fontSize: 21, bold: true, color: C.white });
  text(s, '128', 760, 304, 160, 70, { fontSize: 56, bold: true, color: '#83D7B6' });
  rect(s, 400, 414, 700, 1, '#40525A');
  text(s, 'Aprobación y rechazo actualizan solicitud, stock y auditoría en la misma operación.', 400, 448, 620, 50, { fontSize: 19, color: '#D6E0E4' });
  text(s, 'Vista conceptual basada en las métricas y paneles implementados.', 400, 514, 600, 18, { fontSize: 12, color: '#9FB0B8' });
  footer(s, 4);
  s.speakerNotes.textFrame.setText('Los números del mockup son ilustrativos para explicar la interfaz. La aplicación calcula métricas desde el inventario real. Fuente: app/app.vue, AdminRequests.vue y composables/useInventory.ts.');
}

// 5. Architecture
{
  const s = p.slides.add(); s.background.fill = C.white; title(s, 'Arquitectura de la solución', 'Una aplicación Nuxt con persistencia D1 y controles de acceso en el servidor.');
  const boxes = [
    [72, 250, 250, 150, C.orangeSoft, C.orange, 'Interfaz Nuxt 4', 'Catálogo, panel de Operations y estado compartido'],
    [430, 250, 250, 150, C.blueSoft, C.blue, 'API server-side', 'Inventario, solicitudes, movimientos y auditoría'],
    [788, 250, 250, 150, C.greenSoft, C.green, 'Cloudflare D1', 'Productos, stock, solicitudes y registro de actividad'],
  ];
  boxes.forEach(([x, y, w, h, fill, color, head, body]) => {
    rect(s, x, y, w, h, fill, 20);
    text(s, head, x + 24, y + 28, w - 48, 30, { fontSize: 22, bold: true, color });
    text(s, body, x + 24, y + 76, w - 48, 52, { fontSize: 15, color: C.ink });
  });
  rect(s, 322, 318, 108, 2, C.line); rect(s, 680, 318, 108, 2, C.line);
  text(s, 'Cloudflare Pages', 72, 482, 250, 26, { fontSize: 18, bold: true, color: C.blue });
  text(s, 'Despliegue preparado con Wrangler y build específico para Pages.', 72, 516, 360, 40, { fontSize: 16, color: C.muted });
  text(s, 'Cloudflare Access', 530, 482, 250, 26, { fontSize: 18, bold: true, color: C.blue });
  text(s, 'Las rutas de escritura validan JWT en origen antes de tocar datos.', 530, 516, 360, 40, { fontSize: 16, color: C.muted });
  text(s, 'Seguridad transversal', 930, 482, 220, 26, { fontSize: 18, bold: true, color: C.blue });
  text(s, 'Rate limiting, verificación de email y logs estructurados.', 930, 516, 240, 40, { fontSize: 16, color: C.muted });
  footer(s, 5);
  s.speakerNotes.textFrame.setText('Fuente: README.md, nuxt.config.ts, wrangler.toml, server/middleware/access.ts, server/middleware/rateLimit.ts y server/utils/audit.ts.');
}

// 6. Current state
{
  const s = p.slides.add(); s.background.fill = C.paper; title(s, 'Estado actual', 'La base funcional está cubierta; la siguiente etapa se centra en robustez operativa y escala.');
  label(s, 'Implementado', 72, 212, 220, C.green);
  const done = ['Catálogo público con imágenes y disponibilidad', 'Solicitudes con bloqueo temporal', 'Aprobación y rechazo desde Operations', 'Entradas y salidas por SC y SBD', 'Rate limiting, Access JWT y auditoría', 'Tests unitarios e integración'];
  done.forEach((v, i) => { text(s, '✓', 76, 252 + i * 44, 24, 24, { fontSize: 18, bold: true, color: C.green }); text(s, v, 110, 250 + i * 44, 440, 30, { fontSize: 17, color: C.ink }); });
  label(s, 'Siguiente etapa', 690, 212, 260, C.orange);
  const next = ['Integridad de datos con constraints y locking', 'Paginación y rendimiento para inventarios grandes', 'Operaciones masivas y exportación CSV/Excel', 'E2E, CI/CD, previews y monitorización'];
  next.forEach((v, i) => { text(s, '→', 694, 252 + i * 56, 24, 24, { fontSize: 18, bold: true, color: C.orange }); text(s, v, 730, 250 + i * 56, 420, 38, { fontSize: 17, color: C.ink }); });
  rect(s, 690, 500, 440, 72, C.orangeSoft, 16);
  text(s, 'Prioridad recomendada', 714, 516, 180, 20, { fontSize: 12, bold: true, color: C.orange });
  text(s, 'Cerrar integridad de datos antes de escalar volumen.', 714, 542, 370, 22, { fontSize: 16, bold: true, color: C.ink });
  footer(s, 6);
  s.speakerNotes.textFrame.setText('Fuente: TODO.md. “Implementado” recoge tareas marcadas como completadas. “Siguiente etapa” resume pendientes del roadmap; la prioridad es una recomendación editorial, no una decisión registrada en el repositorio.');
}

// 7. Close
{
  const s = p.slides.add(); s.background.fill = C.dark;
  rect(s, 0, 0, 1280, 720, C.dark);
  rect(s, 72, 92, 72, 8, C.orange);
  label(s, 'Resumen', 72, 140, 200, '#FFB49A');
  text(s, 'Stock F1 convierte el inventario en una experiencia sencilla para el equipo y controlable para Operations.', 72, 196, 840, 120, { fontSize: 40, bold: true, color: C.white, lineSpacing: 0.98 });
  rect(s, 72, 390, 520, 2, '#49616C');
  text(s, 'Producto claro · operación trazable · base preparada para crecer', 72, 428, 720, 34, { fontSize: 21, color: '#D7E0E4' });
  s.images.add({ blob: productC, contentType: 'image/jpeg', alt: 'Producto del catálogo', fit: 'cover', position: { left: 940, top: 154, width: 220, height: 330 }, geometry: 'roundRect', borderRadius: 24 });
  text(s, 'mini-stock', 72, 622, 200, 22, { fontSize: 14, bold: true, color: '#AEBBC2' });
  text(s, 'Presentación del proyecto', 1020, 622, 170, 22, { fontSize: 12, color: '#AEBBC2', alignment: 'right' });
  s.speakerNotes.textFrame.setText('Cierre basado en el alcance documentado del proyecto.');
}

await (await PresentationFile.exportPptx(p)).save(candidatePath);
const requirements = {
  explicitTotalSlideCount: 7,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  fontPolicy: { basis: 'design', families: [family] },
};
const result = await finalizePresentation({
  ...requirements,
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable: runtimePython,
  integrityValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-heading-fit'],
  fontPolicy: requirements.fontPolicy,
  verifyArtifactToolImport: true,
  receiptPath: path.join(buildDir, 'stock-f1-presentacion.validation.json'),
});
console.log(JSON.stringify({ finalPath, family, result }, null, 2));
