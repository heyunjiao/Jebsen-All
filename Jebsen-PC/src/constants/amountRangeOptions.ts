/**
 * 标签/分群筛选用金额区间（定好金额范围，客户直接选择）
 * 用于：购车金额、选配金额、售后自费金额
 */

export interface AmountRangeOption {
  label: string;
  value: string;
  /** 最小值（万元或元，与所在列表单位一致） */
  min: number | undefined;
  /** 最大值（万元或元），undefined 表示无上限 */
  max: number | undefined;
}

/** 购车金额区间（万元） */
export const PURCHASE_AMOUNT_RANGES: AmountRangeOption[] = [
  { label: "请选择", value: "", min: undefined, max: undefined },
  { label: "50万以下", value: "0-50", min: 0, max: 50 },
  { label: "50-100万", value: "50-100", min: 50, max: 100 },
  { label: "100-150万", value: "100-150", min: 100, max: 150 },
  { label: "150-200万", value: "150-200", min: 150, max: 200 },
  { label: "200万以上", value: "200+", min: 200, max: undefined }
];

/** 选配金额区间（万元） */
export const OPTION_AMOUNT_RANGES: AmountRangeOption[] = [
  { label: "请选择", value: "", min: undefined, max: undefined },
  { label: "10万以下", value: "0-10", min: 0, max: 10 },
  { label: "10-20万", value: "10-20", min: 10, max: 20 },
  { label: "20-30万", value: "20-30", min: 20, max: 30 },
  { label: "30-50万", value: "30-50", min: 30, max: 50 },
  { label: "50万以上", value: "50+", min: 50, max: undefined }
];

/** 售后自费金额区间（元） */
export const AFTER_SALES_SELF_PAY_RANGES: AmountRangeOption[] = [
  { label: "请选择", value: "", min: undefined, max: undefined },
  { label: "5千以下", value: "0-5000", min: 0, max: 5000 },
  { label: "5千-1万", value: "5000-10000", min: 5000, max: 10000 },
  { label: "1万-3万", value: "10000-30000", min: 10000, max: 30000 },
  { label: "3万-5万", value: "30000-50000", min: 30000, max: 50000 },
  { label: "5万以上", value: "50000+", min: 50000, max: undefined }
];

function matchRange(
  min: number | undefined,
  max: number | undefined,
  options: AmountRangeOption[]
): string {
  if (min === undefined && (max === undefined || max === null)) return "";
  const noMax = max === undefined || max === null;
  const item = options.find(
    r =>
      r.value &&
      r.min === min &&
      (noMax ? r.max === undefined : r.max === max)
  );
  return item?.value ?? "";
}

/** 根据 min/max 匹配购车金额区间 value（用于回显） */
export function matchPurchaseAmountRange(min: number | undefined, max: number | undefined): string {
  return matchRange(min, max, PURCHASE_AMOUNT_RANGES);
}

/** 根据 min/max 匹配选配金额区间 value（用于回显） */
export function matchOptionAmountRange(min: number | undefined, max: number | undefined): string {
  return matchRange(min, max, OPTION_AMOUNT_RANGES);
}

/** 根据 min/max 匹配售后自费金额区间 value（用于回显） */
export function matchAfterSalesSelfPayRange(min: number | undefined, max: number | undefined): string {
  return matchRange(min, max, AFTER_SALES_SELF_PAY_RANGES);
}
