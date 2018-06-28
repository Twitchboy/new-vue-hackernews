# Vue SSR 快读理解和掌握

> 语言，本身就是一个工具。借助工具来实现某种目的的手段。

通过官方 [HackerNews Demo](https://github.com/vuejs/vue-hackernews-2.0/) 项目来快速学习和掌握 Vue SSR 技能。因为 `firebase` 使用的是国外的服务提供商，所以你懂的，科学上网是程序猿的必备条件之一，然后你需要设置终端也得可以科学上网哦！

```bash
export http_proxy=http://<ip>:<prot>
export https_proxy=http://<ip>:<prot>
```
执行上面的命令后，官网的 Demo 就可以好好的运行出来了～

## 开篇识依赖

既然是从项目中学习，首先我们应该大致的了解下项目本身所用到的那些技术、依赖，从而在一个比较高的位置来俯瞰项目的整体来把握项目。目前前端项目基本都是借助 [NPM](https://docs.npmjs.com/) 来进行项目管理。`So` 来看看 `package.json` 这个文件吧。

```json
{
  "name": "vue-hackernews-2.0", // 项目名
  "description": "A Vue.js project",    // 项目描述
  "author": "Evan You <yyx990803@gmail.com>", // 作者
  "private": true, // 不希望在软件包管理器中发布软件包
  "scripts": { // 脚本命令字典
    "dev": "node server",
    "start": "cross-env NODE_ENV=production node server",
    "build": "rimraf dist && npm run build:client && npm run build:server",
    "build:client": "cross-env NODE_ENV=production webpack --config build/webpack.client.config.js --progress --hide-modules",
    "build:server": "cross-env NODE_ENV=production webpack --config build/webpack.server.config.js --progress --hide-modules"
  },
  "engines": { // node 工作版本
    "node": ">=7.0",
    "npm": ">=4.0"
  },
  // 项目依赖
  "dependencies": {
    "compression": "^1.7.1", // 压缩，Node.js 中的压缩中间件
    "cross-env": "^5.1.1", // 跨平台运行和设置环境变量的脚本
    "es6-promise": "^4.1.1", // 轻量级库，提供用于组织异步代码的工具
    "express": "^4.16.2", // 用于 Node 的 Web 服务器框架
    "extract-text-webpack-plugin": "^3.0.2", // 提取到单独的文件，用于提取 css 代码
    "firebase": "4.6.2", // Firebase云消息传递，这里用于获取数据的API
    "lru-cache": "^4.1.1", // LRU 算法缓存方案工具。
    "route-cache": "0.4.3", // Express中间件用于缓存路由
    "serve-favicon": "^2.4.5", // 对网站的 favicon icon 进行缓存，减少频繁请求 icon
    "vue": "^2.5.16",
    "vue-router": "^3.0.1", // Vue 中使用的路由器
    "vue-server-renderer": "^2.5.16", // 用于服务端渲染，服务器渲染 vue 代码
    "vuex": "^3.0.1",  // Vue 的状态管理机
    "vuex-router-sync": "^5.0.0" // 轻松保持vue-router和vuex store同步
  },
  // 开发环境需要的依赖
  "devDependencies": {
    "autoprefixer": "^7.1.6", // CSS 后置处理器，自动添加各个浏览器的 CSS 前缀
    "babel-core": "^6.26.0", // babel编译器核心
    "babel-loader": "^7.1.2", // babel加载器
    "babel-plugin-syntax-dynamic-import": "^6.18.0", // 支持 import() 动态导入
    "babel-preset-env": "^1.6.1", // 环境预设 Babel，使用哪种类型、什么阶段的Babel
    "chokidar": "^1.7.0", // 专门用于文件监控的库
    "css-loader": "^0.28.7",
    "file-loader": "^1.1.5",
    "friendly-errors-webpack-plugin": "^1.6.1", // 可识别某些类型的webpack错误并清理，聚合并优先考虑它们以提供更好的开发者体验。
    "rimraf": "^2.6.2", // 节点的深度删除模块，类似 rm -rf
    "stylus": "^0.54.5",
    "stylus-loader": "^3.0.1",
    "sw-precache-webpack-plugin": "^0.11.4", // webpack 中使用 Service workder 来缓存外部项目依赖
    "url-loader": "^0.6.2", // 将文件加载为`base64`编码的URL
    "vue-loader": "^15.0.0-beta.1",
    "vue-template-compiler": "^2.5.16", // Vue 模板编译器
    "webpack": "^3.8.1",
    "webpack-dev-middleware": "^1.12.0", // 生成一个与 webpack 的 compiler 绑定的中间件，然后在 express 启动的服务 app 中调用这个中间件；对更改的文件进行监控，编译
    "webpack-hot-middleware": "^2.20.0", // 用来进行页面的热重载的
    "webpack-merge": "^4.1.1", // 对 webpack 配置文件进行合并（merge）
    "webpack-node-externals": "^1.6.0" // 排除Webpack软件包中的node_modules，不进行一起编译打包
  }
}

```

### 延伸阅读

1. Service workers 本质上充当Web应用程序与浏览器之间的代理服务器，也可以在网络可用时作为浏览器和网络间的代理。它们旨在（除其他之外）使得能够创建有效的离线体验，拦截网络请求并基于网络是否可用以及更新的资源是否驻留在服务器上来采取适当的动作。他们还允许访问推送通知和后台同步API。

2. `webpack-dev-middleware` 是一个处理静态资源的 `middleware`。`webpack-dev-server`，实际上是一个小型 `Express` 服务器，它也是用 `webpack-dev-middleware` 来处理 `webpack` 编译后的输出。
3. `webpack-hot-middleware` 是一个结合 `webpack-dev-middleware` 使用的`middleware`，它可以实现浏览器的无刷新更新（hot reload）。这也是 `webpack` 文档里常说的 HMR（Hot Module Replacement）。
4. [webpack-dev-middleware 和 webpack-hot-middleware 详细](http://acgtofe.com/posts/2016/02/full-live-reload-for-express-with-webpack)
5. [webpack-dev-middleware 和 webpack-hot-middleware 详细](http://webxiaoma.com/blogs/2017/10/28/webpack-dev-middleware)

`package.json` 也详细介绍完了，那么新建一个项目，把它们全先装上吧～

```bash
# 创建项目并切换到此项目目录
$ mkdir new-vue-hackernews && cd
# 使用 npm 进行管理此项目
$ npm init -f
# 安装依赖
$ npm i express compression cross-env es6-promise extract-text-w
ebpack-plugin@next firebase lru-cache route-cache serve-favicon vue vue-router vue-server-renderer vuex vue
x-router-sync -S
# 安装开发环境需要的依赖
$ npm i autoprefixer babel-core babel-loader babel-plugi
n-syntax-dynamic-import babel-preset-env chokidar css-loader file-loader friendly-errors-webpack-plugi
n rimraf stylus stylus-loader sw-precache-webpack-plugin url-loader vue-loader vue-template-compiler w
ebpack webpack-dev-middleware webpack-hot-middleware webpack-merge webpack-node-externals -D
```
上面需要注意的就是 `extract-text-webpack-plugin` 我们使用的是 `webpack 4.X` 以上的版本，所以需要安装相匹配支持的版本 `extract-text-webpack-plugin@next` 。

## 项目目录结构

```
.
├── LICENSE
├── README.md
├── build   // webpack 配置相关文件夹
│   ├── setup-dev-server.js
│   ├── webpack.base.config.js
│   ├── webpack.client.config.js
│   └── webpack.server.config.js
├── dist // 打包编译后文件存放文件夹
├── manifest.json
├── package.json
├── public // 静态资源文件
├── server.js   // http 服务器文件
└── src     // 源码目录
    ├── App.vue
    ├── api     // API 目录
    │   ├── create-api-client.js
    │   ├── create-api-server.js
    │   └── index.js
    ├── components  // 公共组件
    │   ├── Comment.vue
    │   ├── Item.vue
    │   ├── ProgressBar.vue
    │   └── Spinner.vue
    ├── router  // 路由
    │   └── index.js
    ├── store   // Store 状态管理
    │   ├── actions.js
    │   ├── getters.js
    │   ├── index.js
    │   └── mutations.js
    ├── util    // 工具库
    │   ├── filters.js
    │   └── title.js
    └── views   // 视图
    │   ├── CreateListView.js
    │   ├── ItemList.vue
    │   ├── ItemView.vue
    │   └── UserView.vue
    ├── app.js              // 项目应用入口文件
    ├── entry-client.js     // 客户端入口文件 server 需要使用
    ├── entry-server.js     // 服务端入口文件 server 需要使用
    ├── index.template.html // 模板文件
```

目录结构了解完，按照此目录结构 Copy 一份，然后接下来就是开始照搬还分析了～

项目最终 UI 展现形式观看，然后将此 UI 组织成组件树的形式，以组件为最小单元来划分，脑海里构思和分析一下，然后结合你的组件设计跟项目里的设计由什么不同，想想为什么作者为什么这样设计，然后再结合你的理解，你认为这样设计还有什么更加好的实现方式，打开你的脑洞～

这里是我根据 UI 后对其进行的分层：
![将UI组织成组件树的形式](https://upload-images.jianshu.io/upload_images/735083-42b23318c0297986.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 装备齐全，先来把开发环境准备好

### webpack.base.config.js

```js
/**
 * 通用 webpack 配置文件
 * @fileOverview
 * @author pycoder.Junting
 * @email: 342766475@qq.com
 * @Date: 2018-06-28 20:38:45
 * @Last Modified by: pycoder.Junting
 * @Last Modified time: 2018-06-28 21:40:02
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

```
