<template>
  <div class="customer-reference-panel">
    <!-- 客户基本信息 -->
    <el-card shadow="never" class="reference-card">
      <template #header>
        <div class="card-header">
          <el-icon><User /></el-icon>
          <span>{{ t("errorCorrection.customerReference.customerInfo") }}</span>
        </div>
      </template>
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="OneID">{{ customerInfo.oneId }}</el-descriptions-item>
        <el-descriptions-item :label="t('errorCorrection.customerReference.customerName')">{{
          customerInfo.name
        }}</el-descriptions-item>
        <el-descriptions-item :label="t('errorCorrection.customerReference.phone')">
          <div class="phone-tags-container">
            <el-tag v-for="(phoneItem, index) in phoneValues" :key="index" type="info" size="small" class="phone-tag">
              {{ phoneItem.value }}
            </el-tag>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="t('errorCorrection.customerReference.jobTitle')">{{
          customerInfo.title || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="t('errorCorrection.customerReference.company')">{{
          customerInfo.company || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="t('errorCorrection.customerReference.gender')">{{
          customerInfo.gender
        }}</el-descriptions-item>
        <el-descriptions-item :label="t('errorCorrection.customerReference.ageGroup')">{{
          customerInfo.ageGroup
        }}</el-descriptions-item>
        <el-descriptions-item :label="t('errorCorrection.customerReference.familyStatus')">{{
          customerInfo.familyStatus
        }}</el-descriptions-item>
        <el-descriptions-item :label="t('errorCorrection.customerReference.address')" :span="2">{{
          customerInfo.address
        }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 商机信息 -->
    <el-card v-if="props.opportunityInfoList && props.opportunityInfoList.length > 0" shadow="never" class="reference-card">
      <template #header>
        <div class="card-header">
          <el-icon><Opportunity /></el-icon>
          <span>{{ t("errorCorrection.customerReference.opportunityInfo") }}</span>
        </div>
      </template>
      <div class="opportunity-tags-container">
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
    </el-card>
    <!-- 标签分类 -->
    <el-card shadow="never" class="reference-card">
      <template #header>
        <div class="card-header">
          <el-icon><PriceTag /></el-icon>
          <span>{{ t("errorCorrection.customerReference.categoryTags") }}</span>
        </div>
      </template>
      <div class="category-tags-container">
        <template
          v-if="(props.selectedTags && Object.keys(props.selectedTags).length > 0) || (preferences && preferences.length > 0)"
        >
          <div class="tags-flow">
            <!-- Service Preferences Group -->
            <div class="category-tags-group" v-if="preferences && preferences.length > 0">
              <div class="category-header">
                <span class="category-name">
                  {{ t("errorCorrection.customerReference.servicePreference") }}
                </span>
              </div>
              <div class="tags-list">
                <el-tag v-for="pref in preferences" :key="pref" size="small" class="category-tag category-tag-0">
                  <span class="tag-origin manual">{{ t("customer.tagOrigin.manual") }}</span>
                  <span class="tag-text">{{ pref }}</span>
                </el-tag>
              </div>
            </div>
            <template v-for="(tags, category) in props.selectedTags" :key="category">
              <template v-if="tags && Array.isArray(tags) && tags.length > 0">
                <div class="category-tags-group">
                  <div class="category-header">
                    <span class="category-name">
                      {{ getCategoryDisplayName(category) }}
                    </span>
                  </div>
                  <div class="tags-list">
                    <el-tag
                      v-for="tag in tags"
                      :key="tag"
                      size="small"
                      :class="['category-tag', `category-tag-${getCategoryColorIndex(category)}`]"
                    >
                      <span class="tag-origin" :class="getTagOriginClass(category, tag)">{{
                        getTagOriginLabel(category, tag)
                      }}</span>
                      <span class="tag-text">{{ tag }}</span>
                    </el-tag>
                  </div>
                </div>
              </template>
            </template>
          </div>
          <div v-if="!hasSelectedTags && (!preferences || preferences.length === 0)" class="empty-tags">
            <span class="empty-text">{{ t("common.noData") }}</span>
          </div>
        </template>
        <div v-else class="empty-tags">
          <span class="empty-text">{{ t("common.noData") }}</span>
        </div>
      </div>
    </el-card>

    <!-- 信息标签页 -->

    <el-tabs v-model="activeInfoTab" type="border-card">
      <!-- 维保记录 -->
      <el-tab-pane :label="t('customer.profile360.transactions')" name="transactions">
        <div class="tab-header">
          <div class="tab-header-left">
            <el-input
              v-model="transactionSearch"
              :placeholder="t('customer.profile360.searchPlaceholder')"
              clearable
              style="width: 300px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select
              v-model="transactionTypeFilter"
              :placeholder="t('customer.profile360.filterByType')"
              clearable
              style="width: 150px; margin-left: 12px"
            >
              <el-option :label="t('customer.profile360.all')" value="" />
              <el-option :label="t('customer.profile360.sale')" value="sale" />
              <el-option :label="t('customer.profile360.service')" value="service" />
            </el-select>
          </div>
          <div class="tab-header-right">
            <span class="data-count">{{ t("customer.profile360.total") }}: {{ filteredTransactions.length }}</span>
          </div>
        </div>
        <el-table :data="filteredTransactions" border stripe style="margin-top: 12px" size="small">
          <el-table-column type="index" label="#" width="60" />
          <el-table-column prop="date" :label="t('customer.profile360.date')" width="120" sortable />
          <el-table-column prop="type" :label="t('customer.profile360.type')" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.type === 'sale' ? 'success' : 'info'" size="small">
                {{ scope.row.type === "sale" ? t("customer.profile360.sale") : t("customer.profile360.service") }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="amount" :label="t('customer.profile360.amount')" width="120" sortable align="right">
            <template #default="scope">
              <span class="amount-text">{{ formatCurrency(scope.row.amount) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="description" :label="t('customer.profile360.description')" min-width="150" />
          <el-table-column prop="storeName" :label="t('customer.profile360.storeName')" width="150" />
          <el-table-column prop="orderNo" :label="t('customer.profile360.orderNo')" width="150" />
        </el-table>
        <el-empty v-if="filteredTransactions.length === 0" :description="t('common.noData')" />
      </el-tab-pane>

      <!-- 保险信息 -->
      <el-tab-pane :label="t('customer.profile360.insurance')" name="insurance">
        <div class="tab-header" v-if="insuranceData && insuranceData.length > 0">
          <div class="tab-header-right">
            <span class="data-count">{{ t("customer.profile360.total") }}: {{ insuranceData.length }}</span>
          </div>
        </div>
        <el-table
          v-if="insuranceData && insuranceData.length > 0"
          :data="insuranceData"
          border
          stripe
          style="margin-top: 12px"
          size="small"
        >
          <el-table-column type="index" label="#" width="60" />
          <el-table-column prop="policyName" :label="t('customer.profile360.policyName')" min-width="150" />
          <el-table-column prop="policyNo" :label="t('customer.profile360.policyNo')" width="180" />
          <el-table-column prop="company" :label="t('customer.profile360.insuranceCompany')" width="150" />
          <el-table-column prop="startDate" :label="t('customer.profile360.startDate')" width="120" />
          <el-table-column prop="endDate" :label="t('customer.profile360.endDate')" width="120" />
          <el-table-column prop="amount" :label="t('customer.profile360.insuranceAmount')" width="120" align="right">
            <template #default="scope">
              {{ formatCurrency(scope.row.amount) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" :label="t('customer.profile360.status')" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'valid' ? 'success' : 'danger'" size="small">
                {{ scope.row.status === "valid" ? t("customer.profile360.valid") : t("customer.profile360.expired") }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else :description="t('common.noData')" />
      </el-tab-pane>

      <!-- 资产中心 -->
      <el-tab-pane :label="t('customer.profile360.assets')" name="assets">
        <el-row :gutter="20" v-if="assetsData">
          <el-col :span="12">
            <div class="asset-section">
              <div class="section-header">
                <h4>{{ t("customer.profile360.coupons") }}</h4>
                <el-tag type="success" size="small">
                  {{ t("customer.profile360.totalValue") }}: {{ formatCurrency(assetsData.totalCouponValue || 0) }}
                </el-tag>
              </div>
              <el-table :data="assetsData.coupons || []" border size="small" style="margin-top: 12px">
                <el-table-column prop="name" :label="t('customer.profile360.couponName')" />
                <el-table-column prop="amount" :label="t('customer.profile360.amount')" width="100" align="right">
                  <template #default="scope">
                    {{ formatCurrency(scope.row.amount) }}
                  </template>
                </el-table-column>
                <el-table-column prop="expireDate" :label="t('customer.profile360.expireDate')" width="120" />
                <el-table-column prop="status" :label="t('customer.profile360.status')" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.status === 'valid' ? 'success' : scope.row.status === 'used' ? 'info' : 'danger'"
                      size="small"
                    >
                      {{ getCouponStatusLabel(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="asset-section">
              <div class="section-header">
                <h4>{{ t("customer.profile360.vouchers") }}</h4>
                <el-tag type="primary" size="small">
                  {{ t("customer.profile360.totalBalance") }}: {{ formatCurrency(assetsData.totalVoucherBalance || 0) }}
                </el-tag>
              </div>
              <el-table :data="assetsData.vouchers || []" border size="small" style="margin-top: 12px">
                <el-table-column prop="name" :label="t('customer.profile360.voucherName')" />
                <el-table-column prop="balance" :label="t('customer.profile360.balance')" width="120" align="right">
                  <template #default="scope">
                    {{ formatCurrency(scope.row.balance) }}
                  </template>
                </el-table-column>
                <el-table-column prop="totalAmount" :label="t('customer.profile360.totalAmount')" width="120" align="right">
                  <template #default="scope">
                    {{ formatCurrency(scope.row.totalAmount || 0) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-col>
        </el-row>
        <el-empty v-else :description="t('common.noData')" />
      </el-tab-pane>

      <!-- 车辆关联 -->
      <el-tab-pane :label="t('customer.profile360.vehicles')" name="vehicles">
        <el-table v-if="vehiclesData && vehiclesData.length > 0" :data="vehiclesData" border stripe size="small">
          <el-table-column type="index" label="#" width="60" />
          <el-table-column prop="licensePlate" :label="t('customer.licensePlate')" width="120" />
          <el-table-column prop="model" :label="t('customer.carSeriesModel')" min-width="150" />
          <el-table-column prop="brand" :label="t('customer.profile360.brand')" width="100" />
          <el-table-column prop="purchaseDate" :label="t('customer.profile360.purchaseDate')" width="120" />
          <el-table-column prop="lastServiceDate" :label="t('customer.profile360.lastServiceDate')" width="120" />
          <el-table-column prop="nextServiceDate" :label="t('customer.profile360.nextServiceDate')" width="120" />
          <el-table-column prop="mileage" :label="t('customer.currentMileage')" width="120" align="right">
            <template #default="scope"> {{ scope.row.mileage.toLocaleString() }} km </template>
          </el-table-column>
          <el-table-column prop="serviceCount" :label="t('customer.profile360.serviceCount')" width="100" align="right" />
          <el-table-column
            prop="totalServiceAmount"
            :label="t('customer.profile360.totalServiceAmount')"
            width="150"
            align="right"
          >
            <template #default="scope">
              {{ formatCurrency(scope.row.totalServiceAmount || 0) }}
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else :description="t('common.noData')" />
      </el-tab-pane>

      <!-- 沟通记录 -->
      <el-tab-pane :label="t('customer.profile360.interactions')" name="interactions">
        <el-timeline v-if="interactionsData && interactionsData.length > 0">
          <el-timeline-item
            v-for="item in interactionsData"
            :key="item.id"
            :timestamp="formatDateTime(item.date)"
            placement="top"
            :type="getInteractionTimelineType(item.type)"
          >
            <el-card shadow="hover" class="interaction-card">
              <div class="interaction-item">
                <div class="interaction-header">
                  <el-tag :type="getInteractionType(item.type)" size="small">
                    {{ getInteractionTypeLabel(item.type) }}
                  </el-tag>
                  <span class="operator">{{ t("customer.profile360.operator") }}: {{ item.operator }}</span>
                  <span v-if="item.duration" class="duration">
                    {{ t("customer.profile360.duration") }}: {{ formatDuration(item.duration) }}
                  </span>
                </div>
                <div class="interaction-content">{{ item.content }}</div>
                <div v-if="item.result" class="interaction-result">
                  <el-tag type="info" size="small">{{ item.result }}</el-tag>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else :description="t('common.noData')" />
      </el-tab-pane>
    </el-tabs>

    <!-- 消费统计 -->
    <el-card shadow="never" class="reference-card">
      <template #header>
        <div class="card-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>{{ t("errorCorrection.customerReference.consumptionStats") }}</span>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :span="12">
          <div class="stat-item">
            <div class="stat-label">{{ t("errorCorrection.customerReference.totalSpend") }}</div>
            <div class="stat-value money-font">¥{{ formatMoney(consumptionStats.totalSpend) }}</div>
          </div>
        </el-col>

        <el-col :span="12">
          <div class="stat-item">
            <div class="stat-label">{{ t("errorCorrection.customerReference.avgSpend") }}</div>
            <div class="stat-value money-font">¥{{ formatMoney(consumptionStats.avgSpend) }}</div>
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
            <div class="stat-label">{{ t("errorCorrection.customerReference.visit90d") }}</div>
            <div class="stat-value">{{ consumptionStats.visit90d }}{{ t("errorCorrection.customerReference.times") }}</div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="stat-item">
            <div class="stat-label">{{ t("errorCorrection.customerReference.lastVisit") }}</div>
            <div class="stat-value">{{ consumptionStats.lastVisit || t("errorCorrection.customerReference.none") }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { User, DataAnalysis, PriceTag, Search, Opportunity } from "@element-plus/icons-vue";

const { t } = useI18n();

export interface CustomerInfo {
  oneId: string;
  name: string;
  phone: string;
  title?: string;
  company?: string;
  gender: string;
  ageGroup: string;
  familyStatus: string;
  address: string;
  remarks?: string;
}

export interface VehicleInfo {
  vin: string;
  plate: string;
  brand: string;
  model: string;
  purchaseDate: string;
  mileage: number;
  warrantyStatus: string;
}

export interface ConsumptionStats {
  totalSpend: number;
  avgSpend: number;
  orderCount: number;
  visit90d: number;
  lastVisit?: string;
}

export interface ValueInfo {
  loyaltyLevel: string;
  opportunityLevel: string;
  lifecycle: string;
  customerValue: string;
}

export interface OpportunityInfo {
  leadType: string; // 商机类型
  priority: "low" | "medium" | "high"; // 优先级
  status: "pending" | "pushed" | "processing" | "completed"; // 状态
  ruleName: string; // 触发规则名称
  pushTarget?: "BDC外呼系统"; // 推送目标系统
  pushStatus?: "pending" | "success" | "failed"; // 推送状态
}

export interface CategoryTags {
  [category: string]: string[]; // 分类名称 -> 标签列表
}

export interface SelectedTags {
  [category: string]: string[]; // 分类名称 -> 选中的标签列表
}

export interface Transaction {
  id: string;
  type: "sale" | "service";
  date: string;
  amount: number;
  description: string;
  orderNo?: string;
  storeName?: string;
}

export interface Insurance {
  id: string;
  policyName: string;
  policyNo: string;
  company: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: "valid" | "expired";
}

export interface Assets {
  coupons: Array<{
    id: string;
    name: string;
    amount: number;
    expireDate: string;
    status: "valid" | "used" | "expired";
  }>;
  vouchers: Array<{
    id: string;
    name: string;
    balance: number;
    totalAmount?: number;
  }>;
  totalCouponValue: number;
  totalVoucherBalance: number;
}

export interface Vehicle {
  vin: string;
  licensePlate: string;
  model: string;
  brand?: string;
  purchaseDate: string;
  lastServiceDate: string;
  nextServiceDate: string;
  mileage: number;
  serviceCount?: number;
  totalServiceAmount?: number;
}

export interface Interaction {
  id: string;
  type: "call" | "wechat" | "visit" | "email" | "sms";
  date: string;
  content: string;
  operator: string;
  duration?: number;
  result?: string;
}

interface Props {
  customerInfo: CustomerInfo;
  vehicleInfo?: VehicleInfo;
  consumptionStats: ConsumptionStats;
  valueInfo: ValueInfo;
  opportunityInfoList?: OpportunityInfo[]; // 商机信息列表
  preferences?: string[];
  categoryTags?: CategoryTags; // 分类标签数据
  selectedTags?: SelectedTags; // 选中的标签
  oneId?: string; // OneID，用于传递
  transactions?: Transaction[]; // 维保记录
  insuranceData?: Insurance[]; // 保险信息
  assetsData?: Assets; // 资产中心
  vehiclesData?: Vehicle[]; // 车辆关联
  interactionsData?: Interaction[]; // 沟通记录
}

const props = defineProps<Props>();

// 模拟多个手机号数据（实际应从API获取）
const phoneValues = computed(() => [
  { value: props.customerInfo.phone, source: "DMS", isPrimary: true, updateTime: "2024-12-15 10:30:00" },
  { value: "138****5678", source: "BDC", updateTime: "2025-01-06 14:20:00" },
  { value: "138****5678", source: "客户报告纠错", updateTime: "2025-01-05 09:15:00" }
]);

// 判断是否有选中的标签
const hasSelectedTags = computed(() => {
  if (!props.selectedTags) return false;
  const tags = props.selectedTags;
  // 检查是否有任何分类有标签
  for (const category in tags) {
    const tagList = tags[category];
    if (tagList && Array.isArray(tagList) && tagList.length > 0) {
      return true;
    }
  }
  return false;
});

const formatMoney = (amount: number) => {
  return amount.toLocaleString("zh-CN");
};

const activeInfoTab = ref("transactions");
const transactionSearch = ref("");
const transactionTypeFilter = ref("");

// 计算过滤后的维保记录
const filteredTransactions = computed(() => {
  if (!props.transactions) return [];
  let result = [...props.transactions];

  // 按类型过滤
  if (transactionTypeFilter.value) {
    result = result.filter(item => item.type === transactionTypeFilter.value);
  }

  // 按搜索关键词过滤
  if (transactionSearch.value) {
    const keyword = transactionSearch.value.toLowerCase();
    result = result.filter(
      item =>
        item.description.toLowerCase().includes(keyword) ||
        item.orderNo?.toLowerCase().includes(keyword) ||
        item.storeName?.toLowerCase().includes(keyword)
    );
  }

  return result;
});

const formatCurrency = (amount: number) => {
  return `¥${amount.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return "--";
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN");
};

const formatDuration = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds}秒`;
  }
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}分${secs}秒`;
};

const getCouponStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    valid: t("customer.profile360.valid"),
    used: t("customer.profile360.used"),
    expired: t("customer.profile360.expired")
  };
  return map[status] || status;
};

const getInteractionType = (type: string): "primary" | "success" | "warning" | "info" => {
  const map: Record<string, "primary" | "success" | "warning" | "info"> = {
    call: "primary",
    wechat: "success",
    visit: "warning",
    email: "info",
    sms: "info"
  };
  return map[type] || "info";
};

const getInteractionTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    call: t("customer.profile360.call"),
    wechat: t("customer.profile360.wechat"),
    visit: t("customer.profile360.visit"),
    email: t("customer.profile360.email"),
    sms: t("customer.profile360.sms")
  };
  return map[type] || type;
};

const getInteractionTimelineType = (type: string): "primary" | "success" | "warning" | undefined => {
  const map: Record<string, "primary" | "success" | "warning"> = {
    call: "primary",
    wechat: "success",
    visit: "warning"
  };
  return map[type] || undefined;
};

// 获取分类显示名称（去掉【必选】等标记）
const getCategoryDisplayName = (category: string): string => {
  return category
    .replace(/【必选】/g, "")
    .replace(/必选/g, "")
    .trim();
};

// 判断某个标签分类是否为自动计算类
const isAutoCategory = (category: string): boolean => {
  const displayName = getCategoryDisplayName(category);
  const autoCategories = ["意向级别", "SC", "SA", "续保", "POC", "免打扰车主", "线上活动"];
  return autoCategories.some(key => displayName.includes(key));
};

// 获取标签分类来源说明（自动 / 手工）
const getCategoryOriginLabel = (category: string): string => {
  const isAuto = isAutoCategory(category);
  return isAuto ? t("customer.tagOrigin.auto") : t("customer.tagOrigin.manual");
};

// 获取单个标签来源说明（目前按分类规则区分）
const getTagOriginLabel = (category: string, tag: string): string => {
  // tag 目前未用于区分来源，预留参数避免未使用告警
  void tag;
  return getCategoryOriginLabel(category);
};

// 获取标签来源 class（自动 / 手工，用于样式区分）
const getTagOriginClass = (category: string, tag: string): string => {
  // tag 目前未用于区分样式，预留参数避免未使用告警
  void tag;
  return isAutoCategory(category) ? "auto" : "manual";
};

// 获取分类颜色索引（用于区分不同分类）
const getCategoryColorIndex = (category: string): number => {
  const categoryMap: Record<string, number> = {
    意向级别: 0,
    "SC【必选】": 1,
    "SA【必选】": 2,
    "续保【必选】": 3,
    "POC【必选】": 4,
    免打扰车主: 5,
    线上活动: 6,
    "爱好(≥1项)": 7
  };

  // 如果分类名称包含这些关键词，返回对应索引
  for (const key in categoryMap) {
    if (category.includes(key.replace("【必选】", "").replace("【", "").replace("】", ""))) {
      return categoryMap[key];
    }
  }

  // 默认返回基于字符串hash的索引
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 8;
};

// 以下商机 / 推送相关辅助函数暂未在模板中使用，后续如需要可从历史记录中恢复
</script>

<style scoped lang="scss">
.customer-reference-panel {
  .reference-card {
    margin-bottom: 16px;
    .card-header {
      display: flex;
      gap: 8px;
      align-items: center;
      font-weight: 600;
    }
  }
  .stat-item {
    padding: 12px;
    text-align: center;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
    .stat-label {
      margin-bottom: 6px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
    .stat-value {
      font-size: 16px;
      font-weight: 700;
      color: var(--el-text-color-primary);
    }
    .money-font {
      font-family: Consolas, "Courier New", monospace;
      color: var(--el-color-success);
    }
  }
  .preferences-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    .preference-tag {
      margin: 0;
    }
  }
  .remarks-content {
    padding: 8px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
    background: var(--el-fill-color-lighter);
    border-radius: 4px;
  }
  .category-tags-container {
    .empty-tags {
      padding: 30px 0;
      text-align: center;
      .empty-text {
        font-size: 13px;
        color: #c0c4cc;
      }
    }
    .tags-flow {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .category-tags-group {
      min-width: auto;
      max-width: fit-content;
      padding: 10px 12px;
      background: #ffffff;
      border: 1px solid #e8eaed;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgb(0 0 0 / 4%);
      .category-header {
        display: flex;
        gap: 6px;
        align-items: center;
        margin-bottom: 8px;
        .category-name {
          font-size: 12px;
          font-weight: 500;
          color: #606266;
          white-space: nowrap;
        }
      }
      .tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .category-tag {
        display: inline-flex;
        gap: 6px;
        align-items: center;
        padding: 3px 10px;
        font-size: 12px;
        font-weight: 400;
        color: #303133;
        cursor: default;
        background-color: #ffffff;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        transition: all 0.2s;
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
      font-weight: 400;
    }
  }
  .phone-tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    .phone-tag {
      padding: 4px 10px;
      font-size: 12px;
    }
  }
  .category-tag {
    .tag-origin {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 30px;
      height: 18px;
      padding: 0 6px;
      font-size: 12px;
      font-weight: 500;
      border: 1px solid;
      border-radius: 4px;
      &.auto {
        color: #b88230;
        background-color: #fdf6ec;
        border-color: #e6a23c;
      }
      &.manual {
        color: #606266;
        background-color: #f5f7fa;
        border-color: #dcdfe6;
      }
    }
    .tag-text {
      margin: 0;
    }
  }
  .tab-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    .tab-header-left {
      display: flex;
      align-items: center;
    }
    .tab-header-right {
      .data-count {
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }
  }
  .amount-text {
    font-weight: 600;
    color: var(--el-color-primary);
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
  .interaction-item {
    .interaction-header {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 8px;
      .operator {
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
      .duration {
        font-size: 12px;
        color: var(--el-text-color-regular);
      }
    }
    .interaction-content {
      margin-bottom: 8px;
      line-height: 1.6;
      color: var(--el-text-color-primary);
    }
    .interaction-result {
      margin-top: 8px;
    }
  }
  .interaction-card {
    :deep(.el-card__body) {
      padding: 12px 16px;
    }
  }
}
</style>
