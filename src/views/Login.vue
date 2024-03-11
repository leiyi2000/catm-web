
<template>
    <div>
        <form>
            <div>
                <div>账号</div>
                <input type="text" v-model="form.username" placeholder="请输入账号">
                <!-- 提示信息 -->
                <div v-if="form_errors.username"> {{ form_errors.username }} </div>
            </div>
            <div>
                <div>密码</div>
                <input type="password" v-model="form.password" placeholder="请输入密码">
                <!-- 提示信息 -->
                <div v-if="form_errors.password"> {{ form_errors.password }} </div>
            </div>
            <!-- TODO ylei 验证码 -->
            <div>
                <div @click="login">登录</div>
                <div>注册</div>
                <!-- 提示信息 -->
                <div v-if="form_errors.login"> {{ form_errors.login }} </div>
            </div>
        </form>
    </div>
</template>


<script setup lang="ts">
import type { Ref } from 'vue'
import { ref } from "vue";


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
const form_errors: Ref<FormErrors> = ref({
    username: null,
    password: null,
    login: null,
})
// 动态验证表单
const validate_username = (username: string | null): string | null => {
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
const validate_password = (password: string | null): string | null => {
    if (password === null) {
        return "密码不能为空";
    }
    // 密码必须大于6位
    if (password.length < 6) {
        return "密码必须大于6位";
    }
    return null;
}

const login = () => {
    form_errors.value.username = validate_username(form.value.username);
    form_errors.value.password = validate_password(form.value.password);
    // 获取加密的kid和公钥
}

</script>