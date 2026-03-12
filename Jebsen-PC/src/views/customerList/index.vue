<template>
  <div class="customer-list-container table-box">
    <!-- 双层 Tab：第一层门店，第二层视图模式（按人 / 按车） -->
    <el-card shadow="hover" class="double-tabs-card">
      <!-- 第一层：门店 -->
      <div class="tabs-layer">
        <span class="tabs-layer-label">{{ t("customer.store.label") }}</span>
        <el-tabs v-model="selectedStoreId" class="layer-tabs store-tabs" @tab-change="onTopStoreChange">
          <el-tab-pane v-for="opt in storeSearchOptions" :key="opt.value" :name="opt.value" :label="opt.label" />
        </el-tabs>
      </div>
      <!-- 第二层：视图模式 -->
      <div class="tabs-layer">
        <span class="tabs-layer-label">{{ t("customer.listMode.label") }}</span>
        <el-tabs v-model="activeListMode" class="layer-tabs type-tabs" @tab-change="handleListModeChange">
          <el-tab-pane name="person">
            <template #label>
              <span class="tab-label">
                {{ t("customer.listModeTabs.person") }}
                <span v-if="listModeStats.person > 0" class="tab-count">{{ listModeStats.person }}</span>
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane name="vehicle">
            <template #label>
              <span class="tab-label">
                {{ t("customer.listModeTabs.vehicle") }}
                <span v-if="listModeStats.vehicle > 0" class="tab-count">{{ listModeStats.vehicle }}</span>
              </span>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <!-- 统计面板：客户分层维度 -->
    <div class="stats-panel">
      <div class="stats-card primary-card">
        <div class="stats-icon-wrapper">
          <el-icon><Medal /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(customerStats.salesDiamond) }}</div>
          <div class="stats-label">{{ t("customer.stats.salesDiamond") }}</div>
        </div>
      </div>
      <div class="stats-card success-card">
        <div class="stats-icon-wrapper">
          <el-icon><Top /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(customerStats.aftersalesDiamond) }}</div>
          <div class="stats-label">{{ t("customer.stats.aftersalesDiamond") }}</div>
        </div>
      </div>
      <div class="stats-card info-card">
        <div class="stats-icon-wrapper">
          <el-icon><Connection /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(customerStats.activeAfterSales) }}</div>
          <div class="stats-label">{{ t("customer.stats.activeAfterSales") }}</div>
        </div>
      </div>
      <div class="stats-card warning-card">
        <div class="stats-icon-wrapper">
          <el-icon><Select /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(customerStats.dormant) }}</div>
          <div class="stats-label">{{ t("customer.stats.dormant") }}</div>
        </div>
      </div>
      <div class="stats-card info-card">
        <div class="stats-icon-wrapper">
          <el-icon><Refresh /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(customerStats.lost) }}</div>
          <div class="stats-label">{{ t("customer.stats.lost") }}</div>
        </div>
      </div>
    </div>

    <!-- 按人列表 -->
    <pro-table
      v-if="activeListMode === 'person'"
      ref="proTableRef"
      :columns="personColumns"
      :request-api="loadPersonData"
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

    <!-- 按车列表 -->
    <pro-table
      v-else
      ref="vehicleTableRef"
      :columns="vehicleColumns"
      :request-api="loadVehicleData"
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

      <template #status="scope">
        <el-tag :type="getVehicleStatusType(scope.row.status)" size="small">
          {{ scope.row.status || TABLE_EMPTY_PLACEHOLDER }}
        </el-tag>
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
import { ColumnProps } from "@/components/ProTable/interface";
import { TABLE_EMPTY_PLACEHOLDER } from "@/utils";
import { Customer, Customer360View, FeedbackForm, LifecycleStatus, CompanyInfo } from "./interface";
import MultiValueField from "./components/MultiValueField.vue";
import Profile360View from "./components/Profile360View.vue";
import FeedbackDialog from "./components/FeedbackDialog.vue";

// 国际化多语言处理
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const userStore = useUserStore();

interface VehicleListRow {
  id: string;
  oneId: string;
  userId: string;
  customerRef: Customer;
  hasConflict: boolean;
  primaryStoreName?: string;
  customerType: Customer["customerType"];
  vehicleModel: string;
  licensePlate: string;
  vin: string;
  purchaseDate: string;
  currentMileage: number;
  insuranceCompany: string;
  insuranceType: string;
  insuranceStatus: string;
  insuranceEndDate: string;
  financeInstitution: string;
  loanStatus: string;
  loanAmount: number;
  loanTerm: string;
  submitDate: string;
  signStatus: string;
  signDate: string;
  issueCenter: string;
  customerRate: number;
  bankRebate: number;
  loanServiceFee: number;
  vehicleRegistrationFee: number;
  vehicleRegistrationCitySubsidy: number;
  discountRate: number;
  lastVisitTime: string;
  visitCount90Days: number;
  annualOrderFrequency: number;
  buyerPhone: string;
  status: string;
}

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

// 客户库统计数据（根据当前筛选/Tab 的结果动态计算）- 客户分层维度
const customerStats = reactive({
  salesDiamond: 0, // 销售钻石客户
  aftersalesDiamond: 0, // 售后钻石客户
  activeAfterSales: 0, // 普通活跃售后客户
  dormant: 0, // 休眠客户
  lost: 0 // 流失客户
});

// 格式化数字
const formatNumber = (num: number) => {
  return num.toLocaleString("zh-CN");
};

// 客户列表模式（按人 / 按车）
type CustomerListMode = "person" | "vehicle";
const activeListMode = ref<CustomerListMode>("person");

const listModeStats = reactive<{
  person: number;
  vehicle: number;
}>({
  person: 0,
  vehicle: 0
});

// 顶部门店选择（与下方列表、公司筛选共用，变更时触发刷新）
const selectedStoreId = ref("");

// 初始化参数：当前仅保留门店维度，列表模式由页面级 Tab 控制
const initParam = reactive<{ storeId?: string }>({
  storeId: ""
});

// 顶部门店变更：同步到 initParam 并刷新当前 Tab 数据（清空时视为「全部」）
const onTopStoreChange = () => {
  const storeId = selectedStoreId.value ?? "";
  initParam.storeId = storeId;
  if (activeListMode.value === "vehicle") {
    vehicleTableRef.value?.getTableList?.();
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

const personColumns = computed<ColumnProps<Customer>[]>(() => baseColumns.filter(col => col.prop !== "handler"));

const vehicleColumns = computed<ColumnProps<VehicleListRow>[]>(() => [
  {
    prop: "primaryStoreName",
    label: t("customer.store.label"),
    minWidth: 180
  },
  {
    prop: "vehicleModel",
    label: t("customer.profile360.vehicleModel"),
    minWidth: 160,
    search: {
      el: "input",
      label: t("customer.profile360.vehicleModel"),
      props: { placeholder: t("customer.placeholder.carSeriesModel") }
    }
  },
  {
    prop: "licensePlate",
    label: t("customer.licensePlate"),
    minWidth: 130,
    search: {
      el: "input",
      label: t("customer.licensePlate"),
      props: { placeholder: t("customer.placeholder.licensePlate") }
    }
  },
  {
    prop: "vin",
    label: t("customer.profile360.vin"),
    minWidth: 160,
    search: {
      el: "input",
      label: t("customer.profile360.vin"),
      props: { placeholder: t("customer.placeholder.vinInfo") }
    }
  },
  {
    prop: "purchaseDate",
    label: t("customer.profile360.purchaseDate"),
    minWidth: 120
  },
  {
    prop: "status",
    label: t("customer.profile360.status"),
    minWidth: 110
  },
  {
    prop: "submitDate",
    label: t("customer.profile360.submitDate"),
    minWidth: 130
  },
  {
    prop: "signStatus",
    label: t("customer.profile360.signStatus"),
    minWidth: 120
  },
  {
    prop: "signDate",
    label: t("customer.profile360.signDate"),
    minWidth: 130
  },
  {
    prop: "issueCenter",
    // 发放中心跟随订单，不直接等于上方门店列
    label: t("customer.profile360.issueCenter"),
    minWidth: 160
  },
  {
    label: t("customer.profile360.transactions"),
    _children: [
      {
        prop: "lastVisitTime",
        label: t("customer.lastVisitTime"),
        minWidth: 170
      },
      {
        prop: "visitCount90Days",
        label: t("customer.visitCount90Days"),
        minWidth: 140
      },
      {
        prop: "annualOrderFrequency",
        label: t("customer.annualOrderFrequency"),
        minWidth: 140
      },
      {
        prop: "currentMileage",
        label: t("customer.currentMileage"),
        minWidth: 130,
        render: scope => `${formatNumber(Math.round(scope.row.currentMileage || 0))} km`
      }
    ]
  },
  {
    label: t("customer.profile360.insurance"),
    _children: [
      {
        prop: "insuranceCompany",
        label: t("customer.profile360.insuranceCompany"),
        minWidth: 150,
        search: {
          el: "input",
          label: t("customer.profile360.insuranceCompany"),
          props: { placeholder: t("customer.profile360.insuranceCompany") }
        }
      },
      {
        prop: "insuranceType",
        label: t("customer.profile360.insuranceType"),
        minWidth: 120
      },
      {
        prop: "insuranceStatus",
        label: t("customer.vehicleView.insuranceStatus"),
        minWidth: 120
      },
      {
        prop: "insuranceEndDate",
        label: t("customer.vehicleView.insuranceEndDate"),
        minWidth: 130
      }
    ]
  },
  {
    label: t("customer.profile360.financialLoans"),
    _children: [
      {
        prop: "financeInstitution",
        label: t("customer.profile360.financeInstitution"),
        minWidth: 150,
        search: {
          el: "input",
          label: t("customer.profile360.financeInstitution"),
          props: { placeholder: t("customer.profile360.financeInstitution") }
        }
      },
      {
        prop: "loanStatus",
        label: t("customer.vehicleView.financeStatus"),
        minWidth: 120
      },
      {
        prop: "customerRate",
        label: t("customer.profile360.customerRate"),
        minWidth: 130,
        render: scope => `${scope.row.customerRate?.toFixed(1) ?? 0}%`
      },
      {
        prop: "loanAmount",
        label: t("customer.profile360.loanAmount"),
        minWidth: 140,
        render: scope => `¥${formatNumber(Math.round(scope.row.loanAmount || 0))}`
      },
      {
        prop: "loanTerm",
        label: t("customer.profile360.loanTerm"),
        minWidth: 120
      },
      {
        prop: "bankRebate",
        label: t("customer.profile360.bankRebate"),
        minWidth: 130,
        render: scope => `¥${formatNumber(Math.round(scope.row.bankRebate || 0))}`
      },
      {
        prop: "loanServiceFee",
        label: t("customer.profile360.loanServiceFee"),
        minWidth: 140,
        render: scope => `¥${formatNumber(Math.round(scope.row.loanServiceFee || 0))}`
      },
      {
        prop: "vehicleRegistrationFee",
        label: t("customer.profile360.vehicleRegistrationFee"),
        minWidth: 150,
        render: scope => `¥${formatNumber(Math.round(scope.row.vehicleRegistrationFee || 0))}`
      },
      {
        prop: "vehicleRegistrationCitySubsidy",
        label: t("customer.profile360.vehicleRegistrationCitySubsidy"),
        minWidth: 180,
        render: scope => `¥${formatNumber(Math.round(scope.row.vehicleRegistrationCitySubsidy || 0))}`
      },
      {
        prop: "discountRate",
        label: t("customer.profile360.discountRate"),
        minWidth: 130,
        render: scope => `${scope.row.discountRate?.toFixed(1) ?? 0}%`
      }
    ]
  }
]);

// 表格引用
const proTableRef = ref();
const vehicleTableRef = ref();

const handleListModeChange = (name: string) => {
  activeListMode.value = (name || "person") as CustomerListMode;
  if (activeListMode.value === "vehicle") {
    vehicleTableRef.value?.getTableList?.();
    return;
  }
  proTableRef.value?.getTableList?.();
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

  listModeStats.person = baseFiltered.length;

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

  // 基于筛选后的全量数据（非分页）计算统计面板数据：客户分层维度
  let salesDiamond = 0;
  let aftersalesDiamond = 0;
  let activeAfterSales = 0;
  let dormant = 0;
  let lost = 0;

  const now = Date.now();

  filteredData.forEach(item => {
    const visitCount90Days = Number(item.visitCount90Days || 0);
    const annualOrderFrequency = Number(item.annualOrderFrequency || 0);
    const loyaltyLevel = item.loyaltyLevel as string | undefined;
    const tags = (item.tags || []) as string[];

    let daysSinceLastVisit = 9999;
    if (item.lastVisitTime) {
      const time = new Date(item.lastVisitTime).getTime();
      if (!Number.isNaN(time)) {
        daysSinceLastVisit = Math.floor((now - time) / (1000 * 60 * 60 * 24));
      }
    }

    // 流失：很久未到店（> 365 天）
    if (daysSinceLastVisit > 365) {
      lost += 1;
      return;
    }

    // 休眠：较长时间未到店（180–365 天）
    if (daysSinceLastVisit > 180) {
      dormant += 1;
      return;
    }

    // 普通活跃售后客户：近 90 天有到店记录
    if (visitCount90Days > 0) {
      activeAfterSales += 1;
    }

    // 售后钻石客户：活跃 + 标签/忠诚度较高
    const isHighLoyalty = loyaltyLevel === "金卡" || loyaltyLevel === "VIP";
    const hasValueTag = tags.includes("高价值客户") || tags.includes("VIP客户") || tags.includes("活跃客户");
    if (visitCount90Days > 0 && (isHighLoyalty || hasValueTag)) {
      aftersalesDiamond += 1;
    }

    // 销售钻石客户：忠诚度高 + 年度订单频次较高
    if (isHighLoyalty && annualOrderFrequency >= 5) {
      salesDiamond += 1;
    }
  });

  const stats = {
    salesDiamond,
    aftersalesDiamond,
    activeAfterSales,
    dormant,
    lost
  };

  return {
    data: pageData,
    total: filteredTotal,
    stats
  };
};

const getDisplayValue = (field: string | { value?: string }[] | undefined) => {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[0]?.value || "";
};

const buildVehicleRows = (customers: Customer[]): VehicleListRow[] =>
  customers.map((customer, index) => {
    const primaryPhone = Array.isArray(customer.phone) ? customer.phone[0] : undefined;
    const buyerPhone =
      customer.customerType === "company"
        ? customer.handlers?.[0]?.mobile || (typeof primaryPhone === "object" ? primaryPhone?.value : "")
        : typeof customer.phone === "string"
          ? customer.phone
          : primaryPhone?.value || "";
    const insuranceCompanies = ["平安财险", "太保财险", "人保财险"];
    const insuranceTypes = ["商业险", "交强险", "商业险+交强险"];
    const insuranceStatuses = ["已生效", "待续保", "已过期"];
    const financeInstitutions = ["招商银行金融", "保时捷金融", "建设银行"];
    const issueCenters = ["上海闵行保时捷中心", "上海闵行保时捷金融中心", "上海浦东保时捷中心"];
    const loanStatuses = ["正常", "即将到期", "已结清"];
    const loanTerms = ["12期", "24期", "36期", "48期"];
    const insuranceIndex = customer.id % insuranceCompanies.length;
    const financeIndex = customer.id % financeInstitutions.length;
    const endMonth = String((customer.id % 12) + 1).padStart(2, "0");
    const endDay = String(((customer.id * 3) % 20) + 8).padStart(2, "0");
    const submitMonth = String(((customer.id + 5) % 12) + 1).padStart(2, "0");
    const submitDay = String(((customer.id * 2) % 20) + 5).padStart(2, "0");
    const baseAmount = Math.max(120000, Math.round(Number(customer.avgConsumption || 0) * 80 + customer.id * 5000));
    const customerRate = 3 + (customer.id % 5); // 3% - 7%
    const bankRebate = Math.round(baseAmount * 0.015);
    const loanServiceFee = 3000 + (customer.id % 5) * 500;
    const vehicleRegistrationFee = 2000 + (customer.id % 3) * 300;
    const vehicleRegistrationCitySubsidy = 1500 + (customer.id % 3) * 250;
    const discountRate = 1 + (customer.id % 3); // 1% - 3%

    return {
      id: `vehicle-${customer.id}-${index + 1}`,
      oneId: customer.oneId,
      userId: customer.userId,
      customerRef: customer,
      hasConflict: customer.hasConflict,
      primaryStoreName: customer.primaryStoreName,
      customerType: customer.customerType,
      vehicleModel: customer.carSeriesModel,
      licensePlate: getDisplayValue(customer.licensePlate),
      vin: getDisplayValue(customer.vinInfo),
      purchaseDate: customer.createdAt?.slice(0, 10) || "2024-01-01",
      currentMileage: Number(customer.currentMileage || 0),
      insuranceCompany: insuranceCompanies[insuranceIndex],
      insuranceType: insuranceTypes[insuranceIndex],
      insuranceStatus: insuranceStatuses[insuranceIndex],
      insuranceEndDate: `2026-${endMonth}-${endDay}`,
      financeInstitution: financeInstitutions[financeIndex],
      loanStatus: loanStatuses[financeIndex],
      loanAmount: baseAmount,
      loanTerm: loanTerms[customer.id % loanTerms.length],
      submitDate: `2024-${submitMonth}-${submitDay}`,
      signStatus: customer.id % 3 === 0 ? t("customer.profile360.signStatus") : t("customer.profile360.loanStatusNormal"),
      signDate: `2024-${submitMonth}-${String(Number(submitMonth) + 1).padStart(2, "0")}-${submitDay}`,
      // 发放中心随订单走，这里仅做示例模拟
      issueCenter: issueCenters[financeIndex],
      customerRate,
      bankRebate,
      loanServiceFee,
      vehicleRegistrationFee,
      vehicleRegistrationCitySubsidy,
      discountRate,
      lastVisitTime: customer.lastVisitTime,
      visitCount90Days: Number(customer.visitCount90Days || 0),
      annualOrderFrequency: Number(customer.annualOrderFrequency || 0),
      buyerPhone,
      status: ["自用", "维修中", "已售", "订车中-在途"][customer.id % 4]
    };
  });

const getVehicleStatusType = (status: string): "success" | "info" | "warning" | "primary" => {
  const map: Record<string, "success" | "info" | "warning" | "primary"> = {
    自用: "success",
    维修中: "warning",
    已售: "info",
    "订车中-在途": "primary"
  };
  return map[status] || "info";
};

// 模拟按人数据加载
const loadPersonData = async (params: any) => {
  console.log("加载客户数据，参数：", params);

  // 获取页码和页面大小
  const pageNum = params.pageNum || 1;
  const pageSize = params.pageSize || 10;

  console.log(`请求第 ${pageNum} 页，每页 ${pageSize} 条数据`);

  // 获取搜索参数
  const searchParams = params;

  // 生成模拟数据
  const result = generateMockData(pageNum, pageSize, searchParams);
  const totalCustomers = generateMockData(1, 1000, { ...searchParams, pageNum: 1, pageSize: 1000 }).data;
  listModeStats.person = totalCustomers.length;
  listModeStats.vehicle = buildVehicleRows(totalCustomers).length;

  console.log(`生成了 ${result.data.length} 条数据，总共 ${result.total} 条`);

  // 同步更新统计面板数据（客户分层维度）
  customerStats.salesDiamond = result.stats.salesDiamond;
  customerStats.aftersalesDiamond = result.stats.aftersalesDiamond;
  customerStats.activeAfterSales = result.stats.activeAfterSales;
  customerStats.dormant = result.stats.dormant;
  customerStats.lost = result.stats.lost;

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

// 模拟按车数据加载
const loadVehicleData = async (params: any) => {
  const { pageNum = 1, pageSize = 10, ...filters } = params || {};
  const personResult = generateMockData(1, 1000, { ...filters, pageNum: 1, pageSize: 1000 });
  let vehicleRows = buildVehicleRows(personResult.data);

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    vehicleRows = vehicleRows.filter((item: VehicleListRow) => {
      const field = item[key as keyof VehicleListRow];
      if (field === undefined || field === null) return false;
      return String(field).includes(String(value));
    });
  });

  listModeStats.person = personResult.total;
  listModeStats.vehicle = vehicleRows.length;

  // 使用按人维度的统计结果，保持客户分层口径一致
  customerStats.salesDiamond = personResult.stats.salesDiamond;
  customerStats.aftersalesDiamond = personResult.stats.aftersalesDiamond;
  customerStats.activeAfterSales = personResult.stats.activeAfterSales;
  customerStats.dormant = personResult.stats.dormant;
  customerStats.lost = personResult.stats.lost;

  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;

  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    data: {
      list: vehicleRows.slice(start, end),
      total: vehicleRows.length
    }
  };
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
const getStatusLabel = (status?: LifecycleStatus | null) => {
  if (!status) return TABLE_EMPTY_PLACEHOLDER;
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

const buildProfileAddresses = (row: Customer) => {
  const baseAddress = typeof row.address === "string" ? row.address : row.address?.[0]?.value || "上海市浦东新区世纪大道 9 号";
  return [
    { value: baseAddress, source: "Golden Record", isPrimary: true, slotKey: "address1", weight: 100, weightLabel: "高权重" },
    { value: `${row.city || "上海"}市常用收件地址`, source: "CRM", slotKey: "address2", weight: 80, weightLabel: "中高权重" }
  ];
};

const buildProfilePhones = (row: Customer) => {
  const primaryValue = typeof row.phone === "string" ? row.phone : row.phone?.[0]?.value || "13800000000";
  if (row.customerType === "company") {
    return [
      {
        value: "021-58886688",
        source: "CRM",
        isPrimary: true,
        relationTagName: "公司总机"
      },
      {
        value: primaryValue,
        source: "Golden Record",
        relationTagName: "采购联系人",
        contactName: row.handlers?.[0]?.name || "首选联系人",
        isPrimaryContact: true
      },
      {
        value: "13900008888",
        source: "DMS",
        relationTagName: "售后送修人",
        contactName: row.handlers?.[1]?.name || "送修人A",
        personRole: "送修人",
        readonly: true,
        isPreferredRepairer: true,
        linkedVehicleIds: ["V1"]
      }
    ];
  }
  return [
    {
      value: primaryValue,
      source: "Golden Record",
      isPrimary: true,
      relationTagName: "本人",
      contactName: row.name,
      personRole: "购车人"
    },
    {
      value: "13912345678",
      source: "售后订单",
      relationTagName: "家庭联系人",
      contactName: `${row.name}的送修人A`,
      personRole: "送修人",
      readonly: true,
      isPreferredRepairer: true,
      linkedVehicleIds: ["V1"]
    },
    {
      value: "13712345678",
      source: "售后订单",
      relationTagName: "其他个人关系",
      contactName: `${row.name}的送修人B`,
      personRole: "送修人",
      readonly: true,
      linkedVehicleIds: ["V1"]
    }
  ];
};

const buildProfileHandlers = (row: Customer) => {
  if (row.customerType !== "company") return undefined;
  return [
    {
      id: "H001",
      name: row.handlers?.[0]?.name || "王敏",
      role: "联系人",
      mobile: typeof row.phone === "string" ? row.phone : row.phone?.[0]?.value || "13800000000",
      age: 34,
      gender: "female",
      city: row.city || "上海",
      isPrimaryContact: true
    },
    {
      id: "H002",
      name: row.handlers?.[1]?.name || "周杰",
      role: "送修人",
      mobile: "13900008888",
      age: 38,
      gender: "male",
      city: row.city || "上海",
      readonly: true,
      isPreferredRepairer: true
    }
  ];
};

const buildProfileVehicles = (row: Customer, selectedVehicle?: VehicleListRow | null) => {
  const licensePlate = selectedVehicle?.licensePlate || getDisplayValue(row.licensePlate) || "沪A12345";
  const vin = selectedVehicle?.vin || getDisplayValue(row.vinInfo) || "WP0ZZZ99ZTS392124";
  const purchaseDate = selectedVehicle?.purchaseDate || row.createdAt?.slice(0, 10) || "2024-01-01";
  const buyerPhone = typeof row.phone === "string" ? row.phone : row.phone?.[0]?.value || "";
  const buyerName = row.customerType === "company" ? row.handlers?.[0]?.name || "王敏" : row.name;
  const repairerBaseName = row.customerType === "company" ? row.handlers?.[1]?.name || "周杰" : `${row.name}的送修人A`;

  return [
    {
      id: "V1",
      vehicleModel: selectedVehicle?.vehicleModel || row.carSeriesModel,
      licensePlate,
      registrationCity: row.city || "上海",
      vin,
      purchaseDate,
      status: selectedVehicle?.status || "自用",
      relatedPersons: [
        {
          id: "P-BUYER-1",
          role: "购车人",
          name: buyerName,
          phone: buyerPhone
        },
        {
          id: "P-REPAIR-1",
          role: "送修人",
          name: repairerBaseName,
          phone: "13900008888",
          orderNo: "SO20260311001",
          readonly: true,
          isPreferred: true
        },
        {
          id: "P-REPAIR-2",
          role: "送修人",
          name: row.customerType === "company" ? "李海" : `${row.name}的送修人B`,
          phone: "13700007777",
          orderNo: "SO20260311002",
          readonly: true
        }
      ],
      source: "DMS",
      newCarSeries: row.carSeriesModel.split(" ")[0] || "保时捷",
      newCarModel: row.carSeriesModel,
      contractNo: "CT2023001",
      signStatus: "已签单",
      submitTime: "2025-12-20",
      signTime: "2026-01-01",
      issueCenter: row.primaryStoreName || "上海浦东",
      newCarMsrp: 1200000,
      newCarContractPrice: 1150000,
      nonCashDiscountAmount: 20000,
      salesItemAmount: 50000,
      salesItemName: "延保套餐",
      model: row.carSeriesModel,
      lastServiceDate: "2026-02-15",
      nextServiceDate: "2026-08-15",
      mileage: row.currentMileage,
      serviceCount: 12,
      totalServiceAmount: 15000
    }
  ];
};

const buildProfileInteractions = () => [
  { id: "I1", channel: "电话", time: "2026-03-10 14:30:00", type: "电话", content: "确认保养预约与到店时间" },
  { id: "I2", channel: "微信", time: "2026-03-09 10:20:00", type: "微信", content: "发送活动邀约和服务提醒" },
  { id: "I3", channel: "到店", time: "2026-03-08 16:45:00", type: "到店", content: "当面确认维修项目和取车安排" }
];

const buildProfileOfflineActivities = () => [
  { id: "A1", activityCode: "ACT-202603-001", activityDate: "2026-03-01" },
  { id: "A2", activityCode: "ACT-202602-008", activityDate: "2026-02-18" }
];

// 查看360度全景视图
const viewProfile360 = async (sourceRow: Customer | VehicleListRow) => {
  const row = "customerRef" in sourceRow ? sourceRow.customerRef : sourceRow;
  const selectedVehicle = "customerRef" in sourceRow ? sourceRow : null;
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
  let companyInfo: CompanyInfo | undefined = undefined;
  if (hasCompanyInfo) {
    if (row.customerType === "individual" && row.companyOneId) {
      companyInfo = {
        id: row.companyId || "",
        oneId: row.companyOneId || row.companyId || "",
        name: `公司-${row.companyOneId || row.companyId}`,
        address: "",
        phone: row.phone,
        contactPerson: row.name
      };
    } else if (row.customerType === "company") {
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
      address: buildProfileAddresses(row),
      phone: buildProfilePhones(row),
      primaryRelationTag: row.customerType === "company" ? "公司总机" : "本人",
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
    vehicles: buildProfileVehicles(row, selectedVehicle),
    interactions: buildProfileInteractions(),
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
    offlineActivities: buildProfileOfflineActivities(),
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
    handlers: buildProfileHandlers(row),
    selectedHandlerId: row.customerType === "company" ? "H001" : undefined,
    marketingCampaigns: [
      {
        id: "M1",
        campaignCode: "CAM-2025-002",
        activityDate: "2026-02-01",
        campaignName: "保时捷新春试驾",
        activityTime: "2026-02-01",
        location: "上海浦东店",
        status: "已报名",
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
    if (activeListMode.value === "vehicle") vehicleTableRef.value?.getTableList?.();
  },
  { deep: true }
);

// 组件挂载时：同步顶部门店到 initParam，并初始化列表
onMounted(() => {
  initParam.storeId = selectedStoreId.value;
  proTableRef.value?.getTableList?.();
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
