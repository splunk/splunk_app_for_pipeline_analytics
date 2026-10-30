import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP_NAME = 'splunk_app_for_pipeline_analytics';
const ROOT = fileURLToPath(new URL('../', import.meta.url));

export function releaseVersion(value) {
    const version = value.replace(/^v/, '');
    if (!/^\d+\.\d+\.\d+$/.test(version) || version.trim() !== version) {
        throw new Error('Version must be MAJOR.MINOR.PATCH, optionally prefixed with v');
    }
    return version;
}

export const versionedConfig = (content, version) => content.replaceAll('X.Y.Z', releaseVersion(version));

// Stage only tracked app files. Build tooling, local files and credentials never enter the archive.
export async function packageApp(version, outputDirectory = resolve(ROOT, 'dist')) {
    const normalizedVersion = releaseVersion(version);
    const files = execFileSync('git', ['ls-files', '-z', '--', APP_NAME], { cwd: ROOT, encoding: 'utf8' })
        .split('\0').filter(Boolean);
    if (!files.includes(`${APP_NAME}/default/app.conf`)) {
        throw new Error('The tracked app manifest is missing default/app.conf');
    }
    const stage = await mkdtemp(join(tmpdir(), 'pipeline-analytics-'));
    try {
        await Promise.all(files.map(async (file) => {
            const original = await readFile(resolve(ROOT, file));
            const content = file === `${APP_NAME}/default/app.conf`
                ? versionedConfig(original.toString('utf8'), normalizedVersion) : original;
            const destination = join(stage, file);
            await mkdir(dirname(destination), { recursive: true });
            await writeFile(destination, content, { mode: 0o644 });
        }));
        await mkdir(outputDirectory, { recursive: true });
        const output = resolve(outputDirectory, `${APP_NAME}.spl`);
        // Prevent macOS extended attributes from becoming extra archive members.
        execFileSync('tar', ['-czf', output, '-C', stage, APP_NAME], {
            env: { ...process.env, COPYFILE_DISABLE: '1' },
        });
        return output;
    } finally {
        await rm(stage, { recursive: true, force: true });
    }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    console.log(await packageApp(process.argv[2] ?? '0.0.0'));
}
