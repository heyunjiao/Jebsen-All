export type LeadTagType = "primary" | "success" | "warning" | "danger" | "info";

// 18 个标准商机（按产品要求顺序）
export const STANDARD_18_LEAD_TYPE_OPTIONS = [
  { label: "PSP到期", value: "psp_expiry" },
  { label: "保养潜在流失", value: "maintenance_churn" },
  { label: "车辆365天未进店", value: "no_visit_365d" },
  { label: "定保客户365天未保养", value: "regular_maintenance_365d" },
  { label: "定期保养", value: "periodic_maintenance" },
  { label: "首保2年", value: "first_insurance_2y" },
  { label: "首次保养", value: "first_maintenance" },
  { label: "新车365天未保养", value: "newcar_365d_no_maintenance" },
  { label: "新车保修到期", value: "newcar_warranty_expiry" },
  { label: "延保到期", value: "extended_warranty_expiry" },
  { label: "新车交付90天回访", value: "newcar_delivery_90d_revisit" },
  { label: "PCN召回Campaign", value: "pcn_aftersales_campaign" },
  { label: "TTR调研", value: "ttr_survey" },
  { label: "新车满意度回访", value: "newcar_cs" },
  { label: "售后满意度回访", value: "aftersales_cs" },
  { label: "新转续", value: "new_to_renew" },
  { label: "续转续", value: "renew_to_renew" },
  { label: "在修不在保", value: "in_repair_no_insurance" }
] as const;

// 商机看板/下拉等完整列表：标准 18 项 + 通用商机 + BDC Campaign
export const BOARD_LEAD_TYPE_OPTIONS = [
  ...STANDARD_18_LEAD_TYPE_OPTIONS,
  { label: "通用商机", value: "cm_custom" },
  { label: "BDC Campaign", value: "bdc_campaign" }
] as const;

export type UnifiedLeadType = (typeof BOARD_LEAD_TYPE_OPTIONS)[number]["value"];

export const GENERAL_LEAD_TYPE_VALUES = ["new_to_renew", "renew_to_renew"] as const;

// C360 系统商机（标准 18 中除新转续、续转续外的 16 项，与标准商机同序）
export const C360_LEAD_TYPE_VALUES = [
  "psp_expiry",
  "maintenance_churn",
  "no_visit_365d",
  "regular_maintenance_365d",
  "periodic_maintenance",
  "first_insurance_2y",
  "first_maintenance",
  "newcar_365d_no_maintenance",
  "newcar_warranty_expiry",
  "extended_warranty_expiry",
  "newcar_delivery_90d_revisit",
  "pcn_aftersales_campaign",
  "ttr_survey",
  "newcar_cs",
  "aftersales_cs",
  "in_repair_no_insurance"
] as const;

/** 使用模版上传的商机类型（PCN召回Campaign、TTR调研、新转续、续转续） */
export const LEAD_TYPE_SOURCE_TEMPLATE_UPLOAD = [
  "pcn_aftersales_campaign",
  "ttr_survey",
  "new_to_renew",
  "renew_to_renew"
] as const;

/** 商机来源 i18n key：使用模版上传 / 通过C360自动生成（用于小字弱化展示） */
export const LEAD_TYPE_SOURCE_I18N = {
  templateUpload: "leadManagement.leadTypeSource.templateUpload",
  c360Auto: "leadManagement.leadTypeSource.c360Auto"
} as const;

/**
 * 返回商机类型的来源说明 i18n key，用于小字弱化展示。
 * 使用模版上传：PCN召回Campaign、TTR调研、新转续、续转续；其余标准商机为 C360 自动生成。
 */
export function getLeadTypeSourceI18nKey(type?: string | null): string {
  const normalized = normalizeLeadType(type);
  if (!normalized) return "";
  if (LEAD_TYPE_SOURCE_TEMPLATE_UPLOAD.includes(normalized as (typeof LEAD_TYPE_SOURCE_TEMPLATE_UPLOAD)[number])) {
    return LEAD_TYPE_SOURCE_I18N.templateUpload;
  }
  const standardValues = STANDARD_18_LEAD_TYPE_OPTIONS.map(o => o.value);
  if (standardValues.includes(normalized as (typeof standardValues)[number])) return LEAD_TYPE_SOURCE_I18N.c360Auto;
  return "";
}

const LEAD_TYPE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  BOARD_LEAD_TYPE_OPTIONS.map(option => [option.value, option.label])
);

const LEGACY_LEAD_TYPE_ALIAS_MAP: Record<string, UnifiedLeadType> = {
  bdc_aftersales_recall: "maintenance_churn",
  bdc_renewal: "renew_to_renew",
  dormant: "no_visit_365d",
  pending_activation: "newcar_delivery_90d_revisit",
  active: "bdc_campaign",
  diamond: "cm_custom",
  gold: "cm_custom",
  silver: "cm_custom",
  bdc_aftersales_churn_15m: "maintenance_churn",
  segment_template_validation: "cm_custom",
  repair_pending: "in_repair_no_insurance",
  parking_repair_pending: "in_repair_no_insurance"
};

const LEAD_TYPE_TAG_TYPE_MAP: Record<UnifiedLeadType, LeadTagType> = {
  aftersales_cs: "primary",
  newcar_cs: "success",
  bdc_campaign: "primary",
  cm_custom: "danger",
  pcn_aftersales_campaign: "success",
  ttr_survey: "warning",
  new_to_renew: "primary",
  renew_to_renew: "success",
  in_repair_no_insurance: "warning",
  psp_expiry: "warning",
  maintenance_churn: "danger",
  no_visit_365d: "info",
  regular_maintenance_365d: "primary",
  periodic_maintenance: "success",
  first_insurance_2y: "primary",
  first_maintenance: "success",
  newcar_365d_no_maintenance: "warning",
  newcar_warranty_expiry: "primary",
  extended_warranty_expiry: "success",
  newcar_delivery_90d_revisit: "danger"
};

export const normalizeLeadType = (type?: string | null): string => {
  const rawType = String(type || "").trim();
  if (!rawType) return "";
  return LEGACY_LEAD_TYPE_ALIAS_MAP[rawType] || rawType;
};

export const getLeadTypeLabel = (type?: string | null): string => {
  const normalizedType = normalizeLeadType(type);
  return LEAD_TYPE_LABEL_MAP[normalizedType] || normalizedType || "-";
};

export const getLeadTypeTagType = (type?: string | null): LeadTagType => {
  const normalizedType = normalizeLeadType(type) as UnifiedLeadType;
  return LEAD_TYPE_TAG_TYPE_MAP[normalizedType] || "primary";
};

export const normalizeLeadTypeField = <T extends Record<string, any>>(item: T, field: string): T => {
  if (!item || typeof item !== "object" || !(field in item)) return item;
  return {
    ...item,
    [field]: normalizeLeadType(item[field])
  };
};

export const normalizeLeadTypeList = <T extends Record<string, any>>(items: T[], field: string): T[] =>
  (items || []).map(item => normalizeLeadTypeField(item, field));

export const mergeLeadTypeMetrics = <T extends { type: string }>(items: T[], metricKeys: string[]): T[] => {
  const merged = new Map<string, T>();

  (items || []).forEach(item => {
    const normalizedType = normalizeLeadType(item.type);
    const existing = merged.get(normalizedType);
    if (!existing) {
      merged.set(normalizedType, { ...item, type: normalizedType });
      return;
    }

    const next = { ...existing } as Record<string, any>;
    metricKeys.forEach(key => {
      const currentValue = Number(next[key] || 0);
      const incomingValue = Number((item as Record<string, any>)[key] || 0);
      next[key] = currentValue + incomingValue;
    });
    merged.set(normalizedType, next as T);
  });

  return BOARD_LEAD_TYPE_OPTIONS.map(option => merged.get(option.value)).filter(Boolean) as T[];
};
