import dns from 'dns/promises';
import type { H3Event } from 'h3';
import { requireAccess } from './access.ts';
import { readBody } from 'h3';
import { createError } from 'h3';

/**
 * Enhanced email verification that checks domain validity and email authentication records
 */
export interface EmailVerificationResult {
  isValid: boolean;
  domain: string;
  hasValidSyntax: boolean;
  domainExists: boolean;
  spfValid: boolean;
  dkimValid: boolean;
  dmarcValid: boolean;
  errors: string[];
}

/**
 * Validates email syntax
 */
function validateEmailSyntax(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Extracts domain from email address
 */
function extractDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() || '';
}

/**
 * Checks if domain exists by resolving MX records
 */
async function checkDomainExists(domain: string): Promise<boolean> {
  try {
    const mxRecords = await dns.resolveMx(domain);
    return mxRecords.length > 0;
  } catch (error) {
    // If MX records don't exist, try A records as fallback
    try {
      await dns.resolve4(domain);
      return true;
    } catch (aError) {
      return false;
    }
  }
}

/**
 * Checks SPF record for domain
 */
async function checkSPFRecord(domain: string): Promise<boolean> {
  try {
    const txtRecords = await dns.resolveTxt(domain);
    // Look for SPF record (starts with "v=spf1")
    const spfRecord = txtRecords.flat().find((record) => record.startsWith('v=spf1'));
    return !!spfRecord;
  } catch (error) {
    return false;
  }
}

/**
 * Checks DMARC record for domain
 */
async function checkDMARCRecord(domain: string): Promise<boolean> {
  try {
    const txtRecords = await dns.resolveTxt(`_dmarc.${domain}`);
    // Look for DMARC record (starts with "v=DMARC1")
    const dmarcRecord = txtRecords.flat().find((record) => record.startsWith('v=DMARC1'));
    return !!dmarcRecord;
  } catch (error) {
    return false;
  }
}

/**
 * Note: DKIM verification requires checking specific selectors which is more complex
 * For now, we'll return true as a placeholder, but in production you would:
 * 1. Check common DKIM selectors (default, google, etc.)
 * 2. Or use a dedicated email verification service
 */
function checkDKIMRecord(domain: string): Promise<boolean> {
  // Placeholder implementation - in reality would check specific DKIM selectors
  return Promise.resolve(true);
}

/**
 * Performs comprehensive email verification
 */
export async function verifyEmailComprehensive(email: string): Promise<EmailVerificationResult> {
  const errors: string[] = [];
  
  // Validate syntax
  const hasValidSyntax = validateEmailSyntax(email);
  if (!hasValidSyntax) {
    errors.push('Invalid email format');
  }
  
  // Extract domain
  const domain = extractDomain(email);
  if (!domain) {
    errors.push('Could not extract domain from email');
    return {
      isValid: false,
      domain: '',
      hasValidSyntax: false,
      domainExists: false,
      spfValid: false,
      dkimValid: false,
      dmarcValid: false,
      errors
    };
  }
  
  // Check domain existence
  const domainExists = await checkDomainExists(domain);
  if (!domainExists) {
    errors.push('Domain does not exist or has no DNS records');
  }
  
  // Check SPF record
  const spfValid = await checkSPFRecord(domain);
  if (!spfValid) {
    errors.push('No valid SPF record found');
  }
  
  // Check DMARC record
  const dmarcValid = await checkDMARCRecord(domain);
  if (!dmarcValid) {
    errors.push('No valid DMARC record found');
  }
  
  // Check DKIM (placeholder)
  const dkimValid = await checkDKIMRecord(domain);
  if (!dkimValid) {
    errors.push('DKIM verification not implemented (placeholder)');
  }
  
  // Overall validity - basic checks must pass
  const isValid = hasValidSyntax && domainExists && spfValid && dmarcValid;
  
  return {
    isValid,
    domain,
    hasValidSyntax,
    domainExists,
    spfValid,
    dkimValid,
    dmarcValid,
    errors
  };
}

/**
 * Middleware to verify email with enhanced checks
 */
export async function verifyEmailForRequest(event: H3Event) {
  // First verify Cloudflare Access
  const claims = await requireAccess(event);
  
  // Get email from request body
  const body = await readBody<{ email: string }>(event);
  if (!body?.email) {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' });
  }
  
  // Perform enhanced email verification
  const verificationResult = await verifyEmailComprehensive(body.email.trim().toLowerCase());
  
  if (!verificationResult.isValid) {
    throw createError({
      statusCode: 400,
      statusMessage: `Email verification failed: ${verificationResult.errors.join(', ')}`
    });
  }
  
  // Additional domain restriction for superwagen.es
  if (!body.email.toLowerCase().endsWith('@superwagen.es')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only @superwagen.es email addresses are allowed'
    });
  }
  
  return {
    email: body.email.trim().toLowerCase(),
    claims,
    verificationResult
  };
}