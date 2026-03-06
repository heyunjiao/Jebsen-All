import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";

/**
 * @name 参数配置模块
 */
// 查询参数列表
export const listConfig = (params?: any) => {
  return http.get(PORT1 + `/system/config/list`, params);
};

// 查询参数详细
export const getConfig = (configId: string | number) => {
  return http.get(PORT1 + `/system/config/${configId}`);
};

// 根据参数键名查询参数值
export const getConfigKey = (configKey: string) => {
  return http.get(PORT1 + `/system/config/configKey/${configKey}`);
};

// 新增参数配置
export const addConfig = (params: any) => {
  return http.post(PORT1 + `/system/config`, params);
};

// 修改参数配置
export const updateConfig = (params: any) => {
  return http.put(PORT1 + `/system/config`, params);
};

// 删除参数配置
export const delConfig = (configId: string | number) => {
  return http.delete(PORT1 + `/system/config/${configId}`);
};

// 刷新参数缓存
export const refreshCache = () => {
  return http.delete(PORT1 + `/system/config/refreshCache`);
};
