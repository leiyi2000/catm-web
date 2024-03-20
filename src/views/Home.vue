<template>
    <Message ref="message"></Message>
    <div class="nav">
        <!-- 头像 -->
        <img v-if="user.avatar" :src=user.avatar @click="toggleFeature" alt="头像" class="avatar">
        <!-- 点击下拉菜单 -->
        <div v-if="state.showFeature">
            <ul>
                <li>上传音乐</li>
                <li @click="toggleUploadAvatar">修改头像</li>
                <li>修改密码</li>
                <li>注销登录</li>
            </ul>
        </div>
        <!-- 搜索框 -->
        <div class="search-box">
            <input type="text" placeholder="搜索">
            <div class="search-box-btn">
                <svg focusable="false" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                </svg>
            </div>
            <div class="search-box-btn">
                <svg focusable="false" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                </svg>
            </div>
        </div>
    </div>
    <div v-if="state.showUploadAvatar" class="upload-box">
        <UploadImage
            :submit="uploadAvatar"
            :height="300"
            :width="300"
            :radius="50"
        >
        </UploadImage>
    </div>
    <div class="bg" v-if="state.showUploadAvatar"></div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";

import Message from "../components/Message.vue";
import UploadImage from "../components/UploadImage.vue";
import { readLoginUser, readAvatar, createAvatar } from "../api/user";


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
}

const message: Ref<any> = ref(null);
const state: Ref<State> = ref({
    showFeature: false,
    showUploadAvatar: false,
})
const user: Ref<User> = ref<User>({
    id: null,
    username: null,
    created_at: null,
    updated_at: null,
    avatar: ""
});

// 点击关闭或者展示功能列表
const toggleFeature = () => {
    state.value.showFeature = !state.value.showFeature;
}

const toggleUploadAvatar = () => {
    console.log(state.value.showUploadAvatar);
    state.value.showUploadAvatar = !state.value.showUploadAvatar;
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
    } else if (avatarResponse.error == null) {
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
    .nav {
        display: flex;
        width: 100vw;
        height: 8vh;
        align-items: center; /* 垂直居中 */
        background-color: #e8a57f;
    }
    .avatar {
        /* 设置头像大小 */
        width: 5vh;
        height: 5vh;
        /* 圆形头像 */
        border-radius: 50%;
        /* 绝对定位，放置到页面右侧 */
        position: absolute;
        right: 1.25rem; /* 距离右侧边缘的距离 */
        cursor: pointer;
    }
    /* 修改头像弹框 */
    .upload-box {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 25rem;
        height: 26rem;;
        position: fixed;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        background: #FFC0CB;
        border-radius: 2%;
    }
    /* 遮盖层 */
    .bg {
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0px;
        left: 0px;
        background: rgb(0, 0, 0, .4);
        z-index: 9998;
    }
    .search-box {
        position: fixed;
        display: flex;
        right: 50%;
        width: 30%;
        height: 5vh;
        align-items: center;
        justify-content: center;
        background-color: #f2f2f2;
        border-radius: 40px;
        padding: 10px 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .search-box input[type="text"] {
        flex: 1;
        border: none;
        background-color: transparent;
        outline: none;
        font-size: 1rem;
        color: #333;
    }
    .search-box-btn {
        width: 5%;
        height: 5%;
        display: flex;
        align-items: center;
        justify-content: center;  
    }
</style>
