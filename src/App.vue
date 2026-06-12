<template>
  <div id="app">
    <template v-if="route.path.startsWith('/user')">
      <router-view />
    </template>
    <template v-else>
      <BasicLayout />
    </template>
  </div>
</template>

<style>
#app {
}
</style>
<script setup lang="ts">
import BasicLayout from "@/layouts/BasicLayout.vue";
import { useRoute, useRouter } from "vue-router";
import { onMounted } from "vue";

const route = useRoute();

//预留一个可以编写全局初始化逻辑的代码
/**
 * 全局初始化函数-全局单次调用的代码。
 */
const doInit = () => {
  console.log("项目初始化了");
};

onMounted(() => {
  doInit();
});
</script>
