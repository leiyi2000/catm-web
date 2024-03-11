import { createFetch } from '@vueuse/core'


const Errors = new Map<number, Error>([
    [500, Error("服务器正在开小差~~")],
])


const rsaFetch = createFetch({
    baseUrl: import.meta.env.VITE_API_HOST + "/rsa",
    combination: 'overwrite',
    options: {
        async beforeFetch({ options }) {
            return { options }
        },
        timeout: 300,
        onFetchError(ctx) {
            let errorCode: number = 500
            if (ctx.response && ctx.data.code && Errors.has(ctx.data.code)) {
                errorCode = ctx.data.code
            }
            return {
                error: Errors.get(errorCode),
                data: ctx.data,
            }
        },
    },
})


