const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const extractStyle = new ExtractTextPlugin({filename: '[name].[md5:contenthash:hex:20].css'});

const root = path.resolve(__dirname);

module.exports = env => {
    const release = !!env.release;
    const watch = !!env.watch;

    return {
        entry: {
            main: path.resolve(root, 'main.js')
        },
        output: {
            path: path.resolve(root, 'dist'),
            filename: '[name].[chunkhash].js'
        },
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: extractStyle.extract({use: ['css-loader', 'sass-loader']})
                },
                {
                    test: /\.css$/,
                    use: extractStyle.extract({use: ['css-loader']})
                },
                {
                    test: /\.(png|jpg|gif|eot|svg|woff|woff2|ttf)$/,
                    use: [{loader: 'url-loader'}]
                }
            ]
        },
        resolve: {
            modules: [
                root,
                path.resolve(root, '..', 'node_modules')
            ],
            alias: {
                vue: 'vue/dist/vue.js'
            }
        },
        mode: release ? 'production' : 'development',
        watch: watch,
        stats: 'minimal',
        plugins: [
            new CleanWebpackPlugin(path.resolve(root, 'dist')),
            new CopyWebpackPlugin([
                {from: path.resolve(root, 'assets'), to: path.resolve(root, 'dist')}
            ]),
            extractStyle,
            new HtmlWebpackPlugin({
                template: path.resolve(root, 'index.html')
            }),
            new webpack.ProvidePlugin({
                jQuery: 'jquery'
            }),
            new webpack.optimize.SplitChunksPlugin(),
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify(release ? 'production' : 'development')
                },
                BUILD_ENV: JSON.stringify(release ? 'prod' : 'dev')
            })
        ]
    }
};
