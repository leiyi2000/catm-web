<template>
    <div class="nav">
        <!-- 头像 -->
        <img v-if="user.avatar" :src=user.avatar @click="toggleFeature" alt="头像" class="avatar">
        <!-- 点击下拉菜单 -->
        <div v-if="showFeature">
            <ul>
                <li>上传音乐</li>
                <li @click="toggleUploadAvatar">修改头像</li>
                <li>修改密码</li>
                <li>注销登录</li>
            </ul>
        </div>
        <!-- 搜索框 -->
        <div>
            <input type="text">
        </div>
    </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";

import { getLoginUser, getAvatar } from "../api/user";


interface User {
    id: string | null;
    username: string | null;
    created_at: string | null;
    updated_at: string | null;
    avatar: string;
}

const showFeature: Ref<boolean> = ref(false);
const showUploadAvatar: Ref<boolean> = ref(false);
const user: Ref<User> = ref<User>({
    id: null,
    username: null,
    created_at: null,
    updated_at: null,
    avatar: ""
});

// 点击关闭或者展示功能列表
const toggleFeature = () => {
    showFeature.value = !showFeature.value;
}

const toggleUploadAvatar = () => {
    showUploadAvatar.value = !showUploadAvatar.value;
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
const loadUserAvatar = async (username: string, user_id: string) => {
    const avatarResponse = await getAvatar(user_id); 
    if (avatarResponse.data) {
        user.value.avatar = avatarResponse.data.avatar_base64;
    } else {
        // 根据用户名生成头像
        user.value.avatar = generateAvatar(username);
    }
}

// 加载的时候加载用户信息
const loadLoginUser = async () => {
    const loginUserResponse = await getLoginUser()
    if (loginUserResponse.data) {
        Object.assign(user.value, loginUserResponse.data);
    }
    // 用户头像
    if (user.value.id && user.value.username) {
        await loadUserAvatar(user.value.username, user.value.id);
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
</style>
