export const PLATFORM_REPORTS: Record<string, { id: string; name: string }[]> = {
  poas: [{ id: "poas_opp", name: "商机表" }],
  wws: [{ id: "wws_activity", name: "活动列表" }],
  cap: [
    { id: "cap_vehicle", name: "车辆报告" },
    { id: "cap_complaint", name: "投诉报告" },
    { id: "cap_prosperity", name: "共行致远" }
  ],
  voucher: [
    { id: "voucher_sales", name: "附加销售报表" },
    { id: "voucher_benefits", name: "会员优惠信息统计表" },
    { id: "voucher_balance", name: "优惠券余额报表 (明细)" }
  ],
  manual: [
    { id: "manual_pc_marketing", name: "PC主动营销跟进信息更新表" },
    { id: "manual_client_base", name: "客户基盘" },
    { id: "manual_loss_15m", name: "首保15个月流失判定" },
    { id: "manual_ins_new", name: "Monthly Insurance Report-New Car" },
    { id: "manual_ins_used", name: "Monthly Insurance Report-Used Car" },
    { id: "manual_ins_renewal", name: "Monthly Renewal Insurance" },
    { id: "manual_jsp", name: "JSP PAW PSP" },
    { id: "manual_pcn_interest", name: "PCN企微助手 兴趣爱好" },
    { id: "manual_sign", name: "活动报道签名" },
    { id: "manual_base_analysis", name: "基盘分析统计表" }
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
