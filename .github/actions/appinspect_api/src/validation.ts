import type { ReportResponse } from './api.js';

// Fail before network access if a caller has not selected the patched runtime.
export function assertPatchedRuntime(version: string): void {
    const [major, minor, patch] = version.split('.').map(Number);
    if (!/^\d+\.\d+\.\d+$/.test(version) || major !== 24 || minor < 22 || (minor === 22 && patch < 1)) {
        throw new Error(`AppInspect requires patched Node.js 24.22.1 or later in the 24.x line; got ${version}`);
    }
}

export const splitTags = (value: string): string[] | undefined => {
    const tags = value.split(',').map((tag) => tag.trim()).filter(Boolean);
    return tags.length > 0 ? tags : undefined;
};

export function assertReportPassed(result: ReportResponse): void {
    if (result.reports.length !== 1) {
        throw new Error(`Expected one AppInspect report; received ${result.reports.length}`);
    }
    const summaries = [result.summary, result.reports[0].summary];
    if (summaries.some((summary) => summary.error !== 0 || summary.failure !== 0)) {
        throw new Error('AppInspect reported errors or failures; refusing to release the package');
    }
}
