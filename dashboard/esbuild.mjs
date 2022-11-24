import { build as esbuild } from 'esbuild';

import { prepareFolder, injectJsFile, baseConfig } from './esbuild-config.mjs';

async function main() {
    prepareFolder();
    injectJsFile();
    await esbuild(baseConfig).catch(() => process.exit(1));
}

main();
