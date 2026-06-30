/*
  Copy to uploads/media-config.js and set your deployed Worker upload URL.

  uploadUrl — full URL to POST /upload (e.g. https://media-api.yourdomain.com/upload)
  publicBaseUrl — optional; must match Worker PUBLIC_MEDIA_BASE_URL if you validate URLs client-side
*/
window.AUL_BILIM_MEDIA_CONFIG = {
  uploadUrl: 'https://media-api.example.com/upload',
  publicBaseUrl: 'https://media.example.com'
};
