// 顺序与欢迎页「今日数据采集状态」一致：按上传频率 每天 → 每周五 → 每月第二个周五 → 按需
export const PLATFORM_REPORTS: Record<string, { id: string; name: string }[]> = {
  wws: [{ id: "wws_activity", name: "活动列表" }],
  voucher: [
    { id: "voucher_member_benefit_stats", name: "会员优惠信息统计表" },
    { id: "voucher_balance_detail", name: "优惠券余额报表明细" },
    { id: "voucher_member_addon_sales", name: "会员附加销售报表" }
  ],
  poas: [{ id: "poas_opp", name: "商机表" }],
  cap: [{ id: "cap_vehicle", name: "车辆报告" }],
  manual: [
    { id: "manual_ins_renewal_sales", name: "续保销售记录" },
    { id: "manual_ins_new_sales", name: "新保销售记录" },
    { id: "manual_client_base_table", name: "客户基盘表" },
    { id: "manual_replace_approval", name: "推荐置换再购审批记录" },
    { id: "manual_offline_marketing_segment", name: "线下营销/社群活动分群" },
    { id: "manual_generic_opportunity", name: "自定义通用商机" },
    { id: "manual_ttr", name: "TTR" }
  ]
};

// 与欢迎页一致的上传周期（用于数据催收配置等展示）
export const REPORT_UPLOAD_CYCLE: Record<string, string> = {
  wws_activity: "每天",
  voucher_member_benefit_stats: "每月第二个周五",
  voucher_balance_detail: "每月第二个周五",
  voucher_member_addon_sales: "每月第二个周五",
  poas_opp: "每周五",
  cap_vehicle: "每周五上传",
  manual_ins_renewal_sales: "每月第二个周五",
  manual_ins_new_sales: "每月第二个周五",
  manual_client_base_table: "每月第二个周五",
  manual_replace_approval: "每月第二个周五",
  manual_offline_marketing_segment: "按需",
  manual_generic_opportunity: "按需",
  manual_ttr: "按需"
};

// 平台 key 顺序（与欢迎页今日数据采集状态一致，用于催收配置 tab 顺序）
export const ORDERED_PLATFORM_KEYS = ["wws", "voucher", "poas", "cap", "manual"] as const;

export const PLATFORM_METADATA: Record<string, { label: string; tagType: string; tagLabel: string }> = {
  poas: { label: "POAS", tagType: "danger", tagLabel: "POAS" },
  wws: { label: "WWS", tagType: "warning", tagLabel: "WWS" },
  cap: { label: "C@P系统", tagType: "primary", tagLabel: "Porsche" },
  voucher: { label: "Voucher", tagType: "success", tagLabel: "Marketing" },
  manual: { label: "Manual Files", tagType: "info", tagLabel: "General" }
};

export const DATA_PLATFORM_LABELS: Record<string, string> = {
  poas: "POAS",
  wws: "WWS",
  cap: "C@P系统",
  voucher: "Voucher",
  manual: "Manual Files"
};
