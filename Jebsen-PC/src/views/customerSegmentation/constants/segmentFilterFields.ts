/**
 * 客户分群 - 筛选条件配置
 * 基于「需求侧字段列表」与「标签管理-默认标签」统一维护
 * 标签选项来自 @/constants/tagCategory（会员分层、售后行为、活跃度、本年内购买过粘性产品、投诉相关、定保相关）
 */

export type SectionKey =
  | "basic"      // 基础档案信息
  | "value"     // 客户价值
  | "vehicle"   // 车辆关联信息
  | "sales"     // 销售行为
  | "afterSales" // 售后行为
  | "tags";     // 标签（默认标签）

/** 需求侧维度与区块 key、i18n 键 */
export const SEGMENT_SECTIONS: { key: SectionKey; labelKey: string }[] = [
  { key: "basic", labelKey: "customerSegmentation.filterSections.basic" },
  { key: "value", labelKey: "customerSegmentation.filterSections.value" },
  { key: "vehicle", labelKey: "customerSegmentation.filterSections.vehicle" },
  { key: "sales", labelKey: "customerSegmentation.filterSections.sales" },
  { key: "afterSales", labelKey: "customerSegmentation.filterSections.afterSales" },
  { key: "tags", labelKey: "customerSegmentation.filterSections.tags" }
];

/** 各区块对应的表单字段 key（与 FilterFormType 一致），用于统计与预览 */
export const SECTION_FIELD_KEYS: Record<SectionKey, string[]> = {
  basic: [
    "name",
    "gender",
    "ageGroup",
    "residenceArea",   // 居住区域（搜索城市）
    "lifecycleStatus"  // OneID/生命周期状态
  ],
  value: [
    "annualSpend",
    "compositeScore",  // 价值综合评分
    "afterSalesSelfPayAmount"
  ],
  vehicle: [
    "modelLine",   // 车系
    "modelLines",  // 车型
    "versionYear", // 版本/年款
    "carAge",      // 车龄
    "vin",         // 车架号（VIN）
    "licensePlate", // 车牌号
    "vehicleAttribute", // 车辆属性
    "purchaseAttribute", // 购车属性
    "lastPurchaseDeliveryDate" // 交车日期
  ],
  sales: [
    "totalCarPrice",      // 购车金额（需求侧-销售行为）
    "totalOptionPrice",   // 选配金额
    "completedOrderCount" // 已成交订单数
  ],
  afterSales: [
    "lastVisitTime",               // 到店时间
    "visits90d",                  // 近90天到店
    "annualOrderFreq",            // 年度订单频次
    "avgSpend",                   // 平均消费金额
    "visitsIn2Years",             // 两年内进场/最近一年入厂频次
    "selfPayAmountIn2Years",      // 最近一年自费维修金额
    "lastServiceOrderDate",       // 上次服务日期
    "accidentRepairCountIn1Year", // 最近一年事故维修次数
    "lastMaintenanceStore", // 最近一次保养门店
    "lastReturnStore"        // 最后一次返厂门店
  ],
  tags: [
    "tags"  // 默认标签（tagCategory 叶子）
  ]
};

/** 所有参与快捷筛选的表单字段 key（用于冲突检测、条件计数） */
export const ALL_FILTER_FIELD_KEYS: string[] = SEGMENT_SECTIONS.flatMap(
  s => SECTION_FIELD_KEYS[s.key]
);

/** 去重后的字段 key 列表 */
export const UNIQUE_FILTER_FIELD_KEYS: string[] = [...new Set(ALL_FILTER_FIELD_KEYS)];
