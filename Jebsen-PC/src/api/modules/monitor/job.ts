import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";

/**
 * @name 定时任务管理模块
 */
// 查询定时任务调度列表
export const listJob = (params: any) => {
  return http.get(PORT1 + `/monitor/job/list`, params);
};

// 查询定时任务调度详细
export const getJob = (jobId: string | number) => {
  return http.get(PORT1 + `/monitor/job/${jobId}`);
};

// 新增定时任务调度
export const addJob = (params: any) => {
  return http.post(PORT1 + `/monitor/job`, params);
};

// 修改定时任务调度
export const updateJob = (params: any) => {
  return http.put(PORT1 + `/monitor/job`, params);
};

// 删除定时任务调度
export const delJob = (jobId: string | number) => {
  return http.delete(PORT1 + `/monitor/job/${jobId}`);
};

// 任务状态修改
export const changeJobStatus = (jobId: string | number, status: string) => {
  return http.put(PORT1 + `/monitor/job/changeStatus`, { jobId, status });
};

// 定时任务立即执行一次
export const runJob = (jobId: string | number, jobGroup: string) => {
  return http.put(PORT1 + `/monitor/job/run`, { jobId, jobGroup });
};
