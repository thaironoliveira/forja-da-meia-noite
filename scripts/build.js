'use strict';
const { mkdirSync, rmSync, copyFileSync } = require('node:fs');
const { resolve } = require('node:path');
const root = resolve(__dirname, '..');
const output = resolve(root, 'dist');
// Publish only explicit public assets, never backend code or configuration.
const publicFiles = [
    'index.html', 'gerador.html', 'pagamento.html',
    'style.css', 'gerador.css', 'pagamento.css',
    'login.js', 'gerador.js', 'pagamento.js', 'canvas2svg.min.js'
];
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
for (const file of publicFiles) copyFileSync(resolve(root, file), resolve(output, file));
