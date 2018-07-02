const fs = require('fs')
const path = require('path')
const express = require('express')
const LRU = require('lru-cache')
const { createBundleRenderer } = require('vue-server-renderer')

const isProd = process.env.NODE_ENV === 'production'
const template = fs.readFileSync('./src/index.template.html', 'utf-8')
const serverBundle = require('./dist/vue-ssr-server-bundle.json')
const clientManifest = require('./dist/vue-ssr-client-manifest.json')

function createRenderer(bundle, options) {
    return createBundleRenderer(bundle, Object.assign(options, {
        runInNewContext: false, // // 关闭每次渲染都要重新创建一个上下文，减少性能开销
    }))
}

const app = express()

// 静态资源文件设置函数，生产环境上并设置缓存时间
const serve = (path, cache) => express.static(resolve(path), {
    maxAge: cache && isProd ? 1000 * 60 * 60 * 24 * 30 : 0
})

app.use('/dist', serve('./dist', true))

app.get('*', (req, res) => {
    const context = {
        title: 'Vue ssr hackerNews',
        meta: `
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
        `,
        url: req.url
    }

    createRenderer(serverBundle, { template,
        clientManifest }).renderToString(context, (err, html) => {
        if (err) {
            if (err.code === 404) {
              res.status(404).end('Page not found')
            } else {
              res.status(500).end('Internal Server Error')
            }
          } else {
            res.end(html)
          }
    })
})

const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`Server is running at http://127.0.0.1:${port}`)
})
