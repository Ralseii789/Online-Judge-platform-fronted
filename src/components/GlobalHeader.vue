<template>
  <a-row id="globalHeader" align="center" :wrap="false">
    <a-col flex="auto">
      <a-menu
        mode="horizontal"
        :selected-keys="selectedKeys"
        @menu-item-click="doMenuClick"
      >
        <a-menu-item
          key="0"
          :style="{ padding: 0, marginRight: '38px' }"
          disabled
        >
          <div class="title-bar">
            <img class="logo" src="../assets/oj-logo.png" />
            <div class="title">做题系统</div>
          </div>
        </a-menu-item>
        <a-menu-item v-for="item in visibleRoutes" :key="item.path">
          {{ item.name }}
        </a-menu-item>
      </a-menu>
    </a-col>
    <a-col flex="64px">
      <router-link v-if="store.state.user?.loginUser" to="/profile">
        {{ store.state.user.loginUser.userName }}
      </router-link>
      <span v-else>未登录</span>
    </a-col>
    <a-button
      type="primary"
      style="margin-right: 10px"
      @click="toLogin"
      v-if="!store.state.user?.loginUser"
      >登录
    </a-button>
    <a-button
      status="normal"
      style="margin-right: 10px"
      @click="toRegister"
      v-if="!store.state.user?.loginUser"
      >注册
    </a-button>
    <a-button
      type="primary"
      style="margin-right: 10px"
      @click="toLogout"
      v-if="store.state.user?.loginUser"
      >登出
    </a-button>
  </a-row>
</template>

<script setup lang="ts">
import { routes } from "../router/routes";
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";
import checkAccess from "@/access/CheckAccess";
import ACCESS_ENUM from "@/access/accessEnum";

const router = useRouter();

const selectedKeys = ref(["/"]);

const store = useStore();

//展示在菜单的路由数据,包含权限过滤
const visibleRoutes = computed(() => {
  return routes.filter((item, index) => {
    if (item.meta?.hideInMenu) {
      return false;
    }
    //根据权限过滤菜单
    if (
      !checkAccess(store.state.user.loginUser, item?.meta?.access as string)
    ) {
      return false;
    }
    return true;
  });
});

router.afterEach((to) => {
  selectedKeys.value = [to.path];
});

const doMenuClick = (key: string) => {
  router.push({
    path: key,
  });
};

onMounted(() => {
  store.dispatch("user/getLoginUser");
});

/**
 * 跳转到登录页面
 */
const toLogin = () => {
  router.push({
    path: "/user/login",
  });
};

/**
 * 跳转到注册页面
 */
const toRegister = () => {
  router.push({
    path: "/user/register",
  });
};

/**
 * 登出
 */
const toLogout = async () => {
  await store.dispatch("user/logout");
  location.reload();
  router.push({ path: "/" });
};
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
}

.title {
  color: forestgreen;
  margin-left: 16px;
}

.logo {
  height: 48px;
}
</style>
