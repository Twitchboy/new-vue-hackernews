/**
 * 通用 webpack 配置文件
 * @fileOverview
 * @author pycoder.Junting
 * @email: 342766475@qq.com
 * @Date: 2018-06-28 20:38:45
 * @Last Modified by: pycoder.Junting
 * @Last Modified time: 2018-06-28 21:39:03
 */
const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')

// 判断当前环境是否是生产环境
const isProd = process.env.NODE_ENV === 'production'

module.exports = {
    //控制是否生成，以及如何生成 source map
    devtool: isProd ? false : '#cheap-module-source-map',
    // 构建后输出目录设置
    output: {
        path: path.resolve(__dirname, '../dist'),
        publicPath:'/dist/',
        filename: '[name].[chunkhash:8].js'
    },
    // 相关解析设置项
    resolve: {
        alias: { // 别名映射
            'public': path.resolve(__dirname, '../public')
        }
    },
    // 处理项目中的不同类型的模块
    module: {
        noParse: /es6-promise\.js$/, // 匹配到 es6-promise.js 文件将不会去解析它
        // 不同类型的模块，不同 loader 规则设置
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    compilerOptions: { // 模板编译器的选项，配合vue-template-compiler 使用
                        preserveWhitespace: false // 去除模板标签之间的空格
                    }
                }
            },
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: ['node_modules'] // 忽略
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'url-loader',
                options: {
                    limit: 10000, // 字节限制 10000 一下的进行 base64
                    name: '[name].[ext]?[hash:8]'
                }
            },
            {
                test: /\.styl(us)?$/,
                use: isProd
                    ? ExtractTextPlugin.extract({ // 生产环境提取 css 单独放入一个 chunk 并压缩
                            use: [
                                {
                                    loader: 'css-loader',
                                    options: { minimize: true }
                                },
                                'stylus-loader'
                            ],
                            fallback: 'vue-style-loader'
                        })
                    : ['vue-style-loader', 'css-loader', 'stylus-loader']
            },
        ]
    },
    // 性能,配置如何展示性能提示,和做一些限制
    performance: {
        maxEntrypointSize: 300000, //入口起点的最大体积 300000 bytes
        hints: isProd ? 'warning' : false // 打开/关闭提示
    },
    // 插件
    plugins: isProd
        ? [ // 生产环境
            new VueLoaderPlugin(),
            new webpack.optimize.UglifyJsPlugin({ // 优化，压缩代码； webpack4.X 开始，压缩称为了 wbepack 内置插件了，不需要再引用了
                uglifyOptions: {
                    compress: { warnings: false }
                }
            }),
            // 提升(hoist)或者预编译所有模块到一个闭包中，提升你的代码在浏览器中的执行速度。此插件仅适用于由 webpack 直接处理的 ES6 模块
            new webpack.optimize.ModuleConcatenationPlugin(),
            new ExtractTextPlugin({ // 提取 CSS
                filename: 'common.[chunkhash:8].css'
            })
          ]
        : [
            new VueLoaderPlugin(),
            new FriendlyErrorsPlugin() //能够更好在终端看到 webapck 运行的警告和错误
          ]
}
