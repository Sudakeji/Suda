// src/preview.js
// Simple previewer: find index.html or NovaStudio_v0.2.html and open in iframe or new window using Blob

export function buildPreviewBlob(files) {
  // Prefer index.html, then NovaStudio_v0.2.html
  const byName = new Map(files.map(f => [f.name || f.id, f]));
  const index = byName.get('index.html') || byName.get('NovaStudio_v0.2.html') || files[0];
  const html = index.content || '<!doctype html><html><body><h1>Preview</h1></body></html>';
  const blob = new Blob([html], { type: 'text/html' });
  return URL.createObjectURL(blob);
}

export function openPreviewWindow(files, name = 'Preview') {
  const url = buildPreviewBlob(files);
  const w = window.open(url, name);
  // Release objectURL after window loads to avoid memory leak
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  return w;
}
