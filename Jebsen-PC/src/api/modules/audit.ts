import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";

/**
 * @name 审计日志模块
 */
// 查询审计日志列表
export const getAuditLogList = (params: any) => {
  return http.get(PORT1 + `/audit/log/list`, params);
};
