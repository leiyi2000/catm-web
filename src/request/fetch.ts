import { OnFetchErrorContext, UseFetchReturn, createFetch } from '@vueuse/core'

import { Errors } from '../request/errors'


export const Fetch = createFetch({
    baseUrl: import.meta.env.VITE_API_HOST,
    combination: 'overwrite',
    options: {
        timeout: 300,
        async beforeFetch({ options }) {
            return { options }
        },
        /**
         * 当获取数据出错时触发的回调函数
         *
         * @param ctx 错误上下文
         * @returns 返回包含错误信息和原始数据的对象
         */
        onFetchError(ctx): Promise<Partial<OnFetchErrorContext<any, Error>>> | Partial<OnFetchErrorContext<any, Error>> {
            let errorCode: number = 500
            if (ctx.data?.code && Errors.has(ctx.data.code)) {
                errorCode = ctx.data.code
            }
            return {
                error: Errors.get(errorCode),
                data: ctx.data,
            }
        },
    },
})


export interface FetchResponse<T> {
    error: Error | null,
    data: T | null,
}


export function buildFetchResponse<T>(response: UseFetchReturn<any>): FetchResponse<T> {
    const {error, data} = response;
    return {
        error: error.value as Error || null,
        data: data.value as T | null,
    }
}
