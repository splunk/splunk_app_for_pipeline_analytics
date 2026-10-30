import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('CLI gate rejects incomplete tag coverage even when its limited checks pass', () => {
    const directory = mkdtempSync(join(tmpdir(), 'appinspect-report-'));
    const script = fileURLToPath(new URL('../../../../scripts/check-appinspect.mjs', import.meta.url));
    const reportPath = join(directory, 'report.json');
    const summary = { error: 0, failure: 0 };
    try {
        for (const [tags, status] of [[['cloud,splunk_appinspect'], 1], [['cloud'], 1], [['cloud', 'splunk_appinspect'], 0]]) {
            writeFileSync(reportPath, JSON.stringify({ summary, reports: [{ summary, run_parameters: { included_tags: tags } }] }));
            const result = spawnSync(process.execPath, [script, reportPath], { encoding: 'utf8' });
            assert.equal(result.status, status, result.stdout + result.stderr);
        }
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});
