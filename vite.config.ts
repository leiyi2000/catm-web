import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        hmr:true,
        port: 8081,
        open: true,
        proxy:{
            "/api": { 
                target: "http://127.0.0.1:8000",
                changeOrigin: true, // 允许跨域
                secure: false,  //忽略安全证书
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    }
})
