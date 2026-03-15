/**
 * 维保记录 - 服务类型枚举（与产品规范一致）
 */
export const MAINTENANCE_SERVICE_TYPES = [
  "钣金",
  "喷漆",
  "尊享快修",
  "维修",
  "常规维修",
  "换油服务",
] as const;

export type MaintenanceServiceType = (typeof MAINTENANCE_SERVICE_TYPES)[number];

/** 下拉/选项格式 */
export const MAINTENANCE_SERVICE_TYPE_OPTIONS: {
  label: string;
  value: MaintenanceServiceType;
}[] = MAINTENANCE_SERVICE_TYPES.map((v) => ({ label: v, value: v }));
