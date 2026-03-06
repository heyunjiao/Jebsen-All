import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";

/**
 * @name 在线客户模块
 */
// 查询在线客户列表
export const list = (params: any) => {
  return http.get(PORT1 + `/monitor/online/list`, params);
};

// 强退客户
export const forceLogout = (tokenId: string) => {
  return http.delete(PORT1 + `/monitor/online/${tokenId}`);
};
