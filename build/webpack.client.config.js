const webpack = require('webpack')
const merge = require('webpack-merge')
const base = require('./webpack.base.config')
// 下面的暂时用不上，先注释了
// const SWPrecachPlugin = require('sw-precache-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin') // 为了测试开发环境，后面删除

const config = merge (base, {
    // target: 'web', // 运行在 web 端
    entry: {
        app: './src/entry-client.js'
    },
    resolve: {
        alias: {
            // 'create-api': './src/api/create-api-client.js' // 暂时也用不上
        }
    },
    plugins: [
        // 定义全局常量，可供编译时使用
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.env.VUE_ENV': '"client"' // 为后续服务端渲染提供
        }),
        // 优化，提取公共代码
        new webpack.optimize.SplitChunksPlugin({
            cacheGroups: {
                commons: {
                    name: 'vender',
                    test: function (module) {
                        return (
                            /node_modules/.test(module.context) &&
                            !/\.css$/.test(module.request)
                        )
                    }
                }
            }
        }),
        // 服务端渲染时使用
        new VueSSRClientPlugin(),
        // 生成 html 入口文件
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, '../src/index.template.html')
        }),
    ]
})

if (process.env.NODE_ENV === 'production') {
    // TODO: 占位
} else {
    // 开启 HRM 时，编译打包的 Chunk 名有一定的限制，不能使用 [chunkhash] 而是需要使用 [hash]
    config.output = {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].[hash:8].js'
    }
    config.devServer = {
        port: 8001, // 端口
        host: '0.0.0.0', // http://127.0.0.1 或者 内网本机IP，这样别人也能访问
        overlay: { // webpack 编译过程中出现错误都显示再网页上
          errors: true
        },
        // historyFallback: {}, // 访问地址不识别的时候，映射到 index
        open: true, // 打开浏览器窗口
        hot: true // 热更新， 组件修改，只更新组件
    }
    config.plugins.push(
        // 实际的模块热加载，其实需要我们自己在前端写代码去定义的，这里 vue-loader 帮我们解决了
        new webpack.HotModuleReplacementPlugin() // 模块热替换插件)
    )
}

module.exports = config
