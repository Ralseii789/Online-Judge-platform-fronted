import { createStore } from "vuex";
import user from "./user";

// 导入用户模块
export default createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    //定义模块
    user,
  },
});
