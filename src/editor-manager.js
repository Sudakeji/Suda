// src/editor-manager.js
// Manage Monaco models per file and expose open/save operations

const models = new Map(); // id -> model
let editorInstance = null;
let currentId = null;

export function initEditor(containerId, options = {}) {
  if (!window.monaco) {
    console.error('Monaco is not loaded');
    return;
  }
  editorInstance = monaco.editor.create(document.getElementById(containerId), {
    value: options.value || '',
    language: options.language || 'html',
    theme: options.theme || 'vs-dark',
    automaticLayout: true,
    fontSize: options.fontSize || 14,
  });
  return editorInstance;
}

function getLanguageFromName(name) {
  const ext = name.split('.').pop().toLowerCase();
  switch (ext) {
    case 'js': return 'javascript';
    case 'ts': return 'typescript';
    case 'json': return 'json';
    case 'css': return 'css';
    case 'html': return 'html';
    case 'md': return 'markdown';
    default: return 'plaintext';
  }
}

export function createModel(file) {
  if (models.has(file.id)) return models.get(file.id);
  const lang = getLanguageFromName(file.name || file.id);
  const uri = monaco.Uri.parse('inmemory://model/' + encodeURIComponent(file.id));
  const model = monaco.editor.createModel(file.content || '', lang, uri);
  models.set(file.id, model);
  return model;
}

export function openFileInEditor(file) {
  if (!editorInstance) {
    console.error('Editor not initialized');
    return;
  }
  const model = createModel(file);
  editorInstance.setModel(model);
  currentId = file.id;
}

export function getCurrentContent() {
  if (!editorInstance) return '';
  return editorInstance.getValue();
}

export function saveCurrent() {
  if (!currentId) return null;
  const content = getCurrentContent();
  return { id: currentId, content };
}

export function setTheme(theme) {
  if (theme === 'light') monaco.editor.setTheme('vs');
  else if (theme === 'high-contrast') monaco.editor.setTheme('hc-black');
  else monaco.editor.setTheme('vs-dark');
}

export function dispose() {
  for (const m of models.values()) m.dispose();
  models.clear();
  if (editorInstance) editorInstance.dispose();
}
