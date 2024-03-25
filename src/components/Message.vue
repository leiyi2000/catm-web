<template>
    <div v-show="visible" class="message-box">
        <span>{{ message }}</span>
    </div>
</template>


<script setup lang="ts">
import { Ref, ref } from 'vue';

import { HError } from '../request/errors'


const message: Ref<string> = ref("");
const visible: Ref<boolean> = ref(false);


/**
 * 显示提示消息
 * @param msg 提示消息
 * @param time 提示时长
 */
const showMessage = (msg: string, time: number = 1000) => {
    visible.value = true;
    message.value = msg;
    setTimeout(() => {
        visible.value = false;
    }, time)
}

/**
 * 消息框错误提示
 * @param error 错误信息
 * @param time 提示时长
 */
const showError = (error: HError, time: number = 1000) => {
    visible.value = true;
    message.value = error.message;
    setTimeout(() => {
        visible.value = false;
        // 判断是否有跳转
        if (error.redirect) {
            location.href = error.redirect;
        }
    }, time)
}

// 导出
defineExpose({
    showMessage,
    showError
})

</script>

<style scoped>
    .message-box {
        position: fixed;
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
        padding: 0.625rem 1.25rem;
        border-radius: 0.25rem;
        color: #595050;
        z-index: 999;
        display: flex;
        align-items: center;
        background-color: #FFC0CB;
        justify-content: space-between;
    }
</style>