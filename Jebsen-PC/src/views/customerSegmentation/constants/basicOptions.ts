/**
 * 客户分群 - 基础档案选项（与客户列表筛选对齐）
 */

/** OneID/生命周期状态（与客户列表 lifecycleStatus 一致） */
export const LIFECYCLE_STATUS_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "active", labelKey: "customer.lifecycleStatusOptions.active" },
  { value: "inactive", labelKey: "customer.lifecycleStatusOptions.inactive" },
  { value: "pending", labelKey: "customer.lifecycleStatusOptions.pending" },
  { value: "conflict", labelKey: "customer.lifecycleStatusOptions.conflict" }
];

/** 居住区域 - 城市搜索用示例列表（可接接口，支持 filterable 下拉） */
export const RESIDENCE_CITY_OPTIONS = [
  "北京", "上海", "广州", "深圳", "杭州", "成都", "南京", "苏州",
  "武汉", "西安", "天津", "重庆", "青岛", "宁波", "厦门", "长沙"
];
