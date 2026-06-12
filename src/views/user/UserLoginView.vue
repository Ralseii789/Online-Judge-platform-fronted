<template>
  <div id="userLoginView">
    <h2 style="margin-bottom: 16px">用户登录</h2>
    <a-form
      style="max-width: 500px; margin: 0 auto"
      label-align="left"
      auto-label-width
      :model="form"
      @submit="handleSubmit"
    >
      <a-form-item field="userAccount">
        <template #label>
          <span style="color: white">账号</span>
        </template>
        <a-input v-model="form.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item field="userPassword" tooltip="密码不少于8位">
        <template #label>
          <span style="color: white">密码</span>
        </template>
        <a-input v-model="form.userPassword" placeholder="请输入密码" />
      </a-form-item>
      <a-form-item class="button-item">
        <a-button type="primary" html-type="submit" style="width: 120px"
          >登录
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<style scoped>
.button-item :deep(.arco-form-item-content) {
  justify-content: flex-end;
  display: flex;
}
</style>

<script setup lang="ts">
import { reactive } from "vue";
import { UserControllerService, UserLoginRequest } from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import user from "@/store/user";
import { useStore } from "vuex";

const router = useRouter();
const store = useStore();
/**
 * 表单信息
 */
const form = reactive({
  userAccount: "",
  userPassword: "",
} as UserLoginRequest);

/**
 * 提交表单
 */
const handleSubmit = async () => {
  const res = await UserControllerService.userLogin(form);
  if (res.code === 0) {
    await store.dispatch("user/getLoginUser");
    router.push({
      path: "/",
      replace: true,
    });
  } else {
    message.error("登录失败" + res.message);
  }
  alert(JSON.stringify(form));
};
</script>
