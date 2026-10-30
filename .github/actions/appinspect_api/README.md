# App Inspect

The caller must select Node.js 24.22.1 or a newer patched 24.x version first.
This composite action uses that executable rather than the runner's separately
bundled JavaScript-action runtime. It fails before network access on other versions.

Use the existing `filePath`, `splunkUser`, `splunkPassword`, `includedTags` and
`excludedTags` inputs. HTTP errors, missing reports and inspection failures fail
the action. Warnings and manual checks are logged for review.

Run `npm ci` and `npm run all` in this directory to test and rebuild `dist/`.
Tests use mocked HTTP responses and do not contact Splunk.
