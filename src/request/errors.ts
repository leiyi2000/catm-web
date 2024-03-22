import { clearStoreUser } from "../storage/user";


export class HError {
    message: string;
    handle: Function | null;
    constructor(message: string, handle: Function | null = null) {
        this.message = message;
        this.handle = handle;
    }
}

/**
 * 清理localStorage用户信息
 * @param _ctx 请求信息
 */
export const handle_101 = (_ctx: any) => {
    clearStoreUser();
}

export const DEFAULT_ERROR = new HError("服务器正在开小差~~");
export const Errors = new Map<number, HError>([
    [500, DEFAULT_ERROR],
    [101, new HError("登录信息过期", handle_101)],
    [102, new HError("用户名已被注册")],
    [103, new HError("账号或者密码错误")],
    [104, new HError("用户未头像为空")],
])
