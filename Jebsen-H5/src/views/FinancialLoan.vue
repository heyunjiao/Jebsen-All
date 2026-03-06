<template>
  <div class="loan-container">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <div
        v-for="record in loanRecords"
        :key="record.id"
        class="loan-card"
      >
        <div class="card-header">
          <div class="record-title">{{ record.vehicleModel }}</div>
          <van-tag :type="getStatusType(record.status)" :size="'small' as any">
            {{ record.status }}
          </van-tag>
        </div>
        <div class="card-content">
          <div v-if="record.submitDate" class="info-row">
            <span class="label">提交日期：</span>
            <span class="value">{{ record.submitDate }}</span>
          </div>
          <div v-if="record.signStatus" class="info-row">
            <span class="label">签单状态：</span>
            <span class="value">{{ record.signStatus }}</span>
          </div>
          <div v-if="record.signDate" class="info-row">
            <span class="label">签单日期：</span>
            <span class="value">{{ record.signDate }}</span>
          </div>
          <div v-if="record.issueCenter" class="info-row">
            <span class="label">发放中心：</span>
            <span class="value">{{ record.issueCenter }}</span>
          </div>

          <div class="loan-detail">
            <div class="loan-detail-section">
              <div class="loan-detail-section-title">金融机构与周期</div>
              <div class="loan-detail-grid">
                <div v-if="record.financeInstitution" class="info-row detail-info">
                  <span class="label">金融机构</span>
                  <span class="value">{{ record.financeInstitution }}</span>
                </div>
                <div v-if="record.loanTerm" class="info-row detail-info">
                  <span class="label">贷款周期</span>
                  <span class="value">{{ record.loanTerm }}</span>
                </div>
                <div v-if="record.customerRate != null" class="info-row detail-info">
                  <span class="label">客户费率</span>
                  <span class="value">{{ record.customerRate }}%</span>
                </div>
              </div>
            </div>

            <div class="loan-detail-section">
              <div class="loan-detail-section-title">金额与费用</div>
              <div class="loan-detail-grid">
                <div v-if="record.loanAmount != null" class="info-row detail-info">
                  <span class="label">贷款金额</span>
                  <span class="value amount">¥{{ record.loanAmount?.toLocaleString() }}</span>
                </div>
                <div v-if="record.bankRebate != null" class="info-row detail-info">
                  <span class="label">银行返点</span>
                  <span class="value amount">¥{{ record.bankRebate?.toLocaleString() }}</span>
                </div>
                <div v-if="record.loanServiceFee != null" class="info-row detail-info">
                  <span class="label">贷款服务费用</span>
                  <span class="value amount">¥{{ record.loanServiceFee?.toLocaleString() }}</span>
                </div>
                <div v-if="record.vehicleRegistrationFee != null" class="info-row detail-info">
                  <span class="label">车辆上牌服务费</span>
                  <span class="value amount">¥{{ record.vehicleRegistrationFee?.toLocaleString() }}</span>
                </div>
                <div v-if="record.vehicleRegistrationCitySubsidy != null" class="info-row detail-info">
                  <span class="label">车辆上牌城市贷款贴息</span>
                  <span class="value amount">¥{{ record.vehicleRegistrationCitySubsidy?.toLocaleString() }}</span>
                </div>
                <div v-if="record.discountRate != null" class="info-row detail-info">
                  <span class="label">折扣率（含老车主赠送）</span>
                  <span class="value">{{ record.discountRate }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!loading && loanRecords.length === 0" class="empty-state">
        <van-empty :description="type === 'expiring' ? '暂无即将到期贷款' : '暂无金融贷款记录'" />
      </div>
    </van-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCustomerStore } from '@/stores/customer'

const props = defineProps<{
  type?: 'all' | 'expiring'
}>()

const customerStore = useCustomerStore()
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = ref(5)

const loanRecords = computed(() => {
  if (props.type === 'expiring') {
    return customerStore.financialLoanRecords.filter(r => r.status === '即将到期')
  }
  return customerStore.financialLoanRecords
})

const getStatusType = (status: string): any => {
  const typeMap: Record<string, any> = {
    '正常': 'success',
    '即将到期': 'warning',
    '已结清': 'primary',
    '逾期': 'danger',
  }
  return typeMap[status] || 'default'
}

const onLoad = async () => {
  try {
    const hasMore = await customerStore.fetchFinancialLoanRecordsPage(
      page.value, 
      pageSize.value,
      customerStore.profile?.id
    )
    
    if (hasMore) {
      page.value++
    } else {
      finished.value = true
    }
  } catch (error) {
    console.error('加载贷款记录失败:', error)
    finished.value = true
  } finally {
    loading.value = false
  }
}

watch(() => props.type, () => {
  page.value = 1
  finished.value = false
  customerStore.clearFinancialLoanRecords()
  onLoad()
})

// 移除 onMounted 中的 clearFinancialLoanRecords，防止与 van-list 的 onLoad 竞争
onMounted(() => {
  // 可以在这里做一些初始化，但不要清空刚加载的数据
})
</script>

<style scoped lang="scss">
.loan-container {
  min-height: 200px;
  background: transparent;
  padding: 0;

  :deep(.van-list__finished-text) {
    padding: 12px 0;
    color: var(--text-sub);
    font-size: 12px;
    text-align: center;
  }

  :deep(.van-list__loading) {
    padding: 12px 0;
    text-align: center;
  }
}

.loan-card {
  background: white;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  margin-bottom: 8px;
  border: 1px solid var(--border-color);

  &:last-child {
    margin-bottom: 0;
  }

  .card-header {
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(180deg, #fafbfc 0%, #fff 100%);

    .record-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
    }
  }

  .card-content {
    padding: 10px 12px;

    .info-row {
      display: flex;
      align-items: flex-start;
      gap: 4px;
      margin-bottom: 3px;
      font-size: 12px;
      line-height: 1.35;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: var(--text-sub);
        min-width: 68px;
        flex-shrink: 0;
        font-size: 11px;
      }

      .value {
        color: var(--text-main);
        flex: 1;
        word-break: break-all;
        font-size: 12px;

        &.amount {
          font-weight: 600;
          color: var(--accent-gold);
        }
      }
    }

    .loan-detail {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed var(--border-color);
    }

    .loan-detail-section {
      & + .loan-detail-section {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px dashed var(--border-color);
      }
    }

    .loan-detail-section-title {
      font-size: 11px;
      color: var(--text-sub);
      margin-bottom: 6px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;

      &::before {
        content: '';
        width: 3px;
        height: 12px;
        border-radius: 999px;
        background: var(--accent-gold);
      }
    }

    .loan-detail-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px 12px;

      .detail-info {
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 0;
        padding: 4px 6px;
        background: #f8fafc;
        border-radius: 4px;
        border: 1px solid var(--border-color);

        .label {
          min-width: auto;
          font-size: 11px;
          margin-bottom: 2px;
          color: var(--text-sub);
        }

        .value {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-main);

          &.amount {
            font-weight: 600;
            color: var(--accent-gold);
          }
        }
      }
    }
  }
}

.empty-state {
  padding: 30px 0;
}
</style>
