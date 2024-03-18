
<template>
    <div class="box">
        <form class="form-box">
            <div class="input-box">
                <input class="input-text" type="text" v-model="form.username" placeholder="用户名" oninput="value=value.replace(/[^a-zA-Z0-9]/g, '')">
                <transition name="fade">
                    <div v-if="formErrors.username" class="err_msg"> {{ formErrors.username }} </div>
                </transition>
            </div>
            <div class="input-box">
                <input class="input-text" type="password" v-model="form.password" placeholder=" 密码">
                <transition name="fade">
                    <div v-if="formErrors.password" class="err_msg"> {{ formErrors.password }} </div>
                </transition>
            </div>
            <!-- TODO ylei 验证码 -->
            <div class="input-box">
                <div class="btn-box">
                    <div @click="click_login" class="btn">登录</div>
                    <div @click="click_register" class="btn">注册</div>
                </div>
                <transition name="fade">
                    <div v-if="formErrors.login" class="err_msg"> {{ formErrors.login }} </div>
                </transition>
            </div>
        </form>
    </div>
</template>


<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from 'vue'

import { getPublicKey } from "../api/rsa";
import { login, register } from "../api/user";
import router from "../router";


interface Form {
    username: string | null,
    password: string | null,
}

interface FormErrors {
    username: string | null,
    password: string | null,
    login: string | null,
}
// 表单数据
const form: Ref<Form> = ref({
    username: null,
    password: null,
})
// 收集验证表单的错误
const formErrors: Ref<FormErrors> = ref({
    username: null,
    password: null,
    login: null,
})
// 动态验证表单
const validateUsername = (username: string | null): string | null => {
    if (username === null) {
        return "用户名不能为空";
    }
    // 验证用户名必须是字母开头且只包含字母数字
    if (!/^[a-zA-Z]/.test(username)) {
        return "用户名必须以字母开头";
    }
    // 用户名必须大于3位
    if (username.length < 3) {
        return "用户名必须大于3位";
    }
    return null;
}

// 验证密码
const validatePassword = (password: string | null): string | null => {
    if (password === null) {
        return "密码不能为空";
    }
    // 密码必须大于6位
    if (password.length < 6) {
        return "密码必须大于6位";
    }
    return null;
}

const encrypt = async (password: string): Promise<Array<string>> => {
    // 请求获取rsa
    const publicKeyResponse = await getPublicKey();
    if (publicKeyResponse.error) {
        formErrors.value.login = publicKeyResponse.error.message;
        return ["", ""];
    }
    if (publicKeyResponse.data == null) {
        return ["", ""];
    }
    const { kid, public_key } = publicKeyResponse.data;
    const encoded = new TextEncoder().encode(password);
    const header = "-----BEGIN PUBLIC KEY-----";
    const footer = "-----END PUBLIC KEY-----";
    const base64Data = public_key.replace(header, "").replace(footer, "").trim();
    const binaryData = window.atob(base64Data);
    const publicKeyBytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
        publicKeyBytes[i] = binaryData.charCodeAt(i);
    }
    const key = await window.crypto.subtle.importKey(
        "spki",
        publicKeyBytes.buffer,
        { 
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        false,
        ["encrypt"]
    );
    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: 'RSA-OAEP'
        },
        key,
        encoded
    );
    // 转为base64
    return [kid, window.btoa(Array.from(new Uint8Array(encrypted)).map(b => String.fromCharCode(b)).join(''))];
};

const validate = (): boolean => {
    // 过滤掉用户名中非字母和数字的字符
    formErrors.value.username = validateUsername(form.value.username);
    // 表单验证不通过终止后续操作
    if (formErrors.value.username) {
        return false;
    }
    formErrors.value.password = validatePassword(form.value.password);
    if (formErrors.value.password) {
        return false;
    }
    return true;
}

const click_login = async () => {
    if (!validate()) {
        return;
    }
    // 密码为空终止后续操作
    if (form.value.password == null) {
        return;
    }
    // 用户名为空终止后续操作
    if (form.value.username == null) {
        return;
    }
    const [kid, password] = await encrypt(form.value.password);
    if (kid === "" || password === "") {
        return;
    }
    const payload = {
        kid: kid,
        username: form.value.username,
        password: password,
    }
    // 请求登录接口
    const loginResponse = await login(payload);
    if (loginResponse.error) {
        formErrors.value.login = loginResponse.error.message;
    } else {
        // 登录成功后跳转
        router.push("/home");
    }
}

const click_register = async () => {
    if (!validate()) {
        return;
    }
    // 密码为空终止后续操作
    if (form.value.password == null) {
        return;
    }
    // 用户名为空终止后续操作
    if (form.value.username == null) {
        return;
    }
    const [kid, password] = await encrypt(form.value.password);
    if (kid === "" || password === "") {
        return;
    }
    const payload = {
        kid: kid,
        username: form.value.username,
        password: password,
    }
    // 请求登录接口
    const registerResponse = await register(payload);
    if (registerResponse.error) {
        formErrors.value.login = registerResponse.error.message;
    } else {
        form.value = {
            username: null,
            password: null,
        };
        formErrors.value = {
            username: null,
            password: null,
            login: null,
        };
        // 注册成功后跳转
        router.push("/");
    }
}
</script>

<style scoped>
    .box {
        display: flex;
        width: 100vw;
        height: 100vh;
        justify-content: center; /* 水平居中 */
        align-items: center; /* 垂直居中 */
        background-image: url("../assets/login/back.png");
        background-size: cover;
        background-position: center;
    }
    .form-box {
        display: flex;
        flex-direction: column;
        justify-content: center; /* 水平居中 */
        align-items: center; /* 垂直居中 */
        width: 40%;
        height: 60%;
        background-image: url("../assets/login/back.png");
        background-size: cover;
        background-position: center;
        border-radius: 0.625rem;
    }
    .input-box{
        width: 35%;
        height: 12%;
    }
    .err_msg {
        width: 100%;
        height: 35%;
        font-size: 0.9rem;
        padding-left: 4%;
    }
    .fade-enter-active, .fade-leave-active {
        transition: opacity 0.5s;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }
    .input-text {
        width: 100%;
        height: 65%;
        padding: 0.625rem;
        font-size: 1rem;
        border-radius: 0.625rem;
        background-color: transparent;
        backdrop-filter: blur(1.5rem);
        border: 0.1rem solid #282626;
        border-bottom: 0.1rem solid #282626;
        outline: none; /* 移除聚焦时的默认轮廓线 */
        transition: border-bottom-width 0.1s; /* 定义边框宽度变化的动画 */
    }
    .input-text:focus {
        border-bottom-width: 0.125rem; /* 聚焦时下边框加粗 */
    }
    .input-text::placeholder {
        color: #282626; /* 占位符颜色 */
        font-size: 0.9rem;
    }
    .btn-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        height: 100%;
        overflow: auto;
    }
    .btn {
        display: flex;
        width: 48%;
        height: 60%;
        justify-content: center;
        align-items: center;
        color:  #282626;
        background-color: #e8a57f;
        border-radius: 0.625rem;
        text-align: center;
        font-size: 1rem;
        border: 0.1rem solid #b58181;
        cursor: pointer;
        text-decoration: none;
        transition: transform 0.3s;
    }
    .btn:active {
        transform: scale(0.95);
    }
</style>