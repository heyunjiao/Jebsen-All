import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";

/**
 * @name 缓存监控模块
 */
// 查询缓存详细
export const getCache = () => {
  return http.get(PORT1 + `/monitor/cache`);
};

// 查询缓存名称列表
export const listCacheName = () => {
  return http.get(PORT1 + `/monitor/cache/getNames`);
};

// 查询缓存键名列表
export const listCacheKey = (cacheName: string) => {
  return http.get(PORT1 + `/monitor/cache/getKeys/${cacheName}`);
};

// 查询缓存内容
export const getCacheValue = (cacheName: string, cacheKey: string) => {
  return http.get(PORT1 + `/monitor/cache/getValue/${cacheName}/${cacheKey}`);
};

// 清理指定名称缓存
export const clearCacheName = (cacheName: string) => {
  return http.delete(PORT1 + `/monitor/cache/clearCacheName/${cacheName}`);
};

// 清理指定键名缓存
export const clearCacheKey = (cacheKey: string) => {
  return http.delete(PORT1 + `/monitor/cache/clearCacheKey/${cacheKey}`);
};

// 清理全部缓存
export const clearCacheAll = () => {
  return http.delete(PORT1 + `/monitor/cache/clearCacheAll`);
};
