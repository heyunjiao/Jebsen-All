import type { Lead } from "@/api/modules/lead";

// 重新导出 API 类型，方便页面使用
export type { Lead };

// 商机状态选项
export const LEAD_STATUS_OPTIONS = [
  { label: "待处理", value: "pending" },
  { label: "已推送", value: "pushed" },
  { label: "处理中", value: "processing" },
  { label: "已完成", value: "completed" },
  { label: "已拒绝", value: "rejected" },
  { label: "失败", value: "failed" }
] as const;

// 商机类型选项
export const LEAD_TYPE_OPTIONS = [
  { label: "售后满意度回访", value: "aftersales_cs" },
  { label: "新车满意度回访", value: "newcar_cs" },
  { label: "BDC Campaign", value: "bdc_campaign" },
  { label: "BDC售后商机招揽", value: "bdc_aftersales_recall" },
  { label: "BDC续保商机", value: "bdc_renewal" },
  { label: "CM 自定义", value: "cm_custom" },
  { label: "PCN售后 Campaign", value: "pcn_aftersales_campaign" },
  { label: "TTR调研", value: "ttr_survey" },
  { label: "新转续", value: "new_to_renew" },
  { label: "续转续", value: "renew_to_renew" },
  { label: "在修不在保", value: "in_repair_no_insurance" },
  { label: "沉睡", value: "dormant" },
  { label: "待激活", value: "pending_activation" },
  { label: "活跃", value: "active" }
] as const;

// 推送目标选项
export const PUSH_TARGET_OPTIONS = [{ label: "BDC外呼系统", value: "BDC外呼系统" }] as const;

// 优先级选项
export const PRIORITY_OPTIONS = [
  { label: "低", value: "low", color: "info" },
  { label: "中", value: "medium", color: "warning" },
  { label: "高", value: "high", color: "danger" }
] as const;
