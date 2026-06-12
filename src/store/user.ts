import { StoreOptions } from "vuex";
import AccessEnum from "@/access/accessEnum";
import ACCESS_ENUM from "@/access/accessEnum";
import { UserControllerService } from "../../generated";
import message from "@arco-design/web-vue/es/message";

// 定义user模块，存储用户信息

export default {
  namespaced: true,
  state: () => ({
    loginUser: {
      userName: "未登录",
    },
  }),
  actions: {
    async getLoginUser({ commit, state }, payload) {
      //从远程请求获取登录信息
      const res = await UserControllerService.getLoginUser();
      if (res.code == 0) {
        commit("updateUser", res.data);
      } else {
        commit("updateUser", {
          ...state.loginUser,
          userRole: ACCESS_ENUM.NOT_LOGIN,
        });
        commit("updateUser", payload);
      }
    },

    async logout({ commit }) {
      const res = await UserControllerService.userLogout();
      if (res.code != 0) {
        message.error("登出失败");
      }
      commit("updateUser", {
        userName: "未登录",
        userRole: ACCESS_ENUM.NOT_LOGIN,
      });
    },
  },
  mutations: {
    updateUser(state, payload) {
      state.loginUser = payload;
    },
  },
} as StoreOptions<any>;
