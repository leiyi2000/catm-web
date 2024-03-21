import { createRouter, createWebHistory } from "vue-router";


const routes = [
    {
        path: "/",
        name: "home",
        component: () => import("../views/Home.vue")
    },
    // {
    //     path: "/test",
    //     name: "test",
    //     component: () => import("../components/Message.vue")
    // },
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

export default router