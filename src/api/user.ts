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


export async function login(payload: LoginPayload): Promise<FetchResponse<User>> {
    const response = await Fetch<User>("user/login").post(payload).json()
    return buildFetchResponse<User>(response)
}


export async function logout(): Promise<FetchResponse<string>> {
    const response = await Fetch<string>("user/logout").get().json()
    return buildFetchResponse<string>(response)
}


export async function readLoginUser(): Promise<FetchResponse<User>> {
    const response = await Fetch<User>("user").get().json()
    return buildFetchResponse<User>(response)
}


export async function register(payload: RegisterPayload): Promise<FetchResponse<User>> {
    const response = await Fetch<User>("user").post(payload).json()
    return buildFetchResponse<User>(response)
}


export async function readAvatar(user_id: string): Promise<FetchResponse<string>> {
    const response = await Fetch<string>("user/avatar/" + user_id).get().json()
    return buildFetchResponse<string>(response)
}


export async function createAvatar(imageBase64: string) {
    const response = await Fetch<string>("user/avatar").post(imageBase64).json();
    return buildFetchResponse<string>(response)
}