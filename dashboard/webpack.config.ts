import path from 'path';

import { Configuration, DefinePlugin, ProvidePlugin } from 'webpack';
import 'webpack-dev-server';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyPlugin from 'copy-webpack-plugin';

import { packageVersion, buildTime, releaseInformation } from './../globals';

const config: Configuration = {
    entry: {
        dashboard: './src/ApplicationRenderer.tsx',
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'build'),
        publicPath: '',
        library: 'FIXParserDashboard',
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: { babelrcRoots: ['.', '../'] },
            },
            {
                test: /\.(css|sass|scss)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2,
                            sourceMap: true,
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
            {
                test: /\.jpg$|\.gif$|\.png$|\.mp4$|\.svg$|\.ico$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                },
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json'],
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: './dashboard.css' }),
        new CopyPlugin({
            patterns: [{ from: 'templates' }, { from: 'fonts' }],
        }),
        new DefinePlugin({
            __PACKAGE_VERSION__: JSON.stringify(packageVersion),
            __BUILD_TIME__: JSON.stringify(buildTime),
            __RELEASE_INFORMATION__: JSON.stringify(releaseInformation),
        }),
        new ProvidePlugin({
            process: 'process/browser',
            React: 'react',
        }),
    ],
    context: __dirname,
    devServer: {
        host: '0.0.0.0',
        allowedHosts: 'all',
        port: 8090,
        static: {
            directory: __dirname,
        },
        client: {
            overlay: true,
        },
    },
};

export default config;
