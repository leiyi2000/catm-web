import { Ref } from 'vue';

import { get } from '../request/fetch'
import Message from "../components/Message.vue";


interface PublicKey {
    kid: string,
    public_key: string,
}


/**
 * 获取公钥
 *
 * @returns 包含错误信息和公钥数据的对象
 */
export async function getPublicKey(message?: Ref<InstanceType<typeof Message> | undefined | null>) {
    return await get<PublicKey>("rsa", message);
}