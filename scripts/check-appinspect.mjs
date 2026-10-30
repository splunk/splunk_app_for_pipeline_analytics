import { readFileSync } from 'node:fs';
import { assertReportPassed } from '../.github/actions/appinspect_api/lib/validation.js';

const report = JSON.parse(readFileSync(process.argv[2] ?? 'appinspect_result.json', 'utf8'));
console.log(JSON.stringify(report.summary, null, 2));
assertReportPassed(report);
const selectedTags = report.reports[0].run_parameters?.included_tags ?? [];
if (!['cloud', 'splunk_appinspect'].every((tag) => selectedTags.includes(tag))) {
    throw new Error('AppInspect must run both cloud and splunk_appinspect checks');
}
console.log('No AppInspect errors or failures. Review warnings and manual checks before publication.');
