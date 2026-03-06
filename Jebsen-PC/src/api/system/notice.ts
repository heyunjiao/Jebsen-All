import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";

/**
 * @name 通知公告模块
 */
// 查询公告列表
export const listNotice = (params?: any) => {
  return http.get(PORT1 + `/system/notice/list`, params);
};

// 查询公告详细
export const getNotice = (noticeId: string | number) => {
  return http.get(PORT1 + `/system/notice/${noticeId}`);
};

// 新增公告
export const addNotice = (params: any) => {
  return http.post(PORT1 + `/system/notice`, params);
};

// 修改公告
export const updateNotice = (params: any) => {
  return http.put(PORT1 + `/system/notice`, params);
};

// 删除公告
export const delNotice = (noticeId: string | number) => {
  return http.delete(PORT1 + `/system/notice/${noticeId}`);
};
