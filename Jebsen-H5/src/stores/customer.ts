import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CustomerProfile, TagPool, MaintenanceRecord, TransactionRecord, VehicleRelation, Asset, ConflictResolution, Appointment, PlatformSource, Opportunity, OperationLog, InsuranceRecord, MarketingCampaign, FinancialLoanRecord } from '@/api/customer'
import { customerApi } from '@/api/customer'
import { normalizeOpportunityField, normalizeOpportunities } from '@/constants/opportunityTypes'
import { DEFAULT_TAG_POOL_PC, MOCK_PORTRAIT_TAG_NAMES } from '@/constants/tagCategory'
import { mockFinancialLoanRecords, mockMarketingCampaigns } from '@/mock/data'
import { showLoadingToast, closeToast, showToast } from 'vant'

export const useCustomerStore = defineStore('customer', () => {
  const profile = ref<CustomerProfile | null>(null)
  const tagPool = ref<TagPool[]>([])
  const maintenanceRecords = ref<MaintenanceRecord[]>([])
  const insuranceRecords = ref<InsuranceRecord[]>([])
  const transactions = ref<TransactionRecord[]>([])
  const vehicles = ref<VehicleRelation[]>([])
  const assets = ref<Asset[]>([])
  const appointments = ref<Appointment[]>([])
  const platformSources = ref<PlatformSource[]>([])
  const opportunities = ref<Opportunity[]>([])
  const operationLogs = ref<OperationLog[]>([])
  const marketingCampaigns = ref<MarketingCampaign[]>([])
  const financialLoanRecords = ref<FinancialLoanRecord[]>([])
  const loading = ref(false)

  const normalizeProfileData = (data: CustomerProfile | null) => {
    if (!data)
      return data

    return {
      ...data,
      opportunityType: normalizeOpportunityField(data.opportunityType),
    }
  }

  // 设置经办人
  const setHandler = (handlerId: string) => {
    if (profile.value && profile.value.handlers) {
      profile.value.selectedHandlerId = handlerId
      // 这里可以添加逻辑：切换经办人后重新加载该经办人相关的车辆、维保等信息
      // 目前演示模式下，我们可以保持数据不变，或者模拟一些数据变化
      showToast(`已切换至经办人: ${profile.value.handlers.find(h => h.id === handlerId)?.name}`)
    }
  }

  // 获取客户画像
  const fetchProfile = async (customerId?: string) => {
    loading.value = true
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
    })

    try {
      const res = await customerApi.getProfile(customerId)
      if (res.code === 200) {
        console.log('[Store] 接收到的 profile 数据:', res.data)
        console.log('[Store] vehicles:', res.data.vehicles)
        console.log('[Store] assets:', res.data.assets)
        console.log('[Store] customerType:', res.data.customerType)
        console.log('[Store] opportunityType:', res.data.opportunityType)
        console.log('[Store] segmentType:', res.data.segmentType)
        console.log('[Store] totalConsumption:', res.data.totalConsumption)
        profile.value = normalizeProfileData(res.data)
        // 公司类型若接口未返回经办人列表，补全默认经办人，否则车辆相关人员只能选「公司电话」
        if (profile.value?.customerType?.value === '公司' && (!profile.value.handlers || profile.value.handlers.length === 0)) {
          (profile.value as any).handlers = [
            { id: 'H001', name: '汪洁', role: '使用人', mobile: '' },
            { id: 'H002', name: '张雪', role: '联系人', mobile: '' },
            { id: 'H003', name: '周杰', role: '送修人', mobile: '' },
          ]
          if (!profile.value.selectedHandlerId) (profile.value as any).selectedHandlerId = 'H001'
        }
        console.log('[Store] 设置后的 profile.value:', profile.value)
        console.log('[Store] profile.value.vehicles:', profile.value?.vehicles)
        console.log('[Store] profile.value.assets:', profile.value?.assets)
        console.log('[Store] profile.value.customerType:', profile.value?.customerType)
        console.log('[Store] profile.value.opportunityType:', profile.value?.opportunityType)
        console.log('[Store] profile.value.segmentType:', profile.value?.segmentType)
        console.log('[Store] profile.value.totalConsumption:', profile.value?.totalConsumption)
        console.log('[Store] profile.value.latestOperation:', profile.value?.latestOperation)
      }
    } catch (error: any) {
      // Fallback: 使用本地数据
      console.log('使用 fallback 数据设置 profile, ID:', customerId)
      if (customerId === 'COMP001') {
        profile.value = normalizeProfileData({
          id: 'COMP001',
          name: { value: '深圳市望昕实业有限公司', isConflict: false },
          customerType: { value: '公司', isConflict: false },
          handlers: [
            { id: 'H001', name: '汪洁', role: '采购主管', mobile: '13811112222', isPrimaryContact: true },
            { id: 'H002', name: '张雪', role: '财务经理', mobile: '13833334444' },
            { id: 'H003', name: '周杰', role: '行政总监', mobile: '13855556666' },
          ],
          selectedHandlerId: 'H001',
          tags: MOCK_PORTRAIT_TAG_NAMES.slice(0, 4),
          city: { value: '上海', isConflict: false },
          totalConsumption: { value: 5680000, isConflict: false },
          age: { value: 'N/A', isConflict: false },
          gender: { value: 'N/A', isConflict: false },
          preferredCarModel: { value: 'Taycan', isConflict: false },
          maintenanceRecords: { value: '25次保养', isConflict: false },
          mobile: {
            items: [
              { id: 'm1', mobile: '021-66668888', isPrimary: true, relationTagName: '公司电话' },
              { id: 'm2', mobile: '13811112222', isPrimary: false, relationTagName: '采购联系人', contactName: '汪洁', businessTags: ['购车人'], personRole: '购车人', isPrimaryContact: true, vehicleLabel: 'Cayenne Turbo' },
            ],
            isConflict: true,
            editable: true,
          } as any
        } as CustomerProfile)
      } else {
        profile.value = normalizeProfileData({
          id: 'C001',
          name: { value: '陈明', isConflict: false },
          age: { value: 35, isConflict: false },
          mobile: {
            items: [
              { id: 'm1', mobile: '13800138000', isPrimary: true, relationTagName: '本人' },
            ],
            isConflict: false,
            editable: true,
          } as any,
          gender: { value: '男', isConflict: false },
          city: { value: '北京', isConflict: false },
          preferredCarModel: { value: '3系', isConflict: false },
          maintenanceRecords: { value: '3次保养', isConflict: false },
          tags: MOCK_PORTRAIT_TAG_NAMES.slice(0, 3),
          customerType: { value: '个人', isConflict: false },
        } as CustomerProfile)
      }
    } finally {
      loading.value = false
      closeToast()
    }
  }

  // 获取标签池
  const fetchTagPool = async () => {
    try {
      const res = await customerApi.getTagPool()
      if (res.code === 200) {
        tagPool.value = res.data
      }
    } catch (error: any) {
      // Fallback: 与 PC 标签管理一致（TAG_CATEGORY_OPTIONS 展开的默认标签池）
      tagPool.value = DEFAULT_TAG_POOL_PC as TagPool[]
    }
  }

  // 添加标签
  const addTag = async (tagId: string) => {
    showLoadingToast({
      message: '添加中...',
      forbidClick: true,
    })

    try {
      const res = await customerApi.addTag(tagId)
      if (res.code === 200 && profile.value) {
        // 使用新数组引用确保响应式更新
        profile.value.tags = [...res.data.tags]
        showToast('添加成功')
      }
    } catch (error: any) {
      showToast(error.message || '添加失败，请重试')
    } finally {
      closeToast()
    }
  }

  // 删除标签
  const removeTag = async (tagName: string) => {
    showLoadingToast({
      message: '删除中...',
      forbidClick: true,
    })

    try {
      const res = await customerApi.removeTag(tagName)
      if (res.code === 200 && profile.value) {
        // 使用新数组引用确保响应式更新
        profile.value.tags = [...res.data.tags]
        showToast('删除成功')
      }
    } catch (error: any) {
      showToast(error.message || '删除失败，请重试')
    } finally {
      closeToast()
    }
  }

  // 批量更新标签（一次性提交）
  const updateTags = async (tags: string[]) => {
    showLoadingToast({
      message: '保存中...',
      forbidClick: true,
    })

    try {
      const res = await customerApi.updateTags(tags)
      if (res.code === 200 && profile.value) {
        // 使用新数组引用确保响应式更新
        profile.value.tags = [...res.data.tags]
        showToast('保存成功')
      }
    } catch (error: any) {
      showToast(error.message || '保存失败，请重试')
      throw error
    } finally {
      closeToast()
    }
  }

  // 获取维保记录
  const fetchMaintenanceRecords = async (customerId?: string) => {
    try {
      const res = await customerApi.getMaintenanceRecords(customerId)
      if (res.code === 200) {
        // 使用新数组引用确保响应式更新
        maintenanceRecords.value = [...res.data]
      }
    } catch (error: any) {
      console.error('获取维保记录失败:', error)
      // Fallback: 使用空数组
      maintenanceRecords.value = []
    }
  }

  // 更新维保记录标签
  const updateMaintenanceTags = async (recordId: string, tags: string[]) => {
    try {
      const res = await customerApi.updateMaintenanceTags(recordId, tags)
      if (res.code === 200) {
        // 直接更新本地数据，避免重新加载
        const index = maintenanceRecords.value.findIndex((r) => r.id === recordId)
        if (index !== -1) {
          // 使用新数组引用确保响应式更新
          // 创建新对象以确保响应式更新
          maintenanceRecords.value[index] = {
            ...maintenanceRecords.value[index],
            tags: [...res.data.tags],
          }
        }
      }
      return res
    } catch (error: any) {
      throw error
    }
  }

  // 更新用户偏好标签
  const updatePreferredCarModelTags = async (tags: string[], showSuccessToast = true) => {
    if (showSuccessToast) {
      showLoadingToast({
        message: '保存中...',
        forbidClick: true,
      })
    }

    try {
      const res = await customerApi.updatePreferredCarModelTags(tags)
      if (res.code === 200 && profile.value) {
        // 使用对象展开运算符创建新对象，确保响应式更新
        profile.value.preferredCarModel = {
          ...profile.value.preferredCarModel,
          tags: [...res.data.tags],
        }

        if (showSuccessToast) {
          showToast('保存成功')
        }
      }
    } catch (error: any) {
      if (showSuccessToast) {
        showToast(error.message || '保存失败，请重试')
      }
      throw error
    } finally {
      if (showSuccessToast) {
        closeToast()
      }
    }
  }

  // 获取交易记录
  const fetchTransactions = async (customerId?: string) => {
    try {
      const res = await customerApi.getTransactions(customerId)
      if (res.code === 200) {
        transactions.value = [...res.data]
      }
    } catch (error: any) {
      console.error('获取交易记录失败:', error)
      // Fallback: 使用本地数据
      transactions.value = [
        {
          id: 'T001',
          orderNo: 'ORD20231001001',
          productName: '3系 2023款',
          amount: 320000,
          status: '已完成',
          transactionTime: '2023-10-01 14:30:00',
          source: '官网',
        },
        {
          id: 'T002',
          orderNo: 'ORD20230915002',
          productName: '车辆保养服务',
          amount: 1200,
          status: '已完成',
          transactionTime: '2023-09-15 10:20:00',
          source: '线下门店',
        },
      ]
    }
  }

  // 获取车辆关联
  const fetchVehicles = async (customerId?: string) => {
    try {
      const res = await customerApi.getVehicles(customerId)
      if (res.code === 200) {
        vehicles.value = [...res.data]
      }
    } catch (error: any) {
      console.error('获取车辆关联失败:', error)
      // Fallback: 使用本地数据
      vehicles.value = [
        {
          id: 'V001',
          vehicleModel: '3系 2023款',
          licensePlate: '京A12345',
          registrationCity: '北京',
          vin: 'LBVNU2104X3K12345',
          purchaseDate: '2023-10-01',
          status: '已售',
          source: '官网',
        },
        {
          id: 'V002',
          vehicleModel: 'X5 2023款',
          licensePlate: '京B67890',
          registrationCity: '北京',
          vin: '5UXKR0C550L9A1234',
          purchaseDate: '2022-05-15',
          status: '已售',
          source: '线下门店',
        },
      ]
    }
  }

  // 获取资产中心
  const fetchAssets = async (customerId?: string) => {
    try {
      const res = await customerApi.getAssets(customerId)
      if (res.code === 200) {
        assets.value = [...res.data]
      }
    } catch (error: any) {
      console.error('获取资产中心失败:', error)
      // Fallback: 使用本地数据
      assets.value = [
        {
          id: 'A001',
          type: 'voucher',
          name: '购车代金券',
          amount: 5000,
          status: '未使用',
          validFrom: '2023-10-01',
          validTo: '2024-10-01',
          source: '官网',
        },
        {
          id: 'A002',
          type: 'coupon',
          name: '新车购车优惠券',
          discount: 0.9,
          status: '未使用',
          validFrom: '2023-09-01',
          validTo: '2024-09-01',
          source: '线下门店',
        },
      ]
    }
  }

  // 提交姓名+手机号冲突处理
  const submitNameMobileConflict = async (data: ConflictResolution) => {
    showLoadingToast({
      message: '提交中...',
      forbidClick: true,
    })

    try {
      const res = await customerApi.submitNameMobileConflict(data)
      if (res.code === 200) {
        showToast('提交成功，后台管理人员将尽快处理')
        return res
      }
    } catch (error: any) {
      showToast(error.message || '提交失败，请重试')
      throw error
    } finally {
      closeToast()
    }
  }

  // 获取预约信息
  const fetchAppointments = async (customerId?: string) => {
    try {
      const res = await customerApi.getAppointments(customerId)
      console.log('[Store] 获取预约信息响应:', res)
      console.log('[Store] 响应数据类型:', typeof res.data, Array.isArray(res.data))
      console.log('[Store] 响应数据长度:', res.data?.length)
      if (res.code === 200) {
        // 确保 data 是数组且只包含预约信息
        if (Array.isArray(res.data)) {
          console.log('[Store] 预约信息数据:', res.data)
          // 只取前2条，确保数据正确
          appointments.value = res.data.slice(0, 2)
          console.log('[Store] 设置后的 appointments 长度:', appointments.value.length)
        } else {
          console.warn('[Store] 预约信息数据格式错误，不是数组:', res.data)
          appointments.value = []
        }
      }
    } catch (error: any) {
      console.error('获取预约信息失败:', error)
      // Fallback: 使用本地数据
      appointments.value = [
        {
          id: 'A001',
          type: '试驾预约',
          date: '2024-02-15',
          time: '14:00',
          store: '北京朝阳4S店',
          status: '已确认',
          description: '预约试驾3系 2024款',
          vehicleModel: '3系 2024款',
          source: '官网',
        },
        {
          id: 'A002',
          type: '保养预约',
          date: '2024-02-20',
          time: '10:00',
          store: '北京朝阳4S店',
          status: '待确认',
          description: '定期保养服务',
          vehicleModel: '3系 2023款',
          source: '官网',
        },
      ]
    }
  }

  // 获取平台溯源信息
  const fetchPlatformSources = async (customerId?: string) => {
    try {
      const res = await customerApi.getPlatformSources(customerId)
      if (res.code === 200) {
        platformSources.value = [...res.data]
      }
    } catch (error: any) {
      console.error('获取平台溯源信息失败:', error)
      platformSources.value = []
    }
  }

  // 获取商机信息
  const fetchOpportunities = async (customerId?: string) => {
    try {
      const res = await customerApi.getOpportunities(customerId)
      if (res.code === 200) {
        opportunities.value = normalizeOpportunities(res.data)
      }
    } catch (error: any) {
      console.error('获取商机信息失败:', error)
      // Fallback: 使用本地数据
      opportunities.value = normalizeOpportunities([
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
      ])
    }
  }

  // 获取操作日志
  const fetchOperationLogs = async (customerId?: string) => {
    try {
      const res = await customerApi.getOperationLogs(customerId)
      if (res.code === 200) {
        operationLogs.value = [...res.data]
      }
    } catch (error: any) {
      console.error('获取操作日志失败:', error)
      // Fallback: 使用空数组
      operationLogs.value = []
    }
  }

  // 获取保险记录（分页加载）
  const fetchInsuranceRecordsPage = async (page: number = 1, pageSize: number = 5, customerId?: string): Promise<boolean> => {
    try {
      const res = await customerApi.getInsuranceRecords({
        customerId,
        page,
        pageSize,
      })
      if (res.code === 200) {
        // 追加新数据到现有列表
        if (page === 1) {
          // 第一页，重置数据
          insuranceRecords.value = [...res.data.list]
        } else {
          // 后续页，追加数据
          insuranceRecords.value = [...insuranceRecords.value, ...res.data.list]
        }
        return res.data.hasMore
      }
      return false
    } catch (error: any) {
      console.error('获取保险记录失败:', error)
      return false
    }
  }

  // 获取保险记录（兼容旧接口，一次性加载所有）
  const fetchInsuranceRecords = async (customerId?: string) => {
    try {
      const res = await customerApi.getInsuranceRecords({
        customerId,
        page: 1,
        pageSize: 100, // 一次性加载大量数据
      })
      if (res.code === 200) {
        // 新格式：{ list, hasMore, total }
        if (res.data && 'list' in res.data) {
          insuranceRecords.value = [...res.data.list]
        } else {
          // 兼容旧格式：直接是数组
          insuranceRecords.value = Array.isArray(res.data) ? [...res.data] : []
        }
      }
    } catch (error: any) {
      console.error('获取保险记录失败:', error)
      insuranceRecords.value = []
    }
  }

  // 清空保险记录
  const clearInsuranceRecords = () => {
    insuranceRecords.value = []
  }

  // 获取线下活动记录（分页）
  const fetchMarketingCampaignsPage = async (page: number = 1, pageSize: number = 5, customerId?: string): Promise<boolean> => {
    try {
      const res = await customerApi.getMarketingCampaigns({
        customerId,
        page,
        pageSize,
      })
      if (res.code === 200) {
        // 追加新数据到现有列表
        if (page === 1) {
          // 第一页，重置数据
          marketingCampaigns.value = [...res.data.list]
        } else {
          // 后续页，追加数据
          marketingCampaigns.value = [...marketingCampaigns.value, ...res.data.list]
        }
        return res.data.hasMore
      }
      return false
    } catch (error: any) {
      console.error('获取线下活动记录失败:', error)
      // Fallback：接口不可用时使用本地 Mock 数据，至少保证 H5 Tab 能正常展示示例
      if (page === 1) {
        marketingCampaigns.value = [...mockMarketingCampaigns]
      }
      return false
    }
  }

  // 清空线下活动记录
  const clearMarketingCampaigns = () => {
    marketingCampaigns.value = []
  }

  // 获取金融贷款记录（支持分页）
  const fetchFinancialLoanRecordsPage = async (page: number = 1, pageSize: number = 5, customerId?: string): Promise<boolean> => {
    try {
      const res = await customerApi.getFinancialLoanRecords({
        customerId,
        page,
        pageSize,
      })
      if (res.code === 200) {
        if (page === 1) {
          financialLoanRecords.value = [...res.data.list]
        } else {
          financialLoanRecords.value = [...financialLoanRecords.value, ...res.data.list]
        }
        return res.data.hasMore
      }
      return false
    } catch (error: any) {
      console.error('获取金融贷款记录失败:', error)
      // Fallback：接口不可用时使用本地 Mock 数据
      if (page === 1) {
        financialLoanRecords.value = [...mockFinancialLoanRecords]
      }
      return false
    }
  }

  // 清空金融贷款记录
  const clearFinancialLoanRecords = () => {
    financialLoanRecords.value = []
  }

  return {
    profile,
    tagPool,
    maintenanceRecords,
    insuranceRecords,
    transactions,
    vehicles,
    assets,
    appointments,
    platformSources,
    opportunities,
    operationLogs,
    marketingCampaigns,
    financialLoanRecords,
    loading,
    fetchProfile,
    fetchTagPool,
    fetchMaintenanceRecords,
    fetchInsuranceRecords,
    fetchInsuranceRecordsPage,
    clearInsuranceRecords,
    fetchMarketingCampaignsPage,
    clearMarketingCampaigns,
    fetchFinancialLoanRecordsPage,
    clearFinancialLoanRecords,
    fetchTransactions,
    fetchVehicles,
    fetchAssets,
    fetchAppointments,
    fetchPlatformSources,
    fetchOpportunities,
    fetchOperationLogs,
    addTag,
    removeTag,
    updateTags,
    updatePreferredCarModelTags,
    updateMaintenanceTags,
    submitNameMobileConflict,
    setHandler,
  }
})
