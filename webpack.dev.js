const helpers = require('./helpers');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');

module.exports = {
    entry: {
        main: './demo-app/main.ts'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: [
            helpers.root('src'),
            helpers.root('demo-app'),
            helpers.root('node_modules')
        ]
    },
    devtool: 'source-map',
    output: {
        path: helpers.root('dist'),
        filename: '[name].js',
        sourceMapFilename: '[name].map',
        chunkFilename: '[id].chunk.js'
    },
    module: {
        // configuration regarding modules

        rules: [
        // rules for modules (configure loaders, parser options, etc.)
            {
                test: /\.ts$/,
                exclude: [
                    /\.(spec|e2e)\.ts$/,
                    /node_modules/
                ],
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: helpers.root('tsconfig.json'),
                            transpileOnly: true
                        }
                    },
                    'angular2-template-loader'
                ]
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'semantic-ui-less-module-loader'
                ],
                include: [/[\/\\]node_modules[\/\\]semantic-ui-less[\/\\]/]
            },
            {
                test: /.less$/,
                use: [
                    'to-string-loader',
                    'css-loader',
                    'less-loader'
                ],
                include: [/src[\/\\]/]
            },
            {
                test: /.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader'
                ],
                exclude: [
                    /node_modules/,
                    /src[\/\\]/]
            },
            {
                test: /\.html$/,
                use: 'html-loader',
                exclude: [helpers.root('src/index.html')]
            },
            {
                test: /\.(png|jpg)$/,
                use: 'file-loader?name=images/[name].[hash].[ext]'
            },
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                use: 'file-loader?name=fonts/[name].[hash].[ext]&mimetype=application/font-woff'
            },
            {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                use: 'file-loader?name=fonts/[name].[hash].[ext]&mimetype=application/font-woff'
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                use: 'file-loader?name=fonts/[name].[hash].[ext]&mimetype=application/octet-stream'
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                use: 'file-loader?name=fonts/[name].[hash].[ext]'
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: 'file-loader?name=images/[name].[hash].[ext]&mimetype=image/svg+xml'
            }
        ]
    },
    plugins: [
        /**
         * Plugin: ContextReplacementPlugin
         * Description: Provides context to Angular's use of System.import
         *
         * See: https://webpack.github.io/docs/list-of-plugins.html#contextreplacementplugin
         * See: https://github.com/angular/angular/issues/11580
         */
        // new ContextReplacementPlugin(
        //     // The (\\|\/) piece accounts for path separators in *nix and Windows
        //     /angular(\\|\/)core(\\|\/)(@angular|esm5)/,
        //     helpers.root('src') // location of your src
        // ),

        new CleanWebpackPlugin(),

        // Plugin: HtmlWebpackPlugin
        // Description: Simplifies creation of HTML files to serve your webpack bundles.
        // This is especially useful for webpack bundles that include a hash in the filename
        // which changes every compilation.
        //
        // See: https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
            template: 'demo-app/index.html',
            title: 'test',
            chunksSortMode: 'dependency',
            inject: 'body'
        }),

        new webpack.LoaderOptionsPlugin({
            // switch loader to debug mode
            debug: true,
            options: {
                // Static analysis linter for TypeScript advanced options configuration
                // Description: An extensible linter for the TypeScript language.
                //
                // See: https://github.com/wbuchwalter/tslint-loader
                tslint: {
                    emitErrors: false,
                    failOnHint: false,
                    resourcePath: 'src'
                },
                semanticUiLessModuleLoader: {
                    siteFolder: helpers.root('site')
                }
            }
        }),
    ],
    // Webpack Development Server configuration
    // Description: The webpack-dev-server is a little node.js Express server.
    // The server emits information about the compilation state to the client,
    // which reacts to those events.
    //
    // See: https://webpack.github.io/docs/webpack-dev-server.html
    devServer: {
        port: 3000,
        host: '0.0.0.0',
        historyApiFallback: true,
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        }
    },

    node: {
        global: true,
        crypto: 'empty',
        process: true,
        module: false,
        clearImmediate: false,
        setImmediate: false
    }
};
