import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assertPatchedRuntime, assertReportPassed, splitTags } from '../lib/validation.js';

test('rejects vulnerable or unsupported runtimes before API calls', () => {
    for (const version of ['12.22.12', '24.22.0', '24.21.0', '26.3.0']) {
        assert.throws(() => assertPatchedRuntime(version));
    }
    for (const version of ['24.22.1', '24.22.2', '24.23.0']) {
        assert.doesNotThrow(() => assertPatchedRuntime(version));
    }
});

test('parses independent tag lists and omits blank filters', () => {
    assert.equal(splitTags(' , '), undefined);
    assert.deepEqual(splitTags(' cloud, splunk_appinspect, '), ['cloud', 'splunk_appinspect']);
    assert.deepEqual(splitTags('manual'), ['manual']);
});

test('AppInspect errors, failures and missing reports block release', () => {
    const clean = { error: 0, failure: 0, warning: 1, manual_check: 1 };
    assert.doesNotThrow(() => assertReportPassed({ summary: clean, reports: [{ summary: clean }] }));
    assert.throws(() => assertReportPassed({ summary: clean, reports: [] }));
    assert.throws(() => assertReportPassed({ summary: clean, reports: [{ summary: clean }, { summary: clean }] }));
    for (const field of ['error', 'failure']) {
        assert.throws(() => assertReportPassed({ summary: { ...clean, [field]: 1 }, reports: [{ summary: clean }] }));
        assert.throws(() => assertReportPassed({ summary: clean, reports: [{ summary: { ...clean, [field]: 1 } }] }));
    }
});
