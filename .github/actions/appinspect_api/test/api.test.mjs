import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { login, submit, getStatus, getReport } from '../lib/api.js';

test('native fetch preserves authentication, multipart bytes and tag inputs', async (t) => {
    const directory = await mkdtemp(join(tmpdir(), 'appinspect-test-'));
    const file = join(directory, 'app.spl');
    const bytes = Buffer.from([0, 1, 2, 255]);
    await writeFile(file, bytes);
    const calls = [];
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        calls.push({ url, options });
        const result = calls.length === 1 ? { data: { token: 'fixture-token' } } : { request_id: 'fixture/id' };
        return new Response(JSON.stringify(result), { status: 200 });
    });
    try {
        const token = await login('fixture-user', 'fixture-password');
        assert.equal(token, 'fixture-token');
        assert.equal(calls[0].options.headers.Authorization, `Basic ${Buffer.from('fixture-user:fixture-password').toString('base64')}`);
        const result = await submit({ filePath: file, token, includedTags: ['cloud'], excludedTags: ['manual'] });
        assert.equal(result.request_id, 'fixture/id');
        const { body, headers } = calls[1].options;
        assert.equal(headers.Authorization, 'Bearer fixture-token');
        assert.equal(headers['Content-Type'], undefined, 'fetch must supply its multipart boundary');
        assert.equal(body.get('included_tags'), 'cloud');
        assert.equal(body.get('excluded_tags'), 'manual');
        assert.equal(body.get('app_package').name, 'app.spl');
        assert.deepEqual(Buffer.from(await body.get('app_package').arrayBuffer()), bytes);
        await getStatus({ request_id: 'fixture/id', token });
        await getReport({ request_id: 'fixture/id', token });
        assert.ok(calls[2].url.endsWith('/status/fixture%2Fid'));
        assert.ok(calls[3].url.endsWith('/report/fixture%2Fid'));
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
});

test('HTTP failures do not expose response bodies', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => new Response('private-response-body', { status: 401 }));
    await assert.rejects(login('fixture-user', 'fixture-password'), (error) => {
        assert.match(error.message, /HTTP status 401/);
        assert.doesNotMatch(error.message, /private-response-body|fixture-password/);
        return true;
    });
});
