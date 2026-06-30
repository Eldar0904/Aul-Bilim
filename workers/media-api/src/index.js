/**
 * Aul Bilim media upload API — Cloudflare Worker + R2.
 * POST /upload with Firebase ID token and multipart file field.
 */

const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

let jwksCache = null;
let jwksFetchedAt = 0;

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data, status, extraHeaders) {
  return new Response(JSON.stringify(data), Object.assign({
    status: status || 200,
    headers: { 'Content-Type': 'application/json' },
  }, extraHeaders || {}));
}

function base64UrlToUint8Array(str) {
  const pad = '='.repeat((4 - (str.length % 4)) % 4);
  const b64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function getJWKS() {
  const now = Date.now();
  if (jwksCache && now - jwksFetchedAt < 3600000) return jwksCache;
  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error('JWKS fetch failed');
  jwksCache = await res.json();
  jwksFetchedAt = now;
  return jwksCache;
}

async function importRsaKey(jwk) {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
}

async function verifyFirebaseToken(token, projectId) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');

  const header = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(parts[0])));
  const payload = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(parts[1])));
  const now = Math.floor(Date.now() / 1000);

  if (!payload.exp || payload.exp < now) throw new Error('Token expired');
  if (payload.aud !== projectId) throw new Error('Invalid audience');
  if (payload.iss !== 'https://securetoken.google.com/' + projectId) throw new Error('Invalid issuer');

  const jwks = await getJWKS();
  const jwk = (jwks.keys || []).find(function (k) { return k.kid === header.kid; });
  if (!jwk) throw new Error('Signing key not found');

  const key = await importRsaKey(jwk);
  const valid = await crypto.subtle.verify(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    base64UrlToUint8Array(parts[2]),
    new TextEncoder().encode(parts[0] + '.' + parts[1])
  );
  if (!valid) throw new Error('Invalid signature');
  return payload;
}

function sanitizeFolder(folder) {
  const raw = String(folder || 'general').trim().toLowerCase();
  const clean = raw.replace(/[^a-z0-9/_-]+/g, '-').replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
  return clean || 'general';
}

function extForType(type) {
  if (type === 'image/jpeg') return 'jpg';
  if (type === 'image/png') return 'png';
  if (type === 'image/avif') return 'avif';
  return 'webp';
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '*';
    const cors = { headers: corsHeaders(origin) };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors.headers });
    }

    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/upload') {
      return json({ error: 'Not found' }, 404, cors);
    }

    const projectId = env.FIREBASE_PROJECT_ID;
    const publicBase = (env.PUBLIC_MEDIA_BASE_URL || '').replace(/\/$/, '');
    if (!projectId || projectId === 'YOUR_FIREBASE_PROJECT_ID') {
      return json({ error: 'Worker FIREBASE_PROJECT_ID not configured' }, 500, cors);
    }
    if (!publicBase || publicBase === 'https://media.example.com') {
      return json({ error: 'Worker PUBLIC_MEDIA_BASE_URL not configured' }, 500, cors);
    }

    const auth = request.headers.get('Authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) {
      return json({ error: 'Missing Authorization bearer token' }, 401, cors);
    }

    try {
      await verifyFirebaseToken(token, projectId);
    } catch (err) {
      return json({ error: 'Unauthorized', detail: err.message }, 401, cors);
    }

    let form;
    try {
      form = await request.formData();
    } catch (e) {
      return json({ error: 'Expected multipart/form-data' }, 400, cors);
    }

    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return json({ error: 'Missing file field' }, 400, cors);
    }

    const contentType = file.type || 'application/octet-stream';
    if (!ALLOWED_TYPES.has(contentType)) {
      return json({ error: 'Unsupported image type. Use JPEG, PNG, WebP, or AVIF.' }, 400, cors);
    }

    const size = file.size || 0;
    if (size > MAX_BYTES) {
      return json({ error: 'File too large (max 15 MB)' }, 400, cors);
    }

    const folder = sanitizeFolder(form.get('folder'));
    const ext = extForType(contentType);
    const key = 'uploads/' + folder + '/' + crypto.randomUUID() + '.' + ext;

    await env.MEDIA_BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: contentType },
    });

    const publicUrl = publicBase + '/' + key;
    return json({
      url: publicUrl,
      key: key,
      contentType: contentType,
      size: size,
    }, 200, cors);
  },
};
