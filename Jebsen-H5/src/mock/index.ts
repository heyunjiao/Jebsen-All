/**
 * 基于 Axios 拦截器的 Mock 方案
 * 不依赖 vite-plugin-mock，直接在 axios 层面拦截请求
 */
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { CustomerProfile, TagPool, MobileData, MobileItem, MaintenanceRecord, Appointment, PlatformSource, Opportunity, OperationLog, InsuranceRecord, MarketingCampaign } from '@/types/customer'
import { STORE_LIST } from '@/constants/storeList'
import { mockCustomerProfile, mockCompanyProfile, mockTagPool, mockRelationTagPool, mockMaintenanceRecords, mockFinancialLoanRecords } from './data'
import { normalizeInsuranceRecords, validateInsuranceRecords } from './rules'

// 模拟网络延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// API 响应格式
interface MockResponse<T> {
  code: number
  message: string
  data: T
}

// 检查是否启用 Mock
const isMockEnabled = () => {
  // 开发环境默认启用，可通过环境变量控制
  const env = import.meta.env.MODE
  const useMock = import.meta.env.VITE_USE_MOCK !== 'false'
  return env === 'development' && useMock
}

/**
 * Mock 请求拦截器
 * 在 axios 请求拦截器中调用，如果匹配到 Mock 规则则返回 Mock 数据
 */
export async function mockRequestInterceptor(
  config: AxiosRequestConfig
): Promise<AxiosResponse | null> {
  // 如果未启用 Mock，直接返回 null，让请求正常发送
  if (!isMockEnabled()) {
    return null
  }

  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()
  const baseURL = config.baseURL || '/api'

  // 构建完整路径
  const fullPath = url.startsWith('http') ? url : `${baseURL}${url}`

  console.log(`[Mock] 拦截请求: ${method.toUpperCase()} ${fullPath}`, {
    originalUrl: url,
    baseURL,
    method,
    fullPath,
  })

  // 根据路径和方法匹配 Mock 规则
  let mockResponse: MockResponse<any> | null = null

  // 手机号或座机校验与规范化（供多处使用）
  const isPhoneOrLandlineValid = (raw: string) => {
    const cleaned = (raw || '').replace(/[\s-]/g, '')
    return /^(1[3-9]\d{9}|0\d{2,3}\d{7,8}|\d{7,8})$/.test(cleaned)
  }
  const normalizePhone = (raw: string) => (raw || '').replace(/[\s-]/g, '').trim()

  // 多 OneId 时按 customerId 区分列表数据，与顶部身份保持一致
  const customerIdToDisplayName: Record<string, string> = {
    C001: '陈明',
    C002: '张雪',
    C003: '李华',
    COMP001: '深圳市望昕实业有限公司',
    COMP002: '上海捷成汽车销售有限公司',
  }
  const getTargetProfileForLists = (customerId: string | undefined) => {
    if (customerId === 'COMP001' || customerId === 'COMP002') return mockCompanyProfile
    return mockCustomerProfile
  }

  try {
    // GET /api/customer/profile
    if (method === 'get' && fullPath.includes('/customer/profile')) {
      await delay(800)

      // 获取请求中的 customerId
      const params = config.params || {}
      const customerId = params.customerId
      console.log('[Mock] profile 请求参数 customerId:', customerId)

      // 根据 customerId 决定返回哪份数据（支持 5 个 OneId Mock：C001/C002/C003/COMP001/COMP002）
      const isCompanyId = customerId === 'COMP001' || customerId === 'COMP002'
      let baseProfile = isCompanyId ? mockCompanyProfile : mockCustomerProfile
      if (customerId === 'C002') {
        baseProfile = { ...mockCustomerProfile, id: 'C002', name: { ...mockCustomerProfile.name, value: '张雪' } }
      } else if (customerId === 'C003') {
        baseProfile = { ...mockCustomerProfile, id: 'C003', name: { ...mockCustomerProfile.name, value: '李华' } }
      } else if (customerId === 'COMP002') {
        baseProfile = { ...mockCompanyProfile, id: 'COMP002', name: { ...mockCompanyProfile.name, value: '上海捷成汽车销售有限公司' } }
      }

      // 确保 latestOperation 字段存在
      const profileWithLatestOperation = {
        ...baseProfile,
        latestOperation: baseProfile.latestOperation || {
          operator: 'Rebecca Z.',
          operationType: '人工更新',
          operationTime: '2025-01-15 14:30:00',
        },
      }
      console.log('[Mock] profile latestOperation:', profileWithLatestOperation.latestOperation)
      mockResponse = {
        code: 200,
        message: 'success',
        data: profileWithLatestOperation,
      }
    }
    // GET /api/customer/oneids-by-phone（手机号搜索多 OneId 时返回列表，用于顶部切换）
    else if (method === 'get' && fullPath.includes('/customer/oneids-by-phone')) {
      await delay(800)
      const params = config.params || {}
      const phone = (params.phone || '').toString().replace(/\D/g, '')
      // Mock：10000000000 返回空（测试空状态）；13800138000 返回 5 个；13811112222/13833334444 返回 2 个；其他返回 1 个
      let oneIdList: Array<{ oneId: string; type: 'personal' | 'company'; name: string }>
      if (phone === '10000000000') {
        oneIdList = []
      } else if (phone === '13800138000') {
        oneIdList = [
          { oneId: 'C001', type: 'personal', name: '陈明' },
          { oneId: 'C002', type: 'personal', name: '张雪' },
          { oneId: 'C003', type: 'personal', name: '李华' },
          { oneId: 'COMP001', type: 'company', name: '深圳市望昕实业有限公司' },
          { oneId: 'COMP002', type: 'company', name: '上海捷成汽车销售有限公司' },
        ]
      } else if (phone.length >= 11 && ['13811112222', '13833334444'].some(p => phone.includes(p) || p.includes(phone))) {
        oneIdList = [
          { oneId: 'C001', type: 'personal', name: '陈明' },
          { oneId: 'COMP001', type: 'company', name: '深圳市望昕实业有限公司' },
        ]
      } else {
        oneIdList = [{ oneId: 'C001', type: 'personal', name: '陈明' }]
      }
      mockResponse = {
        code: 200,
        message: 'success',
        data: oneIdList,
      }
    }
    // GET /api/customer/tags/pool
    else if (method === 'get' && fullPath.includes('/customer/tags/pool') && !fullPath.includes('/relation-pool')) {
      await delay(500)
      mockResponse = {
        code: 200,
        message: 'success',
        data: mockTagPool,
      }
    }
    // GET /api/customer/tags/relation-pool
    else if (method === 'get' && fullPath.includes('/customer/tags/relation-pool')) {
      await delay(500)
      mockResponse = {
        code: 200,
        message: 'success',
        data: mockRelationTagPool,
      }
    }
    // GET /api/customer/maintenance/records
    else if (method === 'get' && fullPath.includes('/customer/maintenance/records')) {
      await delay(800)
      mockResponse = {
        code: 200,
        message: 'success',
        data: mockMaintenanceRecords,
      }
    }
    // GET /api/customer/insurance/records
    else if (method === 'get' && fullPath.includes('/customer/insurance/records')) {
      await delay(800)

      // 获取分页参数
      const params = config.params || {}
      const page = Number(params.page) || 1
      const pageSize = Number(params.pageSize) || 5

      // 定义保险记录原始数据（生成更多数据用于分页测试）
      const allMockInsuranceRecordsRaw: Partial<InsuranceRecord>[] = [
        {
          id: 'I001',
          type: '交强险',
          amount: 950,
          status: '已生效',
          company: '中国人保',
          policyNo: 'PICC202501150012345',
          startDate: '2025-01-15',
          endDate: '2026-01-14',
          purchaseDate: '2024-12-20',
          source: 'DMS',
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
          purchaseDate: '2024-12-20',
          source: 'DMS',
          renewalSpecialistName: '张明',
        },
        {
          id: 'I003',
          type: '第三者责任险',
          amount: 1200,
          status: '已生效',
          company: '平安保险',
          policyNo: 'PAIC202501150056789',
          startDate: '2025-01-15',
          endDate: '2026-01-14',
          purchaseDate: '2024-12-25',
          source: 'BDC',
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
          purchaseDate: '2024-12-28',
          source: 'CRM',
        },
        {
          id: 'I005',
          type: '交强险',
          amount: 950,
          status: '已过期',
          company: '中国人保',
          policyNo: 'PICC202401150012344',
          startDate: '2024-01-15',
          endDate: '2025-01-14',
          purchaseDate: '2023-12-20',
          source: 'DMS',
        },
        {
          id: 'I006',
          type: '商业险',
          amount: 5200,
          status: '待续保',
          company: '平安保险',
          policyNo: 'PAIC202406150056788',
          startDate: '2024-06-15',
          endDate: '2025-06-14',
          purchaseDate: '2024-05-25',
          source: 'BDC',
          renewalSpecialistName: '王静',
        },
        // 生成更多数据用于分页测试
        {
          id: 'I007',
          type: '交强险',
          amount: 980,
          status: '已生效',
          company: '太平洋保险',
          policyNo: 'CPIC202502150090124',
          startDate: '2025-02-15',
          endDate: '2026-02-14',
          purchaseDate: '2025-01-20',
          source: 'CRM',
        },
        {
          id: 'I008',
          type: '商业险',
          amount: 5200,
          status: '已生效',
          company: '中国人寿',
          policyNo: 'CLIC202502150012347',
          startDate: '2025-02-15',
          endDate: '2026-02-14',
          purchaseDate: '2025-01-25',
          source: 'DMS',
        },
        {
          id: 'I009',
          type: '第三者责任险',
          amount: 1500,
          status: '已生效',
          company: '大地保险',
          policyNo: 'CCIC202502150056790',
          startDate: '2025-02-15',
          endDate: '2026-02-14',
          purchaseDate: '2025-01-28',
          source: 'BDC',
        },
        {
          id: 'I010',
          type: '意外险',
          amount: 750,
          status: '已生效',
          company: '阳光保险',
          policyNo: 'SUN202502150090125',
          startDate: '2025-02-15',
          endDate: '2026-02-14',
          purchaseDate: '2025-02-10',
          source: 'CRM',
        },
        {
          id: 'I011',
          type: '交强险',
          amount: 960,
          status: '待续保',
          company: '中国人保',
          policyNo: 'PICC202502150012348',
          startDate: '2025-02-15',
          endDate: '2026-02-14',
          purchaseDate: '2025-01-20',
          source: 'DMS',
        },
        {
          id: 'I012',
          type: '商业险',
          amount: 5500,
          status: '已过期',
          company: '平安保险',
          policyNo: 'PAIC202503150056791',
          startDate: '2024-03-15',
          endDate: '2025-03-14',
          purchaseDate: '2024-02-25',
          source: 'BDC',
        },
      ]

      // 使用规则验证和规范化所有数据
      let allRecords: InsuranceRecord[]
      try {
        allRecords = normalizeInsuranceRecords(allMockInsuranceRecordsRaw)
        if (!validateInsuranceRecords(allRecords)) {
          console.error('[Mock] 保险记录数据验证失败，返回空数组')
          allRecords = []
        }
      } catch (error) {
        console.error('[Mock] 保险记录数据规范化失败:', error)
        allRecords = []
      }

      // 计算分页
      const total = allRecords.length
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const pageRecords = allRecords.slice(startIndex, endIndex)
      const hasMore = endIndex < total

      mockResponse = {
        code: 200,
        message: 'success',
        data: {
          list: pageRecords,
          hasMore,
          total,
        },
      }
      console.log(`[Mock] 保险记录分页返回: 第${page}页, 每页${pageSize}条, 共${total}条, 返回${pageRecords.length}条, 还有更多: ${hasMore}`)
    }
    // GET /api/customer/marketing-campaigns
    else if (method === 'get' && fullPath.includes('/customer/marketing-campaigns')) {
      await delay(800)

      // 获取分页参数
      const params = config.params || {}
      const page = Number(params.page) || 1
      const pageSize = Number(params.pageSize) || 5

      // 定义线下活动记录原始数据
      const allMockMarketingCampaignsRaw: Partial<MarketingCampaign>[] = [
        {
          id: 'MC001',
          campaignCode: 'CAM-2025-001',
          campaignName: '保时捷911试驾体验日',
          campaignType: '试驾活动',
          activityTime: '2025-01-20 14:00:00',
          activityDate: '2025-01-20',
          location: STORE_LIST[0].storeName,
          status: '已参加',
          description: '客户参加了保时捷911试驾体验活动，对车辆性能非常满意',
          organizer: STORE_LIST[0].storeName,
          uploader: 'John Smith',
          validExamples: 25,
          source: 'CRM',
        },
        {
          id: 'MC002',
          campaignCode: 'CAM-2024-012',
          campaignName: '2025年春季新车发布会',
          campaignType: '新车发布会',
          activityTime: '2024-12-15 19:00:00',
          activityDate: '2024-12-15',
          location: '上海闵行店',
          status: '未参加',
          description: '客户报名了2025年春季新车发布会，但最终未参加',
          organizer: '上海闵行店',
          uploader: 'Emily Johnson',
          validExamples: 150,
          source: 'BDC',
        },
        {
          id: 'MC003',
          campaignCode: 'CAM-2024-011',
          campaignName: '保时捷车主聚会',
          campaignType: '车主聚会',
          activityTime: '2024-11-10 18:00:00',
          activityDate: '2024-11-10',
          location: STORE_LIST[0].storeName,
          status: '已参加',
          description: '客户参加了保时捷车主聚会，与其他车主交流用车心得',
          organizer: STORE_LIST[0].storeName,
          uploader: 'Michael Brown',
          validExamples: 80,
          source: 'CRM',
        },
        {
          id: 'MC004',
          campaignCode: 'CAM-2024-010',
          campaignName: '品牌体验日',
          campaignType: '品牌体验日',
          activityTime: '2024-10-05 10:00:00',
          activityDate: '2024-10-05',
          location: '上海闵行店',
          status: '已参加',
          description: '客户参加了品牌体验日活动，体验了保时捷品牌文化',
          organizer: '上海闵行店',
          uploader: 'Sarah Williams',
          validExamples: 60,
          source: 'DMS',
        },
        {
          id: 'MC005',
          campaignCode: 'CAM-2024-009',
          campaignName: '双十一促销活动',
          campaignType: '促销活动',
          activityTime: '2024-11-11 09:00:00',
          activityDate: '2024-11-11',
          location: STORE_LIST[0].storeName,
          status: '未参加',
          description: '客户报名参加了双十一促销活动，但最终未参加',
          organizer: STORE_LIST[0].storeName,
          uploader: 'David Jones',
          validExamples: 500,
          source: 'BDC',
        },
        {
          id: 'MC006',
          campaignCode: 'CAM-2024-008',
          campaignName: 'Macan试驾专场',
          campaignType: '试驾活动',
          activityTime: '2024-09-20 15:00:00',
          activityDate: '2024-09-20',
          location: '上海闵行店',
          status: '已参加',
          description: '客户参加了Macan试驾专场活动',
          organizer: '上海闵行店',
          uploader: 'Lisa Davis',
          validExamples: 30,
          source: 'CRM',
        },
        {
          id: 'MC007',
          campaignCode: 'CAM-2024-007',
          campaignName: '保时捷赛道日',
          campaignType: '品牌体验日',
          activityTime: '2024-08-15 08:00:00',
          activityDate: '2024-08-15',
          location: STORE_LIST[0].storeName,
          status: '已参加',
          description: '客户参加了保时捷赛道日活动，体验了赛道驾驶乐趣',
          organizer: STORE_LIST[0].storeName,
          uploader: 'Robert Miller',
          validExamples: 100,
          source: 'CRM',
        },
        {
          id: 'MC008',
          campaignCode: 'CAM-2024-006',
          campaignName: 'Cayenne新车品鉴会',
          campaignType: '新车发布会',
          activityTime: '2024-07-25 19:30:00',
          activityDate: '2024-07-25',
          location: '上海闵行店',
          status: '已参加',
          description: '客户参加了Cayenne新车品鉴会',
          organizer: '上海闵行店',
          uploader: 'Jennifer Wilson',
          validExamples: 120,
          source: 'BDC',
        },
        {
          id: 'MC009',
          campaignCode: 'CAM-2024-005',
          campaignName: '保时捷车主自驾游',
          campaignType: '车主聚会',
          activityTime: '2024-06-10 07:00:00',
          activityDate: '2024-06-10',
          location: STORE_LIST[0].storeName,
          status: '未参加',
          description: '客户报名了保时捷车主自驾游活动，但因时间冲突未参加',
          organizer: STORE_LIST[0].storeName,
          uploader: 'James Moore',
          validExamples: 50,
          source: 'CRM',
        },
        {
          id: 'MC010',
          campaignCode: 'CAM-2024-004',
          campaignName: 'Panamera试驾体验',
          campaignType: '试驾活动',
          activityTime: '2024-05-18 14:00:00',
          activityDate: '2024-05-18',
          location: '上海闵行店',
          status: '未参加',
          description: '客户预约了Panamera试驾体验活动，但最终未参加',
          organizer: '上海闵行店',
          uploader: 'Patricia Taylor',
          validExamples: 20,
          source: 'DMS',
        },
      ]

      // 规范化数据（确保必填字段存在）
      const allCampaigns: MarketingCampaign[] = allMockMarketingCampaignsRaw.map((item, index) => ({
        id: item.id || `MC${String(index + 1).padStart(3, '0')}`,
        campaignCode: item.campaignCode || `CAM-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
        campaignName: item.campaignName || '未知活动',
        campaignType: item.campaignType || '其他',
        activityTime: item.activityTime || '',
        activityDate: item.activityDate || item.activityTime?.split(' ')[0] || '',
        location: item.location || '',
        status: item.status || '未参加',
        description: item.description,
        organizer: item.organizer,
        uploader: item.uploader,
        validExamples: item.validExamples,
        source: item.source,
      }))

      // 计算分页
      const total = allCampaigns.length
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const pageCampaigns = allCampaigns.slice(startIndex, endIndex)
      const hasMore = endIndex < total

      mockResponse = {
        code: 200,
        message: 'success',
        data: {
          list: pageCampaigns,
          hasMore,
          total,
        },
      }
      console.log(`[Mock] 线下活动记录分页返回: 第${page}页, 每页${pageSize}条, 共${total}条, 返回${pageCampaigns.length}条, 还有更多: ${hasMore}`)
    }
    // PUT /api/customer/maintenance/records/:id/tags
    else if (method === 'put' && fullPath.includes('/customer/maintenance/records/') && fullPath.includes('/tags')) {
      await delay(700)
      const match = fullPath.match(/\/records\/([^/]+)\/tags/)
      const recordId = match ? match[1] : null
      const tags = (config.data as any)?.tags

      if (!recordId) {
        mockResponse = {
          code: 400,
          message: '缺少记录ID',
          data: null,
        }
      } else if (!Array.isArray(tags)) {
        mockResponse = {
          code: 400,
          message: '标签格式不正确',
          data: null,
        }
      } else {
        const record = mockMaintenanceRecords.find((r) => r.id === recordId)
        if (!record) {
          mockResponse = {
            code: 404,
            message: '记录不存在',
            data: null,
          }
        } else {
          record.tags = tags
          mockResponse = {
            code: 200,
            message: '更新成功',
            data: { tags },
          }
        }
      }
    }
    // POST /api/customer/mobile
    else if (method === 'post' && fullPath.includes('/customer/mobile') && !fullPath.includes('/items') && !fullPath.includes('/merge')) {
      await delay(600)
      const mobile = (config.data as any)?.mobile
      if (!mobile || !isPhoneOrLandlineValid(mobile)) {
        mockResponse = {
          code: 400,
          message: '手机号或座机号格式不正确',
          data: null,
        }
      } else {
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
        mockResponse = {
          code: 200,
          message: '更新成功',
          data: { mobile: normalizedMobile },
        }
      }
    }
    // POST /api/customer/tags
    else if (method === 'post' && fullPath.includes('/customer/tags') && !fullPath.includes('/pool')) {
      await delay(700)
      const tagId = (config.data as any)?.tagId
      if (!tagId) {
        mockResponse = {
          code: 400,
          message: '缺少标签ID',
          data: null,
        }
      } else {
        const tag = mockTagPool.find((t) => t.id === tagId)
        if (!tag) {
          mockResponse = {
            code: 400,
            message: '标签不存在',
            data: null,
          }
        } else {
          if (!mockCustomerProfile.tags.includes(tag.name)) {
            mockCustomerProfile.tags.push(tag.name)
          }
          mockResponse = {
            code: 200,
            message: '添加成功',
            data: { tags: mockCustomerProfile.tags },
          }
        }
      }
    }
    // DELETE /api/customer/tags
    else if (method === 'delete' && fullPath.includes('/customer/tags') && !fullPath.includes('/pool')) {
      await delay(700)
      const tagName = (config.params as any)?.tagName
      if (!tagName) {
        mockResponse = {
          code: 400,
          message: '缺少标签名称',
          data: null,
        }
      } else {
        const index = mockCustomerProfile.tags.indexOf(tagName)
        if (index > -1) {
          mockCustomerProfile.tags.splice(index, 1)
        }
        mockResponse = {
          code: 200,
          message: '删除成功',
          data: { tags: mockCustomerProfile.tags },
        }
      }
    }
    // PUT /api/customer/tags (批量更新标签)
    else if (method === 'put' && fullPath.includes('/customer/tags') && !fullPath.includes('/pool')) {
      await delay(800)
      const body = config.data as any
      const { tags } = body

      if (!Array.isArray(tags)) {
        mockResponse = {
          code: 400,
          message: '标签格式不正确',
          data: null,
        }
      } else {
        // 验证标签是否都在标签池中
        const invalidTags = tags.filter((tagName: string) => !mockTagPool.find(t => t.name === tagName))
        if (invalidTags.length > 0) {
          mockResponse = {
            code: 400,
            message: `以下标签不存在: ${invalidTags.join('、')}`,
            data: null,
          }
        } else {
          // 更新标签列表
          mockCustomerProfile.tags = [...tags]
          mockResponse = {
            code: 200,
            message: '更新成功',
            data: { tags: mockCustomerProfile.tags },
          }
        }
      }
    }
    // POST /api/customer/mobile/items
    else if (method === 'post' && fullPath.includes('/customer/mobile/items')) {
      await delay(600)
      const body = config.data as any
      const { mobile, contactName, relationTagId, relationTagName, relationTagIds, relationTagNames, businessTags, vehicleLabel, isPrimary } = body
      if (!mobile || !isPhoneOrLandlineValid(mobile)) {
        mockResponse = {
          code: 400,
          message: '手机号或座机号格式不正确',
          data: null,
        }
      } else {
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
        mockResponse = {
          code: 200,
          message: '添加成功',
          data: newItem,
        }
      }
    }
    // PUT /api/customer/mobile/items
    else if (method === 'put' && fullPath.includes('/customer/mobile/items')) {
      await delay(600)
      const body = config.data as any
      const { id, mobile, contactName, relationTagId, relationTagName, relationTagIds, relationTagNames, businessTags, vehicleLabel, isPrimary } = body
      if (!id) {
        mockResponse = {
          code: 400,
          message: '缺少电话号码ID',
          data: null,
        }
      } else if (!mobile || !isPhoneOrLandlineValid(mobile)) {
        mockResponse = {
          code: 400,
          message: '手机号或座机号格式不正确',
          data: null,
        }
      } else {
        const mobileData = mockCustomerProfile.mobile as MobileData
        const idStr = String(id)
        let item = mobileData.items.find((i) => String(i.id) === idStr)

        // 兼容：如果根据 id 找不到号码（例如使用了 fallback profile，自定义了 id），
        // 则回退到列表中的第一个号码，避免前端报 404。
        if (!item) {
          console.warn('[Mock PUT] 未找到匹配的电话号码ID，使用首个号码作为回退目标。请求 id =', idStr, '现有 ids =', mobileData.items.map(i => i.id))
          item = mobileData.items[0]
        }

        if (!item) {
          // 理论上不会发生：mock 中至少有一个号码
          mockResponse = {
            code: 404,
            message: '电话号码不存在',
            data: null,
          }
        } else {
          // 如果设置为主号，先将原来的主号改为副号
          if (isPrimary !== undefined && isPrimary) {
            const currentPrimary = mobileData.items.find(i => i.isPrimary && String(i.id) !== String(item!.id))
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
          mockResponse = {
            code: 200,
            message: '更新成功',
            data: item,
          }
        }
      }
    }
    // DELETE /api/customer/mobile/items/:id
    else if (method === 'delete' && fullPath.includes('/customer/mobile/items/')) {
      await delay(600)
      const match = fullPath.match(/\/items\/([^/?]+)/)
      const id = match ? match[1] : null
      if (!id) {
        mockResponse = {
          code: 400,
          message: '缺少电话号码ID',
          data: null,
        }
      } else {
        const mobileData = mockCustomerProfile.mobile as MobileData
        const idStr = String(id)
        const item = mobileData.items.find((i) => String(i.id) === idStr)
        if (!item) {
          mockResponse = {
            code: 404,
            message: '电话号码不存在',
            data: null,
          }
        } else if (item.isPrimary) {
          mockResponse = {
            code: 400,
            message: '不能删除主号码',
            data: null,
          }
        } else {
          mobileData.items = mobileData.items.filter((i) => String(i.id) !== idStr)
          mobileData.isConflict = mobileData.items.length > 1
          mockResponse = {
            code: 200,
            message: '删除成功',
            data: { success: true },
          }
        }
      }
    }
    // POST /api/customer/mobile/merge
    else if (method === 'post' && fullPath.includes('/customer/mobile/merge')) {
      await delay(800)
      const body = config.data as any
      const { ids } = body
      if (!Array.isArray(ids) || ids.length === 0) {
        mockResponse = {
          code: 400,
          message: '请选择要合并的号码',
          data: null,
        }
      } else {
        const mobileData = mockCustomerProfile.mobile as MobileData
        const primaryItem = mobileData.items.find((i) => i.isPrimary)
        if (!primaryItem) {
          mockResponse = {
            code: 400,
            message: '未找到主号码',
            data: null,
          }
        } else {
          const updatedMobileData: MobileData = {
            items: mobileData.items.filter(
              (i) => i.isPrimary || !ids.includes(i.id)
            ),
            isConflict: false,
            editable: mobileData.editable,
          }
          updatedMobileData.isConflict = updatedMobileData.items.length > 1
          mockResponse = {
            code: 200,
            message: '合并成功',
            data: updatedMobileData,
          }
        }
      }
    }
    // PUT /api/customer/preferred-car-model/tags
    else if (method === 'put' && fullPath.includes('/customer/preferred-car-model/tags')) {
      await delay(700)
      const body = config.data as any
      const { tags } = body

      if (!Array.isArray(tags)) {
        mockResponse = {
          code: 400,
          message: '标签格式不正确',
          data: null,
        }
      } else {
        // 更新 mock 数据中的用户偏好标签
        if (!mockCustomerProfile.preferredCarModel.tags) {
          mockCustomerProfile.preferredCarModel.tags = []
        }
        mockCustomerProfile.preferredCarModel.tags = tags

        mockResponse = {
          code: 200,
          message: '更新成功',
          data: { tags },
        }
      }
    }
    // GET /api/customer/transactions
    else if (method === 'get' && fullPath.includes('/customer/transactions')) {
      await delay(800)
      const customerId = config.params?.customerId
      const targetProfile = getTargetProfileForLists(customerId)
      const transactions = targetProfile.transactions || []
      mockResponse = {
        code: 200,
        message: 'success',
        data: transactions,
      }
    }
    // GET /api/customer/vehicles
    else if (method === 'get' && fullPath.includes('/customer/vehicles')) {
      await delay(800)
      const customerId = config.params?.customerId
      const targetProfile = getTargetProfileForLists(customerId)
      const vehicles = targetProfile.vehicles || []
      mockResponse = {
        code: 200,
        message: 'success',
        data: vehicles,
      }
    }
    // PUT /api/customer/vehicles/:id/status
    else if (method === 'put' && fullPath.includes('/customer/vehicles/') && fullPath.includes('/status')) {
      await delay(800)
      const vehicleId = fullPath.match(/\/customer\/vehicles\/([^/]+)\/status/)?.[1]
      const status = (config.data && typeof config.data === 'string' ? JSON.parse(config.data) : config.data)?.status

      if (vehicleId && status) {
        // 个人与公司视图共用车辆列表可能来自不同 profile，两处都查并更新找到的那条
        const listA = mockCustomerProfile.vehicles || []
        const listB = mockCompanyProfile.vehicles || []
        const vehicle = listA.find((v: any) => v.id === vehicleId) ?? listB.find((v: any) => v.id === vehicleId)
        if (vehicle) {
          vehicle.status = status
          mockResponse = {
            code: 200,
            message: 'success',
            data: vehicle,
          }
        } else {
          mockResponse = {
            code: 404,
            message: '车辆不存在',
            data: null,
          }
        }
      } else {
        mockResponse = {
          code: 400,
          message: '参数错误',
          data: null,
        }
      }
    }
    // GET /api/customer/assets
    else if (method === 'get' && fullPath.includes('/customer/assets')) {
      await delay(800)
      const customerId = config.params?.customerId
      const targetProfile = getTargetProfileForLists(customerId)
      const assets = targetProfile.assets || []
      mockResponse = {
        code: 200,
        message: 'success',
        data: assets,
      }
    }
    // GET /api/customer/appointments
    else if (method === 'get' && fullPath.includes('/customer/appointments')) {
      console.log('[Mock] 匹配到 appointments 接口')
      await delay(800)
      const customerId = config.params?.customerId
      const displayName = customerId ? (customerIdToDisplayName[customerId] ?? '陈明') : '陈明'
      const mockAppointments: Appointment[] = [
        {
          id: 'A001',
          type: '试驾预约',
          date: '2025-02-15',
          time: '14:00',
          store: '上海闵行4S店',
          status: '已确认',
          description: `${displayName} 预约试驾911 2025款`,
          vehicleModel: '911 2025款',
          source: 'BDC',
        },
        {
          id: 'A002',
          type: '保养预约',
          date: '2025-02-20',
          time: '10:00',
          store: STORE_LIST[0].storeName,
          status: '待确认',
          description: `${displayName} 定期保养服务`,
          vehicleModel: '911 2025款',
          source: 'BDC',
        },
      ]
      mockResponse = {
        code: 200,
        message: 'success',
        data: mockAppointments,
      }
      console.log('[Mock] appointments Mock 数据:', mockResponse)
    }
    // GET /api/customer/platform-sources
    else if (method === 'get' && fullPath.includes('/customer/platform-sources')) {
      await delay(800)
      const customerId = config.params?.customerId
      const displayName = customerId ? (customerIdToDisplayName[customerId] ?? '陈明') : '陈明'
      const isCompanySource = customerId === 'COMP001' || customerId === 'COMP002'
      const baseKeyInfo = isCompanySource
        ? { name: displayName, mobile: '13800138000', age: 0, gender: '', city: '上海' }
        : { name: displayName, mobile: '13800138000', age: 35, gender: '男', city: '上海' }
      const mockPlatformSources: PlatformSource[] = [
        { id: 'PS001', name: 'DMS', type: '每日导出 CSV', mergeTime: '2025-10-01 10:30:00', keyInfo: { ...baseKeyInfo } },
        { id: 'PS002', name: 'POAS', type: 'POAS系统', mergeTime: '2025-09-28 14:20:00', keyInfo: { ...baseKeyInfo } },
        { id: 'PS003', name: 'WWS', type: 'WWS系统', mergeTime: '2025-09-25 09:15:00', keyInfo: { ...baseKeyInfo } },
        { id: 'PS004', name: 'C@P', type: 'C@P系统', mergeTime: '2025-09-22 16:45:00', keyInfo: { ...baseKeyInfo } },
        { id: 'PS005', name: 'BDC', type: 'BDC系统', mergeTime: '2025-09-20 11:30:00', keyInfo: { ...baseKeyInfo } },
        { id: 'PS006', name: 'Voucher', type: 'Voucher系统', mergeTime: '2025-09-18 13:20:00', keyInfo: { ...baseKeyInfo } },
        { id: 'PS007', name: 'CRM', type: 'CRM系统', mergeTime: '2025-09-15 10:00:00', keyInfo: { ...baseKeyInfo } },
      ]
      mockResponse = {
        code: 200,
        message: 'success',
        data: mockPlatformSources,
      }
    }
    // POST /api/customer/conflicts/name-mobile
    else if (method === 'post' && fullPath.includes('/customer/conflicts/name-mobile')) {
      await delay(800)
      const body = config.data as any
      const { selectedIds, note } = body
      if (!selectedIds || !Array.isArray(selectedIds) || selectedIds.length === 0) {
        mockResponse = {
          code: 400,
          message: '请至少选择一项',
          data: null,
        }
      } else {
        mockResponse = {
          code: 200,
          message: '提交成功，后台管理人员将尽快处理',
          data: { success: true },
        }
      }
    }
    // PUT /api/customer/basic-info
    else if (method === 'put' && fullPath.includes('/customer/basic-info')) {
      await delay(800)
      const body = config.data as any

      // 验证更改理由
      if (!body.reason || !body.reason.trim()) {
        mockResponse = {
          code: 400,
          message: '请输入更改理由',
          data: { success: false },
        }
      }
      // 手机号格式验证
      else if (body.mobile && !/^1[3-9]\d{9}$/.test(String(body.mobile))) {
        mockResponse = {
          code: 400,
          message: '手机号格式不正确',
          data: { success: false },
        }
      }
      // 年龄验证
      else if (body.age !== undefined && (isNaN(Number(body.age)) || Number(body.age) < 0 || Number(body.age) > 150)) {
        mockResponse = {
          code: 400,
          message: '年龄格式不正确',
          data: { success: false },
        }
      }
      else {
        mockResponse = {
          code: 200,
          message: '提交成功，等待后台审核',
          data: { success: true },
        }
      }
    }
    // POST /api/customer/fields/correction
    else if (method === 'post' && fullPath.includes('/customer/fields/correction')) {
      await delay(800)
      const body = config.data as any

      // 验证必填字段
      if (!body.field || body.currentValue === undefined || body.correctValue === undefined) {
        mockResponse = {
          code: 400,
          message: '字段名、当前值和纠错值不能为空',
          data: { success: false },
        }
      }
      // 验证值是否变化
      else if (String(body.currentValue) === String(body.correctValue)) {
        mockResponse = {
          code: 400,
          message: '纠错值应与当前值不同',
          data: { success: false },
        }
      }
      // 手机号格式验证
      else if (body.field === 'mobile' && !/^1[3-9]\d{9}$/.test(String(body.correctValue))) {
        mockResponse = {
          code: 400,
          message: '手机号格式不正确',
          data: { success: false },
        }
      }
      else {
        mockResponse = {
          code: 200,
          message: '纠错信息已提交，等待审核',
          data: { success: true },
        }
      }
    }
    // GET /api/customer/opportunities
    else if (method === 'get' && fullPath.includes('/customer/opportunities')) {
      await delay(800)
      const customerId = config.params?.customerId

      // 个人 ONEID（C001）商机
      const personalOpportunities: Opportunity[] = [
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
          description: '客户姓名：陈明\n客户等级：钻石\n累计消费：¥1,456,200\n客户价值：极高\n拥有车辆：911、Cayenne、Panamera',
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

      //  ONEID（COMP001）商机：10 条类型商机
      const companyOpportunities: Opportunity[] = [
        {
          id: 'OPP_COMP_001',
          oneId: 'COMP001',
          type: 'CM 自定义',
          triggerRule: '大客户规则：过去12个月累计消费≥500万',
          priority: '高',
          status: '待处理',
          pushTarget: 'crm',
          pushStatus: '待推送',
          salesConsultant: '大客户经理·王珂',
          createTime: '2025-01-18 09:30:00',
          description: '名称：深圳市望昕实业有限公司\n客户等级：大客户\n累计消费：¥5,680,000\n重点车型：Taycan / Panamera\n建议动作：邀约高层试驾 Taycan Turbo S',
          source: 'CRM系统',
        },
        {
          id: 'OPP_COMP_002',
          oneId: 'COMP001',
          type: '保养潜在流失',
          triggerRule: '名下车辆首保流失规则',
          priority: '高',
          status: '待处理',
          pushTarget: 'bdc',
          pushStatus: '待推送',
          salesConsultant: '售后专员·刘洋',
          createTime: '2025-01-16 11:00:00',
          description: '名下车辆：Taycan / Panamera\n交付日期：2024/01/10\n至今未进店首保，建议安排专属上门取送车服务。',
          source: 'DMS系统',
        },
        {
          id: 'OPP_COMP_003',
          oneId: 'COMP001',
          type: 'PCN售后 Campaign',
          triggerRule: 'PCN 售后活动规则',
          priority: '中',
          status: '处理中',
          pushTarget: 'bdc',
          pushStatus: '成功',
          salesConsultant: '售后顾问·陈晨',
          createTime: '2025-01-15 15:20:00',
          description: '活动名称：用车轮胎关怀计划\n覆盖车辆：名下全部 Taycan / Panamera\n活动有效期：2025/01/15 - 2025/03/31',
          source: 'PCN系统',
        },
        {
          id: 'OPP_COMP_004',
          oneId: 'COMP001',
          type: 'CM 自定义',
          triggerRule: '合作伙伴识别规则',
          priority: '中',
          status: '待处理',
          pushTarget: 'crm',
          pushStatus: '待推送',
          salesConsultant: 'BD 负责人·张强',
          createTime: '2025-01-12 13:45:00',
          description: '行业：餐饮连锁\n合作方向：联名试驾活动 / 会员权益互通\n建议动作：约见决策人，推进联合营销方案。',
          source: 'CRM系统',
        },
        {
          id: 'OPP_COMP_005',
          oneId: 'COMP001',
          type: 'CM 自定义',
          triggerRule: '名下车辆首保流失规则',
          priority: '中',
          status: '待处理',
          pushTarget: 'bdc',
          pushStatus: '待推送',
          salesConsultant: '售后顾问·黄磊',
          createTime: '2025-01-11 09:10:00',
          description: '车牌：沪A88888\n车型：Taycan Turbo S\n交付日期：2024/01/05\n首保逾期：15个月\n建议动作：电话联系周杰，安排首保绿色通道。',
          source: 'DMS系统',
        },
        {
          id: 'OPP_COMP_006',
          oneId: 'COMP001',
          type: '定期保养',
          triggerRule: 'PCN 售后活动规则',
          priority: '中',
          status: '待处理',
          pushTarget: 'bdc',
          pushStatus: '待推送',
          salesConsultant: '售后顾问·王悦',
          createTime: '2025-01-10 16:20:00',
          description: '活动名称：空调系统免费检测\n覆盖车辆：名下全部 Panamera\n建议动作：给联系人张雪推送活动邀约短信。',
          source: 'PCN系统',
        },
        {
          id: 'OPP_COMP_007',
          oneId: 'COMP001',
          type: 'PCN售后 Campaign',
          triggerRule: '大客户规则：近三年持续复购',
          priority: '高',
          status: '处理中',
          pushTarget: 'crm',
          pushStatus: '成功',
          salesConsultant: '大客户经理·王珂',
          createTime: '2025-01-09 14:00:00',
          description: '近三年每年均有新车采购，Taycan / Panamera 为主力车型；建议规划 2025 车队升级方案。',
          source: 'CRM系统',
        },
        {
          id: 'OPP_COMP_008',
          oneId: 'COMP001',
          type: 'CM 自定义',
          triggerRule: '合作伙伴识别规则',
          priority: '中',
          status: '处理中',
          pushTarget: 'crm',
          pushStatus: '成功',
          salesConsultant: 'BD 负责人·张强',
          createTime: '2025-01-08 10:30:00',
          description: '合作方向：联合会员积分计划\n建议动作：安排门店总经理拜访，确认联合权益包设计。',
          source: 'CRM系统',
        },
        {
          id: 'OPP_COMP_009',
          oneId: 'COMP001',
          type: 'CM 自定义',
          triggerRule: '名下车辆首保流失规则',
          priority: '中',
          status: '待处理',
          pushTarget: 'bdc',
          pushStatus: '待推送',
          salesConsultant: '售后顾问·刘洋',
          createTime: '2025-01-07 11:45:00',
          description: '车牌：沪B99999\n车型：Panamera\n首保逾期：14个月\n建议动作：为提供一键取送车服务方案。',
          source: 'DMS系统',
        },
        {
          id: 'OPP_COMP_010',
          oneId: 'COMP001',
          type: 'CM 自定义',
          triggerRule: 'PCN 售后活动规则',
          priority: '低',
          status: '待处理',
          pushTarget: 'bdc',
          pushStatus: '待推送',
          salesConsultant: '售后顾问·陈晨',
          createTime: '2025-01-06 15:10:00',
          description: '活动名称：原厂轮毂护理套餐\n适用车辆：名下所有车型\n建议动作：推送专属优惠券至周杰微信。',
          source: 'PCN系统',
        },
      ]

      const isCompany = customerId === 'COMP001' || customerId === 'COMP002'
      const baseList = isCompany ? companyOpportunities : personalOpportunities
      const displayName = customerId ? (customerIdToDisplayName[customerId] || (isCompany ? '深圳市望昕实业有限公司' : '陈明')) : '陈明'
      const oneIdForList = customerId || (isCompany ? 'COMP001' : 'C001')
      const mockOpportunities = baseList.map((opp) => ({
        ...opp,
        oneId: oneIdForList,
        description: isCompany
          ? opp.description.replace(/深圳市望昕实业有限公司/g, displayName).replace(/望昕/g, displayName.slice(0, 2))
          : opp.description.replace(/陈明/g, displayName),
      }))

      mockResponse = {
        code: 200,
        message: 'success',
        data: mockOpportunities,
      }
    }
    // GET /api/customer/operation-logs
    else if (method === 'get' && fullPath.includes('/customer/operation-logs')) {
      await delay(800)
      const customerId = config.params?.customerId
      const displayName = customerId ? (customerIdToDisplayName[customerId] ?? '客户') : '客户'
      const mockOperationLogs: OperationLog[] = [
        {
          id: 'LOG001',
          operator: 'Rebecca Z.',
          operationType: '人工更新',
          operationTime: '2025-01-15 14:30:00',
          description: `提交了 ${displayName} 基础信息更新：姓名、手机号`,
        },
        {
          id: 'LOG002',
          operator: 'John D.',
          operationType: '数据纠错',
          operationTime: '2025-01-12 16:45:00',
          description: `提交了 ${displayName} 字段纠错申请：年龄字段`,
        },
        {
          id: 'LOG003',
          operator: 'Alice W.',
          operationType: '人工更新',
          operationTime: '2025-01-10 11:20:00',
          description: `提交了 ${displayName} 标签信息更新`,
        },
        {
          id: 'LOG004',
          operator: 'Bob M.',
          operationType: '冲突处理',
          operationTime: '2025-01-08 09:30:00',
          description: `提交了 ${displayName} 姓名和手机号冲突处理申请`,
        },
        {
          id: 'LOG005',
          operator: 'Rebecca Z.',
          operationType: '人工更新',
          operationTime: '2025-01-05 15:20:00',
          description: `提交了 ${displayName} 电话号码管理更新`,
        },
      ]
      mockResponse = {
        code: 200,
        message: 'success',
        data: mockOperationLogs,
      }
    }
    // GET /api/customer/loan/records
    else if (method === 'get' && fullPath.includes('/customer/loan/records')) {
      await delay(800)
      const params = config.params || {}
      const page = Number(params.page) || 1
      const pageSize = Number(params.pageSize) || 5

      const total = mockFinancialLoanRecords.length
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const pageRecords = mockFinancialLoanRecords.slice(startIndex, endIndex)
      const hasMore = endIndex < total

      mockResponse = {
        code: 200,
        message: 'success',
        data: {
          list: pageRecords,
          hasMore,
          total,
        },
      }
    }

    // 如果匹配到 Mock 规则，返回 Mock 响应
    if (mockResponse) {
      console.log(`[Mock] 返回 Mock 数据:`, {
        url: fullPath,
        method,
        response: mockResponse,
        dataType: typeof mockResponse.data,
        isArray: Array.isArray(mockResponse.data),
        dataLength: Array.isArray(mockResponse.data) ? mockResponse.data.length : 'N/A',
      })
      return {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config,
      } as AxiosResponse
    } else {
      console.log(`[Mock] 未匹配到 Mock 规则: ${method.toUpperCase()} ${fullPath}`)
    }
  } catch (error) {
    console.error('[Mock] 处理请求时出错:', error)
  }

  // 没有匹配到 Mock 规则，返回 null，让请求正常发送
  return null
}
