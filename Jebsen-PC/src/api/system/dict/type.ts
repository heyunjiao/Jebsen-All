import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";

/**
 * @name 字典类型模块
 */
// 获取字典选择框列表
export const optionselect = () => {
  return http.get(PORT1 + `/system/dict/type/optionselect`);
};

// 查询字典类型列表
export const listType = (params: any) => {
  return http.get(PORT1 + `/system/dict/type/list`, params);
};

// 查询字典类型详细
export const getType = (dictId: string | number) => {
  return http.get(PORT1 + `/system/dict/type/${dictId}`);
};

// 新增字典类型
export const addType = (params: any) => {
  return http.post(PORT1 + `/system/dict/type`, params);
};

// 修改字典类型
export const updateType = (params: any) => {
  return http.put(PORT1 + `/system/dict/type`, params);
};

// 删除字典类型
export const delType = (dictId: string | number) => {
  return http.delete(PORT1 + `/system/dict/type/${dictId}`);
};

// 刷新字典缓存
export const refreshCache = () => {
  return http.delete(PORT1 + `/system/dict/type/refreshCache`);
};
