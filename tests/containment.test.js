'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { readdirSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { execFileSync } = require('node:child_process');
const { handler } = require('../netlify/functions/comprar-creditos');

test('retired credit grant rejects every request without database access', async () => {
    for (const event of [
        undefined,
        { httpMethod: 'POST', body: '{"email":"victim@example.com","creditosComprados":999999}' },
        { httpMethod: 'POST', body: '{"creditosComprados":-100}' },
        { httpMethod: 'POST', body: '{invalid json' },
        { httpMethod: 'GET', body: null }
    ]) {
        const response = await handler(event);
        assert.equal(response.statusCode, 410);
        assert.equal(response.headers['Cache-Control'], 'no-store');
        assert.equal(typeof JSON.parse(response.body).erro, 'string');
    }
});

test('static publish directory contains only public assets and scripts obey CSP', () => {
    const root = resolve(__dirname, '..');
    execFileSync(process.execPath, ['scripts/build.js'], { cwd: root });
    const files = readdirSync(resolve(root, 'dist'));
    assert.equal(files.length, 10);
    for (const name of files) {
        assert.match(name, /\.(html|css|js)$/);
        if (!name.endsWith('.html')) continue;
        const html = readFileSync(resolve(root, 'dist', name), 'utf8');
        for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
            const src = script[1].match(/src="([^"]+)"/);
            assert.ok(src, `${name}: inline script violates CSP`);
            assert.ok(files.includes(src[1]), `${name}: script missing from publish directory`);
            assert.equal(script[2].trim(), '');
        }
    }
});
