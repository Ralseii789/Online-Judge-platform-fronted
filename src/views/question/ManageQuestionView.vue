<template>
  <div id="manageQuestionView">
    <h2>管理题目</h2>
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
      <template #tags="{ record }">
        <a-space wrap>
          <a-tag
            v-for="(tag, index) in parseTags(record.tags)"
            :key="index"
            color="blue"
            >{{ tag }}
          </a-tag>
        </a-space>
      </template>
      <template #answer="{ record }">
        <span
          >{{ (record.answer || "").slice(0, 5)
          }}{{ (record.answer || "").length > 5 ? "..." : "" }}</span
        >
      </template>
      <template #title="{ record }">
        <span
          >{{ (record.title || "").slice(0, 5)
          }}{{ (record.title || "").length > 5 ? "..." : "" }}</span
        >
      </template>
      <template #content="{ record }">
        <span
          >{{ (record.content || "").slice(0, 5)
          }}{{ (record.content || "").length > 5 ? "..." : "" }}</span
        >
      </template>
      <template #judgeCase="{ record }">
        <a-space direction="vertical" :size="4">
          <a-tag
            v-for="(item, index) in parseJudge(record.judgeCase)"
            :key="index"
          >
            {{ item.input }} ➔ {{ item.output }}
          </a-tag>
        </a-space>
      </template>
      <template #judgeConfig="{ record }">
        <a-space v-if="record.judgeConfig" wrap>
          <a-tag color="blue"
            >时间：{{ parseJudgeConfig(record.judgeConfig).timeLimit }}ms
          </a-tag>
          <a-tag color="green"
            >内存：{{ parseJudgeConfig(record.judgeConfig).memoryLimit }}KB
          </a-tag>
          <a-tag color="red"
            >堆栈：{{ parseJudgeConfig(record.judgeConfig).stackLimit }}KB
          </a-tag>
        </a-space>
      </template>
      <template #createTime="{ record }">
        {{ moment(record.createTime).format("YYYY-MM-DD") }}
      </template>
      <template #optional="{ record }">
        <a-space>
          <a-button type="primary" @click="doUpdate(record)">修改</a-button>
          <a-button status="danger" @click="doDelete(record)">删除</a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import { Question, QuestionControllerService } from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import moment from "moment/moment";

const dataList = ref<Question[]>([]);
const total = ref<number>(0);
const searchParams = ref({
  pageSize: 10,
  current: 1,
});
/**
 * 加载数据
 */
const loadData = async () => {
  const res = await QuestionControllerService.listQuestionByPage(
    searchParams.value
  );
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
    title: "id",
    dataIndex: "id",
  },
  {
    title: "标题",
    slotName: "title",
  },
  {
    title: "内容",
    slotName: "content",
  },
  {
    title: "标签",
    slotName: "tags",
  },
  {
    title: "答案",
    slotName: "answer",
  },
  {
    title: "提交数",
    dataIndex: "submitNum",
  },
  {
    title: "通过数",
    dataIndex: "acceptedNum",
  },
  {
    title: "判题配置",
    slotName: "judgeConfig",
  },
  {
    title: "判题用例",
    slotName: "judgeCase",
  },
  {
    title: "用户id",
    dataIndex: "userId",
  },
  {
    title: "创建时间",
    slotName: "createTime",
  },
  {
    title: "操作",
    slotName: "optional",
  },
];

const router = useRouter();

/**
 * 修改题目
 */
const doUpdate = (question: Question) => {
  router.push({
    path: "/update/question",
    query: {
      id: question.id,
    },
  });
};

/**
 * 删除题目
 */
const doDelete = async (question: Question) => {
  const res = await QuestionControllerService.deleteQuestion({
    id: question.id,
  });
  if (res.code === 0) {
    message.success("删除成功");
    //更新数据
    loadData();
  } else {
    message.error("删除失败，" + res.message);
  }
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

/**
 * 字符串转数组
 */
const parseTags = (tags: any): string[] => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return tags.split(",").filter(Boolean);
    }
  }
  return [];
};

/**
 * 判题用例解析函数
 * @param judgeCase
 */
const parseJudge = (judgeCase: any) => {
  if (typeof judgeCase === "string") {
    try {
      return JSON.parse(judgeCase);
    } catch {
      return [];
    }
  }
  return Array.isArray(judgeCase) ? judgeCase : [];
};

/**
 * 字符串转对象
 * @param config
 */
const parseJudgeConfig = (config: any): Record<string, any> => {
  if (typeof config === "string") {
    try {
      const obj = JSON.parse(config);
      return obj && typeof obj === "object" ? obj : {};
    } catch {
      return {};
    }
  }
  if (config && typeof config === "object") return config;
  return {};
};
</script>

<style scoped>
#manageQuestionView {
}
</style>
