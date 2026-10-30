# Splunk App for Pipeline Analytics
Source for the Splunk App for Pipeline Analytics, a collection of dashboards and knowledge objects used to report on CI/CD performance as well as other aspects of the Software Delivery Lifecycle.

**This is currently an experimental version and is to be used as such**

## Build and validation

Use Node.js **24.22.1** (see `.node-version`), which includes the fix for
[CVE-2026-111497](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases).
The app consists of checked-in Splunk dashboards, configuration and static assets;
there is no React bundle to compile and no root dependency installation is needed.

```sh
npm run lint
npm test
npm run package -- 0.0.4
```

Packaging copies only tracked files under `splunk_app_for_pipeline_analytics/`,
stamps the requested version in the archived `default/app.conf`, and writes
`dist/splunk_app_for_pipeline_analytics.spl`. Source files stay unchanged.
Without a version argument the package uses `0.0.0` for local/PR validation.

The PR workflow validates the archive and runs Splunk AppInspect CLI. A release
tag such as `v0.0.4` additionally runs AppInspect API with the existing
`SPLUNKBASE_USER` and `SPLUNKBASE_PASSWORD` repository secrets. API errors or
inspection failures block GitHub release creation. Warnings and manual checks
still require maintainer review; passing automation is not Splunkbase approval.

The API action uses the patched Node selected by `setup-node` and rejects an
older or unsupported runtime before making API calls. To rebuild its checked-in
bundle after source changes:

```sh
npm ci --prefix .github/actions/appinspect_api
npm run all --prefix .github/actions/appinspect_api
```

Commit the action's `dist/` output with its source and lockfile; CI verifies they
match. No credentials or live API calls are needed for these local tests.
