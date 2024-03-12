
<template>
    <div>
        <form>
            <div>
                <div>账号</div>
                <input type="text" v-model="form.username" placeholder="请输入账号">
                <!-- 提示信息 -->
                <div v-if="formErrors.username"> {{ formErrors.username }} </div>
            </div>
            <div>
                <div>密码</div>
                <input type="password" v-model="form.password" placeholder="请输入密码">
                <!-- 提示信息 -->
                <div v-if="formErrors.password"> {{ formErrors.password }} </div>
            </div>
            <!-- TODO ylei 验证码 -->
            <div>
                <div @click="click_login">登录</div>
                <div @click="click_register">注册</div>
                <!-- 提示信息 -->
                <div v-if="formErrors.login"> {{ formErrors.login }} </div>
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
    username: "test01",
    password: "123456",
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
    // 验证用户名必须是字母开头
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
    formErrors.value.username = validateUsername(form.value.username);
    formErrors.value.password = validatePassword(form.value.password);
    // 表单验证不通过终止后续操作
    if (formErrors.value.username || formErrors.value.password) {
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
        // 登录成功后跳转登录页面
        router.push("/");
    }
}
</script>