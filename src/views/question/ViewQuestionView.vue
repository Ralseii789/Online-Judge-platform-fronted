<template>
  <div id="viewQuestionView"></div>
  <a-row :gutter="[24, 24]">
    <a-col :md="12" :xs="24">
      <a-tabs default-active-key="question">
        <a-tab-pane key="question" title="题目">
          <a-card v-if="question" :title="question.title">
            <a-descriptions title="限制条件" :column="{ xs: 1, md: 2, lg: 3 }">
              <a-descriptions-item label="时间限制">
                {{ question.judgeConfig.timeLimit ?? 0 }}
              </a-descriptions-item>
              <a-descriptions-item label="内存限制">
                {{ question.judgeConfig.memoryLimit ?? 0 }}
              </a-descriptions-item>
              <a-descriptions-item label="堆栈限制">
                {{ question.judgeConfig.stackLimit ?? 0 }}
              </a-descriptions-item>
            </a-descriptions>
            <MdViewer :value="question.content || ''" />
            <template #extra>
              <a-tag
                v-for="(tag, index) of question.tags"
                :key="index"
                color="blue"
                >{{ tag }}
              </a-tag>
              <span style="margin-left: 30px">通过率：</span>
              {{
                `${
                  question.submitNum
                    ? question.acceptedNum / question.submitNum
                    : "0"
                }%`
              }}
            </template>
          </a-card>
        </a-tab-pane>
        <a-tab-pane key="comment" title="评论"> 暂时没有评论</a-tab-pane>
        <a-tab-pane key="answer" title="答案"> 暂时无法查看答案</a-tab-pane>
      </a-tabs>
    </a-col>
    <a-col :md="12" :xs="24">
      <a-form :model="form" layout="inline">
        <a-form-item field="title" label="编程语言" style="min-width: 300px">
          <a-select
            v-model="form.language"
            :style="{ width: '320px' }"
            placeholder="选择编程语言"
          >
            <a-option>java</a-option>
            <a-option>cpp</a-option>
            <a-option>go</a-option>
          </a-select>
        </a-form-item>
      </a-form>
      <CodeEditor
        :value="form.code as string"
        :language="form.language"
        :handle-change="changeCode"
      />
      <a-button
        style="margin-top: 20px; min-width: 120px; float: right"
        type="primary"
        @click="doSubmit"
        >提交
      </a-button>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { onMounted, ref, withDefaults, defineProps } from "vue";
import {
  QuestionControllerService,
  QuestionSubmitAddRequest,
  QuestionVO,
} from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import CodeEditor from "@/components/CodeEditor.vue";
import MdViewer from "@/components/MdViewer.vue";
import { m } from "monaco-editor/monaco";

const question = ref<QuestionVO>();

interface Props {
  id: string;
}

const props = withDefaults(defineProps<Props>(), { id: () => "" });

/**
 * 加载数据
 */
const loadData = async () => {
  const res = await QuestionControllerService.getQuestionVoById(
    props.id as any
  );
  if (res.code === 0) {
    question.value = res.data;
  } else {
    message.error("加载失败，" + res.message);
  }
};

/**
 * 初始化加载数据
 */
onMounted(() => {
  loadData();
});

const form = ref<QuestionSubmitAddRequest>({
  language: "java",
  code: "",
});

/**
 * 提交代码
 */
const doSubmit = async () => {
  if (!question.value?.id) {
    return;
  }
  const res = await QuestionControllerService.doSubmitQuestion({
    ...form.value,
    questionId: question.value.id,
  });
  if (res.code === 0) {
    message.success("提交成功");
  } else {
    message.error("提交失败，" + res.message);
  }
};
const changeCode = (value: string) => {
  form.value.code = value;
};
</script>

<style scoped>
#viewQuestionView .arco-space-horizontal .arco-space-item {
  margin-bottom: 0 !important;
}
</style>
