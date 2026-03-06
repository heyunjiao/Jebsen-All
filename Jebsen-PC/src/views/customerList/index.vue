<template>
  <div class="customer-list-container table-box">
    <!-- 双层 Tab：第一层门店，第二层客户类型（OneID/全部·个人·公司） -->
    <el-card shadow="hover" class="double-tabs-card">
      <!-- 第一层：门店 -->
      <div class="tabs-layer">
        <span class="tabs-layer-label">{{ t("customer.store.label") }}</span>
        <el-tabs v-model="selectedStoreId" class="layer-tabs store-tabs" @tab-change="onTopStoreChange">
          <el-tab-pane v-for="opt in storeSearchOptions" :key="opt.value" :name="opt.value" :label="opt.label" />
        </el-tabs>
      </div>
      <!-- 第二层：客户类型 -->
      <div class="tabs-layer">
        <span class="tabs-layer-label">{{ t("customer.customerType.label") }}</span>
        <el-tabs v-model="activeCustomerTypeTab" class="layer-tabs type-tabs" @tab-change="handleCustomerTypeTabChange">
          <el-tab-pane>
            <template #label>
              <span class="tab-label">
                {{ t("customer.customerTypeTabs.all") }}
                <span v-if="customerTypeStats.all > 0" class="tab-count">{{ customerTypeStats.all }}</span>
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane>
            <template #label>
              <span class="tab-label">
                {{ t("customer.customerTypeTabs.individual") }}
                <span v-if="customerTypeStats.individual > 0" class="tab-count">{{ customerTypeStats.individual }}</span>
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane>
            <template #label>
              <span class="tab-label">
                {{ t("customer.customerTypeTabs.company") }}
                <span v-if="customerTypeStats.company > 0" class="tab-count">{{ customerTypeStats.company }}</span>
              </span>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <!-- 统计面板 -->
    <div class="stats-panel">
      <div class="stats-card primary-card">
        <div class="stats-icon-wrapper">
          <el-icon><User /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(customerStats.total) }}</div>
          <div class="stats-label">{{ t("customer.stats.total") }}</div>
        </div>
      </div>
      <div class="stats-card success-card">
        <div class="stats-icon-wrapper">
          <el-icon><Top /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">
            +{{ formatNumber(customerStats.newToday) }} <span class="sub-value">{{ t("customer.stats.growth") }}</span>
          </div>
          <div class="stats-label">{{ t("customer.stats.newToday") }}</div>
        </div>
      </div>
      <div class="stats-card warning-card">
        <div class="stats-icon-wrapper">
          <el-icon><Select /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ customerStats.contactable }}%</div>
          <div class="stats-label">{{ t("customer.stats.contactable") }}</div>
        </div>
      </div>
      <div class="stats-card info-card">
        <div class="stats-icon-wrapper">
          <el-icon><Medal /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(customerStats.verified) }}</div>
          <div class="stats-label">{{ t("customer.stats.verified") }}</div>
        </div>
      </div>
      <div class="stats-card success-card">
        <div class="stats-icon-wrapper">
          <el-icon><Connection /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(customerStats.mergedCount) }}</div>
          <div class="stats-label">{{ t("customer.stats.mergedCount") }}</div>
        </div>
      </div>
      <div class="stats-card primary-card">
        <div class="stats-icon-wrapper">
          <el-icon><Refresh /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(customerStats.updatedCount) }}</div>
          <div class="stats-label">{{ t("customer.stats.updatedCount") }}</div>
        </div>
      </div>
    </div>

    <!-- 公司客户筛选（使用公共 SearchForm 组件，支持多条件） -->
    <SearchForm
      v-if="activeCustomerTypeTab === 'company'"
      :columns="companySearchColumns"
      :search-param="companyFilter"
      :search-col="3"
      :search="handleCompanySearch"
      :reset="handleCompanyReset"
    />

    <!-- 公司客户表格（独立表头版） -->
    <CompanyCustomerTable
      v-if="activeCustomerTypeTab === 'company'"
      ref="companyTableRef"
      :table-data="companyTableData"
      :columns="columns"
      :pagination="companyPagination"
      @view360="viewProfile360"
      @view-sensitive-data="handleViewSensitiveData"
      @size-change="handleCompanySizeChange"
      @current-change="handleCompanyCurrentChange"
    />

    <!-- 个人客户表格（使用 ProTable） -->
    <pro-table
      v-else
      ref="proTableRef"
      :columns="columns"
      :request-api="loadData"
      :init-param="initParam"
      :pagination="true"
      :tool-button="toolButton"
      :border="true"
      :row-key="'id'"
    >
      <template #tableHeader>
        <el-button type="primary" @click="handleExport">
          <el-icon>
            <Download />
          </el-icon>
          {{ $t("customer.export") }}
        </el-button>
      </template>

      <!-- OneID列 -->
      <template #oneId="scope">
        <div class="oneid-cell">
          <span>{{ scope.row.oneId }}</span>
          <el-tag v-if="scope.row.hasConflict" type="warning" size="small" style="margin-left: 8px">
            <el-icon><Warning /></el-icon>
            {{ $t("customer.conflict") }}
          </el-tag>
        </div>
      </template>

      <!-- 手机号列（多值支持） -->
      <template #phone="scope">
        <MultiValueField
          field-key="phone"
          field-label="手机号码"
          :field-value="scope.row.phone"
          :one-id="scope.row.oneId"
          @view="handleViewSensitiveData"
        />
      </template>

      <!-- 生命周期状态列 -->
      <template #lifecycleStatus="scope">
        <el-tag :type="getStatusType(scope.row.lifecycleStatus)" size="small">
          {{ getStatusLabel(scope.row.lifecycleStatus) }}
        </el-tag>
      </template>

      <!-- 操作列 -->
      <template #operation="scope">
        <el-button link type="primary" @click="viewProfile360(scope.row)">
          <el-icon><View /></el-icon>
          {{ $t("customer.view360") }}
        </el-button>
      </template>
    </pro-table>

    <!-- 360度全景视图 -->
    <Profile360View
      v-model="show360View"
      :profile-data="current360Data"
      @feedback="submitFeedback"
      @export="handleExport360"
      @vehicle-status-change="onVehicleStatusChange"
      @vehicle-role-change="onVehicleRoleChange"
    />

    <!-- 纠错反馈弹窗 -->
    <FeedbackDialog v-model="showFeedbackDialog" :customer="currentCustomer" @submit="handleFeedbackSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted, watch, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Download, View, Warning, User, Top, Select, Medal, Connection, Refresh } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/modules/user";
import ProTable from "@/components/ProTable/index.vue";
import SearchForm from "@/components/SearchForm/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";
import { TABLE_EMPTY_PLACEHOLDER } from "@/utils";
import { Customer, Customer360View, FeedbackForm, LifecycleStatus, CompanyInfo } from "./interface";
import MultiValueField from "./components/MultiValueField.vue";
import CompanyCustomerTable from "./components/CompanyCustomerTable.vue";
import Profile360View from "./components/Profile360View.vue";
import FeedbackDialog from "./components/FeedbackDialog.vue";

// 国际化多语言处理
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const userStore = useUserStore();

// 模拟门店列表（与 Mock 数据一致，保证搜索选项与列表数据可关联、门店筛选生效）
const MOCK_STORE_LIST = [
  { storeId: "store_001", storeName: "上海浦东保时捷中心" },
  { storeId: "store_002", storeName: "北京保时捷中心" },
  { storeId: "store_003", storeName: "广州天河保时捷中心" },
  { storeId: "store_004", storeName: "深圳南山保时捷中心" },
  { storeId: "store_005", storeName: "杭州西湖保时捷中心" }
];

// 门店筛选项：与 Mock 数据使用同一门店列表，选「全部」不按门店过滤，选具体门店则按 primaryStoreId 过滤
const storeSearchOptions = computed(() => [
  { label: t("customer.store.allStores"), value: "" },
  ...MOCK_STORE_LIST.map(s => ({ label: s.storeName, value: s.storeId }))
]);

// 客户库统计数据（根据当前筛选/Tab 的结果动态计算）
const customerStats = reactive({
  total: 0,
  newToday: 0,
  contactable: 0,
  verified: 0,
  mergedCount: 0,
  updatedCount: 0
});

// 格式化数字
const formatNumber = (num: number) => {
  return num.toLocaleString("zh-CN");
};

// 客户类型 Tab（全部 / 个人 / 公司）
type CustomerTypeTab = "all" | "individual" | "company";
const activeCustomerTypeTab = ref<CustomerTypeTab>("all");

// Tab 对应数量统计（受除 customerType 以外的筛选影响）
const customerTypeStats = reactive<{
  all: number;
  individual: number;
  company: number;
}>({
  all: 0,
  individual: 0,
  company: 0
});

// 顶部门店选择（与下方列表、公司筛选共用，变更时触发刷新）
const selectedStoreId = ref("");

// 初始化参数：含 customerType（Tab）与 storeId（顶部门店），供 ProTable / loadCompanyData 使用
const initParam = reactive<{ customerType?: Customer["customerType"] | ""; storeId?: string }>({
  customerType: "",
  storeId: ""
});

// 顶部门店变更：同步到 initParam 并刷新当前 Tab 数据（清空时视为「全部」）
const onTopStoreChange = () => {
  const storeId = selectedStoreId.value ?? "";
  initParam.storeId = storeId;
  if (activeCustomerTypeTab.value === "company") {
    companyFilter.storeId = storeId;
    companyPagination.pageNum = 1;
    loadCompanyData();
  } else {
    proTableRef.value?.getTableList?.();
  }
};

// 工具栏按钮配置
const toolButton: ("refresh" | "setting" | "search")[] = ["refresh", "setting", "search"];

// 基础表格列配置（个人 / 公司共用）
const baseColumns: ColumnProps<Customer>[] = [
  {
    prop: "oneId",
    label: t("customer.oneId"),
    minWidth: 150,
    sortable: true,
    search: {
      el: "input",
      label: t("customer.oneId"),
      props: { placeholder: t("customer.placeholder.oneId") }
    }
  },
  {
    prop: "storeId",
    label: t("customer.store.label"),
    minWidth: 160,
    enum: storeSearchOptions,
    // 门店筛已移至页面顶部，此处仅作列展示，不再在搜索区重复
    render: scope => {
      // 列表只保留一个门店信息列：展示主服务门店名称，保证当前有数据
      const name = scope.row.primaryStoreName;
      const display = name || TABLE_EMPTY_PLACEHOLDER;
      return display === TABLE_EMPTY_PLACEHOLDER ? h("span", { class: "table-cell-empty" }, display) : display;
    }
  },
  {
    prop: "lifecycleStatus",
    label: t("customer.lifecycleStatus"),
    minWidth: 120,
    search: {
      el: "select",
      label: t("customer.lifecycleStatus"),
      props: {
        placeholder: t("customer.placeholder.lifecycleStatus"),
        options: [
          { label: t("customer.lifecycleStatusOptions.active"), value: "active" },
          { label: t("customer.lifecycleStatusOptions.inactive"), value: "inactive" },
          { label: t("customer.lifecycleStatusOptions.pending"), value: "pending" },
          { label: t("customer.lifecycleStatusOptions.conflict"), value: "conflict" }
        ]
      }
    }
  },
  {
    prop: "userId",
    label: t("customer.userId"),
    minWidth: 120,
    sortable: true,
    search: {
      el: "input",
      label: t("customer.userId"),
      props: { placeholder: t("customer.placeholder.userId") }
    }
  },
  {
    prop: "name",
    label: t("customer.name"),
    minWidth: 120,
    search: {
      el: "input",
      label: t("customer.name"),
      props: { placeholder: t("customer.placeholder.name") }
    }
  },
  {
    prop: "city",
    label: t("customer.city"),
    minWidth: 120,
    search: {
      el: "input",
      label: t("customer.city"),
      props: { placeholder: t("customer.placeholder.city") }
    }
  },
  {
    prop: "customerType",
    label: t("customer.customerType.label"),
    minWidth: 120,
    search: {
      el: "select",
      label: t("customer.customerType.label"),
      props: {
        placeholder: t("customer.placeholder.customerType"),
        options: [
          { label: t("customer.customerType.individual"), value: "individual" },
          { label: t("customer.customerType.company"), value: "company" }
        ]
      }
    },
    render: scope => {
      const type = scope.row.customerType;
      const label = type === "company" ? t("customer.customerType.company") : t("customer.customerType.individual");
      return h(
        "span",
        {
          class: "customer-type-cell"
        },
        label
      );
    }
  },
  {
    prop: "gender",
    label: t("customer.gender.label"),
    minWidth: 100,
    search: {
      el: "select",
      label: t("customer.gender.label"),
      props: {
        placeholder: t("customer.placeholder.gender"),
        options: [
          { label: t("customer.gender.male"), value: "male" },
          { label: t("customer.gender.female"), value: "female" },
          { label: t("customer.gender.other"), value: "other" }
        ]
      }
    },
    render: scope =>
      scope.row.customerType === "company"
        ? "—"
        : scope.row.gender
          ? t(`customer.gender.${scope.row.gender}`)
          : TABLE_EMPTY_PLACEHOLDER
  },
  {
    prop: "ageGroup",
    label: t("customer.ageGroup"),
    minWidth: 120,
    search: {
      el: "input",
      label: t("customer.ageGroup"),
      props: { placeholder: t("customer.placeholder.ageGroup") }
    },
    render: scope => (scope.row.customerType === "company" ? "—" : scope.row.ageGroup || TABLE_EMPTY_PLACEHOLDER)
  },
  {
    prop: "familyStatus",
    label: t("customer.familyStatus"),
    minWidth: 120,
    search: {
      el: "input",
      label: t("customer.familyStatus"),
      props: { placeholder: t("customer.placeholder.familyStatus") }
    },
    render: scope => (scope.row.customerType === "company" ? "—" : scope.row.familyStatus || TABLE_EMPTY_PLACEHOLDER)
  },
  {
    prop: "address",
    label: t("customer.address"),
    minWidth: 180,
    search: {
      el: "input",
      label: t("customer.address"),
      props: { placeholder: t("customer.placeholder.address") }
    },
    render: scope => {
      const fieldValue = scope.row.address;
      if (Array.isArray(fieldValue) && fieldValue.length > 1) {
        return h(MultiValueField, {
          fieldKey: "address",
          fieldLabel: t("customer.address"),
          fieldValue: fieldValue,
          oneId: scope.row.oneId
        });
      }
      const val = typeof fieldValue === "string" ? fieldValue : (fieldValue?.[0]?.value ?? "");
      const display = val || TABLE_EMPTY_PLACEHOLDER;
      return display === TABLE_EMPTY_PLACEHOLDER ? h("span", { class: "table-cell-empty" }, display) : display;
    }
  },
  {
    prop: "phone",
    label: t("customer.phone"),
    minWidth: 140,
    search: {
      el: "input",
      label: t("customer.phone"),
      props: { placeholder: t("customer.placeholder.phone") }
    }
  },
  {
    prop: "primaryRelationTag",
    label: t("customer.primaryRelationTag"),
    minWidth: 110,
    render: scope => {
      const row = scope.row as Customer;
      // 业务规则：主号关系仅对个人客户有意义；公司在列表中不展示
      if (row.customerType === "company") return TABLE_EMPTY_PLACEHOLDER;
      const display = row.primaryRelationTag || TABLE_EMPTY_PLACEHOLDER;
      return display === TABLE_EMPTY_PLACEHOLDER ? h("span", { class: "table-cell-empty" }, display) : display;
    }
  },
  {
    prop: "handler",
    label: t("customer.handler"),
    minWidth: 100,
    render: scope => {
      const row = scope.row;
      if (row.customerType !== "company" || !row.handlers?.length) return "—";
      const selected = row.handlers.find((h: { id: string }) => h.id === row.selectedHandlerId) || row.handlers[0];
      if (!selected?.name) return "—";
      const role = (selected as { role?: string }).role;
      return role ? `${selected.name}（${role}）` : selected.name;
    }
  },
  {
    prop: "segmentName",
    label: t("customer.segmentName"),
    minWidth: 120,
    search: {
      el: "input",
      label: t("customer.segmentName"),
      props: { placeholder: t("customer.placeholder.segmentName") }
    }
  },
  {
    prop: "contactPreference",
    label: t("customer.contactPreference"),
    minWidth: 160,
    search: {
      el: "input",
      label: t("customer.contactPreference"),
      props: { placeholder: t("customer.placeholder.contactPreference") }
    }
  },
  {
    prop: "lastVisitTime",
    label: t("customer.lastVisitTime"),
    minWidth: 160,
    search: {
      el: "date-picker",
      label: t("customer.lastVisitTime"),
      props: {
        type: "daterange",
        rangeSeparator: "-",
        startPlaceholder: t("customer.placeholder.lastVisitTimeStart"),
        endPlaceholder: t("customer.placeholder.lastVisitTimeEnd")
      }
    }
  },
  {
    prop: "visitCount90Days",
    label: t("customer.visitCount90Days"),
    minWidth: 160,
    sortable: true,
    search: {
      el: "input-number",
      label: t("customer.visitCount90Days"),
      props: {
        placeholder: t("customer.placeholder.visitCount90Days"),
        min: 0
      }
    }
  },
  {
    prop: "annualOrderFrequency",
    label: t("customer.annualOrderFrequency"),
    minWidth: 180,
    search: {
      el: "input",
      label: t("customer.annualOrderFrequency"),
      props: { placeholder: t("customer.placeholder.annualOrderFrequency") }
    }
  },
  {
    prop: "avgConsumption",
    label: t("customer.avgConsumption"),
    minWidth: 150,
    sortable: true,
    search: {
      el: "input-number",
      label: t("customer.avgConsumption"),
      props: {
        placeholder: t("customer.placeholder.avgConsumption"),
        min: 0,
        precision: 2
      }
    }
  },
  {
    prop: "projectPreference",
    label: t("customer.projectPreference"),
    minWidth: 150,
    search: {
      el: "input",
      label: t("customer.projectPreference"),
      props: { placeholder: t("customer.placeholder.projectPreference") }
    }
  },
  {
    prop: "hasComplaintLastYear",
    label: t("customer.hasComplaintLastYear"),
    minWidth: 180,
    search: {
      el: "select",
      label: t("customer.hasComplaintLastYear"),
      props: {
        placeholder: t("customer.placeholder.hasComplaintLastYear"),
        options: [
          { label: t("common.yes"), value: true },
          { label: t("common.no"), value: false }
        ]
      }
    },
    render: scope => (scope.row.hasComplaintLastYear ? t("common.yes") : t("common.no"))
  },
  {
    prop: "annualConsumption",
    label: t("customer.annualConsumption"),
    minWidth: 160,
    sortable: true,
    search: {
      el: "input-number",
      label: t("customer.annualConsumption"),
      props: {
        placeholder: t("customer.placeholder.annualConsumption"),
        min: 0,
        precision: 2
      }
    }
  },
  {
    prop: "loyaltyLevel",
    label: t("customer.loyaltyLevel"),
    minWidth: 140,
    search: {
      el: "input",
      label: t("customer.loyaltyLevel"),
      props: { placeholder: t("customer.placeholder.loyaltyLevel") }
    }
  },
  {
    prop: "opportunityLevel",
    label: t("customer.opportunityLevel"),
    minWidth: 140,
    search: {
      el: "input",
      label: t("customer.opportunityLevel"),
      props: { placeholder: t("customer.placeholder.opportunityLevel") }
    }
  },
  {
    prop: "vinInfo",
    label: t("customer.vinInfo"),
    minWidth: 180,
    search: {
      el: "input",
      label: t("customer.vinInfo"),
      props: { placeholder: t("customer.placeholder.vinInfo") }
    },
    render: scope => {
      const fieldValue = scope.row.vinInfo;
      if (Array.isArray(fieldValue) && fieldValue.length > 1) {
        return h(MultiValueField, {
          fieldKey: "vin",
          fieldLabel: t("customer.vinInfo"),
          fieldValue: fieldValue,
          oneId: scope.row.oneId
        });
      }
      const val = typeof fieldValue === "string" ? fieldValue : (fieldValue?.[0]?.value ?? "");
      const display = val || TABLE_EMPTY_PLACEHOLDER;
      return display === TABLE_EMPTY_PLACEHOLDER ? h("span", { class: "table-cell-empty" }, display) : display;
    }
  },
  {
    prop: "licensePlate",
    label: t("customer.licensePlate"),
    minWidth: 140,
    search: {
      el: "input",
      label: t("customer.licensePlate"),
      props: { placeholder: t("customer.placeholder.licensePlate") }
    },
    render: scope => {
      const fieldValue = scope.row.licensePlate;
      if (Array.isArray(fieldValue) && fieldValue.length > 1) {
        return h(MultiValueField, {
          fieldKey: "plate",
          fieldLabel: t("customer.licensePlate"),
          fieldValue: fieldValue,
          oneId: scope.row.oneId
        });
      }
      const val = typeof fieldValue === "string" ? fieldValue : (fieldValue?.[0]?.value ?? "");
      const display = val || TABLE_EMPTY_PLACEHOLDER;
      return display === TABLE_EMPTY_PLACEHOLDER ? h("span", { class: "table-cell-empty" }, display) : display;
    }
  },
  {
    prop: "carSeriesModel",
    label: t("customer.carSeriesModel"),
    minWidth: 160,
    search: {
      el: "input",
      label: t("customer.carSeriesModel"),
      props: { placeholder: t("customer.placeholder.carSeriesModel") }
    }
  },
  {
    prop: "currentMileage",
    label: t("customer.currentMileage"),
    minWidth: 150,
    sortable: true,
    search: {
      el: "input-number",
      label: t("customer.currentMileage"),
      props: {
        placeholder: t("customer.placeholder.currentMileage"),
        min: 0,
        precision: 2
      }
    }
  },
  {
    prop: "serviceHabit",
    label: t("customer.serviceHabit"),
    minWidth: 150,
    search: {
      el: "input",
      label: t("customer.serviceHabit"),
      props: { placeholder: t("customer.placeholder.serviceHabit") }
    }
  },
  {
    prop: "operation",
    label: t("common.operation"),
    fixed: "right",
    width: 150
  }
];

// 根据当前客户类型 Tab 动态裁剪列：
// - 个人 Tab：不展示公司经办人列 & 客户类型列
// - 公司 Tab：不展示客户类型列（已由 Tab 语义明确）
// - 全部 Tab：展示全部基础列
const columns = computed<ColumnProps<Customer>[]>(() => {
  if (activeCustomerTypeTab.value === "individual") {
    return baseColumns.filter(col => col.prop !== "handler" && col.prop !== "customerType");
  }
  if (activeCustomerTypeTab.value === "company") {
    return baseColumns.filter(col => col.prop !== "customerType");
  }
  return baseColumns;
});

// 表格引用
const proTableRef = ref();
const companyTableRef = ref();

// 公司客户表格数据
const companyTableData = ref<Customer[]>([]);
const companyPagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});
// 公司客户筛选参数（使用公共 SearchForm，需支持多条件）
const companyFilter = reactive<Record<string, any>>({});

// 公司 Tab 使用的搜索列（复用基础列配置，过滤掉仅个人/类型相关字段）
const companySearchColumns = computed<ColumnProps<Customer>[]>(() =>
  baseColumns.filter(
    col =>
      col.search &&
      col.prop !== "customerType" &&
      col.prop !== "handler" &&
      col.prop !== "gender" &&
      col.prop !== "ageGroup" &&
      col.prop !== "familyStatus"
  )
);

// 切换客户类型 Tab
const handleCustomerTypeTabChange = (name: any) => {
  const tab: CustomerTypeTab = (name || "all") as CustomerTypeTab;
  activeCustomerTypeTab.value = tab;
  initParam.customerType = tab === "all" ? "" : tab;

  if (tab === "company") {
    // 公司客户：加载数据到 companyTableData
    companyPagination.pageNum = 1;
    // 重置公司筛选参数（但保留 Tab 级别的公共 initParam.customerType）
    Object.keys(companyFilter).forEach(key => {
      delete companyFilter[key];
    });
    loadCompanyData();
  } else {
    // 个人客户：使用 ProTable
    if (proTableRef.value && (proTableRef.value as any).pageable) {
      (proTableRef.value as any).pageable.pageNum = 1;
    }
    proTableRef.value?.getTableList?.();
  }
};

// 加载公司客户数据
const loadCompanyData = async () => {
  const params = {
    ...initParam,
    ...companyFilter,
    customerType: "company",
    pageNum: companyPagination.pageNum,
    pageSize: companyPagination.pageSize
  };

  const result = await loadData(params);
  if (result?.data) {
    companyTableData.value = result.data.list || [];
    companyPagination.total = result.data.total || 0;
  }
};

// 公司筛选：公共 SearchForm 搜索回调
const handleCompanySearch = (params: Record<string, any>) => {
  // 清空旧条件，写入新条件
  Object.keys(companyFilter).forEach(key => {
    delete companyFilter[key];
  });
  Object.assign(companyFilter, params);
  companyPagination.pageNum = 1;
  loadCompanyData();
};

// 公司筛选：重置回调
const handleCompanyReset = () => {
  Object.keys(companyFilter).forEach(key => {
    delete companyFilter[key];
  });
  companyPagination.pageNum = 1;
  loadCompanyData();
};

// 公司表格分页大小变化
const handleCompanySizeChange = (size: number) => {
  companyPagination.pageSize = size;
  companyPagination.pageNum = 1;
  loadCompanyData();
};

// 公司表格当前页变化
const handleCompanyCurrentChange = (page: number) => {
  companyPagination.pageNum = page;
  loadCompanyData();
};

// 生成模拟数据（门店使用上方 MOCK_STORE_LIST 的 storeId/storeName）（先生成全量，再按筛选条件过滤，最后做分页与统计）
const generateMockData = (pageNum: number, pageSize: number, filters: any = {}) => {
  const total = 100; // 全量模拟 100 条
  const allData: Customer[] = [];

  // 定义一些模拟数据的选项
  const genders = ["male", "female", "other"];
  const ageGroups = ["18-25", "26-35", "36-45", "46-55", "56-65"];
  const familyStatuses = ["未婚", "已婚", "离异", "丧偶"];
  const loyaltyLevels = ["普通", "银卡", "金卡", "VIP"];
  const opportunityLevels = ["A级", "B级", "C级", "D级"];
  const projectPreferences = ["保养", "维修", "美容", "配件", "保险", "救援"];
  const serviceHabits = ["到店即办", "预约服务", "上门服务", "电话咨询"];
  // 保时捷在售车系/车型（车辆信息 Tab 与列表车型列一致）
  const carSeriesModels = [
    "保时捷 911 Carrera",
    "保时捷 911 Turbo",
    "保时捷 Cayenne",
    "保时捷 Cayenne Coupé",
    "保时捷 Panamera",
    "保时捷 Taycan",
    "保时捷 Macan",
    "保时捷 718 Boxster",
    "保时捷 718 Cayman"
  ];

  const sourceSystems = ["DMS", "BDC", "CRM", "ERP", "WMS", "SCM", "BI"];
  // 生命周期状态：
  // - active / inactive  : 客户支持启用 / 停用
  // - pending            : 审核中 / 数据异常处理中（已提交到异常中心，等待数据治理员处理）
  // - conflict           : 存在跨源数据冲突
  const lifecycleStatuses: LifecycleStatus[] = ["active", "inactive", "pending", "conflict"];
  const segments = ["高价值客户", "普通客户", "潜在客户", "流失客户", "VIP客户"];
  const cities = ["上海", "北京", "广州", "深圳", "杭州", "成都", "南京", "苏州"];
  // 关系标签：个人客户使用“本人/配偶”，公司客户统一使用“公司电话”
  const individualRelationTags = ["本人", "配偶"];
  const companyRelationTag = "公司电话";
  const storeCount = MOCK_STORE_LIST.length;

  // 生成全量数据
  for (let i = 0; i < total; i++) {
    const oneId = `ONEID${String(i + 1).padStart(8, "0")}`;
    const hasConflict = i % 10 === 0; // 每10个中有1个有冲突
    const customerType: Customer["customerType"] = i % 4 === 0 ? "company" : "individual";
    const lifecycleStatus = lifecycleStatuses[i % lifecycleStatuses.length];
    const store = MOCK_STORE_LIST[i % storeCount];

    allData.push({
      id: i + 1,
      oneId: oneId,
      userId: `C${String(i + 1).padStart(3, "0")}`,
      customerType,
      name: customerType === "company" ? `上汽通用汽车销售有限公司客户${i + 1}` : `客户${i + 1}`,
      // 仅个人客户有性别/年龄段/家庭状态；公司客户不填，列表显示 —
      ...(customerType === "individual"
        ? {
            gender: genders[i % genders.length],
            ageGroup: ageGroups[i % ageGroups.length],
            familyStatus: familyStatuses[i % familyStatuses.length]
          }
        : {}),
      address:
        i % 5 === 0
          ? [
              {
                value: `地址${i + 1}号街道${Math.floor(Math.random() * 100) + 1}号`,
                source: "DMS",
                isPrimary: true,
                updateTime: "2024-12-15 10:30:00"
              },
              {
                value: `地址${i + 1}号街道${Math.floor(Math.random() * 100) + 1}号（新）`,
                source: "BDC",
                updateTime: "2025-01-06 14:20:00"
              }
            ]
          : `地址${i + 1}号街道${Math.floor(Math.random() * 100) + 1}号`,
      phone:
        i % 7 === 0
          ? [
              {
                value: `138${String(Math.floor(Math.random() * 9000) + 1000)}${String(Math.floor(Math.random() * 9000) + 1000)}`,
                source: "DMS",
                isPrimary: true,
                updateTime: "2024-12-15 10:30:00",
                relationTagName:
                  customerType === "company" ? companyRelationTag : individualRelationTags[i % individualRelationTags.length]
              },
              {
                value: `139${String(Math.floor(Math.random() * 9000) + 1000)}${String(Math.floor(Math.random() * 9000) + 1000)}`,
                source: "BDC",
                updateTime: "2025-01-06 14:20:00",
                relationTagName: customerType === "company" ? "联系人" : "配偶"
              },
              {
                value: `150${String(Math.floor(Math.random() * 9000) + 1000)}${String(Math.floor(Math.random() * 9000) + 1000)}`,
                source: "客户报告纠错",
                updateTime: "2025-01-05 09:15:00"
              }
            ]
          : `138${String(Math.floor(Math.random() * 9000) + 1000)}${String(Math.floor(Math.random() * 9000) + 1000)}`,
      contactPreference: ["工作日 9:00-18:00", "周末 10:00-20:00", "任意时间"][i % 3],
      lastVisitTime: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(
        2,
        "0"
      )}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")} ${String(Math.floor(Math.random() * 12) + 8).padStart(
        2,
        "0"
      )}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:00`,
      visitCount90Days: Math.floor(Math.random() * 20),
      annualOrderFrequency: Math.floor(Math.random() * 50),
      avgConsumption: parseFloat((Math.random() * 10000).toFixed(2)),
      projectPreference: projectPreferences[i % projectPreferences.length],
      hasComplaintLastYear: i % 7 === 0, // 每7个客户中有1个有投诉
      annualConsumption: parseFloat((Math.random() * 50000).toFixed(2)),
      loyaltyLevel: loyaltyLevels[i % loyaltyLevels.length],
      opportunityLevel: opportunityLevels[i % opportunityLevels.length],
      vinInfo:
        i % 8 === 0
          ? [
              {
                value: `LSGDB52E7HA${String(100000 + i).slice(-6)}`,
                source: "DMS",
                isPrimary: true,
                updateTime: "2024-12-15 10:30:00"
              },
              { value: `LSGDB52E7HA${String(100000 + i + 1).slice(-6)}`, source: "BDC", updateTime: "2025-01-06 14:20:00" }
            ]
          : `LSGDB52E7HA${String(100000 + i).slice(-6)}`,
      licensePlate:
        i % 6 === 0
          ? [
              {
                value: `${["京", "沪", "粤", "苏", "浙", "鲁"][i % 6]}${String.fromCharCode(65 + (i % 6))}${Math.floor(Math.random() * 90000 + 10000)}`,
                source: "DMS",
                isPrimary: true,
                updateTime: "2024-12-15 10:30:00"
              },
              {
                value: `${["京", "沪", "粤", "苏", "浙", "鲁"][(i + 1) % 6]}${String.fromCharCode(65 + ((i + 1) % 6))}${Math.floor(Math.random() * 90000 + 10000)}`,
                source: "BDC",
                updateTime: "2025-01-05 09:20:00"
              }
            ]
          : `${["京", "沪", "粤", "苏", "浙", "鲁"][i % 6]}${String.fromCharCode(65 + (i % 6))}${Math.floor(Math.random() * 90000 + 10000)}`,
      carSeriesModel: carSeriesModels[i % carSeriesModels.length],
      currentMileage: parseFloat((Math.random() * 200000).toFixed(2)),
      serviceHabit: serviceHabits[i % serviceHabits.length],
      // 新增字段
      lifecycleStatus: lifecycleStatus,
      hasConflict: hasConflict,
      conflicts: hasConflict
        ? [
            {
              field: "phone",
              sourceValues: [
                {
                  system: "DMS",
                  value: `138${String(Math.floor(Math.random() * 9000) + 1000)}${String(Math.floor(Math.random() * 9000) + 1000)}`
                },
                {
                  system: "BDC",
                  value: `139${String(Math.floor(Math.random() * 9000) + 1000)}${String(Math.floor(Math.random() * 9000) + 1000)}`
                }
              ],
              resolvedValue: `138${String(Math.floor(Math.random() * 9000) + 1000)}${String(Math.floor(Math.random() * 9000) + 1000)}`
            }
          ]
        : undefined,
      lineage: {
        oneId: oneId,
        sourceSystems: [
          {
            systemName: sourceSystems[i % sourceSystems.length],
            systemId: `${sourceSystems[i % sourceSystems.length]}_${i + 1}`,
            linkedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            isPrimary: i % 3 === 0
          },
          {
            systemName: sourceSystems[(i + 1) % sourceSystems.length],
            systemId: `${sourceSystems[(i + 1) % sourceSystems.length]}_${i + 1}`,
            linkedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            isPrimary: false
          }
        ]
      },
      tags: i % 5 === 0 ? ["高价值客户", "VIP"] : i % 3 === 0 ? ["活跃客户"] : [],
      segmentName: segments[i % segments.length],
      city: cities[i % cities.length],
      // 主号关系标签：个人客户为“本人/配偶”，公司客户固定“公司电话”
      primaryRelationTag:
        customerType === "company" ? companyRelationTag : individualRelationTags[i % individualRelationTags.length],
      primaryStoreId: store.storeId,
      primaryStoreName: store.storeName,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      ...(customerType === "company"
        ? {
            handlers: [
              { id: `H${i}-1`, name: "张三", role: "联系人" },
              { id: `H${i}-2`, name: "李四", role: "使用人" }
            ],
            selectedHandlerId: `H${i}-1`
          }
        : {})
    });
  }

  // 拆分筛选条件：排除分页与表格内部参数，只保留业务筛选字段
  const { customerType, lifecycleStatus, storeId, pageNum: _pn, pageSize: _ps, ...restFilters } = filters || {};

  // 计算 Tab 统计用的基础集合（不区分 customerType）
  let baseFiltered = allData;

  if (storeId) {
    baseFiltered = baseFiltered.filter(item => item.primaryStoreId === storeId);
  }
  if (lifecycleStatus) {
    baseFiltered = baseFiltered.filter(item => item.lifecycleStatus === lifecycleStatus);
  }

  // 通用筛选（支持公司/个人的多条件搜索）：
  // 对于字符串字段，使用包含（contains）；布尔/枚举字段使用全等
  Object.entries(restFilters || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    baseFiltered = baseFiltered.filter((item: any) => {
      const field = item[key];
      if (field === undefined || field === null) return false;
      if (typeof value === "string") {
        return String(field).includes(value);
      }
      if (typeof value === "boolean" || typeof value === "number") {
        return field === value;
      }
      return true;
    });
  });

  // 更新 Tab 数量（受其他筛选影响，但与当前激活 Tab 无关）
  customerTypeStats.all = baseFiltered.length;
  customerTypeStats.individual = baseFiltered.filter(item => item.customerType === "individual").length;
  customerTypeStats.company = baseFiltered.filter(item => item.customerType === "company").length;

  // 表格数据在基础集合上叠加当前 Tab / 搜索中的 customerType 条件
  let filteredData = baseFiltered;
  if (customerType) {
    filteredData = filteredData.filter(item => item.customerType === customerType);
  }

  const filteredTotal = filteredData.length;

  // 分页切片
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  const pageData = filteredData.slice(start, end);

  // 基于筛选后的全量数据（非分页）计算统计面板数据
  const stats = {
    total: filteredTotal,
    // 模拟“今日新增”：按 5% 比例估算，至少 0
    newToday: filteredTotal > 0 ? Math.max(1, Math.floor(filteredTotal * 0.05)) : 0,
    // 可触达率：有手机号视为可触达
    contactable:
      filteredTotal === 0
        ? 0
        : Number(
            (
              (filteredData.filter(item => !!item.phone && (Array.isArray(item.phone) ? item.phone.length > 0 : true)).length /
                filteredTotal) *
              100
            ).toFixed(1)
          ),
    // 成交车主：简单以年度订单频次>0 作为“真实下单客户”
    verified: filteredData.filter(item => item.annualOrderFrequency > 0).length,
    // 已合并数：有跨源冲突的客户数量
    mergedCount: filteredData.filter(item => item.hasConflict).length,
    // 已更新数：用“总数 - 未合并数”的方式模拟
    updatedCount: Math.max(0, filteredTotal - filteredData.filter(item => !item.hasConflict).length)
  };

  return {
    data: pageData,
    total: filteredTotal,
    stats
  };
};

// 模拟数据加载函数
const loadData = async (params: any) => {
  console.log("加载客户数据，参数：", params);

  // 获取页码和页面大小
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;

  console.log(`请求第 ${pageNum} 页，每页 ${pageSize} 条数据`);

  // 获取搜索参数
  const searchParams = params;

  // 生成模拟数据
  const result = generateMockData(pageNum, pageSize, searchParams);

  console.log(`生成了 ${result.data.length} 条数据，总共 ${result.total} 条`);

  // 同步更新统计面板数据
  customerStats.total = result.stats.total;
  customerStats.newToday = result.stats.newToday;
  customerStats.contactable = result.stats.contactable;
  customerStats.verified = result.stats.verified;
  customerStats.mergedCount = result.stats.mergedCount;
  customerStats.updatedCount = result.stats.updatedCount;

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));

  // useTable hook 期望的返回格式是 { data: { list: [...], total: ... } }
  const response = {
    data: {
      list: result.data,
      total: result.total
    }
  };

  console.log("返回响应:", response);
  return response;
};

// 状态管理
const show360View = ref(false);
const showFeedbackDialog = ref(false);
const currentCustomer = ref<Customer | undefined>();
const current360Data = ref<Customer360View | undefined>();

// 获取状态类型
const getStatusType = (status: LifecycleStatus): "success" | "info" | "warning" | "danger" => {
  const map: Record<LifecycleStatus, "success" | "info" | "warning" | "danger"> = {
    active: "success",
    inactive: "info",
    pending: "warning",
    conflict: "danger"
  };
  return map[status] || "info";
};

// 获取状态标签（避免 status 为空时出现 i18n undefined 警告）
const getStatusLabel = (status: LifecycleStatus) => {
  if (status == null || status === "") return TABLE_EMPTY_PLACEHOLDER;
  return t(`customer.lifecycleStatusOptions.${status}`);
};

// 导出功能
const handleExport = () => {
  ElMessageBox.confirm(t("customer.exportConfirm"), t("customer.exportTitle"), { type: "info" }).then(() => {
    ElMessage.success(t("customer.exportSuccess"));
    // 实际导出逻辑
  });
};

// 查看敏感数据（触发审计）
const handleViewSensitiveData = (value: string | number) => {
  console.log("查看敏感数据，已记录审计日志:", value);
};

// 查看360度全景视图
const viewProfile360 = async (row: Customer) => {
  currentCustomer.value = row;

  // 生成消费趋势数据（最近12个月）
  const consumptionTrend: Array<{ date: string; amount: number; count: number }> = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    consumptionTrend.push({
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      amount: Math.floor(Math.random() * 10000) + 1000,
      count: Math.floor(Math.random() * 5) + 1
    });
  }

  // 生成消费结构数据
  const consumptionStructure = [
    { category: "保养", amount: row.avgConsumption * 0.4, percentage: 40 },
    { category: "维修", amount: row.avgConsumption * 0.3, percentage: 30 },
    { category: "美容", amount: row.avgConsumption * 0.15, percentage: 15 },
    { category: "配件", amount: row.avgConsumption * 0.1, percentage: 10 },
    { category: "其他", amount: row.avgConsumption * 0.05, percentage: 5 }
  ];

  // 生成项目偏好排行
  const projectPreferenceRank = [
    { name: "保养", count: 15, amount: row.avgConsumption * 0.4 * 15 },
    { name: "维修", count: 8, amount: row.avgConsumption * 0.3 * 8 },
    { name: "美容", count: 5, amount: row.avgConsumption * 0.15 * 5 },
    { name: "配件", count: 3, amount: row.avgConsumption * 0.1 * 3 }
  ];

  // 判断是否需要显示公司信息：客户类型为公司，或有 companyId/companyOneId（与 H5 一致，保证 360 弹窗能展示经办人 Tab）
  const hasCompanyInfo = row.customerType === "company" || !!row.companyId || !!row.companyOneId;

  // 构建公司信息（如果客户属于公司）
  // 需要从原始数据中查找公司信息，或者使用当前行的公司信息
  let companyInfo: CompanyInfo | undefined = undefined;
  if (hasCompanyInfo) {
    // 如果是个人客户但有关联公司，需要查找公司信息
    if (row.customerType === "individual" && row.companyOneId) {
      // 尝试从公司表格数据中查找公司信息
      const companyRow = companyTableData.value.find(c => c.oneId === row.companyOneId || c.id.toString() === row.companyId);
      if (companyRow) {
        companyInfo = {
          id: companyRow.id.toString(),
          oneId: companyRow.oneId,
          name: companyRow.name,
          address:
            typeof companyRow.address === "string"
              ? companyRow.address
              : Array.isArray(companyRow.address)
                ? companyRow.address[0]?.value || ""
                : "",
          phone: companyRow.phone,
          contactPerson: row.name,
          lifecycleStatus: companyRow.lifecycleStatus
        };
      } else {
        // 如果找不到，使用默认值
        companyInfo = {
          id: row.companyId || "",
          oneId: row.companyOneId || row.companyId || "",
          name: `公司-${row.companyOneId || row.companyId}`,
          address: "",
          phone: row.phone,
          contactPerson: row.name
        };
      }
    } else if (row.customerType === "company") {
      // 如果本身就是公司，使用当前行数据
      companyInfo = {
        id: row.id.toString(),
        oneId: row.oneId,
        name: row.name,
        address: typeof row.address === "string" ? row.address : Array.isArray(row.address) ? row.address[0]?.value || "" : "",
        phone: row.phone,
        contactPerson: row.name,
        lifecycleStatus: row.lifecycleStatus
      };
    }
  }

  // 模拟加载360度数据
  current360Data.value = {
    // 公司信息（如果客户属于公司）
    company: companyInfo,
    // 带 lineage 的客户信息（用于 OneID 溯源）
    customer: {
      ...row,
      lineage: {
        oneId: row.oneId,
        sourceSystems: [
          {
            systemName: "DMS",
            systemId: "DMS-" + row.userId,
            linkedAt: "2023-01-10 10:00:00",
            isPrimary: true
          },
          {
            systemName: "BDC",
            systemId: "BDC-" + row.userId,
            linkedAt: "2023-03-15 15:20:00",
            isPrimary: false
          },
          {
            systemName: "CRM",
            systemId: "CRM-" + row.userId,
            linkedAt: "2023-05-08 09:30:00",
            isPrimary: false
          }
        ],
        mergeHistory: [
          {
            mergedAt: "2024-01-05 09:30:00",
            mergedBy: "数据治理管理员",
            reason: "对齐客户基本信息，合并 DMS 与 CRM 记录",
            sourceSystem: "DMS",
            changes: [
              {
                field: "name",
                fieldLabel: t("customer.name"),
                oldValue: "张伟（CRM）",
                newValue: row.name
              },
              {
                field: "gender",
                fieldLabel: t("customer.gender.label"),
                oldValue: "未知",
                newValue:
                  row.gender === "male"
                    ? t("customer.gender.male")
                    : row.gender === "female"
                      ? t("customer.gender.female")
                      : t("customer.gender.other")
              },
              {
                field: "address",
                fieldLabel: t("customer.address"),
                oldValue: "上海市浦东新区世纪大道 1 号",
                newValue: typeof row.address === "string" ? row.address : row.address?.[0]?.value || "上海市浦东新区世纪大道 9 号"
              }
            ]
          },
          {
            mergedAt: "2024-02-01 16:20:00",
            mergedBy: "门店前台",
            reason: "客户到店更新车牌和当前里程",
            sourceSystem: "DMS",
            changes: [
              {
                field: "licensePlate",
                fieldLabel: t("customer.licensePlate"),
                oldValue: "沪A·00000",
                newValue: typeof row.licensePlate === "string" ? row.licensePlate : row.licensePlate?.[0]?.value || "沪A·12345"
              },
              {
                field: "currentMileage",
                fieldLabel: t("customer.currentMileage"),
                oldValue: "12000",
                newValue: String(row.currentMileage)
              }
            ]
          },
          {
            mergedAt: "2024-03-12 14:10:00",
            mergedBy: "客服中心",
            reason: "客户主动更新联系方式，手机号及联系偏好同步到 Golden Record",
            sourceSystem: "BDC",
            changes: [
              {
                field: "phone",
                fieldLabel: t("customer.phone"),
                oldValue: "138****0000",
                newValue: typeof row.phone === "string" ? row.phone : row.phone?.[0]?.value || "138****1234"
              },
              {
                field: "contactPreference",
                fieldLabel: t("customer.contactPreference"),
                oldValue: t("customer.placeholder.contactPreference"),
                newValue: row.contactPreference
              }
            ]
          },
          {
            mergedAt: "2024-03-28 09:00:00",
            mergedBy: "售后服务顾问",
            reason: "最近一次保养回写到 Golden Record",
            sourceSystem: "DMS",
            changes: [
              {
                field: "lastVisitTime",
                fieldLabel: t("customer.lastVisitTime"),
                oldValue: "2023-12-10",
                newValue: row.lastVisitTime
              },
              {
                field: "visitCount90Days",
                fieldLabel: t("customer.visitCount90Days"),
                oldValue: "1",
                newValue: String(row.visitCount90Days)
              }
            ]
          },
          {
            mergedAt: "2024-04-10 18:30:00",
            mergedBy: "营销自动化引擎",
            reason: "根据近 12 个月消费升级忠诚度等级",
            sourceSystem: "CRM",
            changes: [
              {
                field: "annualConsumption",
                fieldLabel: t("customer.annualConsumption"),
                oldValue: "80000",
                newValue: String(row.annualConsumption)
              },
              {
                field: "loyaltyLevel",
                fieldLabel: t("customer.loyaltyLevel"),
                oldValue: "普通",
                newValue: row.loyaltyLevel
              }
            ]
          },
          {
            mergedAt: "2024-04-20 11:45:00",
            mergedBy: "营销自动化引擎",
            reason: "基于近 90 天到店与消费表现，调整商机等级",
            sourceSystem: "CRM",
            changes: [
              {
                field: "opportunityLevel",
                fieldLabel: t("customer.opportunityLevel"),
                oldValue: "C级",
                newValue: row.opportunityLevel
              }
            ]
          },
          {
            mergedAt: "2024-05-05 10:15:00",
            mergedBy: "数据治理管理员",
            reason: "统一地址格式，补充省市信息",
            sourceSystem: "CRM",
            changes: [
              {
                field: "address",
                fieldLabel: t("customer.address"),
                oldValue: "浦东新区世纪大道 9 号",
                newValue: typeof row.address === "string" ? row.address : row.address?.[0]?.value || "上海市浦东新区世纪大道 9 号"
              }
            ]
          },
          {
            mergedAt: "2024-06-01 13:00:00",
            mergedBy: "客服中心",
            reason: "客户要求关闭电话联系，只保留企微触达",
            sourceSystem: "BDC",
            changes: [
              {
                field: "contactPreference",
                fieldLabel: t("customer.contactPreference"),
                oldValue: row.contactPreference,
                newValue: "仅限企微沟通"
              }
            ]
          }
        ]
      }
    },
    transactions: [
      {
        id: "2",
        serviceType: "保养",
        serviceTime: "2024-02-20 10:00:00",
        serviceStore: "上海浦东店",
        vehicleModel: row.carSeriesModel,
        amount: 2000,
        description: "常规保养",
        status: "已完成",
        tags: ["保养"],
        source: "DMS",
        orderNo: "ORD20240220001",
        storeName: "上海浦东店"
      },
      {
        id: "3",
        serviceType: "维修",
        serviceTime: "2024-03-15 14:30:00",
        serviceStore: "上海浦东店",
        vehicleModel: row.carSeriesModel,
        amount: 1500,
        description: "更换刹车片",
        status: "已完成",
        tags: ["维修"],
        source: "DMS",
        orderNo: "ORD20240315001",
        storeName: "上海浦东店"
      }
    ],
    consumptionTrend,
    consumptionStructure,
    insurance: [
      {
        id: "1",
        type: "商业险",
        policyNo: "POL20240101001",
        company: "平安财险",
        startDate: "2024-01-01",
        endDate: "2025-01-01",
        purchaseDate: "2023-12-20",
        amount: 5000,
        status: "已生效",
        renewalSpecialistName: "张顾问",
        source: "DMS"
      },
      {
        id: "2",
        type: "交强险",
        policyNo: "POL20240101002",
        company: "平安财险",
        startDate: "2024-01-01",
        endDate: "2025-01-01",
        purchaseDate: "2023-12-20",
        amount: 950,
        status: "已生效",
        renewalSpecialistName: "张顾问",
        source: "DMS"
      }
    ],
    assets: {
      coupons: [
        {
          id: "1",
          type: "coupon",
          name: "保养券",
          amount: 500,
          validFrom: "2024-01-01",
          validTo: "2024-12-31",
          expireDate: "2024-12-31",
          status: "valid",
          source: "活动赠送",
          commissionNo: "COM001",
          newCarSeries: "保时捷",
          newCarModel: row.carSeriesModel,
          vin: typeof row.vinInfo === "string" ? row.vinInfo : row.vinInfo?.[0]?.value,
          contractNo: "CT2024001",
          submitTime: "2024-01-05",
          signTime: "2024-01-06",
          issueCenter: "上海浦东",
          packageName: "保养套餐A",
          itemAmount: 500,
          itemSource: "DMS"
        },
        {
          id: "2",
          type: "coupon",
          name: "维修券",
          amount: 300,
          validFrom: "2024-01-01",
          validTo: "2024-06-30",
          expireDate: "2024-06-30",
          status: "valid",
          source: "会员权益",
          commissionNo: "COM002",
          newCarSeries: "保时捷",
          newCarModel: row.carSeriesModel,
          contractNo: "CT2024002",
          submitTime: "2024-01-10",
          signTime: "2024-01-11",
          issueCenter: "上海浦东",
          itemAmount: 300,
          itemSource: "CRM"
        }
      ],
      vouchers: [
        {
          id: "1",
          name: "代金券",
          balance: 1000,
          totalAmount: 2000,
          usedAmount: 1000,
          commissionNo: "VOU001",
          newCarSeries: "保时捷",
          newCarModel: row.carSeriesModel,
          contractNo: "CT2024003",
          submitTime: "2024-01-08",
          signTime: "2024-01-09",
          issueCenter: "上海浦东",
          packageName: "代金券包",
          itemAmount: 2000,
          itemSource: "活动"
        }
      ],
      totalCouponValue: 800,
      totalVoucherBalance: 1000
    },
    vehicles: [
      {
        id: "V1",
        vehicleModel: row.carSeriesModel,
        licensePlate: typeof row.licensePlate === "string" ? row.licensePlate : row.licensePlate?.[0]?.value || "",
        registrationCity: "上海",
        vin: typeof row.vinInfo === "string" ? row.vinInfo : row.vinInfo?.[0]?.value || "",
        purchaseDate: "2023-01-01",
        status: "自用",
        rolePerson: { 使用人: row.name, 联系人: "", 送修人: "" },
        source: "DMS",
        newCarSeries: row.carSeriesModel.split(" ")[0] || "保时捷",
        newCarModel: row.carSeriesModel,
        contractNo: "CT2023001",
        signStatus: "已签单",
        submitTime: "2022-12-20",
        signTime: "2023-01-01",
        issueCenter: "上海浦东",
        newCarMsrp: 1200000,
        newCarContractPrice: 1150000,
        nonCashDiscountAmount: 20000,
        salesItemAmount: 50000,
        salesItemName: "延保套餐",
        model: row.carSeriesModel,
        lastServiceDate: "2024-01-15",
        nextServiceDate: "2024-07-15",
        mileage: row.currentMileage,
        serviceCount: 12,
        totalServiceAmount: 15000
      }
    ],
    interactions: [
      {
        id: "1",
        type: "电话沟通",
        communicationTime: "2024-01-10 14:30:00",
        date: "2024-01-10",
        content: "电话咨询保养服务，询问下次保养时间",
        operator: "BDC客服",
        duration: 180,
        result: "已预约",
        notes: "客户对服务满意"
      },
      {
        id: "2",
        type: "微信沟通",
        communicationTime: "2024-01-12 10:20:00",
        date: "2024-01-12",
        content: "企业微信沟通，发送保养提醒",
        operator: "销售顾问",
        duration: "8分钟",
        result: "已发送"
      },
      {
        id: "3",
        type: "现场沟通",
        communicationTime: "2024-01-15 16:45:00",
        date: "2024-01-15",
        content: "到店保养，完成常规保养服务",
        operator: "服务顾问",
        duration: "25分钟",
        result: "已跟进"
      }
    ],
    metrics: {
      totalConsumption: row.annualConsumption,
      avgOrderValue: row.avgConsumption,
      retentionRate: 0.85,
      lifetimeValue: row.annualConsumption * 3,
      visitFrequency: row.visitCount90Days * 4, // 估算年度频次
      lastVisitDays: Math.floor((Date.now() - new Date(row.lastVisitTime).getTime()) / (1000 * 60 * 60 * 24)),
      orderCount: row.annualOrderFrequency,
      avgVisitInterval: 45,
      projectPreferenceRank
    },
    statistics: {
      firstOrderDate: "2023-01-15",
      lastOrderDate: row.lastVisitTime,
      totalOrderCount: row.annualOrderFrequency,
      totalServiceCount: 25,
      avgConsumptionPerMonth: row.annualConsumption / 12,
      peakConsumptionMonth: "2024-01"
    },
    dataCompleteness: {
      basicInfo: 95,
      transactionHistory: 90,
      vehicleInfo: 85,
      interactionHistory: 80
    },
    lastUpdated: {
      basicInfo: row.updatedAt,
      transactions: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      assets: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      vehicles: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      interactions: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    offlineActivities: [
      {
        id: "1",
        activityCode: "CAM-2025-001",
        activityName: "保时捷911试驾体验日",
        activityType: "试驾活动",
        activityTime: "2025-01-20 14:00:00",
        activityLocation: "上海浦东店",
        organizer: "上海浦东店",
        uploader: "John Smith",
        validExamples: 25,
        activityDescription: "客户参加了保时捷911试驾体验活动,对车辆性能非常满意",
        status: "participated" as const
      },
      {
        id: "2",
        activityCode: "CAM-2024-012",
        activityName: "2025年春季新车发布会",
        activityType: "新车发布会",
        activityTime: "2024-12-15 19:00:00",
        activityLocation: "上海闵行店",
        organizer: "上海闵行店",
        uploader: "Emily Johnson",
        validExamples: 150,
        activityDescription: "客户报名了2025年春季新车发布会,但最终未参加",
        status: "not_participated" as const
      },
      {
        id: "3",
        activityCode: "CAM-2024-008",
        activityName: "保时捷车主聚会",
        activityType: "车主聚会",
        activityTime: "2024-11-10 18:00:00",
        activityLocation: "上海浦东店",
        organizer: "上海浦东店",
        uploader: "Michael Chen",
        validExamples: 80,
        activityDescription: "客户参加了保时捷车主聚会活动,与其他车主进行了深入交流",
        status: "participated" as const
      },
      {
        id: "4",
        activityCode: "CAM-2024-005",
        activityName: "保时捷赛道体验日",
        activityType: "赛道体验",
        activityTime: "2024-10-05 09:00:00",
        activityLocation: "上海国际赛车场",
        organizer: "上海保时捷中心",
        uploader: "David Wang",
        validExamples: 60,
        activityDescription: "客户报名了保时捷赛道体验日活动,但因个人原因未能参加",
        status: "not_participated" as const
      }
    ],
    financialLoans: [
      {
        id: "LOAN-001",
        vehicleModel: "保时捷 911 Carrera 2024款",
        status: "正常",
        startDate: "2024-01-15",
        expectedExpiryMonths: 36,
        maturityMonths: 36,
        signDate: "2024-01-14",
        signStatus: "已签单",
        submitDate: "2024-01-10",
        issueCenter: "上海浦东",
        financeInstitution: "招商银行金融",
        loanTerm: "36期",
        customerRate: 4.5,
        loanAmount: 800000,
        bankRebate: 5000,
        loanServiceFee: 3000,
        vehicleRegistrationFee: 2000,
        vehicleRegistrationCitySubsidy: 1000,
        discountRate: 98,
        loanInfo: "首付30%，年化4.5%",
        bank: "招商银行",
        lendingBank: "招商银行",
        repaymentDay: 15,
        repaymentDate: "每月15日",
        period: "2024-01 - 2027-01",
        startEndMonth: "2024-01 - 2027-01"
      },
      {
        id: "LOAN-002",
        vehicleModel: "保时捷 Cayenne 2024款",
        status: "即将到期",
        startDate: "2023-06-20",
        expectedExpiryMonths: 24,
        maturityMonths: 24,
        signDate: "2023-06-18",
        signStatus: "已签单",
        submitDate: "2023-06-15",
        issueCenter: "上海闵行",
        financeInstitution: "建设银行",
        loanTerm: "24期",
        customerRate: 4.2,
        loanAmount: 600000,
        bank: "建设银行",
        lendingBank: "建设银行",
        repaymentDay: 20,
        repaymentDate: "每月20日",
        period: "2023-06 - 2025-06",
        startEndMonth: "2023-06 - 2025-06"
      }
    ],
    // 与 H5 一致：冲突/操作提示、数据同步、经办人、营销活动、账户权益
    conflictAlert: row.hasConflict,
    latestOperation: {
      operator: "数据治理管理员",
      operationType: "人工更新",
      operationTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    platformSyncStatus: [
      { name: "DMS", status: "success" as const },
      { name: "BDC", status: "success" as const },
      { name: "CRM", status: "success" as const },
      { name: "Voucher", status: "success" as const }
    ],
    syncTime: new Date().toLocaleString("zh-CN"),
    handlers:
      row.customerType === "company" && row.handlers
        ? row.handlers.map((h: { id: string; name: string; role?: string; mobile?: string }, i: number) => ({
            ...h,
            mobile:
              h.mobile ||
              (typeof row.phone === "string"
                ? row.phone
                : Array.isArray(row.phone)
                  ? (row.phone[i] as { value?: string })?.value
                  : undefined),
            age: [28, 35, 42][i % 3],
            gender: ["male", "female", "male"][i % 3],
            city: ["上海", "北京", "广州"][i % 3],
            latestOperation:
              i === 0
                ? {
                    operator: "数据治理管理员",
                    operationType: "人工更新",
                    operationTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                  }
                : undefined
          }))
        : undefined,
    selectedHandlerId: row.customerType === "company" && row.handlers?.length ? row.handlers[0].id : undefined,
    marketingCampaigns: [
      {
        id: "M1",
        campaignCode: "CAM-2025-002",
        campaignName: "保时捷新春试驾",
        campaignType: "试驾活动",
        activityTime: "2025-02-01 10:00:00",
        location: "上海浦东店",
        status: "已报名",
        organizer: "上海浦东店",
        uploader: "John",
        validExamples: 30,
        description: "新春试驾体验"
      }
    ]
  };

  show360View.value = true;
};

// 提交反馈
const submitFeedback = (row: Customer) => {
  currentCustomer.value = row;
  showFeedbackDialog.value = true;
};

// 处理反馈提交
const handleFeedbackSubmit = (form: FeedbackForm) => {
  console.log("提交纠错反馈:", form);
  ElMessage.success(t("customer.feedback.submitSuccess"));
};

// 导出360视图数据
const handleExport360 = () => {
  ElMessage.success(t("customer.profile360.exportSuccess"));
};

// 360 车辆信息 Tab：修改车辆状态（与 H5 一致）
const onVehicleStatusChange = (vehicleId: string, status: string) => {
  const data = current360Data.value;
  if (!data?.vehicles) return;
  const v = data.vehicles.find(x => x.id === vehicleId);
  if (v) v.status = status;
  ElMessage.success(t("customer.profile360.saveSuccess"));
};

// 360 车辆信息 Tab：设置相关人员（与 H5 一致）
const onVehicleRoleChange = (payload: {
  vehicle: Customer360View["vehicles"][number];
  role: string;
  selectedValue: string;
  selectedLabel: string;
}) => {
  const data = current360Data.value;
  if (!data?.vehicles) return;
  const v = data.vehicles.find(x => x.id === payload.vehicle.id);
  if (!v) return;
  if (!v.rolePerson) v.rolePerson = {};
  const key = payload.role as "使用人" | "联系人" | "送修人";
  v.rolePerson[key] = payload.selectedValue === "__none__" ? "" : payload.selectedLabel;
  ElMessage.success(t("customer.profile360.saveSuccess"));
};

// 监听 initParam 变化，当筛选条件变化时重新加载数据
watch(
  () => initParam,
  () => {
    if (activeCustomerTypeTab.value === "company") {
      companyPagination.pageNum = 1;
      loadCompanyData();
    }
  },
  { deep: true }
);

// 组件挂载时：同步顶部门店到 initParam，公司 Tab 需主动加载数据
onMounted(() => {
  initParam.storeId = selectedStoreId.value;
  if (activeCustomerTypeTab.value === "company") {
    loadCompanyData();
  }
});
</script>

<style scoped>
.customer-list-container {
  padding: 20px;
}
.customer-list-container .el-button {
  margin-right: 8px;
}
</style>

<style scoped lang="scss">
.customer-list-container {
  :deep(.el-card__body) {
    padding: 0;
  }
}
.double-tabs-card {
  margin-bottom: 16px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  :deep(.el-card__body) {
    padding: 16px 20px;
  }
}
.tabs-layer {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 40px;
  &:not(:last-child) {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e7ed;
  }
}
.tabs-layer-label {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  width: 72px;
}
.layer-tabs {
  flex: 1;
  :deep(.el-tabs__header) {
    margin: 0;
  }
  :deep(.el-tabs__item) {
    height: 36px;
    padding: 0 16px;
    font-size: 14px;
    line-height: 36px;
    color: #606266;
    &:hover {
      color: #409eff;
    }
    &.is-active {
      font-weight: 500;
      color: #409eff;
    }
  }
  :deep(.el-tabs__ink-bar) {
    height: 3px;
  }
  :deep(.el-tabs__nav-wrap)::after {
    display: block;
    height: 1px;
    background-color: #e4e7ed;
  }
}
.store-tabs :deep(.el-tabs__item) {
  min-width: auto;
}
.type-tabs .tab-label {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}
.type-tabs .tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 8px;
  font-size: 12px;
  line-height: 20px;
  color: #ffffff;
  background-color: #f56c6c;
  border-radius: 10px;
}
.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}
.customer-type-tabs-card {
  margin-bottom: 16px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  :deep(.el-card__body) {
    padding: 12px 20px;
  }
}
.customer-type-tabs {
  :deep(.el-tabs__header) {
    margin: 0;
  }
  :deep(.el-tabs__nav-wrap) {
    &::after {
      height: 1px;
      background-color: #e4e7ed;
    }
  }
  :deep(.el-tabs__item) {
    height: 40px;
    padding: 0 20px;
    font-size: 14px;
    line-height: 40px;
    color: #606266;
    transition: all 0.3s;
    &:hover {
      color: #409eff;
    }
    &.is-active {
      font-weight: 500;
      color: #409eff;
    }
  }
  .tab-label {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }
  .tab-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 8px;
    font-size: 12px;
    line-height: 20px;
    color: #ffffff;
    background-color: #f56c6c;
    border-radius: 10px;
  }
}
.stats-card {
  position: relative;
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 16px 20px;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover {
    border-color: transparent;
    box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
    transform: translateY(-2px);
  }
  .stats-icon-wrapper {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    font-size: 24px;
    border-radius: 8px;
    transition: all 0.3s ease;
  }
  .stats-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  .stats-number {
    font-size: 28px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
    letter-spacing: -0.02em;
    .sub-value {
      margin-left: 4px;
      font-size: 14px;
      font-weight: 400;
      color: #909399;
    }
  }
  .stats-label {
    font-size: 14px;
    font-weight: 400;
    line-height: 1.5;
    color: #606266;
    word-break: break-word;
  }

  // 各类型卡片颜色配置
  &.primary-card {
    .stats-icon-wrapper {
      color: #409eff;
      background-color: rgb(64 158 255 / 12%);
    }
    .stats-number {
      color: #409eff;
    }
    &:hover .stats-icon-wrapper {
      background-color: rgb(64 158 255 / 20%);
    }
  }
  &.success-card {
    .stats-icon-wrapper {
      color: #67c23a;
      background-color: rgb(103 194 58 / 12%);
    }
    .stats-number {
      color: #67c23a;
    }
    &:hover .stats-icon-wrapper {
      background-color: rgb(103 194 58 / 20%);
    }
  }
  &.warning-card {
    .stats-icon-wrapper {
      color: #e6a23c;
      background-color: rgb(230 162 60 / 12%);
    }
    .stats-number {
      color: #e6a23c;
    }
    &:hover .stats-icon-wrapper {
      background-color: rgb(230 162 60 / 20%);
    }
  }
  &.info-card {
    .stats-icon-wrapper {
      color: #909399;
      background-color: rgb(144 147 153 / 12%);
    }
    .stats-number {
      color: #909399;
    }
    &:hover .stats-icon-wrapper {
      background-color: rgb(144 147 153 / 20%);
    }
  }
}

// 响应式设计
@media (width <= 1400px) {
  .stats-panel {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
  }
  .stats-card {
    gap: 12px;
    padding: 14px 16px;
    .stats-number {
      font-size: 24px;
    }
    .stats-icon-wrapper {
      width: 44px;
      height: 44px;
      font-size: 22px;
    }
  }
}

@media (width <= 768px) {
  .stats-panel {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }
  .stats-card {
    gap: 12px;
    padding: 12px 14px;
    .stats-number {
      font-size: 22px;
    }
    .stats-icon-wrapper {
      width: 40px;
      height: 40px;
      font-size: 20px;
    }
    .stats-label {
      font-size: 12px;
    }
  }
}

@media (width <= 480px) {
  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .stats-card {
    gap: 10px;
    padding: 10px 12px;
    .stats-number {
      font-size: 20px;
    }
    .stats-icon-wrapper {
      width: 36px;
      height: 36px;
      font-size: 18px;
    }
  }
}
.oneid-cell {
  display: flex;
  align-items: center;
}
</style>
