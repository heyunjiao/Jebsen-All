// 源系统ID关联
export interface SourceSystemId {
  systemName: string; // 源系统名称：DMS、BDC、CRM等
  systemId: string; // 该系统中的客户ID
  linkedAt: string; // 关联时间
  isPrimary: boolean; // 是否为主数据源
}

// 身份血缘溯源
export interface LineageInfo {
  oneId: string; // OneID
  sourceSystems: SourceSystemId[]; // 关联的源系统ID列表
  mergeHistory?: Array<{
    mergedAt: string; // 合并时间 / 变更时间
    mergedBy: string; // 操作人
    reason: string; // 合并 / 变更原因
    sourceSystem?: string; // 触发变更的源系统
    changes?: Array<{
      field: string; // 字段标识（如 name/phone 等）
      fieldLabel?: string; // 字段展示名称（i18n 文案可选）
      oldValue: string | null; // 原值
      newValue: string | null; // 新值
    }>;
  }>; // 合并历史 & 字段变更日志
}

// 生命周期状态：
// - active   : 客户支持启用（正常可触达）
// - inactive : 客户支持停用（不再主动触达）
// - pending  : 审核中 / 数据异常处理中（数据治理员尚未最终确认）
// - conflict : 存在跨源数据冲突，需进入异常中心治理
export type LifecycleStatus = "active" | "inactive" | "pending" | "conflict";

// 数据冲突信息
export interface DataConflict {
  field: string;
  sourceValues: Array<{
    system: string;
    value: any;
  }>;
  resolvedValue?: any; // 系统规则确定的权威值
}

// 多值字段项（用于支持一个字段多个值）
export interface MultiValueItem {
  value: string; // 字段值
  source: string; // 来源系统（DMS、BDC、CRM等）或"黄金记录"
  isPrimary?: boolean; // 是否为主值
  updateTime?: string; // 更新时间
  contactName?: string; // 联系人姓名（与 H5 一致）
  relationTagName?: string; // 关系标签：本人、配偶、公司电话等（与 H5 一致）
  readonly?: boolean; // 是否只读（如售后订单同步）
  personRole?: "购车人" | "送修人" | "联系人"; // 业务角色
  linkedVehicleIds?: string[]; // 关联车辆
  isPreferredRepairer?: boolean; // 是否为首选送修人
  isPrimaryContact?: boolean; // 是否为首选联系人
  slotKey?: "address1" | "address2" | "address3" | "address4"; // 地址槽位
  weight?: number; // 地址权重
  weightLabel?: string; // 地址权重文案
}

// 经办人信息（公司客户，与 H5 一致，多角色人员信息）
// 注意：公司内联系人无独立 OneID，仅公司主体有 OneID；联系人通过 id + 所属公司 oneId 标识
export interface HandlerInfo {
  id: string;
  name: string;
  role?: string; // 经办人角色：使用人、联系人、送修人等
  mobile?: string;
  age?: number | string; // 年龄
  gender?: string; // 性别
  city?: string; // 城市
  avatar?: string;
  latestOperation?: { operator: string; operationType: string; operationTime: string };
  isPrimaryContact?: boolean;
  isPreferredRepairer?: boolean;
  readonly?: boolean;
}

export interface VehicleRelatedPerson {
  id: string;
  role: "购车人" | "送修人";
  name: string;
  phone?: string;
  orderNo?: string;
  readonly?: boolean;
  isPreferred?: boolean;
}

// 客户类型定义（基于OneID的C360系统）
// 个人与公司共用同一列表结构；性别/年龄段/家庭状态仅个人客户有，公司客户为空，详情见 handlers
export interface Customer {
  id: number;
  oneId: string; // OneID - 核心标识
  userId: string; // 兼容旧字段
  customerType: "individual" | "company"; // 客户类型：个人 / 公司
  name: string;
  /** 性别（仅个人客户；公司客户为空，个人相关信息在 handlers 中） */
  gender?: string;
  /** 年龄段（仅个人客户） */
  ageGroup?: string;
  /** 家庭状态（仅个人客户） */
  familyStatus?: string;
  address: string | MultiValueItem[]; // 地址（支持多值）
  phone: string | MultiValueItem[]; // 手机号（支持多值）
  contactPreference: string;
  lastVisitTime: string;
  visitCount90Days: number;
  annualOrderFrequency: number;
  avgConsumption: number;
  projectPreference: string;
  hasComplaintLastYear: boolean;
  annualConsumption: number;
  loyaltyLevel: string;
  opportunityLevel: string;
  vinInfo: string | MultiValueItem[]; // VIN信息（支持多值）
  licensePlate: string | MultiValueItem[]; // 车牌号（支持多值）
  carSeriesModel: string;
  currentMileage: number;
  serviceHabit: string;

  // 新增字段
  lifecycleStatus: LifecycleStatus; // 生命周期状态
  hasConflict: boolean; // 是否存在跨源数据冲突
  conflicts?: DataConflict[]; // 冲突详情
  lineage?: LineageInfo; // 身份血缘信息
  tags?: string[]; // 标签列表
  segmentName?: string; // 分群名称
  /** 主服务门店 ID（用于按门店筛选；后续多品牌可加 primaryBrandId） */
  primaryStoreId?: string;
  /** 主服务门店名称 */
  primaryStoreName?: string;
  createdAt: string; // 客户创建时间
  updatedAt: string; // 最后更新时间
  // 公司客户相关字段
  role?: "user" | "contact" | "repairer"; // 角色：使用人、联系人、送修人
  companyId?: string; // 所属公司ID
  companyOneId?: string; // 所属公司OneID
  // 与 H5 对齐的扩展字段
  city?: string; // 城市
  primaryRelationTag?: string; // 主号关系标签（本人、配偶、公司电话等）
  handlers?: HandlerInfo[]; // 经办人列表（仅公司客户）
  selectedHandlerId?: string; // 当前选中经办人ID（仅公司客户）
}

// 公司信息
export interface CompanyInfo {
  id: string; // 公司ID
  oneId: string; // 公司OneID
  name: string; // 公司名称
  address?: string; // 公司地址
  phone?: string | MultiValueItem[]; // 公司电话
  contactPerson?: string; // 联系人
  /** 公司 OneID 维度的生命周期状态（启用/停用/审核中/冲突） */
  lifecycleStatus?: LifecycleStatus;
}

// 360度全景视图数据
export interface Customer360View {
  customer: Customer;
  company?: CompanyInfo; // 所属公司信息（如果客户属于公司）
  // 维保记录（与 H5 MaintenanceRecord 一致，字段一个不少）
  transactions: Array<{
    id: string;
    serviceType: string; // 服务类型：保养、维修、检测等
    serviceTime: string; // 服务时间
    serviceStore: string; // 服务门店
    vehicleModel?: string; // 车辆型号
    amount?: number; // 服务金额
    description?: string; // 服务描述
    status: string; // 状态：已完成、进行中、待处理、已取消
    tags?: string[]; // 标签列表
    source?: string; // 来源系统
    // 兼容旧字段
    type?: "sale" | "service";
    date?: string;
    orderNo?: string;
    storeName?: string;
    paymentMethod?: string;
  }>;
  // 消费趋势数据（用于图表）
  consumptionTrend: Array<{
    date: string;
    amount: number;
    count: number; // 订单数
  }>;
  // 消费结构（按项目类型）
  consumptionStructure: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  // 保险信息（与 H5 InsuranceRecord 一致）
  insurance?: Array<{
    id: string;
    type: string; // 保险类型：交强险、商业险、第三者责任险、意外险
    amount: number; // 保险金额（取整）
    status: string; // 状态：已生效、已过期、待续保、已退保等
    company?: string; // 保险公司
    policyNo?: string; // 保单号
    startDate?: string; // 保险开始日期
    endDate?: string; // 保险结束日期
    purchaseDate?: string; // 购买日期
    source?: string; // 来源系统
    renewalSpecialistName?: string; // 续保专员名字
    policyName?: string; // 兼容
    coverage?: string;
  }>;
  // 资产中心（与 H5 Asset 一致，优惠券/代金券及车辆合同明细字段一个不少）
  assets: {
    coupons: Array<{
      id: string;
      type?: "coupon" | "voucher";
      name: string;
      amount?: number;
      discount?: number; // 折扣（优惠券）
      status: string; // 未使用、已使用、已过期
      validFrom?: string; // 有效期开始
      validTo?: string; // 有效期结束
      expireDate?: string; // 兼容
      source?: string;
      commissionNo?: string; // Commission 编号
      newCarSeries?: string; // 新车车系
      newCarModel?: string; // 新车车型
      vin?: string; // 车架号
      contractNo?: string; // 合同号
      submitTime?: string; // 提交时间
      signTime?: string; // 签单时间
      issueCenter?: string; // 发放中心
      packageName?: string; // 附加套餐名称
      itemAmount?: number; // 项目金额
      itemSource?: string; // 项目来源
    }>;
    vouchers: Array<{
      id: string;
      name: string;
      balance: number;
      totalAmount?: number;
      usedAmount?: number;
      type?: "coupon" | "voucher";
      amount?: number;
      status?: string;
      validFrom?: string;
      validTo?: string;
      source?: string;
      commissionNo?: string;
      newCarSeries?: string;
      newCarModel?: string;
      vin?: string;
      contractNo?: string;
      submitTime?: string;
      signTime?: string;
      issueCenter?: string;
      packageName?: string;
      itemAmount?: number;
      itemSource?: string;
    }>;
    totalCouponValue: number;
    totalVoucherBalance: number;
  };
  // 车辆关联（与 H5 VehicleRelation 一致）
  vehicles: Array<{
    id: string;
    vehicleModel: string; // 车型
    licensePlate?: string; // 车牌号
    registrationCity?: string; // 上牌城市
    vin?: string; // 车架号
    purchaseDate?: string; // 购买日期
    status?: string; // 状态：自用、已售、维修中等
    /** 相关人员展示（与 H5 一致：使用人/联系人/送修人） */
    rolePerson?: { 使用人?: string; 联系人?: string; 送修人?: string };
    relatedPersons?: VehicleRelatedPerson[];
    source?: string; // 来源系统
    newCarSeries?: string; // 新车车系
    newCarModel?: string; // 新车车型（完整）
    contractNo?: string; // 合同号
    signStatus?: string; // 签单状态
    submitTime?: string; // 提交时间
    signTime?: string; // 签单日期
    issueCenter?: string; // 发放中心
    newCarMsrp?: number; // 新车建议零售总价
    newCarContractPrice?: number; // 新车合同价
    nonCashDiscountAmount?: number; // 非现金折扣金额
    salesItemAmount?: number; // 销售项目金额
    salesItemName?: string; // 销售项目名称
    model?: string; // 兼容
    brand?: string;
    lastServiceDate?: string;
    nextServiceDate?: string;
    mileage?: number;
    serviceCount?: number;
    totalServiceAmount?: number;
  }>;
  // 沟通记录（与 H5 一致）
  interactions: Array<{
    id: string;
    channel?: string; // 沟通渠道（新模型）
    time?: string; // 沟通时间（新模型）
    type: string; // 沟通方式：电话沟通、微信沟通、现场沟通等
    communicationTime?: string; // 沟通时间（H5）
    date?: string; // 兼容
    content?: string; // 沟通内容
    operator?: string; // 沟通人员
    duration?: number | string; // 沟通时长（秒或"15分钟"）
    result?: string; // 沟通结果
    notes?: string; // 备注
  }>;
  // 线下活动
  offlineActivities?: Array<{
    id: string;
    activityCode: string; // 活动编码
    activityDate?: string; // 活动日期（新模型）
    activityName?: string; // 活动名称
    activityType?: string; // 活动类型
    activityTime?: string; // 活动时间
    activityLocation?: string; // 活动地点
    organizer?: string; // 组织者
    uploader?: string; // 上传人
    validExamples?: number; // 有效参与人数
    activityDescription?: string; // 活动描述
    status?: "participated" | "not_participated"; // 参与状态：已参加/未参加
  }>;
  // 金融贷款（与 H5 FinancialLoanRecord 一致）
  financialLoans?: Array<{
    id: string;
    vehicleModel: string; // 车辆
    status: string; // 正常、即将到期、已结清、逾期
    startDate: string; // 开始日期
    expectedExpiryMonths?: number; // 预期到期月数（H5）
    maturityMonths?: number; // 兼容
    signDate?: string; // 签单日期
    signStatus?: string; // 已签单、未签单
    submitDate?: string; // 提交日期
    issueCenter?: string; // 发放中心
    financeInstitution?: string; // 金融机构
    loanTerm?: string; // 贷款周期（如36期）
    customerRate?: number; // 客户费率
    loanAmount?: number; // 贷款金额
    bankRebate?: number; // 银行返点
    loanServiceFee?: number; // 贷款服务费用
    vehicleRegistrationFee?: number; // 车辆上牌服务费
    vehicleRegistrationCitySubsidy?: number; // 车辆上牌城市贷款贴息
    discountRate?: number; // 折扣率（含老车主赠送）
    loanInfo?: string; // 贷款相关信息
    bank?: string; // 银行
    lendingBank?: string; // 兼容
    repaymentDay?: number; // 还款日（数字）
    repaymentDate?: string; // 兼容
    period?: string; // 起始月-到月
    startEndMonth?: string; // 兼容
    downPaymentPercent?: number;
    annualRate?: number;
  }>;
  // 关键业务指标
  metrics: {
    totalConsumption: number; // 总消费
    avgOrderValue: number; // 平均订单价值
    retentionRate: number; // 留存率
    lifetimeValue: number; // 生命周期价值
    visitFrequency: number; // 到店频次（次/年）
    lastVisitDays: number; // 距离上次到店天数
    orderCount: number; // 订单总数
    avgVisitInterval: number; // 平均到店间隔（天）
    projectPreferenceRank: Array<{ name: string; count: number; amount: number }>; // 项目偏好排行
  };
  // 数据统计
  statistics: {
    firstOrderDate: string; // 首次订单日期
    lastOrderDate: string; // 最近订单日期
    totalOrderCount: number; // 总订单数
    totalServiceCount: number; // 总服务次数
    avgConsumptionPerMonth: number; // 月均消费
    peakConsumptionMonth: string; // 消费高峰月份
  };
  // 数据完整性
  dataCompleteness: {
    basicInfo: number; // 基本信息完整度 0-100
    transactionHistory: number; // 交易历史完整度
    vehicleInfo: number; // 车辆信息完整度
    interactionHistory: number; // 沟通记录完整度
  };
  // 数据更新时间
  lastUpdated: {
    basicInfo: string;
    transactions: string;
    assets: string;
    vehicles: string;
    interactions: string;
  };
  // 与 H5 对齐：公司客户经办人、数据状态与提示（多角色人员信息）
  handlers?: HandlerInfo[];
  selectedHandlerId?: string;
  platformSyncStatus?: Array<{ name: string; status: "success" | "error" }>;
  syncTime?: string;
  conflictAlert?: boolean; // 是否存在冲突提示
  latestOperation?: { operator: string; operationType: string; operationTime: string };
  // 营销活动（H5 独立 Tab，与线下活动区分）
  marketingCampaigns?: Array<{
    id: string;
    campaignCode: string;
    activityDate?: string;
    campaignName?: string;
    campaignType?: string;
    activityTime?: string;
    location?: string;
    status?: string;
    organizer?: string;
    uploader?: string;
    validExamples?: number;
    description?: string;
  }>;
}

// 客户维护表单
export interface ProfileMaintenanceForm {
  oneId: string;
  name?: string;
  phone?: string | MultiValueItem[]; // 手机号（支持单值或多值）
  // 其他可维护字段
  aliasMappings?: Array<{
    system: string;
    alias: string;
  }>; // 别名映射
  /** 当前记录在主库中的生命周期状态（用于对比是否发生启用/停用变更） */
  originalLifecycleStatus?: LifecycleStatus;
  /** 期望变更后的生命周期状态（active / inactive），提交到数据异常中心由数据治理员审核 */
  targetLifecycleStatus?: LifecycleStatus;
  /** 前端展示用的生命周期状态（包括 pending / conflict 等） */
  lifecycleStatus?: LifecycleStatus;
  tags?: string[];
}

// 纠错反馈
export interface FeedbackForm {
  oneId: string;
  field: string;
  currentValue: any;
  reportedValue: any;
  reason: string;
  reporter: string;
  status?: "pending" | "approved" | "rejected";
}
