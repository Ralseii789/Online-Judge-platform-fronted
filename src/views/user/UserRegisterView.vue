<template>
  <div id="userLoginView">
    <h2 style="margin-bottom: 16px">用户注册</h2>
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
      <a-form-item field="checkPassword">
        <template #label>
          <span style="color: white">确认密码</span>
        </template>
        <a-input v-model="form.checkPassword" placeholder="确认密码" />
      </a-form-item>
      <a-form-item class="button-item">
        <a-button type="primary" html-type="submit" style="width: 120px"
          >注册
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
import { UserControllerService, UserRegisterRequest } from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const router = useRouter();
/**
 * 表单信息
 */
const form = reactive({
  userAccount: "",
  userPassword: "",
  checkPassword: "",
} as UserRegisterRequest);

/**
 * 提交表单
 */
const handleSubmit = async () => {
  const res = await UserControllerService.userRegister(form);
  if (res.code === 0) {
    router.push({
      path: "/user/login",
      replace: true,
    });
  } else {
    message.error("注册失败" + res.message);
  }
  alert(JSON.stringify(form));
};
</script>
