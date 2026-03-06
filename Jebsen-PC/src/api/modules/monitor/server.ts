import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";

/**
 * @name 服务器监控模块
 */
// 获取服务信息
export const getServer = () => {
  return http.get(PORT1 + `/monitor/server`);
};
