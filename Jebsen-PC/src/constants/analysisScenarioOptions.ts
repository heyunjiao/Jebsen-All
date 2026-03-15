/**
 * 分析场景相关选项：活动/Campaign、BDC/WeCom 触达、券到期、进场频次等
 * 用于规则配置与客户分群筛选。
 *
 * 支持的场景：
 * 1) 过去某周期参加活动/Campaign 次数 → 结合后续产值分析（规则：活动次数 + 时间周期）
 * 2) 过去某周期 BDC/WeCom 触达状态 → 成功触达 vs 未触达（未触达即较高流失风险）
 * 3) 消费金额、进场频次、券到期 → 规则中「金额档位」「分析场景」及本常量
 */

export interface LabelValue {
  label: string;
  value: string;
}

/** 时间周期：1个月/3个月/6个月/1年/2年 */
export const TIME_PERIOD_OPTIONS: LabelValue[] = [
  { label: "1个月", value: "1m" },
  { label: "3个月", value: "3m" },
  { label: "6个月", value: "6m" },
  { label: "1年", value: "1y" },
  { label: "2年", value: "2y" }
];

/** 过去某周期参加活动/Campaign 次数档位 */
export const ACTIVITY_COUNT_OPTIONS: LabelValue[] = [
  { label: "0次", value: "0" },
  { label: "1次", value: "1" },
  { label: "2-3次", value: "2-3" },
  { label: "4-5次", value: "4-5" },
  { label: "6次以上", value: "6+" }
];

/** BDC/WeCom 触达状态：成功触达、未触达（存在较高流失风险） */
export const REACH_STATUS_OPTIONS: LabelValue[] = [
  { label: "成功触达", value: "reached" },
  { label: "未触达", value: "not_reached" }
];

/** 券到期维度 */
export const COUPON_EXPIRY_OPTIONS: LabelValue[] = [
  { label: "30天内到期", value: "30d" },
  { label: "60天内到期", value: "60d" },
  { label: "90天内到期", value: "90d" },
  { label: "已到期", value: "expired" },
  { label: "无券", value: "none" }
];

/** 过去某周期进场次数档位 */
export const VISIT_COUNT_IN_PERIOD_OPTIONS: LabelValue[] = [
  { label: "0次", value: "0" },
  { label: "1-2次", value: "1-2" },
  { label: "3-5次", value: "3-5" },
  { label: "6-10次", value: "6-10" },
  { label: "10次以上", value: "10+" }
];

/** 产值/金额档位（用于「接下来一段时间产生产值」等） */
export const REVENUE_RANGE_OPTIONS: LabelValue[] = [
  { label: "0元", value: "0" },
  { label: "1万以下", value: "0-1w" },
  { label: "1-5万", value: "1w-5w" },
  { label: "5-10万", value: "5w-10w" },
  { label: "10万以上", value: "10w+" }
];

export function getTimePeriodLabel(value: string): string {
  return TIME_PERIOD_OPTIONS.find(p => p.value === value)?.label ?? value;
}

export function getReachStatusLabel(value: string): string {
  return REACH_STATUS_OPTIONS.find(r => r.value === value)?.label ?? value;
}

export function getCouponExpiryLabel(value: string): string {
  return COUPON_EXPIRY_OPTIONS.find(c => c.value === value)?.label ?? value;
}

export function getActivityCountLabel(value: string): string {
  return ACTIVITY_COUNT_OPTIONS.find(a => a.value === value)?.label ?? value;
}

export function getVisitCountLabel(value: string): string {
  return VISIT_COUNT_IN_PERIOD_OPTIONS.find(v => v.value === value)?.label ?? value;
}

/** 解析「周期_值」格式并返回展示文案 */
export function formatScenarioValue(field: string, value: string): string {
  if (!value) return value;
  if (field === "couponExpiry") return getCouponExpiryLabel(value);
  const [period, second] = value.split("_");
  const periodLabel = getTimePeriodLabel(period);
  if (field === "activityCountInPeriod") return `过去${periodLabel} ${getActivityCountLabel(second)}`;
  if (field === "bdcReachInPeriod") return `过去${periodLabel} BDC${getReachStatusLabel(second)}`;
  if (field === "wecomReachInPeriod") return `过去${periodLabel} WeCom${getReachStatusLabel(second)}`;
  if (field === "visitCountInPeriod") return `过去${periodLabel} 进场${getVisitCountLabel(second)}`;
  return value;
}

const SCENARIO_FIELD_LABELS: Record<string, string> = {
  activityCountInPeriod: "过去周期参加活动次数",
  bdcReachInPeriod: "过去周期BDC触达",
  wecomReachInPeriod: "过去周期WeCom触达",
  couponExpiry: "券到期",
  visitCountInPeriod: "过去周期进场次数"
};
export function getScenarioFieldLabel(field: string): string {
  return SCENARIO_FIELD_LABELS[field] ?? field;
}
