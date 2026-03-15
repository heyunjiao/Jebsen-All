import { MockMethod } from 'vite-plugin-mock'
import type { CustomerProfile, TagPool, MobileData, MobileItem, AddressData, EmailData, MaintenanceRecord, TransactionRecord, VehicleRelation, Asset, NameMobileConflict, Appointment, PlatformSource, InsuranceInfo, Opportunity, OperationLog, InsuranceRecord, FinancialLoanRecord } from '@/types/customer'
import { validateInsuranceRecords, normalizeInsuranceRecords } from './rules'
import { MOCK_PORTRAIT_TAG_NAMES } from '@/constants/tagCategory'
import { STORE_LIST } from '@/constants/storeList'
import { mockTagPool } from './data'

// Mock 客户画像数据（包含冲突数据）
const mockCustomerProfile: CustomerProfile = {
  id: 'C001',
  name: {
    value: '张明',
    isConflict: true,
    sources: [
      { origin: 'DMS', value: '张明', time: '2025-10-01 10:30:00' },
      { origin: 'BDC', value: '张明华', time: '2025-09-15 14:20:00' },
    ],
  },
  age: {
    value: 35,
    isConflict: true,
    sources: [
      { origin: 'DMS', value: 35, time: '2025-10-01 10:30:00' },
      { origin: 'BDC', value: 38, time: '2025-09-15 14:20:00' },
      { origin: 'CRM', value: 36, time: '2025-09-20 09:15:00' },
    ],
  },
  mobile: {
    items: [
      {
        id: 'mobile1',
        mobile: '13800138000',
        isPrimary: true,
        relationTagId: 'relation1',
        relationTagName: '本人',
        businessTags: ['车主'],
        source: 'DMS',
        updateTime: '2025-10-01 10:30:00',
      },
      {
        id: 'mobile2',
        mobile: '13900139000',
        isPrimary: false,
        relationTagId: 'relation2',
        relationTagName: '配偶',
        businessTags: ['送修人'],
        source: 'BDC',
        updateTime: '2025-09-15 14:20:00',
      },
    ],
    isConflict: true,
    editable: true,
  } as MobileData,
  gender: {
    value: '男',
    isConflict: true,
    sources: [
      { origin: 'DMS', value: '男', time: '2025-10-01 10:30:00' },
      { origin: 'BDC', value: '男', time: '2025-09-15 14:20:00' },
      { origin: 'CRM', value: '男', time: '2025-09-20 09:15:00' },
    ],
  },
  city: {
    value: '上海',
    isConflict: true,
    sources: [
      { origin: 'DMS', value: '上海', time: '2025-10-01 10:30:00' },
      { origin: 'BDC', value: '上海', time: '2025-09-15 14:20:00' },
    ],
  },
  addresses: {
    items: [
      { id: 'addr1', address: '上海市浦东新区陆家嘴环路1000号', label: '家庭', isPrimary: true, source: 'DMS', updateTime: '2025-10-01 10:30:00' },
      { id: 'addr2', address: '上海市静安区南京西路1788号', label: '公司', isPrimary: false, source: 'BDC', updateTime: '2025-09-15 14:20:00' },
    ],
  } as AddressData,
  emails: {
    items: [
      { id: 'email1', email: 'zhangming@example.com', label: '个人', isPrimary: true, source: 'DMS', updateTime: '2025-10-01 10:30:00' },
      { id: 'email2', email: 'zm.work@company.com', label: '工作', isPrimary: false, source: 'BDC', updateTime: '2025-09-15 14:20:00' },
    ],
  } as EmailData,
  preferredCarModel: {
    value: '911',
    isConflict: true,
    sources: [
      { origin: 'POAS', value: '911', time: '2025-10-01 10:30:00' },
      { origin: 'BDC', value: 'Macan', time: '2025-09-15 14:20:00' },
      { origin: 'CRM', value: '911', time: '2025-09-20 09:15:00' },
    ],
    tags: MOCK_PORTRAIT_TAG_NAMES.slice(0, 2),
  },
  maintenanceRecords: {
    value: '8次保养，2次维修',
    isConflict: false,
  },
  tags: [...MOCK_PORTRAIT_TAG_NAMES],
  // 新增字段
  opportunityType: {
    value: 'CM 自定义',
    isConflict: false,
    sources: [
      { origin: 'CRM', value: 'CM 自定义', time: '2025-10-01 10:30:00' },
      { origin: 'WWS', value: 'PCN售后 Campaign', time: '2025-10-05 14:20:00' },
      { origin: 'WWS', value: '新转续', time: '2025-10-08 09:15:00' },
    ],
  },
  segmentType: {
    value: 'VIP客户群',
    isConflict: false,
    sources: [
      { origin: 'C@P', value: 'VIP客户群', time: '2025-10-01 10:30:00' },
      { origin: 'POAS', value: '高价值客户群', time: '2025-10-05 14:20:00' },
      { origin: 'CRM', value: '活跃客户群', time: '2025-10-08 09:15:00' },
    ],
  },
  totalConsumption: {
    value: 1456200,
    isConflict: false,
    sources: [
      { origin: 'DMS', value: 1456200, time: '2025-11-15 09:00:00' },
    ],
  },
  customerType: {
    value: '个人',
    isConflict: false,
    sources: [
      { origin: 'CRM', value: '个人', time: '2025-10-01 10:30:00' },
    ],
  },
  servicePreferences: {
    tags: ['定期保养', '紧急维修', '质保期内', '金融贷款'],
  },
  // 姓名+手机号冲突数据
  nameMobileConflict: [
    {
      id: 'conflict1',
      name: '张明',
      mobile: '13800138000',
      origin: 'DMS',
      updateTime: '2025-10-01 10:30:00',
    },
    {
      id: 'conflict2',
      name: '张明华',
      mobile: '13800138001',
      origin: 'BDC',
      updateTime: '2025-09-15 14:20:00',
    },
  ] as NameMobileConflict[],
  // 是否是多源平台合并
  isMultiSource: true,
  // 最新操作信息（用于首页提示）
  latestOperation: {
    operator: 'Rebecca Z.',
    operationType: '人工更新',
    operationTime: '2025-01-15 14:30:00',
  },
  transactions: [
    {
      id: 'T001',
      orderNo: 'ORD20251001001',
      productName: '911 2025款',
      amount: 1450000,
      status: '已完成',
      transactionTime: '2025-10-01 14:30:00',
      source: 'DMS',
    },
    {
      id: 'T002',
      orderNo: 'ORD20250915002',
      productName: '保养服务套餐',
      amount: 3200,
      status: '已完成',
      transactionTime: '2025-09-15 10:20:00',
      source: 'BDC',
    },
    {
      id: 'T003',
      orderNo: 'ORD20250820003',
      productName: 'Cayenne 2025款',
      amount: 920000,
      status: '已完成',
      transactionTime: '2025-08-20 16:45:00',
      source: 'BDC',
    },
    {
      id: 'T004',
      orderNo: 'ORD20250710004',
      productName: '维修服务',
      amount: 8500,
      status: '已完成',
      transactionTime: '2025-07-10 11:30:00',
      source: 'DMS',
    },
    {
      id: 'T005',
      orderNo: 'ORD20251115005',
      productName: 'Panamera 2025款',
      amount: 980000,
      status: '待支付',
      transactionTime: '2025-11-15 09:00:00',
      source: 'DMS',
    },
    {
      id: 'T006',
      orderNo: 'ORD20251025006',
      productName: '检测服务',
      amount: 800,
      status: '已完成',
      transactionTime: '2025-10-25 14:20:00',
      source: 'BDC',
    },
  ],
  vehicles: [
    {
      id: 'V001',
      vehicleModel: '911 2025款',
      licensePlate: '沪A12345',
      registrationCity: '上海',
      vin: 'WP0AB2A909DS12345',
      purchaseDate: '2025-10-01',
      status: '已售',
      source: 'DMS',
      newCarSeries: '911',
      newCarModel: '911 Carrera 4S',
      contractNo: 'HT20251001001',
      signStatus: '已签单',
      submitTime: '2025-09-28 10:00:00',
      signTime: '2025-10-01 15:30:00',
      issueCenter: '华东发放中心',
      newCarMsrp: 1780000,
      newCarContractPrice: 1680000,
      nonCashDiscountAmount: 80000,
      salesItemAmount: 60000,
      salesItemName: '性能升级套装',
    },
    {
      id: 'V002',
      vehicleModel: 'Cayenne 2025款',
      licensePlate: '沪B67890',
      registrationCity: '上海',
      vin: 'WP1AG2A979DS67890',
      purchaseDate: '2025-05-15',
      status: '已售',
      source: 'BDC',
      contractNo: 'HT20250515002',
      signStatus: '已签单',
      submitTime: '2025-05-12 09:00:00',
      signTime: '2025-05-15 14:00:00',
      issueCenter: '华东发放中心',
      newCarMsrp: 1280000,
      newCarContractPrice: 1180000,
      nonCashDiscountAmount: 60000,
      salesItemAmount: 45000,
      salesItemName: '豪华内饰套装',
    },
    {
      id: 'V003',
      vehicleModel: 'Panamera 2025款',
      licensePlate: '沪C11111',
      registrationCity: '上海',
      vin: 'WP0AF2A959NS11111',
      purchaseDate: '2025-03-20',
      status: '已售',
      source: 'DMS',
      contractNo: 'HT20250320003',
      signStatus: '已签单',
      submitTime: '2025-03-18 11:30:00',
      signTime: '2025-03-20 16:00:00',
      issueCenter: '华东发放中心',
      newCarMsrp: 1380000,
      newCarContractPrice: 1280000,
      nonCashDiscountAmount: 70000,
      salesItemAmount: 55000,
      salesItemName: '行政加长套件',
    },
    {
      id: 'V004',
      vehicleModel: 'Macan 2025款',
      licensePlate: '沪D22222',
      registrationCity: '上海',
      vin: 'WP1AA2A939DS22222',
      purchaseDate: '2025-06-10',
      status: '自用',
      source: 'BDC',
      contractNo: 'HT20250610004',
      signStatus: '已签单',
      submitTime: '2025-06-08 10:00:00',
      signTime: '2025-06-10 15:30:00',
      issueCenter: '华东发放中心',
      newCarMsrp: 680000,
      newCarContractPrice: 638000,
      nonCashDiscountAmount: 30000,
      salesItemAmount: 28000,
      salesItemName: '运动外观套件',
    },
    {
      id: 'V005',
      vehicleModel: 'Taycan 2025款',
      licensePlate: '沪E33333',
      registrationCity: '上海',
      vin: 'WP0AC2A939DS33333',
      purchaseDate: '2025-04-05',
      status: '维修中',
      source: 'DMS',
      contractNo: 'HT20250405005',
      signStatus: '已签单',
      submitTime: '2025-04-02 14:00:00',
      signTime: '2025-04-05 10:00:00',
      issueCenter: '华东发放中心',
      newCarMsrp: 988000,
      newCarContractPrice: 928000,
      nonCashDiscountAmount: 45000,
      salesItemAmount: 35000,
      salesItemName: '充电套装',
    },
  ],
  assets: [
    {
      id: 'A001',
      type: 'voucher',
      name: '购车代金券',
      amount: 5000,
      status: '未使用',
      validFrom: '2025-10-01',
      validTo: '2025-10-01',
      source: '上海闵行店',
      commissionNo: 'H28310',
      newCarSeries: 'Macan Basis',
      newCarModel: 'Macan Passion',
      vin: 'WP1AA29533TLB0195',
      contractNo: 'POS_0520_26_00001',
      submitTime: '2026-01-01 10:00:00',
      signTime: '2026-01-09 16:10:47',
      issueCenter: '上海闵行保时捷中心',
      packageName: '金融尊享礼包',
      itemAmount: 4800,
      itemSource: '优惠项目',
    },
    {
      id: 'A002',
      type: 'coupon',
      name: '新车购车优惠券',
      discount: 0.9,
      status: '未使用',
      validFrom: '2025-09-01',
      validTo: '2025-12-31',
      source: STORE_LIST[0].storeName,
      commissionNo: 'H29355',
      newCarSeries: 'Cayenne Basis',
      newCarModel: 'Cayenne',
      vin: 'WP1AA29Y36TDA0641',
      contractNo: 'POS_0130_26_00021',
      submitTime: '2026-01-01 10:00:00',
      signTime: '2026-01-10 15:00:20',
      issueCenter: '深圳龙岗保时捷中心',
      packageName: '新车保障套餐',
      itemAmount: 2500,
      itemSource: '销售项目',
    },
    {
      id: 'A003',
      type: 'voucher',
      name: '维修代金券',
      amount: 2000,
      status: '未使用',
      validFrom: '2025-01-01',
      validTo: '2025-12-31',
      source: STORE_LIST[0].storeName,
      commissionNo: 'H20177',
      newCarSeries: 'Cayenne Basis',
      newCarModel: 'Cayenne',
      vin: 'WP1AA29Y17TDA0087',
      contractNo: 'POS_0203_26_00015',
      submitTime: '2026-01-01 10:00:00',
      signTime: '2026-01-09 14:30:00',
      issueCenter: '杭州滨江保时捷中心',
      packageName: '售后尊享保养',
      itemAmount: 2000,
      itemSource: '售后项目',
    },
    {
      id: 'A004',
      type: 'coupon',
      name: '购车优惠券',
      discount: 0.95,
      status: '已使用',
      validFrom: '2025-08-01',
      validTo: '2025-12-31',
      source: '上海闵行店',
      commissionNo: 'H31763',
      newCarSeries: 'Macan Basis',
      newCarModel: 'Macan Passion',
      vin: 'WP1AA29536TLB0296',
      contractNo: 'POS_0520_26_00045',
      submitTime: '2026-01-02 09:00:00',
      signTime: '2026-01-05 11:20:00',
      issueCenter: STORE_LIST[1].storeName,
      packageName: '优享购车礼包',
      itemAmount: 2100,
      itemSource: '优惠项目',
    },
    {
      id: 'A005',
      type: 'voucher',
      name: '检测代金券',
      amount: 300,
      status: '未使用',
      validFrom: '2025-11-01',
      validTo: '2025-11-01',
      source: STORE_LIST[0].storeName,
      commissionNo: 'H08072',
      newCarSeries: '718 Boxster',
      newCarModel: '718 Boxster',
      vin: 'WP0CA298X8XKZ1365',
      contractNo: 'POS_0520_26_00033',
      submitTime: '2026-01-01 10:00:00',
      signTime: '2026-01-03 15:45:00',
      issueCenter: STORE_LIST[0].storeName,
      packageName: '车辆检测套餐',
      itemAmount: 300,
      itemSource: '售后项目',
    },
    {
      id: 'A006',
      type: 'coupon',
      name: '维修折扣券',
      discount: 0.85,
      status: '未使用',
      validFrom: '2025-10-15',
      validTo: '2025-10-15',
      source: '上海闵行店',
      commissionNo: 'H35495',
      newCarSeries: 'Cayenne Basis',
      newCarModel: 'Cayenne',
      vin: 'WP1AA29Y27TDA0812',
      contractNo: 'POS_0203_26_00028',
      submitTime: '2026-01-01 10:00:00',
      signTime: '2026-01-05 10:30:00',
      issueCenter: '上海闵行保时捷中心',
      packageName: '售后维修折扣',
      itemAmount: 5000,
      itemSource: '售后项目',
    },
    {
      id: 'A007',
      type: 'voucher',
      name: '保养代金券',
      amount: 1000,
      status: '已过期',
      validFrom: '2025-01-01',
      validTo: '2025-01-01',
      source: STORE_LIST[0].storeName,
      commissionNo: 'H29355-OLD',
      newCarSeries: 'Cayenne Basis',
      newCarModel: 'Cayenne',
      vin: 'WP1AA29Y36TDA0641',
      contractNo: 'POS_0130_25_00088',
      submitTime: '2025-01-01 10:00:00',
      signTime: '2025-01-10 14:00:00',
      issueCenter: '深圳龙岗保时捷中心',
      packageName: '年度保养套餐',
      itemAmount: 1000,
      itemSource: '售后项目',
    },
  ],
}

// Mock 公司账户数据
const mockCompanyProfile: CustomerProfile = {
  id: 'COMP001',
  name: {
    value: '深圳市望昕实业有限公司',
    isConflict: false,
  },
  age: {
    value: 'N/A',
    isConflict: false,
  },
  mobile: {
    items: [
      {
        id: 'c_mobile1',
        mobile: '021-66668888',
        isPrimary: true,
        relationTagName: '公司电话',
        businessTags: ['公司'],
        source: 'CRM',
      },
    ],
    isConflict: false,
    editable: true, // 公司类型下允许修改公司电话/手机号
  } as MobileData,
  gender: {
    value: 'N/A',
    isConflict: false,
  },
  city: {
    value: '上海',
    isConflict: false,
  },
  addresses: {
    items: [
      { id: 'c_addr1', address: '深圳市南山区科技园南区深南大道9988号', label: '注册地址', isPrimary: true, source: 'CRM' },
      { id: 'c_addr2', address: '上海市浦东新区世纪大道100号', label: '办公地址', isPrimary: false, source: 'CRM' },
    ],
  } as AddressData,
  emails: {
    items: [
      { id: 'c_email1', email: 'contact@wangxin.com', label: '公司邮箱', isPrimary: true, source: 'CRM' },
      { id: 'c_email2', email: 'hr@wangxin.com', label: '人事', isPrimary: false, source: 'CRM' },
    ],
  } as EmailData,
  preferredCarModel: {
    value: 'Taycan',
    isConflict: false,
    tags: MOCK_PORTRAIT_TAG_NAMES.slice(0, 2),
  },
  maintenanceRecords: {
    value: '25次保养，5次维修',
    isConflict: false,
  },
  tags: MOCK_PORTRAIT_TAG_NAMES.slice(0, 4),
  customerType: {
    value: '公司',
    isConflict: false,
  },
  handlers: [
    { id: 'H001', name: '汪洁', role: '使用人', mobile: '13811112222' },
    { id: 'H002', name: '张雪', role: '联系人', mobile: '13833334444' },
    { id: 'H003', name: '周杰', role: '送修人', mobile: '13855556666' },
  ],
  selectedHandlerId: 'H001',
  totalConsumption: {
    value: 5680000,
    isConflict: false,
  },
}


// 画像标签池：与 PC 标签管理一致，使用 data 中的 mockTagPool（来自 TAG_CATEGORY_OPTIONS）

// Mock 服务偏好标签池数据
const mockServicePreferenceTagPool: TagPool[] = [
  { id: 'sp1', name: '定期保养', color: '#13c2c2' },
  { id: 'sp2', name: '紧急维修', color: '#f5222d' },
  { id: 'sp3', name: '质保期内', color: '#52c41a' },
  { id: 'sp4', name: '质保期外', color: '#faad14' },
  { id: 'sp5', name: '车辆检测', color: '#1890ff' },
  { id: 'sp6', name: '美容护理', color: '#eb2f96' },
  { id: 'sp7', name: '轮胎更换', color: '#722ed1' },
  { id: 'sp8', name: '保险服务', color: '#fa8c16' },
  { id: 'sp9', name: '道路救援', color: '#ff4d4f' },
  { id: 'sp10', name: '延保服务', color: '#2f54eb' },
  { id: 'sp11', name: '二手车评估', color: '#13c2c2' },
  { id: 'sp12', name: '金融贷款', color: '#52c41a' },
]

// Mock 维保记录数据
const mockMaintenanceRecords = [
  {
    id: 'M001',
    serviceType: '换油服务',
    serviceTime: '2025-01-15 10:30:00',
    serviceStore: '上海闵行4S店',
    vehicleModel: '911 2025款',
    amount: 1200,
    description: '更换机油、机滤、空滤，检查轮胎、刹车系统',
    tags: ['换油服务', '质保期内'],
    insurance: {
      type: '商业险',
      company: '中国人保',
      policyNo: 'PICC202501150012346',
      startDate: '2025-01-15',
      endDate: '2026-01-14',
      amount: 4850,
    } as InsuranceInfo,
  },
  {
    id: 'M002',
    serviceType: '维修',
    serviceTime: '2025-12-20 14:20:00',
    serviceStore: STORE_LIST[0].storeName,
    vehicleModel: '911 2025款',
    amount: 3500,
    description: '更换前保险杠，修复前大灯',
    tags: ['维修', '质保期内'],
    insurance: {
      type: '交强险+商业险',
      company: '平安保险',
      policyNo: 'PAIC202412150056789',
      startDate: '2024-12-15',
      endDate: '2025-12-14',
      amount: 6800,
    } as InsuranceInfo,
  },
  {
    id: 'M003',
    serviceType: '常规维修',
    serviceTime: '2025-10-05 09:15:00',
    serviceStore: '上海闵行4S店',
    vehicleModel: '911 2025款',
    amount: 1500,
    description: '更换机油、机滤、空滤、空调滤芯，检查电瓶',
    tags: ['常规维修', '质保期内', '满意客户'],
    insurance: {
      type: '商业险',
      company: '中国人保',
      policyNo: 'PICC2025001234',
      startDate: '2025-10-01',
      endDate: '2025-10-01',
      amount: 5000,
    } as InsuranceInfo,
  },
  {
    id: 'M004',
    serviceType: '尊享快修',
    serviceTime: '2025-08-18 11:00:00',
    serviceStore: STORE_LIST[0].storeName,
    vehicleModel: '911 2025款',
    amount: 0,
    description: '尊享快修：发动机、变速箱、制动系统',
    tags: ['尊享快修', '质保期内'],
  },
]

// Mock 保险记录数据（全部字段均有值，便于展示与联调）
const mockInsuranceRecordsRaw: Partial<InsuranceRecord>[] = [
  {
    id: 'I001',
    type: '交强险',
    amount: 950,
    status: '已生效',
    company: '中国人保',
    policyNo: 'PICC202501010012345',
    startDate: '2025-01-15',
    endDate: '2026-01-14',
    commercialInsuranceExpiryDate: '2026-01-14',
    insuredPerson: '张明',
    purchaseDate: '2024-12-20',
    renewalSpecialistName: '张明',
  },
  {
    id: 'I002',
    type: '商业险',
    amount: 4850,
    status: '已生效',
    company: '中国人保',
    policyNo: 'PICC202501150012346',
    startDate: '2025-01-15',
    endDate: '2026-01-14',
    commercialInsuranceExpiryDate: '2026-01-14',
    insuredPerson: '张明',
    vehicleDamageAmount: 280000,
    driverSeatAmount: 50,
    passengerSeatAmount: 50,
    purchaseDate: '2024-12-20',
    renewalSpecialistName: '张明',
  },
  {
    id: 'I003',
    type: '第三者责任险',
    amount: 1200,
    status: '已生效',
    company: '平安保险',
    policyNo: 'PAIC202501010056789',
    startDate: '2025-01-15',
    endDate: '2026-01-14',
    commercialInsuranceExpiryDate: '2026-01-14',
    insuredPerson: '张明',
    vehicleDamageAmount: 0,
    driverSeatAmount: 10,
    passengerSeatAmount: 10,
    purchaseDate: '2024-12-25',
    renewalSpecialistName: '李芳',
  },
  {
    id: 'I004',
    type: '意外险',
    amount: 680,
    status: '已生效',
    company: '太平洋保险',
    policyNo: 'CPIC202501150090123',
    startDate: '2025-01-15',
    endDate: '2026-01-14',
    commercialInsuranceExpiryDate: '2026-01-14',
    insuredPerson: '张明',
    purchaseDate: '2024-12-28',
    renewalSpecialistName: '王敏',
  },
  {
    id: 'I005',
    type: '交强险',
    amount: 950,
    status: '已过期',
    company: '中国人保',
    policyNo: 'PICC202401010012344',
    startDate: '2024-01-15',
    endDate: '2025-01-14',
    commercialInsuranceExpiryDate: '2025-01-14',
    insuredPerson: '张明',
    purchaseDate: '2023-12-20',
    renewalSpecialistName: '李四',
  },
  {
    id: 'I006',
    type: '商业险',
    amount: 5200,
    status: '待续保',
    company: '平安保险',
    policyNo: 'PAIC202406010056788',
    startDate: '2024-06-15',
    endDate: '2025-06-14',
    commercialInsuranceExpiryDate: '2025-06-14',
    insuredPerson: '张明',
    vehicleDamageAmount: 320000,
    driverSeatAmount: 60,
    passengerSeatAmount: 60,
    purchaseDate: '2024-05-25',
    renewalSpecialistName: '王静',
  },
]

// 使用规则验证和规范化保险记录数据
let mockInsuranceRecords: InsuranceRecord[]
try {
  // 规范化数据（确保金额取整、格式正确等）
  mockInsuranceRecords = normalizeInsuranceRecords(mockInsuranceRecordsRaw)

  // 验证规范化后的数据
  if (!validateInsuranceRecords(mockInsuranceRecords)) {
    throw new Error('保险记录数据验证失败')
  }

  console.log('[Mock] 保险记录数据已通过规则验证，共', mockInsuranceRecords.length, '条')
} catch (error) {
  console.error('[Mock] 保险记录数据规范化或验证失败:', error)
  // 如果验证失败，使用空数组，避免返回无效数据
  mockInsuranceRecords = []
}

// Mock 商机信息数据
const mockOpportunities: Opportunity[] = [
  {
    id: 'OPP000',
    oneId: 'C001',
    type: 'CM 自定义',
    triggerRule: '高价值客户识别规则：累计消费超过100万',
    priority: '高',
    status: '待处理',
    pushTarget: 'crm',
    pushStatus: '待推送',
    salesConsultant: '李雷',
    createTime: '2025-01-16 10:00:00',
    description: '客户姓名：张明\n客户等级：钻石\n累计消费：¥1,456,200\n客户价值：极高\n拥有车辆：911、Cayenne、Panamera',
    source: 'CRM系统',
  },
  {
    id: 'OPP001',
    oneId: 'C001',
    type: '保养潜在流失',
    triggerRule: '首保流失提醒规则',
    priority: '高',
    status: '待处理',
    pushTarget: 'bdc',
    pushStatus: '待推送',
    salesConsultant: '韩梅梅',
    createTime: '2025-01-15 10:30:00',
    description: '最近保养公里：0\n交付日期：2025/02/02',
    source: 'CRM系统',
  },
  {
    id: 'OPP002',
    oneId: 'C001',
    type: 'PCN售后 Campaign',
    triggerRule: 'PCN售后活动规则',
    priority: '高',
    status: '处理中',
    pushTarget: 'bdc',
    pushStatus: '成功',
    salesConsultant: '王强',
    createTime: '2025-01-14 09:20:00',
    description: '活动内容：对网关控制单元（蓄电池传感器）重新编程\n活动完成率：30%\n距离目标差值（车）：30\n活动属性：30',
    source: 'CRM系统',
  },
]

// Mock 金融贷款记录
const mockFinancialLoanRecords: FinancialLoanRecord[] = [
  {
    id: 'L001',
    vehicleModel: 'Porsche 911 2024款',
    signDate: '2024-01-10',
    signStatus: '已签单',
    submitDate: '2024-01-08',
    startDate: '2024-01-15',
    expectedExpiryMonths: 36,
    loanInfo: '首付30%，年化利率4.5%',
    bank: '招商银行',
    repaymentDay: 15,
    period: '2024-01 - 2027-01',
    status: '正常',
    source: 'DMS',
    issueCenter: '上海闵行保时捷中心',
  },
  {
    id: 'L002',
    vehicleModel: 'Porsche Taycan 2024款',
    signDate: '2023-01-05',
    signStatus: '未签单',
    submitDate: '2023-01-02',
    startDate: '2023-01-10',
    expectedExpiryMonths: 24,
    loanInfo: '融资租赁，月供1.5万',
    bank: '平安银行',
    repaymentDay: 10,
    period: '2023-01 - 2025-01',
    status: '即将到期',
    source: 'BDC',
    issueCenter: '深圳龙岗保时捷中心',
  },
  {
    id: 'L003',
    vehicleModel: 'Porsche Cayenne 2023款',
    signDate: '2023-05-15',
    signStatus: '已签单',
    submitDate: '2023-05-10',
    startDate: '2023-05-20',
    expectedExpiryMonths: 12,
    loanInfo: '低息贷款，已还清10期',
    bank: '中国银行',
    repaymentDay: 20,
    period: '2023-05 - 2024-05',
    status: '即将到期',
    source: 'DMS',
    issueCenter: STORE_LIST[1].storeName,
  }
]

// 模拟网络延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 统一的请求体解析函数
const parseBody = (req: any): any => {
  console.log('[Mock parseBody] 开始解析请求体，req 对象:', {
    url: req.url,
    method: req.method,
    hasBody: !!req.body,
    hasRawBody: !!req.rawBody,
    hasData: !!req.data,
    hasQuery: !!req.query,
    bodyType: typeof req.body,
    bodyValue: req.body,
    rawBodyType: typeof req.rawBody,
    rawBodyValue: req.rawBody,
  })

  // 优先使用 req.body（vite-plugin-mock 3.0 标准格式）
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object' && !Array.isArray(req.body) && Object.keys(req.body).length > 0) {
      console.log('[Mock parseBody] 从 req.body 解析成功:', req.body)
      return req.body
    }
    if (typeof req.body === 'string' && req.body.length > 0) {
      try {
        const parsed = JSON.parse(req.body)
        console.log('[Mock parseBody] 从 req.body 字符串解析成功:', parsed)
        return parsed
      } catch (e) {
        console.warn('[Mock parseBody] 解析 body 字符串失败:', e)
      }
    }
    if (Array.isArray(req.body)) {
      console.log('[Mock parseBody] req.body 是数组:', req.body)
      return req.body
    }
  }

  // 其次使用 req.rawBody
  if (req.rawBody !== undefined && req.rawBody !== null) {
    if (typeof req.rawBody === 'string') {
      try {
        const parsed = JSON.parse(req.rawBody)
        console.log('[Mock parseBody] 从 req.rawBody 字符串解析成功:', parsed)
        return parsed
      } catch (e) {
        console.warn('[Mock parseBody] 解析 rawBody 失败:', e)
      }
    }
    if (typeof req.rawBody === 'object') {
      console.log('[Mock parseBody] 从 req.rawBody 对象获取:', req.rawBody)
      return req.rawBody
    }
  }

  // 最后使用 req.data
  if (req.data !== undefined && req.data !== null) {
    console.log('[Mock parseBody] 从 req.data 获取:', req.data)
    return req.data
  }

  // 如果都没有，尝试从 query 中获取（某些情况下可能在这里）
  if (req.query && typeof req.query === 'object' && Object.keys(req.query).length > 0) {
    console.log('[Mock parseBody] 从 req.query 获取:', req.query)
    return req.query
  }

  console.warn('[Mock parseBody] ⚠️ 无法解析请求体，返回空对象。请求信息:', {
    url: req.url,
    method: req.method,
    hasBody: req.body !== undefined,
    hasRawBody: req.rawBody !== undefined,
    hasData: req.data !== undefined,
    hasQuery: req.query !== undefined,
    bodyType: typeof req.body,
    bodyValue: req.body,
  })

  return {}
}

export default [
  // 获取客户画像数据
  {
    url: '/api/customer/profile',
    method: 'get',
    response: async (req: any) => {
      const { customerId } = req.query || {}
      console.log('[Mock GET] /api/customer/profile - 请求:', req, 'customerId:', customerId)
      await delay(800)

      const profile = customerId === 'COMP001' ? mockCompanyProfile : mockCustomerProfile

      const result = {
        code: 200,
        message: 'success',
        data: profile,
      }
      console.log('[Mock GET] /api/customer/profile - 返回:', result)
      return result
    },
  },
  // 更新手机号（旧版接口，保持兼容）
  {
    url: '/api/customer/mobile',
    method: 'post',
    response: async (req: any) => {
      console.log('[Mock POST] /api/customer/mobile - 开始处理请求')
      console.log('[Mock POST] /api/customer/mobile - 请求对象:', req)
      await delay(600)
      const body = parseBody(req)
      console.log('[Mock POST] /api/customer/mobile - 解析后的 body:', body)
      const { mobile } = body
      const isPhoneOrLandlineValid = (raw: string) => /^(1[3-9]\d{9}|0\d{2,3}\d{7,8}|\d{7,8})$/.test((raw || '').replace(/[\s-]/g, ''))
      const normalizePhone = (raw: string) => (raw || '').replace(/[\s-]/g, '').trim()
      if (!mobile || !isPhoneOrLandlineValid(mobile)) {
        return {
          code: 400,
          message: '手机号或座机号格式不正确',
          data: null,
        }
      }
      const normalizedMobile = normalizePhone(mobile)
      const mobileData = mockCustomerProfile.mobile
      if ('value' in mobileData) {
        mobileData.value = normalizedMobile
      } else if ('items' in mobileData) {
        const primaryItem = mobileData.items.find((i) => i.isPrimary)
        if (primaryItem) {
          primaryItem.mobile = normalizedMobile
        }
      }
      return {
        code: 200,
        message: '更新成功',
        data: { mobile: normalizedMobile },
      }
    },
  },
  // 获取标签池
  {
    url: '/api/customer/tags/pool',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/tags/pool - 请求:', req)
      await delay(500)
      const result = {
        code: 200,
        message: 'success',
        data: mockTagPool,
      }
      console.log('[Mock GET] /api/customer/tags/pool - 返回:', result)
      return result
    },
  },
  // 获取关系标签池
  {
    url: '/api/customer/tags/relation-pool',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/tags/relation-pool - 请求:', req)
      await delay(500)
      const { mockRelationTagPool } = await import('./data')
      const result = {
        code: 200,
        message: 'success',
        data: mockRelationTagPool,
      }
      console.log('[Mock GET] /api/customer/tags/relation-pool - 返回:', result)
      return result
    },
  },
  // 添加标签
  {
    url: '/api/customer/tags',
    method: 'post',
    response: async (req: any) => {
      console.log('[Mock POST] /api/customer/tags - 开始处理请求')
      console.log('[Mock POST] /api/customer/tags - 完整请求对象:', req)
      console.log('[Mock POST] /api/customer/tags - req.body:', req.body)
      console.log('[Mock POST] /api/customer/tags - req.rawBody:', req.rawBody)
      console.log('[Mock POST] /api/customer/tags - req.data:', req.data)
      console.log('[Mock POST] /api/customer/tags - req.query:', req.query)
      await delay(700)
      const body = parseBody(req)
      console.log('[Mock POST] /api/customer/tags - 解析后的 body:', body)
      const { tagId } = body

      if (!tagId) {
        return {
          code: 400,
          message: '缺少标签ID',
          data: null,
        }
      }

      const tag = mockTagPool.find((t) => t.id === tagId)
      if (!tag) {
        return {
          code: 400,
          message: '标签不存在',
          data: null,
        }
      }

      if (!mockCustomerProfile.tags.includes(tag.name)) {
        mockCustomerProfile.tags.push(tag.name)
      }

      const result = {
        code: 200,
        message: '添加成功',
        data: { tags: mockCustomerProfile.tags },
      }
      console.log('[Mock POST] 添加标签 - 返回:', result)
      return result
    },
  },
  // 删除标签
  {
    url: '/api/customer/tags',
    method: 'delete',
    response: async (req: any) => {
      console.log('[Mock DELETE] /api/customer/tags - 开始处理请求')
      console.log('[Mock DELETE] /api/customer/tags - 请求对象:', req)
      console.log('[Mock DELETE] /api/customer/tags - req.query:', req.query)
      await delay(700)
      const tagName = req.query?.tagName

      if (!tagName) {
        return {
          code: 400,
          message: '缺少标签名称',
          data: null,
        }
      }

      const index = mockCustomerProfile.tags.indexOf(tagName)
      if (index > -1) {
        mockCustomerProfile.tags.splice(index, 1)
      }

      const result = {
        code: 200,
        message: '删除成功',
        data: { tags: mockCustomerProfile.tags },
      }
      console.log('[Mock DELETE] 删除标签 - 返回:', result)
      return result
    },
  },
  // 批量更新标签（一次性提交）
  {
    url: '/api/customer/tags',
    method: 'put',
    response: async (req: any) => {
      console.log('[Mock PUT] /api/customer/tags - 开始处理请求')
      console.log('[Mock PUT] /api/customer/tags - 请求对象:', req)
      await delay(800)
      const body = parseBody(req)
      console.log('[Mock PUT] /api/customer/tags - 解析后的 body:', body)
      const { tags } = body

      if (!Array.isArray(tags)) {
        return {
          code: 400,
          message: '标签格式不正确',
          data: null,
        }
      }

      // 验证标签是否都在标签池中
      const invalidTags = tags.filter(tagName => !mockTagPool.find(t => t.name === tagName))
      if (invalidTags.length > 0) {
        return {
          code: 400,
          message: `以下标签不存在: ${invalidTags.join('、')}`,
          data: null,
        }
      }

      // 更新标签列表
      mockCustomerProfile.tags = [...tags]

      const result = {
        code: 200,
        message: '更新成功',
        data: { tags: mockCustomerProfile.tags },
      }
      console.log('[Mock PUT] 批量更新标签 - 返回:', result)
      return result
    },
  },
  // 新增电话号码
  {
    url: '/api/customer/mobile/items',
    method: 'post',
    response: async (req: any) => {
      console.log('[Mock POST] /api/customer/mobile/items - 开始处理请求')
      console.log('[Mock POST] /api/customer/mobile/items - 请求对象:', req)
      await delay(600)
      const body = parseBody(req)
      console.log('[Mock POST] /api/customer/mobile/items - 解析后的 body:', body)
      const { mobile, contactName, relationTagId, relationTagName, relationTagIds, relationTagNames, businessTags, vehicleLabel, isPrimary } = body

      const isPhoneOrLandlineValid = (raw: string) => /^(1[3-9]\d{9}|0\d{2,3}\d{7,8}|\d{7,8})$/.test((raw || '').replace(/[\s-]/g, ''))
      const normalizePhone = (raw: string) => (raw || '').replace(/[\s-]/g, '').trim()

      if (!mobile || !isPhoneOrLandlineValid(mobile)) {
        return {
          code: 400,
          message: '手机号或座机号格式不正确',
          data: null,
        }
      }

      const normalizedMobile = normalizePhone(mobile)
      const mobileData = mockCustomerProfile.mobile as MobileData
      // 如果设置为主号，先将原来的主号改为副号
      if (isPrimary) {
        const currentPrimary = mobileData.items.find(item => item.isPrimary)
        if (currentPrimary) {
          currentPrimary.isPrimary = false
        }
      }
      const newItem: MobileItem = {
        id: `mobile${Date.now()}`,
        mobile: normalizedMobile,
        contactName: contactName ? String(contactName).trim() || undefined : undefined,
        isPrimary: isPrimary || false,
        relationTagId: relationTagId || (relationTagIds && relationTagIds.length > 0 ? relationTagIds[0] : undefined),
        relationTagName: relationTagName || (relationTagNames && relationTagNames.length > 0 ? relationTagNames[0] : undefined),
        businessTags: businessTags || [],
        vehicleLabel: vehicleLabel || undefined,
        updateTime: new Date().toLocaleString('zh-CN'),
      }
      mobileData.items.push(newItem)
      mobileData.isConflict = mobileData.items.length > 1

      const result = {
        code: 200,
        message: '添加成功',
        data: newItem,
      }
      console.log('[Mock POST] 新增电话号码 - 返回:', result)
      return result
    },
  },
  // 更新电话号码
  {
    url: '/api/customer/mobile/items',
    method: 'put',
    response: async (req: any) => {
      console.log('[Mock PUT] /api/customer/mobile/items - 开始处理请求')
      console.log('[Mock PUT] /api/customer/mobile/items - 请求对象:', req)
      await delay(600)
      const body = parseBody(req)
      console.log('[Mock PUT] /api/customer/mobile/items - 解析后的 body:', body)
      const { id, mobile, contactName, relationTagId, relationTagName, relationTagIds, relationTagNames, businessTags, vehicleLabel, isPrimary } = body

      if (!id) {
        return {
          code: 400,
          message: '缺少电话号码ID',
          data: null,
        }
      }

      const isPhoneOrLandlineValid = (raw: string) => /^(1[3-9]\d{9}|0\d{2,3}\d{7,8}|\d{7,8})$/.test((raw || '').replace(/[\s-]/g, ''))
      const normalizePhone = (raw: string) => (raw || '').replace(/[\s-]/g, '').trim()

      if (!mobile || !isPhoneOrLandlineValid(mobile)) {
        return {
          code: 400,
          message: '手机号或座机号格式不正确',
          data: null,
        }
      }

      const mobileData = mockCustomerProfile.mobile as MobileData
      const idStr = String(id)
      const item = mobileData.items.find((i) => String(i.id) === idStr)
      if (!item) {
        return {
          code: 404,
          message: '电话号码不存在',
          data: null,
        }
      }

      // 如果设置为主号，先将原来的主号改为副号
      if (isPrimary !== undefined && isPrimary) {
        const currentPrimary = mobileData.items.find(i => i.isPrimary && String(i.id) !== idStr)
        if (currentPrimary) {
          currentPrimary.isPrimary = false
        }
      }

      item.mobile = normalizePhone(mobile)
      if (contactName !== undefined) {
        item.contactName = contactName ? String(contactName).trim() || undefined : undefined
      }
      // 关系标签（单选）
      if (relationTagId !== undefined) {
        item.relationTagId = relationTagId
        item.relationTagName = relationTagName
      } else if (relationTagIds !== undefined && relationTagIds.length > 0) {
        // 向后兼容
        item.relationTagId = relationTagIds[0]
        item.relationTagName = relationTagNames && relationTagNames.length > 0 ? relationTagNames[0] : undefined
      }
      // 业务标签（多选）
      if (businessTags !== undefined) {
        item.businessTags = businessTags
      }
      if (vehicleLabel !== undefined) {
        item.vehicleLabel = vehicleLabel || undefined
      }
      if (isPrimary !== undefined) {
        item.isPrimary = isPrimary
      }
      item.updateTime = new Date().toLocaleString('zh-CN')

      const result = {
        code: 200,
        message: '更新成功',
        data: item,
      }
      console.log('[Mock PUT] 更新电话号码 - 返回:', result)
      return result
    },
  },
  // 删除电话号码 - 使用正则表达式匹配动态路由
  {
    url: /\/api\/customer\/mobile\/items\/.+/,
    method: 'delete',
    response: async (req: any) => {
      console.log('[Mock DELETE] 删除电话号码 - 请求:', req)
      console.log('[Mock DELETE] req.url:', req.url)
      console.log('[Mock DELETE] req 所有键:', Object.keys(req))

      await delay(600)

      // 从 URL 中提取 id
      let id: string | undefined

      if (req.url && typeof req.url === 'string') {
        const match = req.url.match(/\/items\/([^/?]+)/)
        if (match && match[1]) {
          id = match[1]
        }
      }

      if (!id && req.params) {
        if (typeof req.params === 'object') {
          id = req.params.id || req.params[0]
          if (Array.isArray(req.params) && req.params.length > 0) {
            id = req.params[0]
          }
        }
      }

      console.log('[Mock DELETE] 提取的 id:', id)

      if (!id) {
        console.error('[Mock DELETE] ❌ 无法提取 id')
        return {
          code: 400,
          message: '缺少电话号码ID',
          data: null,
        }
      }

      const idStr = String(id)
      const mobileData = mockCustomerProfile.mobile as MobileData
      const item = mobileData.items.find((i) => String(i.id) === idStr)
      if (!item) {
        return {
          code: 404,
          message: '电话号码不存在',
          data: null,
        }
      }

      if (item.isPrimary) {
        return {
          code: 400,
          message: '不能删除主号码',
          data: null,
        }
      }

      mobileData.items = mobileData.items.filter((i) => String(i.id) !== idStr)
      mobileData.isConflict = mobileData.items.length > 1

      const result = {
        code: 200,
        message: '删除成功',
        data: { success: true },
      }
      console.log('[Mock DELETE] 删除电话号码 - 返回:', result)
      return result
    },
  },
  // 合并电话号码
  {
    url: '/api/customer/mobile/merge',
    method: 'post',
    response: async (req: any) => {
      console.log('[Mock POST] 合并电话号码 - 完整请求对象:', JSON.stringify(req, null, 2))
      console.log('[Mock POST] 合并电话号码 - req.body:', req.body)
      console.log('[Mock POST] 合并电话号码 - req.rawBody:', req.rawBody)
      console.log('[Mock POST] 合并电话号码 - req.data:', req.data)
      console.log('[Mock POST] 合并电话号码 - req.query:', req.query)

      await delay(800)
      const body = parseBody(req)
      console.log('[Mock POST] 合并电话号码 - 解析后的 body:', body)
      const { ids } = body

      if (!Array.isArray(ids) || ids.length === 0) {
        const errorResult = {
          code: 400,
          message: '请选择要合并的号码',
          data: null,
        }
        console.log('[Mock POST] 合并电话号码 - 返回错误:', errorResult)
        return errorResult
      }

      const mobileData = mockCustomerProfile.mobile as MobileData
      const primaryItem = mobileData.items.find((i) => i.isPrimary)
      if (!primaryItem) {
        const errorResult = {
          code: 400,
          message: '未找到主号码',
          data: null,
        }
        console.log('[Mock POST] 合并电话号码 - 返回错误:', errorResult)
        return errorResult
      }

      // 深拷贝 mobileData 避免直接修改原始数据
      const updatedMobileData: MobileData = {
        items: mobileData.items.filter(
          (i) => i.isPrimary || !ids.includes(i.id)
        ),
        isConflict: false,
        editable: mobileData.editable,
      }
      updatedMobileData.isConflict = updatedMobileData.items.length > 1

      const result = {
        code: 200,
        message: '合并成功',
        data: updatedMobileData,
      }
      console.log('[Mock POST] 合并电话号码 - 返回成功:', JSON.stringify(result, null, 2))
      return result
    },
  },
  // 获取维保记录
  {
    url: '/api/customer/maintenance/records',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/maintenance/records - 请求:', req)
      await delay(800)
      const result = {
        code: 200,
        message: 'success',
        data: mockMaintenanceRecords,
      }
      console.log('[Mock GET] /api/customer/maintenance/records - 返回:', result)
      return result
    },
  },
  // 更新维保记录标签
  {
    url: /\/api\/customer\/maintenance\/records\/.+\/tags/,
    method: 'put',
    response: async (req: any) => {
      console.log('[Mock PUT] 更新维保记录标签 - 请求:', req)
      await delay(700)
      const body = parseBody(req)
      console.log('[Mock PUT] 更新维保记录标签 - 解析后的 body:', body)

      // 从 URL 中提取 recordId
      let recordId: string | undefined
      if (req.url && typeof req.url === 'string') {
        const match = req.url.match(/\/records\/([^/]+)\/tags/)
        if (match && match[1]) {
          recordId = match[1]
        }
      }

      if (!recordId) {
        return {
          code: 400,
          message: '缺少记录ID',
          data: null,
        }
      }

      const { tags } = body
      if (!Array.isArray(tags)) {
        return {
          code: 400,
          message: '标签格式不正确',
          data: null,
        }
      }

      const record = mockMaintenanceRecords.find((r) => r.id === recordId)
      if (!record) {
        return {
          code: 404,
          message: '记录不存在',
          data: null,
        }
      }

      record.tags = tags

      const result = {
        code: 200,
        message: '更新成功',
        data: { tags },
      }
      console.log('[Mock PUT] 更新维保记录标签 - 返回:', result)
      return result
    },
  },
  // 更新用户偏好标签
  {
    url: '/api/customer/preferred-car-model/tags',
    method: 'put',
    response: async (req: any) => {
      console.log('[Mock PUT] 更新用户偏好标签 - 请求:', req)
      await delay(700)
      const body = parseBody(req)
      console.log('[Mock PUT] 更新用户偏好标签 - 解析后的 body:', body)

      const { tags } = body
      if (!Array.isArray(tags)) {
        return {
          code: 400,
          message: '标签格式不正确',
          data: null,
        }
      }

      // 更新 mock 数据中的用户偏好标签
      if (!mockCustomerProfile.preferredCarModel.tags) {
        mockCustomerProfile.preferredCarModel.tags = []
      }
      mockCustomerProfile.preferredCarModel.tags = tags

      const result = {
        code: 200,
        message: '更新成功',
        data: { tags },
      }
      console.log('[Mock PUT] 更新用户偏好标签 - 返回:', result)
      return result
    },
  },
  // 获取交易记录
  {
    url: '/api/customer/transactions',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/transactions - 请求:', req)
      await delay(800)
      const transactions: TransactionRecord[] = mockCustomerProfile.transactions || []
      const result = {
        code: 200,
        message: 'success',
        data: transactions,
      }
      console.log('[Mock GET] /api/customer/transactions - 返回:', result)
      return result
    },
  },
  // 获取车辆关联
  {
    url: '/api/customer/vehicles',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/vehicles - 请求:', req)
      await delay(800)
      const vehicles: VehicleRelation[] = mockCustomerProfile.vehicles || []
      const result = {
        code: 200,
        message: 'success',
        data: vehicles,
      }
      console.log('[Mock GET] /api/customer/vehicles - 返回:', result)
      return result
    },
  },
  // 获取资产中心
  {
    url: '/api/customer/assets',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/assets - 请求:', req)
      await delay(800)
      const assets: Asset[] = mockCustomerProfile.assets || []
      const result = {
        code: 200,
        message: 'success',
        data: assets,
      }
      console.log('[Mock GET] /api/customer/assets - 返回:', result)
      return result
    },
  },
  // 提交姓名+手机号冲突处理
  {
    url: '/api/customer/conflicts/name-mobile',
    method: 'post',
    response: async (req: any) => {
      console.log('[Mock POST] /api/customer/conflicts/name-mobile - 请求:', req)
      await delay(800)
      const body = parseBody(req)
      console.log('[Mock POST] /api/customer/conflicts/name-mobile - 解析后的 body:', body)
      const { selectedIds, note } = body

      if (!selectedIds || !Array.isArray(selectedIds) || selectedIds.length === 0) {
        return {
          code: 400,
          message: '请至少选择一项',
          data: null,
        }
      }

      const result = {
        code: 200,
        message: '提交成功，后台管理人员将尽快处理',
        data: { success: true },
      }
      console.log('[Mock POST] 提交冲突处理 - 返回:', result)
      return result
    },
  },
  // 获取预约信息
  {
    url: '/api/customer/appointments',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/appointments - 请求:', req)
      await delay(800)
      const mockAppointments: Appointment[] = [
        {
          id: 'A001',
          type: '试驾预约',
          date: '2025-02-15',
          time: '14:00',
          store: '上海闵行4S店',
          status: '已确认',
          description: '预约试驾911 2025款',
          vehicleModel: '911 2025款',
          source: 'DMS',
        },
        {
          id: 'A002',
          type: '保养预约',
          date: '2025-02-20',
          time: '10:00',
          store: STORE_LIST[0].storeName,
          status: '待确认',
          description: '定期保养服务',
          vehicleModel: '911 2025款',
          source: 'DMS',
        },
      ]
      const result = {
        code: 200,
        message: 'success',
        data: mockAppointments,
      }
      console.log('[Mock GET] /api/customer/appointments - 返回:', result)
      return result
    },
  },
  // 获取平台溯源信息
  {
    url: '/api/customer/platform-sources',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/platform-sources - 请求:', req)
      await delay(800)
      const mockPlatformSources: PlatformSource[] = [
        {
          id: 'PS001',
          name: 'DMS',
          type: 'DMS系统',
          mergeTime: '2025-10-01 10:30:00',
          keyInfo: {
            name: '张明',
            mobile: '13800138000',
            age: 35,
            gender: '男',
            city: '上海',
          },
        },
        {
          id: 'PS002',
          name: 'BDC',
          type: 'BDC系统',
          mergeTime: '2025-09-15 14:20:00',
          keyInfo: {
            name: '张明华',
            mobile: '13900139000',
            age: 38,
            gender: '男',
            city: '上海',
          },
        },
        {
          id: 'PS003',
          name: 'CRM',
          type: 'CRM系统',
          mergeTime: '2025-09-20 09:15:00',
          keyInfo: {
            name: '张明',
            mobile: '13800138000',
            age: 36,
            gender: '男',
            city: '上海',
          },
        },
      ]
      const result = {
        code: 200,
        message: 'success',
        data: mockPlatformSources,
      }
      console.log('[Mock GET] /api/customer/platform-sources - 返回:', result)
      return result
    },
  },
  // 获取商机信息
  {
    url: '/api/customer/opportunities',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/opportunities - 请求:', req)
      await delay(800)
      const result = {
        code: 200,
        message: 'success',
        data: mockOpportunities,
      }
      console.log('[Mock GET] /api/customer/opportunities - 返回:', result)
      return result
    },
  },
  // 提交字段纠错信息
  {
    url: '/api/customer/fields/correction',
    method: 'post',
    response: async (req: any) => {
      console.log('[Mock POST] /api/customer/fields/correction - 请求:', req)
      await delay(800)

      // 解析请求体
      let body = req.body
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body)
        } catch (e) {
          console.error('[Mock POST] /api/customer/fields/correction - 解析 body 失败:', e)
        }
      }

      console.log('[Mock POST] /api/customer/fields/correction - 解析后的 body:', body)

      // 验证必填字段
      if (!body.field || body.currentValue === undefined || body.correctValue === undefined) {
        return {
          code: 400,
          message: '字段名、当前值和纠错值不能为空',
          data: { success: false },
        }
      }

      // 验证值是否变化
      if (String(body.currentValue) === String(body.correctValue)) {
        return {
          code: 400,
          message: '纠错值应与当前值不同',
          data: { success: false },
        }
      }

      // 手机号格式验证
      if (body.field === 'mobile' && !/^1[3-9]\d{9}$/.test(String(body.correctValue))) {
        return {
          code: 400,
          message: '手机号格式不正确',
          data: { success: false },
        }
      }

      const result = {
        code: 200,
        message: '纠错信息已提交，等待审核',
        data: { success: true },
      }
      console.log('[Mock POST] /api/customer/fields/correction - 返回:', result)
      return result
    },
  },
  // 更新基础信息（提交审核）
  {
    url: '/api/customer/basic-info',
    method: 'put',
    response: async (req: any) => {
      console.log('[Mock PUT] /api/customer/basic-info - 请求:', req)
      await delay(800)

      // 解析请求体
      let body = req.body
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body)
        } catch (e) {
          console.error('[Mock PUT] /api/customer/basic-info - 解析 body 失败:', e)
        }
      }

      console.log('[Mock PUT] /api/customer/basic-info - 解析后的 body:', body)

      // 验证更改理由
      if (!body.reason || !body.reason.trim()) {
        return {
          code: 400,
          message: '请输入更改理由',
          data: { success: false },
        }
      }

      // 手机号格式验证
      if (body.mobile && !/^1[3-9]\d{9}$/.test(String(body.mobile))) {
        return {
          code: 400,
          message: '手机号格式不正确',
          data: { success: false },
        }
      }

      // 年龄验证
      if (body.age !== undefined && (isNaN(Number(body.age)) || Number(body.age) < 0 || Number(body.age) > 150)) {
        return {
          code: 400,
          message: '年龄格式不正确',
          data: { success: false },
        }
      }

      const result = {
        code: 200,
        message: '提交成功，等待后台审核',
        data: { success: true },
      }
      console.log('[Mock PUT] /api/customer/basic-info - 返回:', result)
      return result
    },
  },
  // 获取操作日志
  {
    url: '/api/customer/operation-logs',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/operation-logs - 请求:', req)
      await delay(800)
      // 只包含人为操作的日志，显示操作人员提交的信息
      const mockOperationLogs: OperationLog[] = [
        {
          id: 'LOG001',
          operator: 'Rebecca Z.',
          operationType: '人工更新',
          operationTime: '2025-01-15 14:30:00',
          description: '提交了客户基础信息更新：姓名、手机号',
        },
        {
          id: 'LOG002',
          operator: 'John D.',
          operationType: '数据纠错',
          operationTime: '2025-01-12 16:45:00',
          description: '提交了字段纠错申请：年龄字段',
        },
        {
          id: 'LOG003',
          operator: 'Alice W.',
          operationType: '人工更新',
          operationTime: '2025-01-10 11:20:00',
          description: '提交了客户标签信息更新',
        },
        {
          id: 'LOG004',
          operator: 'Bob M.',
          operationType: '冲突处理',
          operationTime: '2025-01-08 09:30:00',
          description: '提交了姓名和手机号冲突处理申请',
        },
        {
          id: 'LOG005',
          operator: 'Rebecca Z.',
          operationType: '人工更新',
          operationTime: '2025-01-05 15:20:00',
          description: '提交了客户电话号码管理更新',
        },
      ]
      const result = {
        code: 200,
        message: 'success',
        data: mockOperationLogs,
      }
      console.log('[Mock GET] /api/customer/operation-logs - 返回:', result)
      return result
    },
  },
  // 获取保险记录
  {
    url: '/api/customer/insurance/records',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/insurance/records - 请求:', req)
      await delay(800)

      // 确保返回的数据符合规则
      let records = mockInsuranceRecords

      // 再次验证数据（防止运行时数据被修改）
      if (!validateInsuranceRecords(records)) {
        console.error('[Mock] 保险记录数据验证失败，返回空数组')
        records = []
      }

      const result = {
        code: 200,
        message: 'success',
        data: records,
      }
      console.log('[Mock GET] /api/customer/insurance/records - 返回:', result)
      console.log('[Mock GET] /api/customer/insurance/records - 数据条数:', records.length)
      return result
    },
  },
  // 获取金融贷款记录
  {
    url: '/api/customer/loan/records',
    method: 'get',
    response: async (req: any) => {
      console.log('[Mock GET] /api/customer/loan/records - 请求:', req)
      await delay(800)

      const { type } = req.query || {}
      let records = [...mockFinancialLoanRecords]

      // 如果是"即将到期"的tab，可以过滤状态
      if (type === 'expiring') {
        records = records.filter(r => r.status === '即将到期')
      }

      const result = {
        code: 200,
        message: 'success',
        data: {
          list: records,
          hasMore: false,
          total: records.length
        },
      }
      console.log('[Mock GET] /api/customer/loan/records - 返回:', result)
      return result
    },
  },
] as MockMethod[]
