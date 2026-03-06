import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";

/**
 * @name 菜单模块
 */
// 查询菜单列表
export const listMenu = (params?: any) => {
  return http.get(PORT1 + `/system/menu/list`, params);
};

// 查询菜单详细
export const getMenu = (menuId: string | number) => {
  return http.get(PORT1 + `/system/menu/${menuId}`);
};

// 查询菜单下拉树结构
export const treeselect = () => {
  return http.get(PORT1 + `/system/menu/treeselect`);
};

// 根据角色ID查询菜单下拉树结构
export const roleMenuTreeselect = (roleId: string | number) => {
  return http.get(PORT1 + `/system/menu/roleMenuTreeselect/${roleId}`);
};

// 新增菜单
export const addMenu = (params: any) => {
  return http.post(PORT1 + `/system/menu`, params);
};

// 修改菜单
export const updateMenu = (params: any) => {
  return http.put(PORT1 + `/system/menu`, params);
};

// 删除菜单
export const delMenu = (menuId: string | number) => {
  return http.delete(PORT1 + `/system/menu/${menuId}`);
};
