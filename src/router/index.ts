import { createRouter, createWebHistory } from "vue-router";


const routes = [
    {
        path: "/",
        name: "login",
        component: () => import("../views/Login.vue")
    },
    {
        path: "/login",
        redirect: "/"
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

export default router