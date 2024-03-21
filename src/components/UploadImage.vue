<template>
    <div>
        <div class="image-box">
            <canvas
                ref="canvas"
                class="canvas"
                :width="canvasWidth"
                :height="canvasHeight"
                @click="triggerFileUpload"
                @mousedown="handleMouseDown"
                @mousemove="handleMouseMove"
                @mouseup="handleMouseUp"
                @mouseleave="handleMouseUp"
                @wheel="handleWheel"
                @dragover.prevent="handleDragOver"
                @drop.prevent="handleDrop"
            >
            </canvas>
            <p v-if="!image" class="upload-text" @click="triggerFileUpload">点击或者拖动图片上传</p>
            <!-- 隐藏的文件输入元素 -->
            <input type="file" ref="fileInput" @change="handleFileChange($event)" style="display: none;" multiple />
        </div>
        <div class="btn-box">
            <div class="btn" @click="clickSubmit">上传</div>
            <div class="btn btn-red" @click="clearImage">清除</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';


const props = defineProps({
    width: {
        type: Number,
        default: 300
    },
    height: {
        type: Number,
        default: 300
    },
    radius: {
        type: Number,
        default: 0
    },
    submit: {
        type: Function,
        required: true,
    }
})

interface CanvasState {
    isDragging: boolean;
    lastX: number;
    lastY: number;
    offsetX: number;
    offsetY: number;
    scale: number;
}

// 图片base64
const canvasWidth: number = props.height.valueOf();
const canvasHeight: number = props.width.valueOf();
const canvasRadius: number = props.radius.valueOf();
const image: Ref<ImageBitmap | null> = ref(null);
const fileInput: Ref<HTMLInputElement | null> = ref(null);
const canvas: Ref<HTMLCanvasElement | null> = ref(null);
const canvasState: Ref<CanvasState> = ref({
    isDragging: false,
    lastX: 0,
    lastY: 0,
    offsetX: 0,
    offsetY: 0,
    scale: 1
})
let canvasCtx: CanvasRenderingContext2D | null = null;

// 图片base64转Blob类型
function base64ToBlob(base64: string, contentType: string = ""): Blob {
    const sliceSize = 1024;
    const byteCharacters = atob(base64.split(",")[1]);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);
    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        const begin = sliceIndex * sliceSize;
        const end = Math.min(begin + sliceSize, bytesLength);
        const bytes = new Array(end - begin);
        for (let offset = begin, i = 0; offset < end; ++offset, ++i) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}

// 初始化画图
const initDraw = (imageBase64: string) => {
    if (canvas.value == null) {
        return;
    }
    canvasCtx = canvas.value.getContext("2d");
    // base64 初始化图片
    createImageBitmap(base64ToBlob(imageBase64)).then(
        imageBitmap => {
            if (canvasCtx == null) {
                return;
            }
            let height = imageBitmap.height;
            let width = imageBitmap.width;
            if (width >= canvasWidth) {  // 宽度优先
                height = height * canvasWidth / width;
                width = canvasWidth;
            } else {  // 高度优先
                width = width * canvasHeight / height;
                height = canvasHeight;
            }
            // 缩放后依然大于画布
            if (width > canvasWidth) {
                height = height * canvasWidth / width;
                width = canvasWidth;
            } else if (height > canvasHeight) {
                width = width * canvasHeight / height;
                height = canvasHeight;
            }
            canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
            canvasCtx.drawImage(imageBitmap, 0, 0, width, height);
            // 保存缩放后的图片
            if (canvas.value) {
                createImageBitmap(base64ToBlob(canvas.value.toDataURL())).then(
                    transformImageBitmap => {
                        image.value = transformImageBitmap;
                    }
                )
            }
        }
    );
}

// 处理拖拽过程中的逻辑
function handleDragOver(event: DragEvent) {
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
    }
}

// 拖动文件
const handleDrop = (event: DragEvent) => {
    const file = event.dataTransfer?.files[0];
    if (!file) {
        return;
    }
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
        if (reader.result instanceof ArrayBuffer) {
            initDraw(new TextDecoder().decode(reader.result));
        } else if (reader.result) {
            initDraw(reader.result);
        }
    }
}

// 触发文件输入的点击事件
const triggerFileUpload = () => {
    if (fileInput.value && image.value == null) {
        fileInput.value.click();
    }
};

// 点击加载文件
const handleFileChange = (event: Event) => {
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
        if (reader.result instanceof ArrayBuffer) {
            initDraw(new TextDecoder().decode(reader.result));
        } else if (reader.result) {
            initDraw(reader.result);
        }
    }
}

// 重新绘制图片
const drawImage = () => {
    if (canvasCtx == null || image.value == null) {
        return;
    }
    const { offsetX, offsetY, scale } = canvasState.value
    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight)
    canvasCtx.save()
    canvasCtx.translate(offsetX, offsetY)
    canvasCtx.scale(scale, scale)
    canvasCtx.drawImage(image.value, 0, 0);
    canvasCtx.restore()
}

// 鼠标点击事件
const handleMouseDown = (event: MouseEvent) => {
    canvasState.value.isDragging = true
    canvasState.value.lastX = event.clientX
    canvasState.value.lastY = event.clientY
}

// 鼠标移动事件
const handleMouseMove = (event: MouseEvent) => {
    if (!canvasState.value.isDragging) return
    const { lastX, lastY } = canvasState.value
    canvasState.value.offsetX += event.clientX - lastX
    canvasState.value.offsetY += event.clientY - lastY
    canvasState.value.lastX = event.clientX
    canvasState.value.lastY = event.clientY
    drawImage()
}

// 鼠标松开事件
const handleMouseUp = () => {
    canvasState.value.isDragging = false
}

// 滚轮事件
const handleWheel = (event: WheelEvent) => {
    const { scale } = canvasState.value
    const delta = event.deltaY > 0 ? -0.1 : 0.1
    canvasState.value.scale = Math.max(0.1, Math.min(10, scale + delta))
    drawImage()
}

// 点击上传文件
const clickSubmit = async () => {
    if (image.value == null) {
        triggerFileUpload()
    } else if (props.submit && image.value != null) {
        const imageBase64 = canvas.value?.toDataURL();  
        return await props.submit(imageBase64);
    }
}

// 清除图片
const clearImage = () => {
    canvasState.value = {
        isDragging: false,
        lastX: 0,
        lastY: 0,
        offsetX: 0,
        offsetY: 0,
        scale: 1
    };
    image.value = null;
    canvasCtx?.clearRect(0, 0, canvasWidth, canvasHeight);
    // 清空input file
    if (fileInput.value) {
        fileInput.value.value = "";
    }
}

</script>

<style scoped>
    .image-box {
        display: flex;
        position: relative;
        align-items: center;
        justify-content: center;
        width: v-bind(canvasWidth + "px");
        height: v-bind(canvasHeight + "px");
        background-color: #ede4e4;
        cursor: pointer;
        border-radius: v-bind(canvasRadius + "%");
    }
    .canvas {
        position: absolute;
        border-radius: v-bind(canvasRadius + "%");
    }
    .upload-text {
        text-align: center;
        font-size: 1rem;
        color: #999;
        z-index: 1;
    }
    .btn-box {
        display: flex;
        color: #201f1f;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        justify-content: space-between;
        width: v-bind(canvasWidth + "px");
        height: v-bind(canvasHeight / 6 + "px");
    }
    .btn {
        width: 6rem;
        height: 2rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #6586f0;
        transition: transform 0.3s;
        border-radius: 0.25rem;
    }
    .btn-red {
        background-color: #f74444;
    }
    .btn:active {
        transform: scale(0.95);
    }
</style>