<template>
  <div id="questionsSubmitView">
    <h2>浏览提交题目</h2>
    <a-form :model="searchParams" layout="inline">
      <a-form-item field="questionId" label="题号" style="min-width: 300px">
        <a-input v-model="searchParams.questionId" placeholder="请输入题号" />
      </a-form-item>
      <a-form-item field="title" label="编程语言" style="min-width: 300px">
        <a-select
          v-model="searchParams.language"
          :style="{ width: '320px' }"
          placeholder="选择编程语言"
        >
          <a-option>java</a-option>
          <a-option>cpp</a-option>
          <a-option>go</a-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="doSearch">搜索</a-button>
      </a-form-item>
      <a-form-item style="margin-left: auto">
        <a-button status="normal" @click="doSearch">刷新</a-button>
      </a-form-item>
    </a-form>
    <a-divider size="0" />
    <a-table
      :columns="columns"
      :data="dataList"
      :pagination="{
        showTotal: true,
        pageSize: searchParams.pageSize,
        current: searchParams.current,
        total,
      }"
      @page-change="onPageChange"
    >
      <template #judgeInfo="{ record }">
        <a-space v-if="record.judgeInfo">
          <a-tag color="blue">{{ record.judgeInfo.time }}ms</a-tag>
          <a-tag color="green">{{ record.judgeInfo.memory }}KB</a-tag>
          <a-tag color="red">{{ record.judgeInfo.message }}</a-tag>
        </a-space>
      </template>
      <template #questionId="{ record }">
        <router-link :to="`/view/question/${record.questionId}`">
          {{ record.questionId }}
        </router-link>
      </template>
      <template #status="{ record }">
        <a-tag v-if="record.status === 0" color="blue">等待判题</a-tag>
        <a-tag v-if="record.status === 1" color="yellow">判题中</a-tag>
        <a-tag v-if="record.status === 2" color="green">成功</a-tag>
        <a-tag v-if="record.status === 3" color="red">失败</a-tag>
      </template>
      <template #createTime="{ record }">
        {{ moment(record.createTime).format("YYYY-MM-DD") }}
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import {
  QuestionControllerService,
  QuestionSubmitVO,
} from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import moment from "moment";

const dataList = ref<QuestionSubmitVO[]>([]);
const total = ref<number>(0);
const searchParams = ref({
  questionId: undefined,
  language: undefined,
  pageSize: 10,
  current: 1,
});
/**
 * 加载数据
 */
const loadData = async () => {
  const res = await QuestionControllerService.listQuestionSubmitByPage({
    ...searchParams.value,
    sortField: "createTime",
    sortOrder: "descend",
  });
  if (res.code === 0) {
    dataList.value = res.data?.records ?? [];
    total.value = res.data?.total ?? 0;
  } else {
    message.error("加载失败，" + res.message);
  }
};

/**
 * 监听 searchParams 变量，改变时触发页面的重新加载
 */
watchEffect(() => {
  loadData();
});

/**
 * 初始化加载数据
 */
onMounted(() => {
  loadData();
});

const columns = [
  {
    title: "提交号",
    dataIndex: "id",
  },
  {
    title: "编程语言",
    dataIndex: "language",
  },
  {
    title: "判题信息",
    slotName: "judgeInfo",
  },
  {
    title: "判题状态",
    slotName: "status",
  },
  {
    title: "题目 id",
    slotName: "questionId",
  },
  {
    title: "提交者 id",
    dataIndex: "userId",
  },
  {
    title: "创建时间",
    slotName: "createTime",
  },
];

const router = useRouter();

/**
 * 根据条件查询题目(重新加载数据)
 */
const doSearch = () => {
  //这里需要重置搜索页号
  searchParams.value = {
    ...searchParams.value,
    current: 1,
  };
};

/**
 * 当页数改变时 改变响应的变量
 */
const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page,
  };
};
</script>

<style scoped>
#questionsSubmitView {
  max-width: 1280px;
  margin: 0 auto;
}
</style>
