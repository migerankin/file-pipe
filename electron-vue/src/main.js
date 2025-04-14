import Vue from 'vue'
import App from './App.vue'

// 阻止启动生产消息
Vue.config.productionTip = false

// 创建 Vue 实例
new Vue({
    render: h => h(App)
}).$mount('#app') 