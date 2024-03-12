import { Fetch, FetchResponse, buildFetchResponse } from '../request/fetch'


interface PublicKey {
    kid: string,
    public_key: string,
}


/**
 * 获取公钥
 *
 * @returns 包含错误信息和公钥数据的对象
 */
export async function getPublicKey(): Promise<FetchResponse<PublicKey>> {
    const response = await Fetch<PublicKey>("rsa").get().json()
    return buildFetchResponse<PublicKey>(response);
}