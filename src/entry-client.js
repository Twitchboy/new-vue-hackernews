import { createApp } from './app'

// 客户端 entry 只需创建应用程序，并且将其挂载到 DOM 中：
const { app } = createApp()

// 挂载在 App.vue 模板中根元素 ‘id = app’ 的元素上
app.$mount('#app')
