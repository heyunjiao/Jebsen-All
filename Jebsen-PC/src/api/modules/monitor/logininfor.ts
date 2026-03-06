import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";

/**
 * @name 登录日志模块
 */
// 查询登录日志列表
export const list = (params: any) => {
  return http.get(PORT1 + `/monitor/logininfor/list`, params);
};

// 删除登录日志
export const delLogininfor = (infoId: string | number) => {
  return http.delete(PORT1 + `/monitor/logininfor/${infoId}`);
};

// 解锁客户登录状态
export const unlockLogininfor = (userName: string) => {
  return http.get(PORT1 + `/monitor/logininfor/unlock/${userName}`);
};

// 清空登录日志
export const cleanLogininfor = () => {
  return http.delete(PORT1 + `/monitor/logininfor/clean`);
};
