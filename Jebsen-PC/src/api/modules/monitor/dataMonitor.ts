import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";

/**
 * @name 数据监控看板模块
 * @description C360数据治理监控驾驶舱相关接口
 */

// 获取T+1跑批全链路进度
export const getPipelineStatus = (params?: any) => {
  return http.get(PORT1 + `/monitor/dataMonitor/pipeline/status`, params);
};

// 获取数据流入与质量统计
export const getDataQuality = (params?: any) => {
  return http.get(PORT1 + `/monitor/dataMonitor/quality`, params);
};

// 获取OneID身份治理统计
export const getIdentityGovernance = (params?: any) => {
  return http.get(PORT1 + `/monitor/dataMonitor/identity`, params);
};

// 获取商机价值转化统计
export const getBusinessValue = (params?: any) => {
  return http.get(PORT1 + `/monitor/dataMonitor/business`, params);
};

// 获取API推送日志
export const getApiLogs = (params?: any) => {
  return http.get(PORT1 + `/monitor/dataMonitor/apiLogs`, params);
};

// 获取系统健康状态
export const getSystemHealth = () => {
  return http.get(PORT1 + `/monitor/dataMonitor/systemHealth`);
};

// 刷新监控数据
export const refreshMonitorData = () => {
  return http.post(PORT1 + `/monitor/dataMonitor/refresh`);
};
