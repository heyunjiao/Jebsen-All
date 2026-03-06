import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";

/**
 * @name 操作日志模块
 */
// 查询操作日志列表
export const list = (params: any) => {
  return http.get(PORT1 + `/monitor/operlog/list`, params);
};

// 删除操作日志
export const delOperlog = (operId: string | number) => {
  return http.delete(PORT1 + `/monitor/operlog/${operId}`);
};

// 清空操作日志
export const cleanOperlog = () => {
  return http.delete(PORT1 + `/monitor/operlog/clean`);
};
