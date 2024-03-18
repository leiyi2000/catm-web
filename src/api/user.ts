import { buildFetchResponse, FetchResponse, Fetch } from '../request/fetch'


interface LoginPayload {
    kid: string,
    username: string,
    password: string,
}

interface RegisterPayload {
    kid: string,
    username: string,
    password: string,
}


export interface User {
    id: string,
    username: string,
    created_at: string,
    updated_at: string,
}


export interface UserAvatar {
    avatar_base64: string,
}


export async function login(payload: LoginPayload): Promise<FetchResponse<User>> {
    const response = await Fetch<User>("user/login").post(payload).json()
    return buildFetchResponse<User>(response)
}


export async function getLoginUser(): Promise<FetchResponse<User>> {
    const response = await Fetch<User>("user").get().json()
    return buildFetchResponse<User>(response)
}


export async function register(payload: RegisterPayload): Promise<FetchResponse<User>> {
    const response = await Fetch<User>("user").post(payload).json()
    return buildFetchResponse<User>(response)
}


export async function getAvatar(user_id: string): Promise<FetchResponse<UserAvatar>> {
    const response = await Fetch<User>("user/avatar/" + user_id).get().json()
    return buildFetchResponse<UserAvatar>(response)
}