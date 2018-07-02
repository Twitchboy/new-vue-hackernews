const fs = require('fs')
const path = require('path')
const MFS = require('memory-fs') // 生成编译后的文件存入内存中
const webpack = require('webpack')
const chokidar = require('chokidar') //文件监控
const clientConfig = require('./webpack.client.config')
const serverConfig = require('./webpack.server.config')

//读取文件函数，针对 client 编译后的文件
const readFile = (fs, file) => {
    try {
        // 同步读取
        return fs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8')
    } catch (error) {
        console.log('read file fail.')
    }
}

module.exports = function setupDevServer (app, templatePath, cb) {
    let bundle // 编译生成的文件
    let template // 模板文件
    let clientManifest // 客户端生成的 manifest 文件，用于服务端渲染的客户端清单

    let ready
    // 提取 Promise 中的 resolve
    const readPromise = new Promise(resolve => { ready = resolve})
    const update = () => {
        if (bundle && clientManifest) {
            ready()
            cb(bundle, {
                template,
                clientManifest
            })
        }
    }

    // 读取模板文件
    template = fs.readFileSync(templatePath, 'utf-8')
    // 监听模板文件是否有变动，有，重新读取和重新渲染
    chokidar.watch(templatePath).on('change', () => {
        template = fs.readFileSync(templatePath, 'utf-8')
        console.log('index.template.html updated.')
        update()
    })

    // 修改客户端配置以使用热中间件
    clientConfig.entry.app = ['webpack-hot-middleware/client', clientConfig.entry.app]
    clientConfig.output.filename = '[name].js'
    clientConfig.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin() //  在编译出现错误时,来跳过输出阶段。
    )

    // dev middleware
    const clientCompiler = webpack(clientConfig)
    const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
        publicPath: clientConfig.output.publicPath,
        noInfo: true
    })
    app.use(devMiddleware)
    clientCompiler.plugin('done', stats => {
        stats = stats.toJson()
        stats.errors.forEach(err => console.log(err))
        stats.warnings.forEach(err => console.log(err))
        if (stats.errors.length) return
        clientManifest = JSON.parse(readFile(
            devMiddleware.fileSystem,
            'vue-ssr-client-manifest.json'
        ))
        update()
    })

    // hot middleware
    app.use(require('webpack-hot-middleware')(clientCompiler, { heartbeat: 5000 }))

    const serverCompiler = webpack(serverConfig)
    const mfs = new MFS()
    serverCompiler.outputFileSystem = mfs
    serverCompiler.watch({}, (err, stats) => {
        if (err) throw err
        stats = stats.toJson()
        if (stats.errors.length) return

        bundle = JSON.parse(readFile(mfs, 'vue-ssr-server-bundle.json'))
        update()
    })

    return readPromise
}
