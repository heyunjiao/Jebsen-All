export const PLATFORM_REPORTS: Record<string, { id: string; name: string }[]> = {
  poas: [{ id: "poas_opp", name: "商机表" }],
  wws: [{ id: "wws_activity", name: "活动列表" }],
  cap: [{ id: "cap_vehicle", name: "车辆报告" }],
  voucher: [
    { id: "voucher_member_addon_sales", name: "会员附加销售报表" },
    { id: "voucher_balance_detail", name: "优惠券余额报表明细" },
    { id: "voucher_first_owner_info", name: "首任车主信息" }
  ],
  manual: [
    { id: "manual_ins_renewal_sales", name: "续保销售记录" },
    { id: "manual_ins_new_sales", name: "新保销售记录" },
    { id: "manual_client_base_table", name: "客户基盘表" },
    { id: "manual_replace_approval", name: "推荐置换再购审批记录" },
    { id: "manual_offline_marketing_segment", name: "线下营销/社群活动分群" },
    { id: "manual_generic_opportunity", name: "自定义通用商机" }
  ]
};

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
