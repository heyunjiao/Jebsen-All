<template>
  <div class="customer-reference-panel profile-360-container">
    <!-- 公司信息（如果客户属于公司） -->
    <el-card v-if="props.companyInfo" shadow="never" class="reference-card company-card">
      <template #header>
        <div class="card-header">
          <div class="card-header-left">
            <div class="header-icon-wrapper company-icon">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <span>{{ t("customer.company.title") }}</span>
            <el-tag
              v-if="props.companyInfo.lifecycleStatus"
              :type="getStatusType(props.companyInfo.lifecycleStatus)"
              size="small"
              class="company-status-tag"
            >
              {{ getStatusLabel(props.companyInfo.lifecycleStatus) }}
            </el-tag>
          </div>
        </div>
      </template>
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item :label="t('customer.company.name')">
          <div class="description-value">
            <el-icon class="value-icon"><OfficeBuilding /></el-icon>
            <span>{{ props.companyInfo.name }}</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="t('customer.company.oneId')">
          <div class="description-value">
            <el-icon class="value-icon"><CopyDocument /></el-icon>
            <span>{{ props.companyInfo.oneId }}</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="t('customer.company.address')" :span="2">
          <div class="description-value">
            <el-icon class="value-icon"><Location /></el-icon>
            <span>{{ props.companyInfo.address || "-" }}</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="t('customer.company.phone')" :span="2">
          <div class="description-value">
            <el-icon class="value-icon"><Phone /></el-icon>
            <div class="phone-tags-container">
              <template v-if="typeof props.companyInfo.phone === 'string'">
                <span>{{ props.companyInfo.phone }}</span>
              </template>
              <template v-else-if="Array.isArray(props.companyInfo.phone)">
                <el-tag
                  v-for="(phoneItem, index) in props.companyInfo.phone"
                  :key="index"
                  type="info"
                  size="small"
                  class="phone-tag"
                >
                  {{ typeof phoneItem === "string" ? phoneItem : phoneItem.value }}
                </el-tag>
              </template>
              <span v-else>-</span>
            </div>
          </div>
        </el-descriptions-item>
      </el-descriptions>
      <!-- 层级连接指示器 -->
      <div class="hierarchy-indicator">
        <div class="indicator-line"></div>
        <div class="indicator-icon">
          <el-icon><Connection /></el-icon>
        </div>
        <div class="indicator-text">{{ t("customer.company.relatedCustomer") }}</div>
      </div>
    </el-card>

    <!-- 客户基本信息 -->
    <el-card shadow="never" class="reference-card" :class="{ 'customer-under-company': props.companyInfo }">
      <template #header>
        <div class="card-header">
          <div class="card-header-left">
            <div class="header-icon-wrapper customer-icon">
              <el-icon><User /></el-icon>
            </div>
            <span>{{ t("errorCorrection.customerReference.customerInfo") }}</span>
          </div>
        </div>
      </template>
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="OneID">{{ customerInfo.oneId }}</el-descriptions-item>
        <el-descriptions-item :label="t('errorCorrection.customerReference.customerName')">{{
          customerInfo.name
        }}</el-descriptions-item>
        <el-descriptions-item :label="t('errorCorrection.customerReference.phone')" :span="2">
          <div class="phone-tags-container">
            <span v-for="(phoneItem, index) in phoneValues" :key="index" class="phone-tag-wrap">
              <el-tag type="info" size="small" class="phone-tag">
                {{ phoneItem.value }}
              </el-tag>
              <span v-if="phoneItem.isPreferred" class="relation-tag preferred">{{ t("customer.profile360.preferredNumber") }}</span>
            </span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="t('errorCorrection.customerReference.gender')">{{
          customerInfo.gender
        }}</el-descriptions-item>
        <el-descriptions-item :label="t('errorCorrection.customerReference.ageGroup')">{{
          customerInfo.ageGroup || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="t('errorCorrection.customerReference.familyStatus')">{{
          customerInfo.familyStatus || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="t('customer.city')">{{ customerInfo.city || "-" }}</el-descriptions-item>
        <el-descriptions-item :label="t('errorCorrection.customerReference.address')" :span="2">{{
          customerInfo.address || "-"
        }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 商机信息 -->
    <el-card shadow="never" class="reference-card">
      <template #header>
        <div class="card-header">
          <div class="card-header-left">
            <el-icon><MagicStick /></el-icon>
            <span>{{ t("errorCorrection.customerReference.opportunityInfo") }}</span>
          </div>
        </div>
      </template>
      <div v-if="props.opportunityInfoList && props.opportunityInfoList.length > 0" class="opportunity-tags-container">
        <el-tag
          v-for="(opportunity, index) in props.opportunityInfoList"
          :key="index"
          type="primary"
          size="default"
          class="opportunity-tag"
        >
          {{ opportunity.leadType || "-" }}
        </el-tag>
      </div>
      <el-empty v-else :description="t('customer.profile360.noOpportunityData')" :image-size="60" />
    </el-card>

    <!-- 标签分类 -->
    <el-card shadow="never" class="reference-card">
      <template #header>
        <div class="card-header">
          <div class="card-header-left">
            <el-icon><PriceTag /></el-icon>
            <span>{{ t("errorCorrection.customerReference.categoryTags") }}</span>
          </div>
        </div>
      </template>
      <div class="category-tags-container">
        <template v-if="selectedTags && Object.keys(selectedTags).length > 0">
          <div class="tags-flow">
            <template v-for="(tags, category) in selectedTags" :key="category">
              <template v-if="tags && Array.isArray(tags) && tags.length > 0">
                <div class="category-tags-group">
                  <div class="category-header">
                    <span class="category-name">
                      {{ getCategoryDisplayLabel(category) }}
                    </span>
                  </div>
                  <div class="tags-list">
                    <el-tag
                      v-for="tag in tags"
                      :key="tag"
                      size="small"
                      :class="['category-tag', `category-tag-${getCategoryColorIndex(category)}`]"
                    >
                      <span class="tag-origin" :class="getTagOriginClass(category, tag)">
                        <el-icon v-if="getTagOriginClass(category, tag) === 'auto'"><MagicStick /></el-icon>
                        <el-icon v-else><User /></el-icon>
                        {{ getTagOriginLabel(category, tag) }}
                      </span>
                      <span class="tag-text">{{ tag }}</span>
                    </el-tag>
                  </div>
                </div>
              </template>
            </template>
          </div>
        </template>
        <el-empty v-else :description="t('common.noData')" :image-size="60" />
      </div>
    </el-card>

    <!-- 信息标签页 -->
    <el-tabs v-model="activeInfoTab" type="border-card" class="info-tabs">
      <!-- 维保记录 -->
      <el-tab-pane :label="t('customer.profile360.transactions')" name="transactions">
        <div class="tab-header">
          <div class="tab-header-left">
            <el-input
              v-model="transactionSearch"
              :placeholder="t('customer.profile360.searchPlaceholder')"
              clearable
              style="width: 250px"
              size="small"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div class="tab-header-right">
            <span class="data-count">{{ t("customer.profile360.total") }}: {{ filteredTransactions.length }}</span>
          </div>
        </div>
        <el-table :data="filteredTransactions" border stripe style="margin-top: 12px" size="small">
          <el-table-column type="index" label="#" width="50" />
          <el-table-column prop="serviceType" :label="t('customer.profile360.serviceType')" min-width="100" />
          <el-table-column prop="serviceTime" :label="t('customer.profile360.serviceTime')" width="140" />
          <el-table-column
            prop="serviceStore"
            :label="t('customer.profile360.serviceStore')"
            min-width="120"
            show-overflow-tooltip
          />
          <el-table-column
            prop="vehicleModel"
            :label="t('customer.profile360.vehicleModel')"
            min-width="120"
            show-overflow-tooltip
          />
          <el-table-column prop="amount" :label="t('customer.profile360.amount')" width="100" align="right">
            <template #default="scope">
              <span class="amount-text">{{ formatCurrency(scope.row.amount) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="description"
            :label="t('customer.profile360.description')"
            min-width="140"
            show-overflow-tooltip
          />
        </el-table>
      </el-tab-pane>

      <!-- 保险合同 -->
      <el-tab-pane :label="t('customer.profile360.insuranceContract')" name="insurance">
        <el-table :data="props.insuranceData || []" border stripe size="small">
          <el-table-column type="index" label="#" width="50" />
          <el-table-column prop="type" :label="t('customer.profile360.insuranceType')" min-width="120" />
          <el-table-column prop="company" :label="t('customer.profile360.insuranceCompany')" width="120" />
          <el-table-column prop="policyNo" :label="t('customer.profile360.policyNo')" width="140" />
          <el-table-column prop="startDate" :label="t('customer.profile360.startDate')" width="100" />
          <el-table-column prop="endDate" :label="t('customer.profile360.endDate')" width="100" />
          <el-table-column prop="amount" :label="t('customer.profile360.insuranceAmount')" width="100" align="right">
            <template #default="scope">{{ formatCurrency(scope.row.amount) }}</template>
          </el-table-column>
        </el-table>
        <el-empty
          v-if="!props.insuranceData || props.insuranceData.length === 0"
          :description="t('common.noData')"
          :image-size="60"
        />
      </el-tab-pane>

      <!-- 沟通记录 -->
      <el-tab-pane :label="t('customer.profile360.communicationRecords')" name="interactions">
        <el-timeline v-if="props.interactionsData && props.interactionsData.length > 0" class="mt-12">
          <el-timeline-item
            v-for="item in props.interactionsData"
            :key="item.id"
            :timestamp="item.date"
            placement="top"
            size="normal"
            :type="getInteractionTimelineType(item.type)"
          >
            <div class="interaction-content-mini">
              <div class="interaction-header">
                <el-tag :type="getInteractionType(item.type)" size="small">{{ getInteractionTypeLabel(item.type) }}</el-tag>
                <span class="operator ml-8">{{ item.operator }}</span>
              </div>
              <p class="content-text mt-4 mb-0">{{ item.content }}</p>
            </div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else :description="t('common.noData')" :image-size="60" />
      </el-tab-pane>

      <!-- 线下活动 -->
      <el-tab-pane :label="t('customer.profile360.offlineActivities')" name="offlineActivities">
        <el-table :data="props.offlineActivities || []" border stripe size="small">
          <el-table-column type="index" label="#" width="50" />
          <el-table-column prop="activityName" :label="t('customer.profile360.activityName')" min-width="150" />
          <el-table-column prop="activityTime" :label="t('customer.profile360.activityTime')" width="120" />
          <el-table-column prop="attendanceStatus" :label="t('customer.profile360.attendanceStatus')" width="100" />
        </el-table>
        <el-empty
          v-if="!props.offlineActivities || props.offlineActivities.length === 0"
          :description="t('common.noData')"
          :image-size="60"
        />
      </el-tab-pane>

      <!-- 金融贷款 -->
      <el-tab-pane :label="t('customer.profile360.financialLoans')" name="financialLoans">
        <el-table :data="props.financialLoans || []" border stripe size="small">
          <el-table-column type="index" label="#" width="50" />
          <el-table-column prop="loanType" :label="t('customer.profile360.loanType')" min-width="120" />
          <el-table-column prop="amount" :label="t('customer.profile360.amount')" width="100" />
          <el-table-column prop="status" :label="t('customer.profile360.status')" width="100">
            <template #default="scope">
              <el-tag :type="getLoanStatusType(scope.row.status)" size="small">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-empty
          v-if="!props.financialLoans || props.financialLoans.length === 0"
          :description="t('common.noData')"
          :image-size="60"
        />
      </el-tab-pane>

      <!-- 资产中心 -->
      <el-tab-pane :label="t('customer.profile360.assets')" name="assets">
        <div class="asset-center-vertical" v-if="props.assetsData">
          <div class="asset-section">
            <div class="section-header">
              <h4>{{ t("customer.profile360.coupons") }}</h4>
            </div>
            <el-table :data="props.assetsData.coupons || []" border size="small" max-height="250">
              <el-table-column prop="name" :label="t('customer.profile360.couponName')" min-width="120" />
              <el-table-column prop="amount" :label="t('customer.profile360.amount')" width="100" align="right">
                <template #default="scope">{{ formatCurrency(scope.row.amount) }}</template>
              </el-table-column>
              <el-table-column prop="status" :label="t('customer.profile360.status')" width="90">
                <template #default="scope">
                  <el-tag size="small" :type="getAssetStatusTagType(scope.row.status)">{{ scope.row.status }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="asset-section">
            <div class="section-header">
              <h4>{{ t("customer.profile360.vouchers") }}</h4>
            </div>
            <el-table :data="props.assetsData.vouchers || []" border size="small" max-height="250">
              <el-table-column prop="name" :label="t('customer.profile360.voucherName')" min-width="120" />
              <el-table-column prop="balance" :label="t('customer.profile360.balance')" width="100" align="right">
                <template #default="scope">{{ formatCurrency(scope.row.balance) }}</template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <el-empty v-else :description="t('common.noData')" :image-size="60" />
      </el-tab-pane>

      <!-- 车辆信息 -->
      <el-tab-pane :label="t('customer.profile360.vehicleInfo')" name="vehicles">
        <el-table :data="props.vehiclesData || []" border stripe size="small">
          <el-table-column type="index" label="#" width="50" />
          <el-table-column prop="licensePlate" :label="t('customer.licensePlate')" width="100" />
          <el-table-column prop="model" :label="t('customer.carSeriesModel')" min-width="150" />
          <el-table-column prop="vin" :label="t('customer.profile360.vin')" width="140" />
          <el-table-column prop="mileage" :label="t('customer.currentMileage')" width="100" align="right">
            <template #default="scope"> {{ (scope.row.mileage || 0).toLocaleString() }} km </template>
          </el-table-column>
        </el-table>
        <el-empty
          v-if="!props.vehiclesData || props.vehiclesData.length === 0"
          :description="t('common.noData')"
          :image-size="60"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 消费分析 -->
    <el-card shadow="never" class="reference-card mt-16">
      <template #header>
        <div class="card-header">
          <div class="card-header-left">
            <el-icon><DataAnalysis /></el-icon>
            <span>{{ t("errorCorrection.customerReference.consumptionStats") }}</span>
          </div>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :span="12" class="mb-12">
          <div class="stat-item">
            <div class="stat-label">{{ t("errorCorrection.customerReference.totalSpend") }}</div>
            <div class="stat-value money-font">¥{{ formatMoney(consumptionStats.totalSpend) }}</div>
          </div>
        </el-col>
        <el-col :span="12" class="mb-12">
          <div class="stat-item">
            <div class="stat-label">{{ t("errorCorrection.customerReference.avgSpend") }}</div>
            <div class="stat-value money-font">¥{{ formatMoney(consumptionStats.avgSpend || 0) }}</div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="stat-item">
            <div class="stat-label">{{ t("errorCorrection.customerReference.orderCount") }}</div>
            <div class="stat-value">{{ consumptionStats.orderCount }}{{ t("errorCorrection.customerReference.times") }}</div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="stat-item">
            <div class="stat-label">{{ t("errorCorrection.customerReference.lastVisit") }}</div>
            <div class="stat-value">{{ consumptionStats.lastVisit || "-" }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  User,
  DataAnalysis,
  PriceTag,
  Search,
  OfficeBuilding,
  Location,
  Phone,
  Connection,
  CopyDocument,
  MagicStick
} from "@element-plus/icons-vue";
import { TAG_CATEGORY_OPTIONS, getCategoryFullPath } from "@/constants/tagCategory";

const { t } = useI18n();

export interface CustomerInfo {
  oneId: string;
  name: string;
  phone: string;
  gender: string;
  ageGroup: string;
  familyStatus: string;
  address: string;
  city?: string;
}

export interface CompanyInfo {
  id: string;
  oneId: string;
  name: string;
  address?: string;
  phone?: any;
  lifecycleStatus?: string;
}

export interface ConsumptionStats {
  totalSpend: number;
  avgSpend?: number;
  orderCount: number;
  lastVisit?: string;
}

export interface OpportunityInfo {
  leadType: string;
}

export interface Interaction {
  id: string;
  type: string;
  date: string;
  content: string;
  operator: string;
}

interface Props {
  customerInfo: CustomerInfo;
  companyInfo?: CompanyInfo;
  consumptionStats: ConsumptionStats;
  opportunityInfoList?: OpportunityInfo[];
  preferences?: string[];
  selectedTags?: any;
  transactions?: any[];
  insuranceData?: any[];
  vehiclesData?: any[];
  interactionsData?: Interaction[];
  offlineActivities?: any[];
  financialLoans?: any[];
  assetsData?: any;
}

const props = defineProps<Props>();

const phoneValues = computed(() => [{ value: props.customerInfo.phone, isPreferred: true }]);

const activeInfoTab = ref("transactions");
const transactionSearch = ref("");

const filteredTransactions = computed(() => {
  if (!props.transactions) return [];
  if (!transactionSearch.value) return props.transactions;
  const kw = transactionSearch.value.toLowerCase();
  return props.transactions.filter(item => {
    const desc = (item.description || "").toLowerCase();
    const time = (item.serviceTime || "").toLowerCase();
    const store = (item.serviceStore || "").toLowerCase();
    return desc.includes(kw) || time.includes(kw) || store.includes(kw);
  });
});

const formatMoney = (val: number) => (val || 0).toLocaleString();
const formatCurrency = (val: number) => `¥${(val || 0).toLocaleString()}`;

const getStatusType = (status: string): any => {
  const map: any = { active: "success", inactive: "info", pending: "warning", conflict: "danger" };
  return map[status] || "info";
};
const getStatusLabel = (status: string) => t(`customer.lifecycleStatusOptions.${status}`);

const getCategoryDisplayName = (category: string): string => {
  return category
    .replace(/【必选】/g, "")
    .replace(/必选/g, "")
    .trim();
};

// 获取分类多级展示名称（完整路径，与系统标签多级一致）
const getCategoryDisplayLabel = (category: string): string => {
  const clean = getCategoryDisplayName(category);
  return getCategoryFullPath(TAG_CATEGORY_OPTIONS, clean) || clean;
};

const getCategoryColorIndex = (category: string): number => {
  const categoryMap: any = { 意向级别: 0, SC: 1, SA: 2, 续保: 3, POC: 4, "爱好(≥1项)": 7 };
  for (const key in categoryMap) {
    if (category.includes(key)) return categoryMap[key];
  }
  return 0;
};

const getTagOriginClass = (category: string, tag: string): string => {
  const autoCategories = ["意向级别", "SC", "SA", "续保", "POC"];
  return autoCategories.some(key => category.includes(key)) ? "auto" : "manual";
};

const getTagOriginLabel = (category: string, tag: string): string => {
  return getTagOriginClass(category, tag) === "auto" ? t("customer.tagOrigin.auto") : t("customer.tagOrigin.manual");
};

const getInteractionType = (type: string): any => {
  const map: any = { call: "primary", wechat: "success", visit: "warning" };
  return map[type] || "info";
};

const getInteractionTypeLabel = (type: string) => {
  const map: any = {
    call: t("customer.profile360.call"),
    wechat: t("customer.profile360.wechat"),
    visit: t("customer.profile360.visit")
  };
  return map[type] || type;
};

const getInteractionTimelineType = (type: string): any => {
  const map: any = { call: "primary", wechat: "success", visit: "warning" };
  return map[type];
};

const getInsuranceStatusType = (status: string): any => {
  const map: any = { 已生效: "success", 生效中: "success", 已过期: "warning", 待续保: "primary" };
  return map[status] || "info";
};

const getLoanStatusType = (status: string): any => {
  const map: any = { 正常: "success", 逾期: "danger", 已结清: "primary" };
  return map[status] || "info";
};

const getAssetStatusTagType = (status: string): any => {
  if (status === "未使用" || status === "valid") return "success";
  if (status === "已使用" || status === "used") return "info";
  if (status === "已过期" || status === "expired") return "danger";
  return "warning";
};
</script>

<style scoped lang="scss">
.profile-360-container {
  padding: 0;

  .reference-card {
    margin-bottom: 16px;

    :deep(.el-card__body) {
      padding: 20px;
    }

    &.customer-under-company {
      margin-top: 0;
      border-top: 2px dashed #e4e7ed;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      font-weight: 600;

      .card-header-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }

  .header-icon-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;

    .el-icon {
      font-size: 18px;
    }

    &.company-icon {
      color: #409eff;
      background: rgba(64, 158, 255, 0.1);
    }
    &.customer-icon {
      color: #67c23a;
      background: rgba(103, 194, 58, 0.1);
    }
  }

  .description-value {
    display: flex;
    align-items: center;
    gap: 6px;
    .value-icon {
      color: #909399;
      font-size: 14px;
    }
  }

  .hierarchy-indicator {
    position: relative;
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    padding: 12px 0;
    margin-top: 16px;

    .indicator-line {
      position: absolute;
      top: 0;
      left: 50%;
      width: 2px;
      height: 100%;
      background: linear-gradient(to bottom, #e4e7ed, #409eff, #e4e7ed);
      opacity: 0.3;
      transform: translateX(-50%);
    }

    .indicator-icon {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      font-size: 16px;
      color: #409eff;
      background: #ffffff;
      border: 2px solid #409eff;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
    }

    .indicator-text {
      position: relative;
      z-index: 1;
      padding: 0 8px;
      font-size: 12px;
      color: #909399;
      background: #ffffff;
    }
  }

  .phone-tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .phone-tag-wrap {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-right: 12px;
      margin-bottom: 6px;
    }

    .relation-tag {
      font-size: 12px;
      color: #909399;

      &.preferred {
        font-weight: 500;
        color: #409eff;
      }
    }
  }

  .opportunity-tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 0;

    .opportunity-tag {
      padding: 6px 12px;
      font-size: 13px;
    }
  }

  .category-tags-container {
    .tags-flow {
      display: flex;
      flex-wrap: wrap;
      margin: -10px;
    }

    .category-tags-group {
      display: flex;
      flex: 1 1 300px;
      flex-direction: column;
      min-width: 250px;
      max-width: calc(33.333% - 20px);
      padding: 16px;
      margin: 10px;
      background: #ffffff;
      border: 1px solid #f2f2f2;
      border-radius: 12px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);

      .category-header {
        margin-bottom: 6px;
      }
      .category-name {
        font-size: 12px;
        font-weight: bold;
        color: #606266;
      }

      .tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 4px;
      }

      .category-tag {
        display: inline-flex;
        gap: 10px;
        align-items: center;
        height: auto;
        padding: 6px 16px 6px 10px;
        font-size: 12px;
        font-weight: 500;
        border-radius: 8px;

        .tag-origin {
          display: inline-flex;
          gap: 4px;
          align-items: center;
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 600;
          border-radius: 4px;

          &.auto {
            color: #a0814f;
            background: #fdf6ec;
            border: 1px solid #e9d8c0;
          }
          &.manual {
            color: #7f8c8d;
            background: #f8f9f9;
            border: 1px solid #d5dbdb;
          }
        }

        &.category-tag-0 {
          color: #4a5c7a;
          background-color: #f0f4f8;
          border-color: #d1d9e6;
        }
        &.category-tag-1 {
          color: #527a61;
          background-color: #f1f8f3;
          border-color: #d2e4d9;
        }
        &.category-tag-2 {
          color: #6a5e8c;
          background-color: #f4f2f8;
          border-color: #dcd7e8;
        }
        &.category-tag-3 {
          color: #8c5e5e;
          background-color: #f9f2f2;
          border-color: #e8d2d2;
        }
        &.category-tag-4 {
          color: #7a7352;
          background-color: #f7f6f0;
          border-color: #e6e3d2;
        }
        &.category-tag-7 {
          color: #6f7a52;
          background-color: #f5f6f1;
          border-color: #e1e4d2;
        }
      }
    }
  }

  .info-tabs {
    margin-top: 0;
    margin-bottom: 16px;
    box-shadow: none;
    border: 1px solid #ebeef5;

    :deep(.el-tabs__content) {
      padding: 16px;
    }

    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      .data-count {
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .amount-text {
    font-weight: 600;
    color: #409eff;
  }

  .asset-center-vertical {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .asset-section {
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
    }
  }

  .stat-item {
    text-align: center;
    background: #f8f9fb;
    padding: 12px;
    border-radius: 6px;

    .stat-label {
      font-size: 12px;
      color: #909399;
      margin-bottom: 6px;
    }
    .stat-value {
      font-size: 16px;
      font-weight: 700;
      color: #303133;
    }
    .money-font {
      color: #67c23a;
      font-family: Consolas, monospace;
    }
  }

  .interaction-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  .operator {
    font-weight: 500;
    font-size: 13px;
    color: #606266;
  }
  .content-text {
    color: #303133;
    font-size: 13px;
    line-height: 1.6;
  }

  .ml-8 {
    margin-left: 8px;
  }
  .mt-4 {
    margin-top: 4px;
  }
  .mt-12 {
    margin-top: 12px;
  }
  .mt-16 {
    margin-top: 16px;
  }
  .mb-0 {
    margin-bottom: 0;
  }
  .mb-12 {
    margin-bottom: 12px;
  }
}
</style>
