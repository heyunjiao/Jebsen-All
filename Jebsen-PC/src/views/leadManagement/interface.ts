import type { Lead } from "@/api/modules/lead";
import {
  BOARD_LEAD_TYPE_OPTIONS,
  C360_LEAD_TYPE_VALUES,
  GENERAL_LEAD_TYPE_VALUES,
  getLeadTypeLabel,
  normalizeLeadType,
  STANDARD_18_LEAD_TYPE_OPTIONS
} from "@/constants/leadTypes";

// 重新导出 API 类型，方便页面使用
export type { Lead };
export { getLeadTypeLabel, normalizeLeadType };

// 商机状态选项（列表筛选与展示：已推送、已成交、已跟进）
export const LEAD_STATUS_OPTIONS = [
  { label: "已推送", value: "pushed" },
  { label: "已成交", value: "completed" },
  { label: "已跟进", value: "followed" }
] as const;

/** 后端可能返回的旧状态到展示状态的映射（展示为 已推送/已成交/已跟进） */
export const LEAD_STATUS_DISPLAY_MAP: Record<string, string> = {
  pushed: "已推送",
  completed: "已成交",
  followed: "已跟进",
  pending: "已跟进",
  processing: "已跟进",
  rejected: "已跟进",
  failed: "已跟进"
};

// 商机类型选项
export const LEAD_TYPE_OPTIONS = BOARD_LEAD_TYPE_OPTIONS;

/** 标准 18 个商机（按产品要求顺序） */
export const STANDARD_18_LEAD_TYPES = STANDARD_18_LEAD_TYPE_OPTIONS;

/** 通用商机：没有逻辑，使用商机通用模板上传 */
export const GENERAL_LEAD_TYPES = LEAD_TYPE_OPTIONS.filter(option =>
  GENERAL_LEAD_TYPE_VALUES.includes(option.value as (typeof GENERAL_LEAD_TYPE_VALUES)[number])
);

/** 360系统商机：C360自动生成 */
export const C360_LEAD_TYPES = LEAD_TYPE_OPTIONS.filter(option =>
  C360_LEAD_TYPE_VALUES.includes(option.value as (typeof C360_LEAD_TYPE_VALUES)[number])
);

// 推送目标选项
export const PUSH_TARGET_OPTIONS = [{ label: "BDC外呼系统", value: "BDC外呼系统" }] as const;

// 优先级选项
export const PRIORITY_OPTIONS = [
  { label: "低", value: "low", color: "info" },
  { label: "中", value: "medium", color: "warning" },
  { label: "高", value: "high", color: "danger" }
] as const;
