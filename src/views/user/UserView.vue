<template>
  <div id="userView">
    <h3>个人主页</h3>
    <a-row :gutter="24">
      <!-- 左侧个人信息卡片 -->
      <a-col :xs="24" :md="6">
        <a-card title="个人信息">
          <template #extra>
            <a-button type="text" @click="showNicknameModal = true"
              >修改昵称
            </a-button>
            <a-button type="text" @click="showPasswordModal = true"
              >修改密码
            </a-button>
          </template>
          <a-space direction="vertical" style="width: 100%">
            <div style="font-size: 20px; font-weight: bold; text-align: center">
              {{ loginUser?.userName }}
            </div>
            <div style="text-align: center">
              <a-tag :color="loginUser?.userRole === 'admin' ? 'red' : 'green'">
                {{ loginUser?.userRole }}
              </a-tag>
            </div>
            <div style="text-align: center; color: #888">
              注册于 {{ moment(loginUser?.createTime).format("YYYY-MM-DD") }}
            </div>
          </a-space>
        </a-card>
      </a-col>

      <!-- 右侧统计与提交列表 -->
      <a-col :xs="24" :md="18">
        <!-- 统计卡片 -->
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="stat-item">
              <div class="stat-label" style="font-size: 25px">总提交</div>
              <div class="stat-value" style="font-size: 30px">
                {{ stats.totalSubmit }}
              </div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="stat-item">
              <div class="stat-label" style="font-size: 25px">通过</div>
              <div class="stat-value" style="font-size: 30px">
                {{ stats.accepted }}
              </div>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="stat-item">
              <div class="stat-label" style="font-size: 25px">通过率</div>
              <div class="stat-value" style="font-size: 30px">
                {{ stats.acceptedRate }}%
              </div>
            </div>
          </a-col>
        </a-row>

        <a-divider />

        <!-- 最近提交 -->
        <h3>最近提交</h3>
        <a-table
          :columns="columns"
          :data="submitList"
          :pagination="false"
          size="small"
        >
          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)"
              >{{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template #judgeInfo="{ record }">
            <span v-if="record.judgeInfo">{{
              parseJudgeInfo(record.judgeInfo).message
            }}</span>
          </template>
          <template #questionId="{ record }">
            <router-link :to="`/view/question/${record.questionId}`">
              {{ record.questionId }}
            </router-link>
          </template>
          <template #createTime="{ record }">
            {{ moment(record.createTime).format("YYYY-MM-DD HH:mm") }}
          </template>
        </a-table>
      </a-col>
    </a-row>

    <!-- 修改昵称弹窗 -->
    <a-modal
      v-model:visible="showNicknameModal"
      title="修改昵称"
      @ok="handleChangeNickname"
    >
      <a-form :model="nicknameForm">
        <a-form-item label="新昵称">
          <a-input v-model="nicknameForm.userName" placeholder="请输入新昵称" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 修改密码弹窗 -->
    <a-modal
      v-model:visible="showPasswordModal"
      title="修改密码"
      @ok="handleChangePassword"
      @cancel="resetPasswordForm"
    >
      <a-form :model="passwordForm" layout="vertical">
        <a-form-item field="oldPassword" label="旧密码">
          <a-input-password
            v-model="passwordForm.oldPassword"
            placeholder="请输入旧密码"
          />
        </a-form-item>
        <a-form-item field="newPassword" label="新密码">
          <a-input-password
            v-model="passwordForm.newPassword"
            placeholder="至少6位"
          />
        </a-form-item>
        <a-form-item field="confirmPassword" label="确认新密码">
          <a-input-password
            v-model="passwordForm.confirmPassword"
            placeholder="再次输入新密码"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import moment from "moment";
import {
  UserControllerService,
  QuestionSubmitVO,
  QuestionControllerService,
} from "../../../generated";
import message from "@arco-design/web-vue/es/message";

const store = useStore();
const router = useRouter();
const loginUser = computed(() => store.state.user?.loginUser);

const stats = ref({ totalSubmit: 0, accepted: 0, acceptedRate: 0 });
const submitList = ref<QuestionSubmitVO[]>([]);
const showPasswordModal = ref(false);
const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const columns = [
  { title: "题号", slotName: "questionId" },
  { title: "状态", slotName: "status" },
  { title: "判题信息", slotName: "judgeInfo" },
  { title: "提交时间", slotName: "createTime" },
];

// 解析 judgeInfo JSON 字符串
const parseJudgeInfo = (info: any) => {
  if (typeof info === "string") {
    try {
      return JSON.parse(info);
    } catch {
      return {};
    }
  }
  return info || {};
};

// 状态映射
const getStatusText = (status: number) =>
  ["等待", "判题中", "成功", "失败"][status] || "未知";
const getStatusColor = (status: number) =>
  ["blue", "yellow", "green", "red"][status] || "gray";

// 加载数据
const loadData = async () => {
  if (!loginUser.value?.id) return;

  const res = await QuestionControllerService.listQuestionSubmitByPage({
    userId: loginUser.value.id,
    pageSize: 10,
    current: 1,
    sortField: "createTime",
    sortOrder: "descend",
  });

  if (res.code === 0) {
    submitList.value = res.data?.records ?? [];
    const total = res.data?.total ?? 0;
    const accepted = submitList.value.filter(
      (s) =>
        s.status === 2 && parseJudgeInfo(s.judgeInfo).message === "Accepted"
    ).length;
    stats.value = {
      totalSubmit: total,
      accepted: accepted,
      acceptedRate: total ? +((accepted / total) * 100).toFixed(1) : 0,
    };
  } else {
    message.error("加载失败");
  }
};

// 修改密码
const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    message.error("两次新密码输入不一致");
    return;
  }
  if (passwordForm.value.newPassword.length < 6) {
    message.error("新密码长度至少6位");
    return;
  }

  try {
    console.log("准备发送请求...");
    const res = await UserControllerService.updatePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword,
    });
    console.log("收到响应:", res);
    if (res.code === 0) {
      message.success("密码修改成功，请重新登录");
      showPasswordModal.value = false;
      store.dispatch("user/logout");
      router.push("/user/login");
    } else {
      message.error(res.message || "修改失败");
    }
  } catch (e) {
    console.error("请求异常:", e);
    message.error("请求失败，请稍后再试");
  }
};

//取消修改密码
const resetPasswordForm = () => {
  passwordForm.value = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
};

onMounted(() => {
  loadData();
});

//修改昵称
const showNicknameModal = ref(false);
const nicknameForm = ref({ userName: "" });

const handleChangeNickname = async () => {
  if (!nicknameForm.value.userName.trim()) {
    message.error("昵称不能为空");
    return;
  }
  const res = await UserControllerService.updateMyUser({
    userName: nicknameForm.value.userName.trim(),
  });
  if (res.code === 0) {
    message.success("昵称修改成功");
    showNicknameModal.value = false;
    store.dispatch("user/getLoginUser"); // 刷新本地用户信息
  } else {
    message.error(res.message || "修改失败");
  }
};
</script>

<style scoped>
#userProfileView {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.stat-value {
  margin-left: 15px;
  margin-top: 10px;
}
</style>
