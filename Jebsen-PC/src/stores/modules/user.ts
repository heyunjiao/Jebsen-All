import { defineStore } from "pinia";
import { UserState } from "@/stores/interface";
import piniaPersistConfig from "@/stores/helper/persist";

export const useUserStore = defineStore({
  id: "geeker-user",
  state: (): UserState => ({
    token: "",
    userInfo: {
      name: "Admin",
      role: "admin",
      storeList: [
        { storeId: "store_001", storeName: "上海浦东保时捷中心" },
        { storeId: "store_002", storeName: "北京保时捷中心" },
        { storeId: "store_003", storeName: "广州天河保时捷中心" },
        { storeId: "store_004", storeName: "深圳南山保时捷中心" },
        { storeId: "store_005", storeName: "杭州西湖保时捷中心" }
      ]
    }
  }),
  getters: {
    /** 是否管理员（可选全部门店或单店） */
    isAdmin: (state): boolean => state.userInfo.role === "admin",
    /** 当前用户所属门店 ID（门店人员有值，管理员可为空） */
    currentStoreId: (state): string | undefined => state.userInfo.storeId,
    /** 可选门店列表（管理员为全部门店，门店人员为单店） */
    storeList: (state): import("@/stores/interface").StoreInfo[] => state.userInfo.storeList ?? []
  },
  actions: {
    // Set Token
    setToken(token: string) {
      this.token = token;
    },
    // Set setUserInfo
    setUserInfo(userInfo: UserState["userInfo"]) {
      this.userInfo = userInfo;
    }
  },
  persist: piniaPersistConfig("geeker-user")
});
