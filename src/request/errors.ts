// 所有的错误码映射
export const Errors = new Map<number, Error>([
    [500, Error("服务器正在开小差~~")],
    [102, Error("用户名已被注册")],
    [103, Error("账号或者密码错误")],
    [104, Error("用户未头像为空")],
])
