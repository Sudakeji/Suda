// src/workspace.js
// Workspace: in-memory file model + persistence via storage.js
import * as storage from './src/storage.js';

const Workspace = {
  files: new Map(), // id -> file
  listeners: new Set(),

  async init() {
    const list = await storage.getAllFiles();
    if (list && list.length) {
      for (const f of list) {
        this.files.set(f.id, f);
      }
    } else {
      // seed with a starter project
      const starter = [
        {
          id: 'NovaStudio_v0.2.html',
          name: 'NovaStudio_v0.2.html',
          content: `<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>Nova Studio</title></head><body><h1>Nova Studio v0.2</h1></body></html>`,
          mtime: Date.now(),
        },
        { id: 'index.html', name: 'index.html', content: '<!doctype html>\n<html><body><h1>Preview</h1></body></html>', mtime: Date.now() },
        { id: 'main.js', name: 'main.js', content: "console.log('hello');", mtime: Date.now() },
        { id: 'style.css', name: 'style.css', content: 'body { font-family: Arial; }', mtime: Date.now() },
      ];
      for (const f of starter) {
        this.files.set(f.id, f);
        await storage.saveFile(f);
      }
    }
    this._emit();
  },

  list() {
    return Array.from(this.files.values()).sort((a, b) => a.name.localeCompare(b.name));
  },

  async createFile(name, content = '') {
    const id = name; // simple id; in real FS use path/uuid
    const file = { id, name, content, mtime: Date.now() };
    this.files.set(id, file);
    await storage.saveFile(file);
    this._emit();
    return file;
  },

  async saveFile(id, content) {
    const file = this.files.get(id);
    if (!file) return null;
    file.content = content;
    file.mtime = Date.now();
    await storage.saveFile(file);
    this._emit();
    return file;
  },

  getFile(id) {
    return this.files.get(id) || null;
  },

  async deleteFile(id) {
    if (!this.files.has(id)) return;
    this.files.delete(id);
    await storage.deleteFile(id);
    this._emit();
  },

  async renameFile(id, newName) {
    const file = this.files.get(id);
    if (!file) return null;
    this.files.delete(id);
    file.id = newName;
    file.name = newName;
    file.mtime = Date.now();
    this.files.set(file.id, file);
    await storage.saveFile(file);
    this._emit();
    return file;
  },

  onDidChange(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  },

  _emit() {
    for (const cb of this.listeners) cb(this.list());
  }
};

export default Workspace;
