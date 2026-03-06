import http from "@/api";
import { PORT1 } from "@/api/config/servicePort";

/**
 * @name 代码生成模块
 */
// 查询表集合
export const listTable = (params: any) => {
  return http.get(PORT1 + `/tool/gen/list`, params);
};

// 查询数据库表列表
export const listDbTable = (params: any) => {
  return http.get(PORT1 + `/tool/gen/db/list`, params);
};

// 查询表详细
export const getGenTable = (tableId: string | number) => {
  return http.get(PORT1 + `/tool/gen/${tableId}`);
};

// 预览代码
export const previewTable = (tableId: string | number) => {
  return http.get(PORT1 + `/tool/gen/preview/${tableId}`);
};

// 删除表
export const delTable = (tableIds: string | number | Array<string | number>) => {
  return http.delete(PORT1 + `/tool/gen/${tableIds}`);
};

// 导入表
export const importTable = (tables: string) => {
  return http.post(PORT1 + `/tool/gen/importTable`, { tables });
};

// 创建表
export const createTable = (sql: string) => {
  return http.post(PORT1 + `/tool/gen/createTable`, { sql });
};

// 修改表
export const updateGenTable = (params: any) => {
  return http.put(PORT1 + `/tool/gen`, params);
};

// 生成代码
export const genCode = (tableName: string) => {
  return http.get(PORT1 + `/tool/gen/genCode/${tableName}`);
};

// 同步数据库
export const synchDb = (tableName: string) => {
  return http.get(PORT1 + `/tool/gen/synchDb/${tableName}`);
};
