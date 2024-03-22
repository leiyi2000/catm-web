/**
 * storage存储用户信息
 */
import { User } from "../api/user";


enum UserStorageKey {
    username = "username",
    userId = "user_id",
}


export const storeUser = (user: User) => {
    localStorage.setItem(UserStorageKey.username, user.username);
    localStorage.setItem(UserStorageKey.userId, user.id);
}


export const getStoreUser = () => {
    const username = localStorage.getItem(UserStorageKey.username);
    const userId = localStorage.getItem(UserStorageKey.userId);
    return {
        id: userId,
        username: username,
    }
}


export const clearStoreUser = () => {
    localStorage.removeItem(UserStorageKey.username);
    localStorage.removeItem(UserStorageKey.userId);
}