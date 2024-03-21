<template>
    <Message ref="message"></Message>
    <div class="main-box">
        <div class="nav">
            <!-- 头像 -->
            <img v-if="user.avatar" :src=user.avatar @click="toggleFeature" alt="头像" class="avatar">
            <button v-if="!user.id" class="btn-login" @click="clickLogin">登录</button>
            <!-- 点击下拉菜单 -->
            <div v-if="state.showFeature" class="feature-box">
                <div>上传音乐</div>
                <div @click="toggleUploadAvatar">修改头像</div>
                <div>修改密码</div>
                <div @click="clickLogout">退出登录</div>
            </div>
            <!-- 搜索框 -->
            <div class="search-box">
                <input v-model="searchInputText" @input="changeInput" @keyup.enter="search" type="text" placeholder="歌名、歌手">
                <div class="search-box-btn">
                    <svg @click="clearInputText" class="visible"  focusable="false" viewBox="0 0 24 24" preserveAspectRatio="none">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                    </svg>
                    <svg @click="search" focusable="false" viewBox="0 0 24 24" preserveAspectRatio="none">
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                    </svg>
                </div>
            </div>
        </div>
        
        <div class="pop-box">
            <!-- 上传头像 -->
            <div v-show="state.showUploadAvatar" class="upload-box">
                <UploadImage
                    :submit="uploadAvatar"
                    :height="300"
                    :width="300"
                    :radius="50"
                >
                </UploadImage>
            </div>
            <!-- 登录 -->
            <div class="login-box" v-show="state.showLogin">
                <Login
                    :username="''"
                    :mode="'login'"
                ></Login>
            </div>
        </div>
        <div class="bg" v-if="state.showUploadAvatar || state.showLogin"></div>
    </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";

import Login from "../components/Login.vue";
import Message from "../components/Message.vue";
import UploadImage from "../components/UploadImage.vue";
import { readLoginUser, readAvatar, createAvatar, logout } from "../api/user";


interface User {
    id: string | null;
    username: string | null;
    created_at: string | null;
    updated_at: string | null;
    avatar: string;
}

interface State {
    // 控制是否点击头像展示功能列表
    showFeature: boolean;
    // 控制点击修改按钮, 弹出头像上传组件
    showUploadAvatar: boolean;
    // 是否展示清除按钮, hidden visible
    showInputClear: string;
    // 显示登录
    showLogin: boolean;
}

const message: Ref<InstanceType<typeof Message> | null> = ref(null);
const searchInputText: Ref<null | String> = ref(null);
const state: Ref<State> = ref({
    showFeature: false,
    showUploadAvatar: false,
    showInputClear: "hidden",
    showLogin: false,
})
const user: Ref<User> = ref<User>({
    id: null,
    username: null,
    created_at: null,
    updated_at: null,
    avatar: ""
});

// 搜索 
const search = () => {
    if (searchInputText.value) {
        // TODO ylei 触发搜索
        console.log(searchInputText.value);
    }
}

// 退出登录
const clickLogout = async () => {
    const response = await logout();
    if (response.error && message.value) {
        message.value.showMessage(response.error.message);
    } else {
        // 重新加载页面
        location.reload();
    }
}

// 登录
const clickLogin = () => {
    state.value.showLogin = !state.value.showLogin;
    state.value.showUploadAvatar = false;
}

// 清除数据
const clearInputText = () => {
    searchInputText.value = "";
    state.value.showInputClear = "hidden";
}

// 输入文字时出现清除图片
const changeInput = () => {
    if (searchInputText.value) {
        state.value.showInputClear = "visible";
    } else {
        state.value.showInputClear = "hidden";
    }
}

// 点击关闭或者展示功能列表
const toggleFeature = () => {
    state.value.showFeature = !state.value.showFeature;
}

const toggleUploadAvatar = () => {
    state.value.showUploadAvatar = !state.value.showUploadAvatar;
    state.value.showLogin = false;
}

// 根据用户名生成头像
function generateAvatar(username: string, size: number = 200): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return '';
    }
    canvas.width = size;
    canvas.height = size;
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).slice(-2);
    }
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);
    ctx.font = `${size / 2}px Arial`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(username.charAt(0).toUpperCase(), size / 2, size / 2);
    return canvas.toDataURL();
}

// 加载用户头像
const loadAvatar = async (username: string, user_id: string) => {
    const avatarResponse = await readAvatar(user_id); 
    if (avatarResponse.data) {
        user.value.avatar = avatarResponse.data;
    } else {
        // 根据用户名生成头像
        user.value.avatar = generateAvatar(username);
    }
}

// 加载的时候加载用户信息
const loadLoginUser = async () => {
    const loginUserResponse = await readLoginUser()
    if (loginUserResponse.data) {
        Object.assign(user.value, loginUserResponse.data);
    }
    // 用户头像
    if (user.value.id && user.value.username) {
        await loadAvatar(user.value.username, user.value.id);
    }
}

// 上传头像
const uploadAvatar = async (avatar: string) => {
    const avatarResponse = await createAvatar(avatar);
    if (avatarResponse.error && message.value) {
        // 上传失败弹出消息盒子, 提醒用户
        message.value.showMessage(avatarResponse.error.message);
    } else if (avatarResponse.error == null && message.value) {
        // 上传头像成功z
        message.value.showMessage("上传成功");
        // 刷新页面
        setTimeout(() => {
            location.reload();
        }, 1000)
    }
}

// 加载的时候加载用户信息
onMounted(loadLoginUser);
</script>
<style scoped>
    .main-box {
        background-color: #928a86;
        width: 100vw;
        height: 100vh;
    }
    .nav {
        position: relative;
        display: flex;
        width: 100vw;
        height: 7vh;
        align-items: center; /* 垂直居中 */
        background-color: #e8a57f;
    }
    .pop-box {
        position: absolute;
        height: 93vh;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .login-box {
        width: 30%;
        height: 50%;
        background-image: url("../assets/login/back.png");
        border-radius: 2%;
        z-index: 3;
    }
    /* 修改头像弹框 */
    .upload-box {
        width: 23%;
        height: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 3;
        background: #fff;
        border-radius: 2%;
    }
    .feature-box {
        position: absolute;
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: end;
        top: 100%;
        right: 2%;
        background-color: #fff;
        border-radius: 3%;
        z-index: 5
    }
    .feature-box div {
        width: 10vh;
        height: 5vh;
        line-height: 5vh;
        text-align: center;
        font-size: 1.6vh;
    }
    .feature-box div:hover {
        cursor: pointer;
        border-radius: 10%;
        background-color: #f6efeb;
    }
    .avatar {
        /* 设置头像大小 */
        width: 5vh;
        height: 5vh;
        /* 圆形头像 */
        border-radius: 50%;
        /* 绝对定位，放置到页面右侧 */
        position: absolute;
        right: 2%; /* 距离右侧边缘的距离 */
        cursor: pointer;
    }
    .btn-login {
        width: 5vh;
        height: 5vh;
        border-radius: 50%;
        /* 绝对定位，放置到页面右侧 */
        position: absolute;
        right: 2%; /* 距离右侧边缘的距离 */
        cursor: pointer;
        border: none;
        font-size: 1.5vh;
        background-color: #e2bcbc;
    }
    .search-box {
        width: 30%;
        height: 65%;
        right: 35%;
        display: flex;
        align-items: center;
        position: absolute;
        justify-content: space-between;
        background-color: #f2f2f2;
        border-radius: 40px;
        padding: 1% 1.1%;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .search-box input {
        width: 90%;
        border: none;
        outline: none;
        color: #333;
        font-size: 2vh;
        background-color: transparent;
    }
    .search-box input::-webkit-input-placeholder {
        font-size: 1.5vh;
    }
    .search-box-btn {
        width: 6vh;
        display: flex;
        align-items: center;
        justify-content: center;  
    }
    .search-box-btn svg {
        width: 100%;
        height: 100%;
        cursor: pointer;
    }
    .visible {
        visibility: v-bind(state.showInputClear);
    }
    /* 遮盖层 */
    .bg {
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0px;
        left: 0px;
        background: rgb(0, 0, 0, .4);
        z-index: 2;
    }
</style>
