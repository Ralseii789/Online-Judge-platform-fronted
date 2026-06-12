<template>
  <div class="home">
    <MdEditor :value="mdValue" :handle-change="mdChange" />
    <CodeEditor :value="codeValue" :handle-change="codeChange" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import MdEditor from "@/components/MdEditor.vue";
import CodeEditor from "@/components/CodeEditor.vue"; // @ is an alias to /src

const mdValue = ref();

const mdChange = (v: string) => {
  mdValue.value = v;
};

const codeValue = ref();

const codeChange = (v: string) => {
  codeValue.value = v;
};
</script>
