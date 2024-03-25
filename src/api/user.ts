import { Ref } from 'vue';

import { post, get } from '../request/fetch'
import Message from "../components/Message.vue";


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


export async function login(payload: LoginPayload, message?: Ref<InstanceType<typeof Message> | undefined | null>) {
    return await post<User>("user/login", payload, message);
}

export async function logout(message?: Ref<InstanceType<typeof Message> | undefined | null>) {
    return await get<User>("user/logout", message=message);
}


export async function readLoginUser(message?: Ref<InstanceType<typeof Message> | undefined | null>) {
    return await get<User>("user", message);
}


export async function register(payload: RegisterPayload, message?: Ref<InstanceType<typeof Message> | undefined | null>) {
    return post<User>("user", payload, message);
}


export async function readAvatar(user_id: string, message?: Ref<InstanceType<typeof Message> | undefined | null>) {
    return await get<string>("user/avatar/" + user_id, message);
}


export async function createAvatar(imageBase64: string, message?: Ref<InstanceType<typeof Message> | undefined | null>) {
    return await post<string>("user/avatar", imageBase64, message);
}