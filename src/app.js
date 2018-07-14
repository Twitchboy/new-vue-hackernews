import Vue from 'vue'
import App from './App.vue'

/**
 * 导出一个工厂函数，每个用户访问都是创建新的 Vue 实例
 * 防止用户使用共同一个 Vue 实例，防止导致交叉请求状态污染，和内存溢出
 */
export function createApp () {
    const app = new Vue({
        render: h => h(App)
    })

    return { app }
}
