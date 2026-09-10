import type { H3Event } from 'h3';
import { createError } from 'h3';

export function getDb(event: H3Event): D1Database {
  const db = (event.context.cloudflare?.env as { DB?: D1Database } | undefined)
    ?.DB;
  if (!db)
    throw createError({
      statusCode: 503,
      statusMessage: 'Base de datos no disponible',
    });
  return db;
}

export async function enableForeignKeys(event: H3Event) {
  try {
    const db = getDb(event);
    await db.prepare('PRAGMA foreign_keys = ON').run();
  } catch (error) {
    // Log the actual error for internal debugging (in a real app, you'd use proper logging)
    console.error('[Database Error] Failed to enable foreign keys:', error);
    throw createError({
      statusCode: 503,
      statusMessage: 'Error de configuración de base de datos',
    });
  }
}

export function productFromRow(row: Record<string, unknown>) {
  const stockSC = Number(row.stock_sc);
  const stockSBD = Number(row.stock_sbd);
  const stock = stockSC + stockSBD;
  return {
    id: Number(row.id),
    line: row.line,
    name: row.name,
    sku: row.sku,
    ref: row.ref,
    stock,
    stockSC,
    stockSBD,
    incoming: Number(row.incoming),
    reserved: 0,
    cost: Number(row.cost),
    price: Number(row.price),
    status: stock <= 1 ? 'critical' : stock <= 2 ? 'low' : 'ok',
    accent: row.accent,
    locked: Boolean(row.locked),
  };
}
