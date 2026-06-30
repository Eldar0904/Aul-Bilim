# Aul Bilim media API (Cloudflare Worker + R2)

Secure image upload endpoint for the admin CMS. Files are stored in R2; the admin saves public URLs in Firestore as before.

## Prerequisites

- Cloudflare account with R2 enabled
- Firebase project (same as `uploads/firebase-config.js`)
- Wrangler CLI: `npm install` in this folder

## 1. Create R2 bucket

1. Cloudflare dashboard → **R2** → **Create bucket** → name: `aulbilim-media`
2. Enable public access:
   - **R2.dev subdomain** (quick start), or
   - **Custom domain** (recommended), e.g. `media.yourdomain.com`

Note the public base URL (e.g. `https://pub-xxxx.r2.dev` or `https://media.yourdomain.com`).

## 2. Configure Worker

Edit `wrangler.toml`:

```toml
[vars]
FIREBASE_PROJECT_ID = "your-firebase-project-id"
PUBLIC_MEDIA_BASE_URL = "https://media.yourdomain.com"
```

## 3. Deploy

```bash
cd workers/media-api
npm install
npx wrangler deploy
```

After deploy, note the Worker URL (e.g. `https://aulbilim-media-api.your-subdomain.workers.dev`).

Optional: add a **route** in Cloudflare so the Worker is available at `https://media-api.yourdomain.com/*`.

## 4. Configure admin (browser)

```bash
cp uploads/media-config.example.js uploads/media-config.js
```

Set in `uploads/media-config.js`:

```js
window.AUL_BILIM_MEDIA_CONFIG = {
  uploadUrl: 'https://aulbilim-media-api.your-subdomain.workers.dev/upload',
  publicBaseUrl: 'https://media.yourdomain.com'
};
```

## API

### `POST /upload`

- **Auth:** `Authorization: Bearer <Firebase ID token>` (from admin login)
- **Body:** `multipart/form-data`
  - `file` — image (JPEG, PNG, WebP, AVIF; max 15 MB)
  - `folder` — optional path segment (e.g. `pages/home-hero`, `schools/kostanay/school-id`)
- **Response:** `{ url, key, contentType, size }`

### CORS

The Worker reflects the request `Origin` header. For production, restrict origins in `src/index.js` if needed.

## Client-side optimization

`uploads/media-upload.js` resizes images to WebP before upload:

| Context | Max dimension |
|---------|----------------|
| Hero / program banners | 1920 px |
| Page cards / carousels | 1200 px |
| School hero / gallery | 1600 px |

## Security

- R2 credentials never reach the browser
- Only authenticated Firebase users can upload
- File type and size are validated on the Worker

## Local development

```bash
npx wrangler dev
```

Use the local Worker URL in `uploads/media-config.js` while testing admin uploads.
