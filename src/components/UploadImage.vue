<template>
    <div>
        <input type="file" @change="loadImage($event)">
        <img :src="image">
        <canvas></canvas>
        <div>
            <!-- 可见框 -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';

// 图片base64
const image: Ref<string> = ref("");
const loadImage = (event: Event) => {
    if (!event?.target) {
        return;
    }
    let input = event.target as HTMLInputElement
    if (!input?.files || input.files.length <= 0) {
        return;
    }
    // 读取图片
    let reader = new FileReader();
    reader.readAsDataURL(input.files[0]);
    reader.onload = (_event) => {
        // 文件读取完后绑定到image
        if (reader.result instanceof ArrayBuffer) {
            image.value = new TextDecoder().decode(reader.result);
        } else if (reader.result) {
            image.value = reader.result;
        }
    }
}
</script>