import 'default-passive-events'
import { createApp } from 'vue'


import './style.css'
import App from './App.vue'
import router from './router/index'
import Message from './components/Message.vue'


createApp(App).use(router).component("Message", Message).mount('#app')
