const helpers = require('./helpers');
const webpack = require('webpack');
const ForkCheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');

module.exports = {
    entry: {
        main: './test-entry.js'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: [
            helpers.root('src'),
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
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader',
                exclude: [
                    helpers.root('node_modules/rxjs'),
                    helpers.root('node_modules/@angular')
                ]
            },
            // rules for modules (configure loaders, parser options, etc.)
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'awesome-typescript-loader',
                        query: {
                            // use inline sourcemaps for 'karma-remap-coverage' reporter
                            sourceMap: false,
                            inlineSourceMap: true,
                            compileOptions: {
                                // Remove Typescript helpers to be injected
                                // below by DefinePlugin
                                removeComments: true
                            }
                        }
                    },
                    {
                        loader: 'angular2-template-loader'
                    }
                ],
                exclude: [/\.e2e\.ts$/]
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
                    'raw-loader',
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
                use: 'raw-loader',
                exclude: [helpers.root('src/index.html')]
            }
        ]
    },
    plugins: [
        new ForkCheckerPlugin(),
        /**
         * Plugin: ContextReplacementPlugin
         * Description: Provides context to Angular's use of System.import
         *
         * See: https://webpack.github.io/docs/list-of-plugins.html#contextreplacementplugin
         * See: https://github.com/angular/angular/issues/11580
         */
        new ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular(\\|\/)core(\\|\/)(@angular|esm5)/,
            helpers.root('src') // location of your src
        ),

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
                }
            }
        })
    ],
    // Webpack Development Server configuration
    // Description: The webpack-dev-server is a little node.js Express server.
    // The server emits information about the compilation state to the client,
    // which reacts to those events.
    //
    // See: https://webpack.github.io/docs/webpack-dev-server.html
    devServer: {
        port: 3000,
        host: 'localhost',
        historyApiFallback: true,
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        }
    },

    // Disable performance hints
    performance: {
        hints: false
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
