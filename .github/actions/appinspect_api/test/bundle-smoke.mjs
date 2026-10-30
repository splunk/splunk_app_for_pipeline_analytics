import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const directory = mkdtempSync(join(tmpdir(), 'appinspect-bundle-'));
try {
    const missingPackage = join(directory, 'missing.spl');
    const result = spawnSync(process.execPath, ['dist/index.js'], {
        encoding: 'utf8',
        env: { ...process.env, INPUT_FILEPATH: missingPackage, INPUT_SPLUNKUSER: 'fixture', INPUT_SPLUNKPASSWORD: 'fixture' },
    });
    assert.equal(result.status, 1, result.stderr);
    assert.ok(result.stdout.includes(`File ${missingPackage} does not exist`), result.stdout + result.stderr);
    console.log('Bundled action starts and fails safely before login when its package is missing.');
} finally {
    rmSync(directory, { recursive: true, force: true });
}
