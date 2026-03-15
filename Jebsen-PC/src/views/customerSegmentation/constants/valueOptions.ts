/**
 * 客户分群 - 客户价值相关选项
 * 供 QuickFilters 与 index 预览共用，保证选项与展示一致
 */
export interface ValueOption {
  label: string;
  value: string;
}

/** 消费等级 */
export const SPENDING_LEVEL_OPTIONS: ValueOption[] = [
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" }
];

/** 忠诚度等级 */
export const LOYALTY_LEVEL_OPTIONS: ValueOption[] = [
  { value: "dormant", label: "沉睡" },
  { value: "churn", label: "流失" },
  { value: "active", label: "活跃" }
];

/** 客户价值分层（与 fieldOptions 中 customerValueTier 一致） */
export const CUSTOMER_VALUE_TIER_OPTIONS: ValueOption[] = [
  { value: "diamond", label: "钻石" },
  { value: "platinum", label: "白金" },
  { value: "gold", label: "黄金" },
  { value: "silver", label: "白银" }
];

const spendingLevelMap = new Map(SPENDING_LEVEL_OPTIONS.map(o => [o.value, o.label]));
const loyaltyLevelMap = new Map(LOYALTY_LEVEL_OPTIONS.map(o => [o.value, o.label]));
const customerValueTierMap = new Map(CUSTOMER_VALUE_TIER_OPTIONS.map(o => [o.value, o.label]));

export function getSpendingLevelLabel(value: string): string {
  return spendingLevelMap.get(value) ?? value;
}
export function getLoyaltyLevelLabel(value: string): string {
  return loyaltyLevelMap.get(value) ?? value;
}
export function getCustomerValueTierLabel(value: string): string {
  return customerValueTierMap.get(value) ?? value;
}

/** 将 value 数组转为展示名（用于预览） */
export function formatValueLabels(values: string[], getLabel: (v: string) => string): string {
  if (!values?.length) return "";
  return values.map(getLabel).join("、");
}
