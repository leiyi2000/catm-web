<template>
    <div>
        <p v-if="user.id">{{ user }}</p>        
    </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";

import { getLoginUser } from "../api/user";


interface User {
    id: string | null;
    username: string | null;
    created_at: string | null;
    updated_at: string | null;
}

const user: Ref<User> = ref<User>({
    id: null,
    username: null,
    created_at: null,
    updated_at: null,
});

// 加载的时候加载用户信息
const loadLoginUser = async () => {
    const loginUserResponse = await getLoginUser()
    if (loginUserResponse.data) {
        user.value = loginUserResponse.data;
    }
}
// 加载的时候加载用户信息
onMounted(loadLoginUser);
</script>