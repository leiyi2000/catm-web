import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index'
import 'default-passive-events'


createApp(App).use(router).mount('#app')
