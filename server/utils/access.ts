import { getHeader } from 'h3';
import type { H3Event } from 'h3';
import { createError } from 'h3';
import type { JsonWebKey } from 'crypto';

type AccessEnv = {
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  ACCESS_ALLOW_INSECURE_LOCAL?: string;
};
type AccessClaims = {
  iss?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  email?: string;
  sub?: string;
};
type AccessJwk = JsonWebKey & { kid?: string; alg?: string; use?: string };

let cachedKeys: { expiresAt: number; keys: AccessJwk[] } | undefined;
// Cache for token validation results to reduce redundant validations
let tokenValidationCache: Map<
  string,
  { claims: AccessClaims; expiresAt: number }
> = new Map();

function getAccessEnv(event: H3Event) {
  return (event.context.cloudflare?.env ?? {}) as AccessEnv;
}

function decodeBase64Url(value: string) {
  const normalized =
    value.replace(/-/g, '+').replace(/_/g, '/') +
    '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(normalized);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function decodeJson<T>(value: string) {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as T;
}

async function getKeys(teamDomain: string) {
  if (cachedKeys && cachedKeys.expiresAt > Date.now()) return cachedKeys.keys;
  const response = await fetch(`${teamDomain}/cdn-cgi/access/certs`);
  if (!response.ok)
    throw createError({
      statusCode: 503,
      statusMessage:
        'No se pudo consultar la configuración de Cloudflare Access',
    });
  const body = (await response.json()) as { keys?: AccessJwk[] };
  cachedKeys = {
    keys: body.keys ?? [],
    expiresAt: Date.now() + 60 * 60 * 1000,
  };
  return cachedKeys.keys;
}

/**
 * Validates a Cloudflare Access token with caching to improve performance
 */
export async function requireAccess(event: H3Event) {
  const env = getAccessEnv(event);
  if (env.ACCESS_ALLOW_INSECURE_LOCAL === 'true')
    return { email: 'dev@local' } as AccessClaims;
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD)
    throw createError({
      statusCode: 503,
      statusMessage: 'Cloudflare Access no está configurado',
    });

  const token = getHeader(event, 'cf-access-jwt-assertion');
  if (!token)
    throw createError({
      statusCode: 401,
      statusMessage: 'Falta la autenticación de Cloudflare Access',
    });

  // Check if we have a cached validation for this token (valid for 5 minutes)
  const cachedValidation = tokenValidationCache.get(token);
  if (cachedValidation && cachedValidation.expiresAt > Date.now()) {
    return cachedValidation.claims;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !encodedSignature)
    throw createError({
      statusCode: 401,
      statusMessage: 'Token de Cloudflare Access inválido',
    });

  try {
    const header = decodeJson<{ kid?: string; alg?: string }>(encodedHeader);
    const claims = decodeJson<AccessClaims>(encodedPayload);
    if (header.alg !== 'RS256' || !header.kid)
      throw new Error('alg/kid inválido');
    const issuer = env.ACCESS_TEAM_DOMAIN.replace(/\/$/, '');
    const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    const now = Math.floor(Date.now() / 1000);
    if (
      claims.iss !== issuer ||
      !audience.includes(env.ACCESS_AUD) ||
      !claims.exp ||
      claims.exp <= now ||
      (claims.nbf && claims.nbf > now)
    )
      throw new Error('claims inválidos');
    const jwk = (await getKeys(issuer)).find(key => key.kid === header.kid);
    if (!jwk) throw new Error('clave no encontrada');
    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const valid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      decodeBase64Url(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    );
    if (!valid) throw new Error('firma inválida');

    // Cache the validation result for 5 minutes (or until token expires, whichever is sooner)
    const cacheTimeout = Math.min(
      claims.exp * 1000 - Date.now(),
      5 * 60 * 1000
    );
    tokenValidationCache.set(token, {
      claims,
      expiresAt: Date.now() + Math.max(cacheTimeout, 30000),
    }); // At least 30 seconds

    return claims;
  } catch (error) {
    // Clear cache entry for invalid token
    tokenValidationCache.delete(token);
    throw createError({
      statusCode: 401,
      statusMessage: 'Token de Cloudflare Access inválido o caducado',
    });
  }
}

/**
 * Clears the token validation cache (useful for testing or when keys rotate)
 */
export function clearAccessTokenCache() {
  tokenValidationCache.clear();
}
