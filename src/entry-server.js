import { createApp } from './app'

// 服务器 entry 使用导出函数，并在每次渲染中重复调用此函数。
// 接收上下文，为后面处理一些逻辑
export default context => {
    const { app } = createApp()

    return app
}
