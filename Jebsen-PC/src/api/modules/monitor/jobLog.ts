import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";

/**
 * @name 定时任务日志模块
 */
// 查询调度日志列表
export const listJobLog = (params: any) => {
  return http.get(PORT1 + `/monitor/jobLog/list`, params);
};

// 删除调度日志
export const delJobLog = (jobLogId: string | number) => {
  return http.delete(PORT1 + `/monitor/jobLog/${jobLogId}`);
};

// 清空调度日志
export const cleanJobLog = () => {
  return http.delete(PORT1 + `/monitor/jobLog/clean`);
};
