<template>
    <div v-if="visible" class="message-box">
        <span>{{ message }}</span>
    </div>
</template>


<script setup lang="ts">
import { Ref, ref } from 'vue';

const message: Ref<string> = ref("");
const visible: Ref<boolean> = ref(false);
const showMessage = (msg: string) => {
    visible.value = true;
    message.value = msg;
    // 3s后消失
    setTimeout(() => {
        visible.value = false;
    }, 1000)
}

// 导出
defineExpose({
    showMessage
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