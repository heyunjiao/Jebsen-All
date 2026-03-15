import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

// 当前使用 copy 菜单数据；接后端时改为 http.get 请求
import authMenuListCurrent from "@/assets/json/authMenuListCurrent.json";

export interface RoleMenuTreeRes {
  code: number;
  data: any[];
  msg?: string;
}

/**
 * 获取角色功能权限的菜单树数据（用于角色管理-功能权限 Tab）
 * 当前 mock：返回 authMenuListCurrent（与 authMenuList copy 一致）
 * 接后端时：return http.get<RoleMenuTreeRes>(PORT1 + `/role/menu/tree`, {}, { loading: false });
 */
export const getRoleMenuTreeApi = (): Promise<RoleMenuTreeRes> => {
  return Promise.resolve(authMenuListCurrent as RoleMenuTreeRes);
  // return http.get<RoleMenuTreeRes>(PORT1 + `/role/menu/tree`, {}, { loading: false });
};
