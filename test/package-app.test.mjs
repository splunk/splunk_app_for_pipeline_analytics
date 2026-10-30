import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { APP_NAME, packageApp, releaseVersion } from '../scripts/package-app.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));

test('release tags accept only numeric Splunk versions', () => {
    assert.equal(releaseVersion('v0.0.4'), '0.0.4');
    assert.equal(releaseVersion('1.2.3'), '1.2.3');
    for (const value of ['', 'v1', '../1.2.3', '1.2.3;echo bad', '1.2.3\n', '1.2.3-beta']) {
        assert.throws(() => releaseVersion(value));
    }
});

test('package preserves every tracked app file and stamps only the archived configuration', async () => {
    const destination = await mkdtemp(join(tmpdir(), 'pipeline-package-test-'));
    const configPath = `${APP_NAME}/default/app.conf`;
    const originalConfig = await readFile(join(ROOT, configPath), 'utf8');
    try {
        const output = await packageApp('v0.0.4', destination);
        const entries = execFileSync('tar', ['-tzf', output], { encoding: 'utf8' })
            .trim().split('\n').filter((name) => !name.endsWith('/')).sort();
        const tracked = execFileSync('git', ['ls-files', '-z', '--', APP_NAME], { cwd: ROOT, encoding: 'utf8' })
            .split('\0').filter(Boolean).sort();
        assert.deepEqual(entries, tracked);
        for (const entry of entries) {
            const actual = execFileSync('tar', ['-xOzf', output, entry]);
            const original = await readFile(join(ROOT, entry));
            const expected = entry === configPath
                ? Buffer.from(originalConfig.replaceAll('X.Y.Z', '0.0.4')) : original;
            assert.deepEqual(actual, expected, entry);
        }
        assert.equal(await readFile(join(ROOT, configPath), 'utf8'), originalConfig);
    } finally {
        await rm(destination, { recursive: true, force: true });
    }
});
