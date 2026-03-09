<template>
  <el-dialog
    :model-value="visible"
    width="1200px"
    top="5vh"
    :close-on-click-modal="false"
    append-to-body
    class="merge-workbench-dialog unified-dialog"
    @update:model-value="handleClose"
  >
    <template #header>
      <div class="dialog-header">
        <div class="dialog-title">
          <span>{{ t("errorCorrection.mergeWorkbench.title") }}</span>
          <el-tag type="info" size="small" class="ml-8"
            >{{ t("errorCorrection.mergeWorkbench.taskNo") }}: {{ task?.taskNo }}</el-tag
          >
          <el-tag type="success" size="small" class="ml-8">OneID: {{ task?.oneId }}</el-tag>
        </div>
        <div class="dialog-status">
          <el-tag :type="getStatusType(task?.status) as any" size="small">{{ getStatusLabel(task?.status) }}</el-tag>
        </div>
      </div>
    </template>

    <el-alert type="warning" show-icon :closable="false" class="mb-12">
      <template #title> {{ t("errorCorrection.mergeWorkbench.conflictAlert", { field: task?.conflictField }) }} </template>
    </el-alert>

    <el-tabs v-model="activeTab" class="workbench-tabs">
      <!-- 核心对比矩阵 -->
      <el-tab-pane :label="t('errorCorrection.mergeWorkbench.tabs.comparison')" name="comparison">
        <ComparisonMatrix
          :fields="comparisonFields"
          :source-systems="sourceSystems"
          :readonly="isReviewMode || isViewMode"
          :one-id="task?.oneId || ''"
          @field-change="handleFieldChange"
        />
      </el-tab-pane>

      <!-- 身份血缘溯源 -->
      <el-tab-pane :label="t('errorCorrection.mergeWorkbench.tabs.lineage')" name="lineage">
        <LineageTrace :lineage-data="lineageData" />
      </el-tab-pane>

      <!-- 客户信息参考 -->
      <el-tab-pane :label="t('errorCorrection.mergeWorkbench.tabs.reference')" name="reference">
        <CustomerReferencePanel
          :customer-info="customerReferenceInfo"
          :company-info="companyReferenceInfo"
          :consumption-stats="consumptionStats"
          :opportunity-info-list="opportunityInfoList"
          :preferences="preferences"
          :selected-tags="selectedTags"
          :transactions="transactionsData"
          :insurance-data="insuranceData"
          :vehicles-data="vehiclesData"
          :interactions-data="interactionsData"
          :offline-activities="offlineActivities"
          :financial-loans="financialLoans"
          :assets-data="assetsData"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 更正理由输入（仅执行模式 & 仅在对比矩阵 Tab 显示） -->
    <div v-if="activeTab === 'comparison' && isExecuteMode && task?.status !== 'draft'" class="reason-section mt20">
      <el-form-item :label="t('errorCorrection.mergeWorkbench.correctionReason')">
        <el-input
          v-model="correctionReason"
          type="textarea"
          :rows="3"
          :placeholder="t('errorCorrection.mergeWorkbench.correctionReasonPlaceholder')"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </div>

    <!-- 驳回意见（仅审核模式） -->
    <div v-if="isReviewMode" class="reject-section">
      <el-form-item :label="t('errorCorrection.mergeWorkbench.rejectReason')">
        <el-input
          v-model="rejectReason"
          type="textarea"
          :rows="2"
          :placeholder="t('errorCorrection.mergeWorkbench.rejectReasonPlaceholder')"
          maxlength="300"
          show-word-limit
        />
      </el-form-item>
    </div>

    <template #footer v-if="activeTab === 'comparison'">
      <div class="dialog-footer">
        <!-- 数据专员操作（执行模式） -->
        <!-- 数据处理操作 -->
        <template v-if="!isViewMode">
          <el-button type="danger" :loading="ignoring" @click="handleIgnore">
            {{ t("errorCorrection.mergeWorkbench.ignoreWithPrompt") }}
          </el-button>
          <el-button type="danger" plain @click="handleSplit">{{ t("errorCorrection.mergeWorkbench.notSamePerson") }}</el-button>
          <el-button type="success" @click="handleConfirmMerge" :loading="confirming">{{
            t("errorCorrection.mergeWorkbench.isSamePerson")
          }}</el-button>
        </template>

        <!-- 部门主管操作（审核模式） -->

        <!-- 查看模式（已解决/已驳回） -->
        <template v-if="isViewMode">
          <el-button @click="handleClose">{{ t("errorCorrection.mergeWorkbench.close") }}</el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox, ElNotification, ElLoading } from "element-plus";
import ComparisonMatrix, { type ComparisonField, type SourceSystem } from "./components/ComparisonMatrix.vue";
import LineageTrace, { type LineageItem } from "./components/LineageTrace.vue";

import CustomerReferencePanel, {
  type CustomerInfo,
  type CompanyInfo,
  type ConsumptionStats,
  type OpportunityInfo,
  type Interaction
} from "./components/CustomerReferencePanel.vue";

export interface ConflictTask {
  id: string;
  taskNo: string;
  oneId: string;
  sourceName: string;
  targetName: string;
  score: number;
  conflictField: string;
  sourceSystem: string;
  conflictType: string;
  status: "pending" | "draft" | "review" | "resolved" | "rejected";
  urgency: "low" | "medium" | "high";
  slaDeadline: string;
  handler: string;
  reviewer: string;
  createTime: string;
  updateTime: string;
}

interface Props {
  visible: boolean;
  task: ConflictTask | null;
  userRole?: "executor" | "reviewer" | "viewer"; // 客户角色
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "split", reason: string): void;
  (e: "submit", task: ConflictTask | null, reason: string): void;
  (e: "save-draft", task: ConflictTask | null, fields: ComparisonField[]): void;
  (e: "confirm-merge", task: ConflictTask | null): void;
  (e: "reject", task: ConflictTask | null, reason: string): void;
  (e: "ignore", taskId: string): void;
  (e: "close"): void;
}

const props = withDefaults(defineProps<Props>(), {
  userRole: "executor"
});

const emit = defineEmits<Emits>();

const { t } = useI18n();

// 核心源系统
const sourceSystems = computed<SourceSystem[]>(() => [
  { code: "DMS_1", name: "DMS", id: "623456" },
  { code: "DMS_2", name: "DMS", id: "687654" },
  { code: "BDC", name: "BDC" },
  { code: "WECHAT", name: t("errorCorrection.mergeWorkbench.sourceSystems.wechat") }
]);

const activeTab = ref("comparison");
const correctionReason = ref("");
const rejectReason = ref("");
const submitting = ref(false);
const confirming = ref(false);
const ignoring = ref(false);

const comparisonFields = ref<ComparisonField[]>([
  {
    key: "name",
    label: "姓名",
    goldValue: "张伟",
    sourceValues: {
      DMS_1: "张伟",
      DMS_2: "张微伟",
      BDC: "张伟",
      WECHAT: "Nick-张"
    },
    sourceValueTimes: {
      DMS_1: "2023-01-01 12:00:00",
      DMS_2: "2023-01-02 10:00:00",
      BDC: "2023-01-03 14:00:00",
      WECHAT: "2023-01-04 09:00:00"
    },
    hasConflict: true,
    suggestedValue: ["张伟"],
    selectedSources: ["DMS_1"],
    singleSelect: true
  },
  {
    key: "phone",
    label: "手机号",
    goldValue: "13812345678",
    sourceValues: {
      DMS_1: "13812345678",
      DMS_2: "13800138000",
      BDC: "13912345678",
      WECHAT: "13812345678"
    },
    sourceValueTimes: {
      DMS_1: "2023-01-01 12:00:00",
      DMS_2: "2023-02-15 16:30:00",
      BDC: "2023-01-03 12:00:00",
      WECHAT: "2023-01-04 12:00:00"
    },
    hasConflict: true,
    suggestedValue: ["13812345678"],
    selectedSources: ["DMS_1"]
  },
  {
    key: "gender",
    label: "性别",
    goldValue: "男",
    sourceValues: {
      DMS_1: "男",
      DMS_2: "未知",
      BDC: "男",
      WECHAT: "男"
    },
    sourceValueTimes: {
      DMS_1: "2023-01-01 12:00:00",
      DMS_2: "2023-01-02 12:00:00",
      BDC: "2023-01-03 12:00:00",
      WECHAT: "2023-01-04 12:00:00"
    },
    hasConflict: true,
    suggestedValue: ["男"],
    selectedSources: ["DMS_1"],
    singleSelect: true
  },
  {
    key: "address",
    label: "地址",
    goldValue: "北京市朝阳区建国路88号",
    sourceValues: {
      DMS_1: "北京市朝阳区建国路88号",
      DMS_2: "北京朝阳区",
      BDC: "北京市海淀区",
      WECHAT: "北京"
    },
    sourceValueTimes: {
      DMS_1: "2023-01-01 12:00:00",
      DMS_2: "2023-01-02 12:00:00",
      BDC: "2023-01-03 12:00:00",
      WECHAT: "2023-01-04 12:00:00"
    },
    hasConflict: true,
    suggestedValue: ["北京市朝阳区建国路88号"],
    selectedSources: ["DMS_1"]
  },
  {
    key: "email",
    label: "邮箱",
    goldValue: "zhangwei@example.com",
    sourceValues: {
      DMS_1: "zhangwei@example.com",
      DMS_2: "zw@example.com",
      BDC: "zhangwei@example.com",
      WECHAT: "zhang.wei@wechat.com"
    },
    sourceValueTimes: {
      DMS_1: "2023-01-01 12:00:00",
      DMS_2: "2023-01-02 12:00:00",
      BDC: "2023-01-03 12:00:00",
      WECHAT: "2023-01-04 12:00:00"
    },
    hasConflict: true,
    suggestedValue: ["zhangwei@example.com"],
    selectedSources: ["DMS_1", "BDC"]
  },
  {
    key: "tags",
    label: "标签",
    goldValue: "高价值,活跃",
    type: "tags",
    sourceValues: {
      DMS_1: "高价值",
      DMS_2: "活跃",
      BDC: "高价值,活跃",
      WECHAT: "意向客户"
    },
    sourceValueTimes: {
      DMS_1: "2023-01-01 12:00:00",
      DMS_2: "2023-01-02 12:00:00",
      BDC: "2023-01-03 12:00:00",
      WECHAT: "2023-01-04 12:00:00"
    },
    hasConflict: true,
    suggestedValue: ["高价值,活跃"],
    selectedSources: ["BDC"]
  }
]);

// 身份血缘数据
const lineageData = ref<LineageItem[]>([
  {
    mergeTime: "2024-01-05 09:30:00",
    mergePerson: "数据治理管理员",
    systemName: "DMS",
    field: "姓名",
    oldValue: "张伟（CRM）",
    newValue: "上汽通用汽车销售有限公司客户1",
    reason: "对齐客户基本信息，合并 DMS 与 CRM..."
  },
  {
    mergeTime: "2024-01-05 09:30:00",
    mergePerson: "数据治理管理员",
    systemName: "DMS",
    field: "性别",
    oldValue: "未知",
    newValue: "其他",
    reason: "对齐客户基本信息，合并 DMS 与 CRM..."
  },
  {
    mergeTime: "2024-01-05 09:30:00",
    mergePerson: "数据治理管理员",
    systemName: "DMS",
    field: "地址",
    oldValue: "上海市浦东新区世纪大道 1 号",
    newValue: "地址1号街道71号",
    reason: "对齐客户基本信息，合并 DMS 与 CRM..."
  },
  {
    mergeTime: "2024-02-01 16:20:00",
    mergePerson: "门店前台",
    systemName: "DMS",
    field: "车牌号",
    oldValue: "沪A·00000",
    newValue: "京A46972",
    reason: "客户到店更新车牌和当前里程"
  },
  {
    mergeTime: "2024-02-01 16:20:00",
    mergePerson: "门店前台",
    systemName: "DMS",
    field: "当前里程",
    oldValue: "12000",
    newValue: "46219.43",
    reason: "客户到店更新车牌和当前里程"
  }
]);

// 客户信息参考数据
const customerReferenceInfo = ref<CustomerInfo>({
  oneId: "ONEID00000001",
  name: "张伟",
  phone: "13800138000",
  gender: "男",
  ageGroup: "30-35岁",
  familyStatus: "已婚",
  address: "上海市浦东新区世纪大道1号",
  city: "上海"
});

const companyReferenceInfo = ref<CompanyInfo>({
  id: "CO0001",
  oneId: "ONEID_CO_0001",
  name: "上汽通用汽车销售有限公司",
  address: "上海市浦东新区宁桥路1299号",
  phone: "021-12345678",
  lifecycleStatus: "active"
});

const consumptionStats = ref<ConsumptionStats>({
  totalSpend: 158000,
  avgSpend: 13166.67,
  orderCount: 12,
  lastVisit: "2024-02-20"
});

const offlineActivities = ref([
  { activityName: "2023 保时捷冰雪体验", activityTime: "2023-01-15", attendanceStatus: "已参加" },
  { activityName: "春季私享品鉴会", activityTime: "2024-03-20", attendanceStatus: "预报名" }
]);

const financialLoans = ref([{ loanType: "汽车金融贷款", amount: "500,000", status: "正常" }]);

const opportunityInfoList = ref<OpportunityInfo[]>([
  {
    leadType: "BDC续保商机",
    priority: "high",
    status: "processing",
    ruleName: "续保到期提醒规则",
    pushTarget: "BDC外呼系统",
    pushStatus: "success"
  },
  {
    leadType: "新转续",
    priority: "medium",
    status: "pushed",
    ruleName: "新转续商机规则",
    pushTarget: "BDC外呼系统",
    pushStatus: "success"
  },
  {
    leadType: "维保到期",
    priority: "high",
    status: "pending",
    ruleName: "维保到期提醒规则",
    pushTarget: "BDC外呼系统",
    pushStatus: "pending"
  },
  {
    leadType: "高价值客户",
    priority: "high",
    status: "completed",
    ruleName: "高价值客户识别规则",
    pushTarget: "BDC外呼系统",
    pushStatus: "success"
  }
]);

const preferences = ref<string[]>(["下午联系", "微信沟通", "需要代步车", "预约保养"]);

// 分类标签数据
const categoryTags = ref<CategoryTags>({
  意向级别: ["冷", "暖", "热"],
  "SC【必选】": [
    "PMP邀约",
    "全款",
    "员工介绍",
    "市场活动",
    "新车",
    "易手车",
    "老客介绍",
    "老客重购",
    "自然客流",
    "贷款",
    "销售邀约",
    "公牌",
    "其他"
  ],
  "SA【必选】": ["本市", "省内外市", "私牌"],
  "续保【必选】": [
    "人保",
    "人寿",
    "保险到期月份-10月",
    "保险到期月份-11月",
    "保险到期月份-12月",
    "保险到期月份-1月",
    "保险到期月份-2月",
    "保险到期月份-3月",
    "保险到期月份-4月",
    "保险到期月份-5月",
    "保险到期月份-6月",
    "保险到期月份-7月",
    "保险到期月份-8月",
    "保险到期月份-9月",
    "其他",
    "在修不在保",
    "太保",
    "平安",
    "新保",
    "续保",
    "太平",
    "大地"
  ],
  "POC【必选】": ["其他评估", "区间报价", "售后评估", "精确报价", "销售评估"],
  免打扰车主: ["车主免打扰"],
  线上活动: ["8月再购活动抽奖"],
  "爱好(≥1项)": ["亲子", "品酒", "宠物", "潮玩", "自驾游", "艺术文化", "赛车", "运动", "高尔夫"]
});

// 选中的标签（客户携带的标签，实际应从API获取）
const selectedTags = ref<SelectedTags>({
  意向级别: ["热"],
  "SC【必选】": ["老客重购", "全款"],
  "SA【必选】": ["本市", "私牌"],
  "续保【必选】": ["平安", "保险到期月份-3月", "续保"],
  "POC【必选】": ["精确报价"],
  "爱好(≥1项)": ["自驾游", "运动", "高尔夫"]
});

// 维保记录数据
const transactionsData = ref<Transaction[]>([
  {
    id: "1",
    serviceType: "售后保养",
    serviceTime: "2024-02-20",
    amount: 2000,
    description: "定期保养",
    serviceStore: "上海浦东店",
    vehicleModel: "911 Carrera S",
    status: "已完成",
    source: "DMS"
  },
  {
    id: "2",
    serviceType: "售后维修",
    serviceTime: "2024-03-15",
    amount: 1500,
    description: "更换雨刮片",
    serviceStore: "上海浦东店",
    vehicleModel: "911 Carrera S",
    status: "已完成",
    source: "DMS"
  },
  {
    id: "3",
    serviceType: "整车销售",
    serviceTime: "2021-03-15",
    amount: 1500000,
    description: "新车交付",
    serviceStore: "上海浦东店",
    vehicleModel: "911 Carrera S",
    status: "已完成",
    source: "DMS"
  }
]);

// 保险信息数据
const insuranceData = ref<Insurance[]>([
  {
    id: "1",
    type: "商业险",
    policyNo: "POL20240101001",
    company: "平安保险",
    startDate: "2024-01-01",
    endDate: "2025-01-01",
    amount: 12000,
    status: "已生效",
    source: "续保系统"
  },
  {
    id: "2",
    type: "交强险",
    policyNo: "POL20240101002",
    company: "平安保险",
    startDate: "2024-01-01",
    endDate: "2025-01-01",
    amount: 950,
    status: "已生效",
    source: "续保系统"
  }
]);

// 资产中心数据
const assetsData = ref<Assets>({
  coupons: [
    {
      id: "1",
      name: "保养优惠券",
      amount: 500,
      expireDate: "2025-06-30",
      status: "valid"
    },
    {
      id: "2",
      name: "维修优惠券",
      amount: 300,
      expireDate: "2025-03-31",
      status: "valid"
    },
    {
      id: "3",
      name: "美容优惠券",
      amount: 200,
      expireDate: "2024-12-31",
      status: "expired"
    },
    {
      id: "4",
      name: "保养优惠券",
      amount: 800,
      expireDate: "2025-08-31",
      status: "valid"
    }
  ],
  vouchers: [
    {
      id: "1",
      name: "代金券A",
      balance: 1000,
      totalAmount: 2000
    },
    {
      id: "2",
      name: "代金券B",
      balance: 500,
      totalAmount: 1000
    }
  ],
  totalCouponValue: 1800,
  totalVoucherBalance: 1500
});

// 车辆关联数据
const vehiclesData = ref<Vehicle[]>([
  {
    vin: "WP0ZZZ99ZKS123456",
    licensePlate: "京A88888",
    model: "911 Carrera S",
    brand: "保时捷",
    purchaseDate: "2021-03-15",
    lastServiceDate: "2024-08-22",
    nextServiceDate: "2025-02-22",
    mileage: 147275,
    serviceCount: 12,
    totalServiceAmount: 177000
  },
  {
    vin: "WP0ZZZ99ZKS789012",
    licensePlate: "京B66666",
    model: "Cayenne",
    brand: "保时捷",
    purchaseDate: "2022-05-20",
    lastServiceDate: "2024-11-10",
    nextServiceDate: "2025-05-10",
    mileage: 85600,
    serviceCount: 8,
    totalServiceAmount: 98000
  }
]);

// 沟通记录数据
const interactionsData = ref<Interaction[]>([
  {
    id: "1",
    type: "call",
    date: "2025-01-10 14:30:00",
    content: "客户咨询下次保养时间，已告知2025年2月22日，客户表示会提前预约。",
    operator: "李销售",
    duration: 180,
    result: "已预约"
  },
  {
    id: "2",
    type: "wechat",
    date: "2025-01-08 10:15:00",
    content: "通过微信发送了保养提醒，客户回复收到，表示感谢。",
    operator: "王客服",
    result: "已发送"
  },
  {
    id: "3",
    type: "visit",
    date: "2025-01-06 15:20:00",
    content: "客户到店进行保养服务，对服务满意度较高，已记录客户偏好。",
    operator: "张技师",
    result: "已完成"
  },
  {
    id: "4",
    type: "call",
    date: "2024-12-28 16:45:00",
    content: "电话回访，了解客户对上次服务的满意度，客户表示满意。",
    operator: "李销售",
    duration: 120,
    result: "满意"
  },
  {
    id: "5",
    type: "email",
    date: "2024-12-20 09:00:00",
    content: "发送了新年祝福邮件和优惠活动信息。",
    operator: "系统",
    result: "已发送"
  },
  {
    id: "6",
    type: "wechat",
    date: "2024-12-15 11:30:00",
    content: "客户通过微信咨询保险续保事宜，已提供相关信息和报价。",
    operator: "王客服",
    result: "已回复"
  }
]);

// 判断模式
const isExecuteMode = computed(() => {
  return true; // 简化逻辑，不再区分执行和审核模式，统一处理
});

const isReviewMode = computed(() => {
  return false; // 移除审核模式
});

const isViewMode = computed(() => {
  return props.userRole === "viewer" || props.task?.status === "resolved" || props.task?.status === "rejected";
});

const canSubmit = computed(() => {
  return true; // Correction reason is optional
});

// 初始化对比矩阵数据
const initComparisonFields = () => {
  comparisonFields.value = [
    {
      key: "name",
      label: "姓名",
      goldValue: "张伟",
      goldValueTime: "2024-12-15 10:30:00",
      sourceValues: {
        DMS: "张伟",
        BDC: "张伟先生",
        CRM: "张伟",
        WECHAT: "张伟",
        APP: "张伟",
        WEBSITE: "张伟",
        ERP: "张伟"
      },
      sourceValueTimes: {
        DMS: "2024-12-15 10:30:00",
        BDC: "2025-01-06 14:20:00",
        CRM: "2024-11-20 09:15:00",
        WECHAT: "2024-12-20 16:45:00",
        APP: "2024-12-10 11:00:00",
        WEBSITE: "2024-12-05 13:30:00",
        ERP: "2024-12-18 15:20:00"
      },
      suggestedValue: ["张伟"],
      selectedSources: ["gold"], // 默认选中黄金记录（多选数组）
      primarySource: "gold", // 主值标记
      hasConflict: true,
      type: undefined,
      singleSelect: true
    },
    {
      key: "gender",
      label: "性别",
      goldValue: "男",
      goldValueTime: "2024-12-15 10:30:00",
      sourceValues: {
        DMS: "男",
        BDC: "男",
        CRM: "未知",
        WECHAT: "男",
        APP: "男",
        WEBSITE: "男",
        ERP: "男"
      },
      sourceValueTimes: {
        DMS: "2024-12-15 10:30:00",
        BDC: "2025-01-06 14:20:00",
        CRM: "2024-11-20 09:15:00",
        WECHAT: "2024-12-20 16:45:00",
        APP: "2024-12-10 11:00:00",
        WEBSITE: "2024-12-05 13:30:00",
        ERP: "2024-12-18 15:20:00"
      },
      suggestedValue: ["男"],
      selectedSources: ["gold"],
      primarySource: "gold",
      hasConflict: true,
      type: undefined,
      singleSelect: true
    },
    {
      key: "mobile",
      label: "手机号码",
      goldValue: "13812345678",
      goldValueTime: "2024-12-15 10:30:00",
      sourceValues: {
        DMS: "13812345678",
        BDC: "13987654321",
        CRM: "13812345678",
        WECHAT: "13812345678",
        APP: "13812345678",
        WEBSITE: "13812345678",
        ERP: "13812345678"
      },
      sourceValueTimes: {
        DMS: "2024-12-15 10:30:00",
        BDC: "2025-01-06 14:20:00",
        CRM: "2024-12-15 10:30:00",
        WECHAT: "2024-12-15 10:30:00",
        APP: "2024-12-15 10:30:00",
        WEBSITE: "2024-12-15 10:30:00",
        ERP: "2024-12-15 10:30:00"
      },
      suggestedValue: ["13812345678"],
      selectedSources: ["gold"], // 默认选中黄金记录（多选数组）
      primarySource: "gold", // 主值标记
      hasConflict: true, // BDC有不同号码，存在冲突
      type: undefined
    },
    {
      key: "address",
      label: "地址",
      goldValue: "北京市朝阳区",
      goldValueTime: "2024-12-15 10:30:00",
      sourceValues: {
        DMS: "北京市朝阳区",
        BDC: "北京市海淀区",
        CRM: "北京市朝阳区",
        WECHAT: "北京市朝阳区",
        APP: "北京市朝阳区",
        WEBSITE: "北京市朝阳区",
        ERP: "北京市朝阳区"
      },
      sourceValueTimes: {
        DMS: "2024-12-15 10:30:00",
        BDC: "2025-01-05 09:20:00",
        CRM: "2024-11-20 09:15:00",
        WECHAT: "2024-12-20 16:45:00",
        APP: "2024-12-10 11:00:00",
        WEBSITE: "2024-12-05 13:30:00",
        ERP: "2024-12-18 15:20:00"
      },
      suggestedValue: ["北京市朝阳区"],
      selectedSources: ["gold"], // 默认选中黄金记录（多选数组）
      primarySource: "gold", // 主值标记
      hasConflict: true,
      type: undefined
    },
    {
      key: "yearlySpend",
      label: "年度消费金额",
      goldValue: "50000",
      goldValueTime: "2024-12-15 10:30:00",
      sourceValues: {
        DMS: "50000",
        BDC: "52000",
        CRM: "50000",
        WECHAT: "50000",
        APP: "50000",
        WEBSITE: "50000",
        ERP: "50000"
      },
      sourceValueTimes: {
        DMS: "2024-12-15 10:30:00",
        BDC: "2025-01-06 14:30:00",
        CRM: "2024-11-20 09:15:00",
        WECHAT: "2024-12-20 16:45:00",
        APP: "2024-12-10 11:00:00",
        WEBSITE: "2024-12-05 13:30:00",
        ERP: "2024-12-18 15:20:00"
      },
      suggestedValue: ["50000"],
      selectedSources: ["gold"], // 默认选中黄金记录（多选数组）
      primarySource: "gold", // 主值标记
      hasConflict: true,
      type: "money"
    },
    {
      key: "email",
      label: "邮箱",
      goldValue: "zhangwei@example.com",
      goldValueTime: "2024-12-15 10:30:00",
      sourceValues: {
        DMS: "zhangwei@example.com",
        BDC: "zhangwei@example.com",
        CRM: "zhangwei@example.com",
        WECHAT: "zhangwei@example.com",
        APP: "zhangwei@example.com",
        WEBSITE: "zhangwei@example.com",
        ERP: "zhangwei@example.com"
      },
      sourceValueTimes: {
        DMS: "2024-12-15 10:30:00",
        BDC: "2024-12-15 10:30:00",
        CRM: "2024-12-15 10:30:00",
        WECHAT: "2024-12-15 10:30:00",
        APP: "2024-12-15 10:30:00",
        WEBSITE: "2024-12-15 10:30:00",
        ERP: "2024-12-15 10:30:00"
      },
      suggestedValue: ["zhangwei@example.com"],
      selectedSources: ["gold"],
      primarySource: "gold",
      hasConflict: false,
      type: undefined
    },
    {
      key: "vin",
      label: "VIN 信息",
      goldValue: "LSV552123456789M4YV",
      goldValueTime: "2024-12-15 10:30:00",
      sourceValues: {
        DMS: "LSV552123456789M4YV",
        BDC: "LSV552123456789M4YV",
        CRM: "LSV552123456789M4YV",
        WECHAT: "LSV552123456789M4YV",
        APP: "LSV552123456789M4YV",
        WEBSITE: "LSV552123456789M4YV",
        ERP: "LSV552123456789M4YV"
      },
      sourceValueTimes: {
        DMS: "2024-12-15 10:30:00",
        BDC: "2024-12-15 10:30:00",
        CRM: "2024-12-15 10:30:00",
        WECHAT: "2024-12-15 10:30:00",
        APP: "2024-12-15 10:30:00",
        WEBSITE: "2024-12-15 10:30:00",
        ERP: "2024-12-15 10:30:00"
      },
      suggestedValue: ["LSV552123456789M4YV"],
      selectedSources: ["gold"],
      primarySource: "gold",
      hasConflict: false,
      locked: true,
      type: undefined
    },
    {
      key: "plate",
      label: "车牌号",
      goldValue: "京A88888",
      goldValueTime: "2024-12-15 10:30:00",
      sourceValues: {
        DMS: "京A88888",
        BDC: "京B88888",
        CRM: "京A88888",
        WECHAT: "京A88888",
        APP: "京A88888",
        WEBSITE: "京A88888",
        ERP: "京A88888"
      },
      sourceValueTimes: {
        DMS: "2024-12-15 10:30:00",
        BDC: "2025-01-05 09:20:00",
        CRM: "2024-11-20 09:15:00",
        WECHAT: "2024-12-20 16:45:00",
        APP: "2024-12-10 11:00:00",
        WEBSITE: "2024-12-05 13:30:00",
        ERP: "2024-12-18 15:20:00"
      },
      suggestedValue: ["京A88888"],
      selectedSources: ["gold"],
      primarySource: "gold",
      hasConflict: true,
      type: undefined
    }
  ];
};

// 监听任务变化，初始化数据
watch(
  () => props.task,
  () => {
    if (props.task) {
      // initComparisonFields();
      correctionReason.value = "";
      rejectReason.value = "";
    }
  },
  { immediate: true }
);

const getStatusType = (status?: string) => {
  const map: Record<string, string> = {
    pending: "warning",
    draft: "info",
    review: "primary",
    resolved: "success",
    rejected: "danger"
  };
  return map[status || ""] || "info";
};

const getStatusLabel = (status?: string) => {
  const statusKey = status || "";
  const map: Record<string, string> = {
    pending: t("errorCorrection.mergeWorkbench.status.pending"),
    draft: t("errorCorrection.mergeWorkbench.status.draft"),
    review: t("errorCorrection.mergeWorkbench.status.review"),
    resolved: t("errorCorrection.mergeWorkbench.status.resolved"),
    rejected: t("errorCorrection.mergeWorkbench.status.rejected")
  };
  return map[statusKey] || t("errorCorrection.mergeWorkbench.status.unknown");
};

const handleFieldChange = (field: ComparisonField) => {
  // 字段变更处理
  console.log("Field changed:", field);
};

const handleConfirmMerge = async () => {
  // 检查是否有多个活跃分组
  const activeGroupIds = new Set<string>();
  comparisonFields.value.forEach(f => {
    if (f.groupSuggestedValues) {
      Object.keys(f.groupSuggestedValues).forEach(id => activeGroupIds.add(id));
    }
  });
  const hasMultipleGroups = activeGroupIds.size > 1;

  let confirmMessage =
    mergedMobileCount > 0
      ? t("errorCorrection.mergeWorkbench.messages.mergeConfirmWithSync", { count: mergedMobileCount })
      : t("errorCorrection.mergeWorkbench.messages.mergeConfirm");

  if (hasMultipleGroups) {
    confirmMessage = `检测到记录将被拆分为 ${activeGroupIds.size} 个独立条目。${confirmMessage}`;
  }

  try {
    await ElMessageBox.confirm(confirmMessage, t("errorCorrection.mergeWorkbench.messages.mergeConfirmTitle"), {
      confirmButtonText: t("errorCorrection.mergeWorkbench.confirmMerge"),
      cancelButtonText: t("common.cancel"),
      type: "warning"
    });

    confirming.value = true;
    const loading = ElLoading.service({ text: t("errorCorrection.mergeWorkbench.messages.merging") });
    await new Promise(resolve => setTimeout(resolve, 1000));
    loading.close();

    emit("confirm-merge", props.task);
    ElNotification({
      title: t("errorCorrection.mergeWorkbench.messages.mergeSuccess"),
      message:
        mergedMobileCount > 0
          ? t("errorCorrection.mergeWorkbench.messages.mergeSuccessWithSync", {
              name: props.task?.sourceName,
              count: mergedMobileCount
            })
          : t("errorCorrection.mergeWorkbench.messages.mergeSuccessNoSync", { name: props.task?.sourceName }),
      type: "success",
      duration: 5000
    });
    handleClose();
  } catch (error) {
    // 客户取消
  } finally {
    confirming.value = false;
  }
};

const handleIgnore = () => {
  if (!props.task) return;
  ElMessageBox.confirm(t("errorCorrection.ignoreConfirm"), t("errorCorrection.ignore"), {
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    type: "warning"
  })
    .then(() => {
      ignoring.value = true;
      emit("ignore", props.task!.id);
      handleClose();
    })
    .finally(() => {
      ignoring.value = false;
    });
};

const handleSplit = async () => {
  try {
    const { value } = await ElMessageBox.prompt(
      t("errorCorrection.mergeWorkbench.messages.splitPrompt"),
      t("errorCorrection.mergeWorkbench.messages.splitConfirmTitle"),
      {
        confirmButtonText: t("errorCorrection.mergeWorkbench.messages.submitSplit"),
        cancelButtonText: t("common.cancel"),
        inputType: "textarea"
      }
    );
    if (value !== undefined) {
      ElMessage.success(t("errorCorrection.mergeWorkbench.messages.splitSuccess"));
      emit("split", value);
      handleClose();
    }
  } catch {
    // 客户取消
  }
};

const handleClose = () => {
  emit("update:visible", false);
  emit("close");
};
</script>

<style lang="scss" scoped>
:deep(.el-dialog.merge-workbench-dialog) {
  width: min(1600px, 96vw);
  max-width: 1600px;
  // 设置整个弹窗的高度
  .el-dialog__body {
    max-height: 85vh;
    overflow-y: auto;
    padding: 20px;
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 18px;
      color: #303133;
    }

    .dialog-status {
      display: flex;
      align-items: center;
    }
  }

  .mb-12 {
    margin-bottom: 12px;
  }

  .workbench-tabs {
    margin-top: 16px;

    :deep(.el-tabs__content) {
      max-height: 70vh;
      overflow-y: auto;
      min-height: 500px;
    }
  }

  .reason-section,
  .reject-section {
    margin-top: 24px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

.ml-8 {
  margin-left: 8px;
}

// 统一弹窗样式
:deep(.unified-dialog) {
  .el-dialog {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .el-dialog__header {
    padding: 20px 24px;
    border-bottom: 1px solid #e4e7ed;
    background: #ffffff;
    border-radius: 8px 8px 0 0;

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .el-dialog__headerbtn {
      top: 20px;
      right: 24px;
      width: 32px;
      height: 32px;

      .el-dialog__close {
        font-size: 18px;
        color: #909399;

        &:hover {
          color: #606266;
        }
      }
    }
  }

  .el-dialog__body {
    padding: 24px;
    background: #ffffff;
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #e4e7ed;
    background: #ffffff;
    border-radius: 0 0 8px 8px;
  }

  // 统一按钮样式
  .dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;

    .el-button {
      min-width: 88px;
      height: 36px;
      padding: 0 20px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 6px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      &:active {
        transform: translateY(0);
      }

      // 危险按钮（忽略、不是同一人）
      &.el-button--danger {
        background-color: #f56c6c;
        border-color: #f56c6c;
        color: #ffffff;

        &:hover {
          background-color: #f78989;
          border-color: #f78989;
        }

        &:active {
          background-color: #e85a5a;
          border-color: #e85a5a;
        }

        // 危险按钮 plain 样式
        &.is-plain {
          background-color: #ffffff;
          border-color: #f56c6c;
          color: #f56c6c;

          &:hover {
            background-color: #fef0f0;
            border-color: #f78989;
            color: #f78989;
          }

          &:active {
            background-color: #fde2e2;
            border-color: #e85a5a;
            color: #e85a5a;
          }
        }
      }

      // 成功按钮（是同一人）
      &.el-button--success {
        background-color: #67c23a;
        border-color: #67c23a;
        color: #ffffff;

        &:hover {
          background-color: #85ce61;
          border-color: #85ce61;
        }

        &:active {
          background-color: #5daf34;
          border-color: #5daf34;
        }
      }

      // 默认按钮（关闭）
      &.el-button--default {
        background-color: #ffffff;
        border-color: #dcdfe6;
        color: #606266;

        &:hover {
          background-color: #f5f7fa;
          border-color: #c0c4cc;
          color: #409eff;
        }

        &:active {
          background-color: #ecf5ff;
          border-color: #409eff;
          color: #409eff;
        }
      }
    }
  }
}
</style>
