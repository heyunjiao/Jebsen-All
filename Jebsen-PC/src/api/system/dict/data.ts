import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";

/**
 * @name 字典数据模块
 */
// 查询字典数据列表
export const listData = (params: any) => {
  return http.get(PORT1 + `/system/dict/data/list`, params);
};

// 查询字典数据详细
export const getData = (dictCode: string | number) => {
  return http.get(PORT1 + `/system/dict/data/${dictCode}`);
};

// 根据字典类型查询字典数据信息
export const getDicts = (dictType: string) => {
  return http.get(PORT1 + `/system/dict/data/type/${dictType}`);
};

// 新增字典数据
export const addData = (params: any) => {
  return http.post(PORT1 + `/system/dict/data`, params);
};

// 修改字典数据
export const updateData = (params: any) => {
  return http.put(PORT1 + `/system/dict/data`, params);
};

// 删除字典数据
export const delData = (dictCode: string | number) => {
  return http.delete(PORT1 + `/system/dict/data/${dictCode}`);
};
