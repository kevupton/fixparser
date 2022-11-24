import { resolve } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

import chalk from 'chalk';
import moment from 'moment';
import { copy } from 'esbuild-plugin-copy';
import { clean } from 'esbuild-plugin-clean';
import sassPlugin from 'esbuild-plugin-sass';

import { packageVersion, buildTime, releaseInformation } from './../globals.js';

export const publicDir = './public';
export const publicOutputDir = './build';
export const publicOutFile = 'dashboard.js';
export const srcHtmlFile = './src/index.html';
export const destinationHTML = `${publicOutputDir}/index.html`;

export const baseConfig = {
    entryPoints: ['./src/ApplicationRenderer.tsx'],
    platform: 'browser',
    bundle: true,
    minify: true,
    loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.woff': 'file',
        '.woff2': 'file',
    },
    tsconfig: './tsconfig.json',
    outfile: `${publicOutputDir}/${publicOutFile}`,
    define: {
        'process.env.NODE_ENV': '"development"',
        __PACKAGE_VERSION__: JSON.stringify(packageVersion),
        __BUILD_TIME__: JSON.stringify(buildTime),
        __RELEASE_INFORMATION__: JSON.stringify(releaseInformation),
    },
    plugins: [
        sassPlugin({
            customSassOptions: {
                loadPaths: [resolve('./node_modules')],
            },
        }),
        clean({
            patterns: ['build/*', `!${destinationHTML}`],
            sync: true,
            verbose: false,
        }),
        copy({
            resolveFrom: 'cwd',
            assets: {
                from: [`${publicDir}/**/*`],
                to: [`${publicOutputDir}`],
                keepStructure: true,
            },
        }),
    ],
};

export const prepareFolder = () => {
    !existsSync(`${publicOutputDir}/`) && mkdirSync(`${publicOutputDir}/`);
};

export const injectJsFile = () => {
    try {
        const str = readFileSync(srcHtmlFile)
            .toString()
            .replace(/<\/body>/, `\t<script src="${publicOutFile}"></script>\n\t<\/body>`);

        writeFileSync(destinationHTML, str);
        const message = `injected script based on ${publicOutFile} file into ${destinationHTML}`;
        console.log(`[${chalk.grey(moment().format('h:mm:ss A'))}] injector: ${chalk.green(message)}`);
    } catch (error) {
        const message = `error while injecting script based on ${publicOutFile} file into ${destinationHTML}`;
        console.log(`[${chalk.grey(moment().format('h:mm:ss A'))}] injector: ${chalk.red(message)}`);
    }
};
