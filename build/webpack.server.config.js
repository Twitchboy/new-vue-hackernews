const webpack = require('webpack')
const merge = require('webpack-merge')
const base = require('./webpack.base.config')
const nodeExternals = require('webpack-node-externals')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')

module.exports = merge(base, {
    target: 'node', // 指定运行环境为 node
    devtool: '#source-map', // 映射原始源代码
    entry: './src/entry-server.js',
    output: {
        filename: 'server-bundle.js', // 因为是运行在服务端，不使用浏览器缓存机制，所以没必要生成带有 hash 名称去区分
        libraryTarget: 'commonjs2' // 使用 CommonJS 规范
    },
    resolve: {
        alias: {
        }
    },
    externals: nodeExternals({
        // 从依赖中导入的 CSS 文件，不需要一起打包
        whitelist: /\.css$/
    }),
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.env.VUE_ENV': '"server"' // 后续服务端渲染时用的上
        }),
        new VueSSRServerPlugin()
    ]
})
