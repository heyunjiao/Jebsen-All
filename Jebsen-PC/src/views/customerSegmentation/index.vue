<template>
  <div class="segmentation-builder">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">{{ $t("customerSegmentation.pageTitle") }}</h1>
          <span class="page-subtitle">{{ $t("customerSegmentation.pageSubtitle") }}</span>
        </div>
        <div class="mode-switch">
          <el-segmented v-model="filterMode" :options="filterModeOptions" size="large" />
        </div>
      </div>
    </div>

    <!-- 冲突警告横幅 -->
    <div v-if="conflictWarnings.length > 0" class="conflict-banner">
      <el-alert type="warning" :closable="false" show-icon>
        <template #title>
          <div class="conflict-title">
            <span>检测到逻辑冲突</span>
          </div>
        </template>
        <div class="conflict-list">
          <div v-for="(warning, index) in conflictWarnings" :key="index" class="conflict-item">
            <el-tag type="warning" size="small">{{ warning.type }}</el-tag>
            <span>{{ warning.message }}</span>
          </div>
        </div>
      </el-alert>
    </div>

    <!-- 主内容区：左右分栏 -->
    <div class="main-content">
      <!-- 左侧：规则构建画布 (70%) -->
      <div class="left-panel">
        <!-- 快捷筛选区 (Quick Filter Mode) - 在混合模式或快捷筛选模式下显示 -->
        <QuickFilters
          v-show="filterMode === 'hybrid' || filterMode === 'quick'"
          v-model="quickFilters"
          :conflict-fields="conflictFields"
          @change="handleQuickFilterChange"
        />

        <!-- 高级规则构建器 (Advanced Builder Mode) - 在混合模式或高级模式下显示 -->
        <el-card v-show="filterMode === 'hybrid' || filterMode === 'advanced'" shadow="never" class="rule-builder-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <el-icon class="header-icon"><Operation /></el-icon>
                <span class="card-title">{{ $t("customerSegmentation.ruleBuilder.title") }}</span>
                <el-tag v-if="filterMode === 'hybrid'" type="info" size="small" class="sync-tag">
                  <el-icon><Connection /></el-icon>
                  已同步
                </el-tag>
              </div>
              <div class="header-right">
                <el-tag :type="conditions.length > 0 ? 'primary' : 'info'" size="small"> {{ conditions.length }} 条件 </el-tag>
                <el-button
                  v-if="quickFilterConditionsCount > 0 && filterMode === 'hybrid'"
                  type="primary"
                  link
                  size="small"
                  @click="handleSyncToRuleTree"
                >
                  <el-icon><Refresh /></el-icon>
                  从漏斗筛选同步
                </el-button>
              </div>
            </div>
          </template>

          <!-- 快捷筛选生成的条件预览 - 仅在混合模式下显示 -->
          <div v-if="quickFilterConditionsCount > 0 && filterMode === 'hybrid'" class="quick-filter-preview">
            <div class="preview-header">
              <el-icon><Filter /></el-icon>
              <span>漏斗筛选条件 ({{ quickFilterConditionsCount }} 项)</span>
              <el-tag v-if="hasQuickFilterConflict" type="danger" size="small" class="conflict-indicator">
                <el-icon><WarningFilled /></el-icon>
                有冲突
              </el-tag>
            </div>
            <div class="preview-tags">
              <el-tag
                v-for="(cond, index) in quickFilterPreviewTags"
                :key="index"
                :type="cond.conflict ? 'danger' : 'success'"
                size="small"
                class="condition-tag"
              >
                {{ cond.label }}
              </el-tag>
            </div>
          </div>

          <el-divider v-if="quickFilterConditionsCount > 0 && filterMode === 'hybrid'" />

          <RuleBuilder
            :key="ruleBuilderKey"
            v-model="ruleTree"
            :field-options="fieldOptions"
            @estimate="handleEstimateDebounced"
          />
        </el-card>
      </div>

      <!-- 右侧：实时洞察面板 (30%) -->
      <div class="right-panel">
        <el-card shadow="never" class="insight-card">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon pulse"><DataAnalysis /></el-icon>
              <span class="card-title">{{ $t("customerSegmentation.insightPanel.title") }}</span>
              <el-tag v-if="hasConflict" type="danger" size="small" class="conflict-tag"> 存在冲突 </el-tag>
            </div>
          </template>

          <!-- 零结果冲突警告 -->
          <el-alert v-if="isZeroResult && !estimateLoading" type="error" :closable="false" show-icon class="zero-result-alert">
            <template #title> 当前条件组合无匹配结果 </template>
            <template #default> 请检查是否存在逻辑冲突，如：筛选条件互斥、标签与分群矛盾等。 </template>
          </el-alert>

          <InsightPanel
            :estimate-result="estimateResult"
            :loading="estimateLoading"
            :change-from-last="changeFromLast"
            :rule-payload="rulePayload"
            :is-timeout="isCalculationTimeout"
            :has-conflict="hasConflict"
            @refresh-sample="handleRefreshSample"
          />
        </el-card>
      </div>
    </div>

    <!-- 底部悬浮操作栏 -->
    <div class="action-bar">
      <div class="action-bar-content">
        <div class="left-actions">
          <el-button :icon="RefreshLeft" @click="handleReset">
            {{ $t("customerSegmentation.actionBar.reset") }}
          </el-button>
          <el-tag v-if="totalConditionsCount > 0" type="info" class="conditions-count">
            共 {{ totalConditionsCount }} 个筛选条件
          </el-tag>
        </div>
        <div class="right-actions">
          <el-button
            v-if="hasExportPermission"
            :icon="Download"
            :loading="exporting"
            :disabled="!canSubmit"
            @click="handleExport"
          >
            {{ $t("customerSegmentation.actionBar.export") }}
          </el-button>
          <el-button type="primary" :icon="FolderAdd" size="large" :disabled="!canSubmit" @click="handleSaveSegment">
            保存为分群
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import {
  Operation,
  DataAnalysis,
  RefreshLeft,
  Download,
  WarningFilled,
  Connection,
  Refresh,
  Filter,
  FolderAdd
} from "@element-plus/icons-vue";
import QuickFilters from "./components/QuickFilters.vue";
import type { FilterFormType } from "./components/QuickFilters.vue";
import type { CustomerSegmentation } from "@/api/modules/customerSegmentation";
import { getFieldOptions, estimateCount } from "@/api/modules/customerSegmentation";
import type { RuleNode } from "@/views/tagManage/components/RuleEditor.vue";
import { getSegmentTagLabel, formatTagLabels } from "./constants/tagOptions";
import {
  formatValueLabels,
  getSpendingLevelLabel,
  getLoyaltyLevelLabel,
  getCustomerValueTierLabel
} from "./constants/valueOptions";
import {
  getVehicleAttributeLabel,
  getPurchaseAttributeLabel
} from "./constants/vehicleOptions";
import { getLastServiceStoreLabel } from "./constants/afterSalesOptions";
import { UNIQUE_FILTER_FIELD_KEYS } from "./constants/segmentFilterFields";

const { t } = useI18n();

// 筛选模式
const filterMode = ref<string>("quick");
// 混合模式暂时隐藏，后续可能需要放开
const showHybridMode = ref(false);
const filterModeOptions = computed(() => {
  const options = [
    { label: "漏斗筛选", value: "quick" },
    { label: "自定义筛选", value: "advanced" }
  ];
  // 如果后续需要显示混合模式，取消下面的注释
  if (showHybridMode.value) {
    options.push({ label: "混合模式", value: "hybrid" });
  }
  return options;
});

// Refs
const formRef = ref<FormInstance>();
const fieldOptions = ref<CustomerSegmentation.FieldOption[]>([]);
const estimateLoading = ref(false);
const exporting = ref(false);
const isCalculationTimeout = ref(false);
const ruleBuilderKey = ref(0); // 用于强制重新渲染 RuleBuilder 组件

// 漏斗筛选表单初始值（与需求侧字段列表 + 标签管理默认标签对齐）
const getInitialFilterForm = (): FilterFormType => ({
  name: "",
  gender: "",
  ageGroup: [],
  familyStatus: [],
  residenceArea: "",
  lifecycleStatus: "",
  contactValidity: "",
  lastVisitTime: null,
  visits90d: { min: undefined, max: undefined },
  annualOrderFreq: { min: undefined, max: undefined },
  avgSpend: { min: undefined, max: undefined },
  annualSpend: { min: undefined, max: undefined },
  compositeScore: { min: undefined, max: undefined },
  spendingLevel: [],
  loyaltyLevel: [],
  modelLine: "",
  modelLines: [],
  versionYear: "",
  carAge: { min: undefined, max: undefined },
  vin: "",
  licensePlate: "",
  vehicleAttribute: "",
  purchaseAttribute: [],
  lastMaintenanceStore: "",
  lastReturnStore: "",
  tags: [],
  totalCarPrice: { min: undefined, max: undefined },
  totalOptionPrice: { min: undefined, max: undefined },
  afterSalesSelfPayAmount: { min: undefined, max: undefined },
  customerValueTier: [],
  completedOrderCount: { min: undefined, max: undefined },
  visitsIn2Years: { min: undefined, max: undefined },
  selfPayAmountIn2Years: { min: undefined, max: undefined },
  lastServiceOrderDate: null,
  lastPurchaseDeliveryDate: null,
  accidentRepairCountIn1Year: { min: undefined, max: undefined }
});

// 快捷筛选
const quickFilters = ref<FilterFormType>(getInitialFilterForm());

// 规则树
const ruleTree = ref<RuleNode>({
  id: "root",
  type: "group",
  operator: "AND",
  children: []
});

// 预估结果
const estimateResult = ref<CustomerSegmentation.ResEstimate | null>(null);
const changeFromLast = ref<{ count: number; rate: string } | null>(null);

// 表单
const form = reactive<CustomerSegmentation.ReqSegmentForm>({
  name: "",
  description: "",
  businessReason: "",
  rulePayload: null,
  validityPeriod: undefined
});

// 权限控制 - Mock
const hasExportPermission = ref(true);

// ========== 冲突检测逻辑 ==========

interface ConflictWarning {
  type: string;
  message: string;
  fields: string[];
}

// 冲突警告列表
const conflictWarnings = ref<ConflictWarning[]>([]);

// 冲突字段列表（用于UI高亮）
const conflictFields = computed(() => {
  const fields: string[] = [];
  conflictWarnings.value.forEach(w => fields.push(...w.fields));
  return [...new Set(fields)];
});

// 是否有冲突
const hasConflict = computed(() => conflictWarnings.value.length > 0);

// 快捷筛选区域是否有冲突
const hasQuickFilterConflict = computed(() => {
  if (!hasConflict.value) return false;
  return conflictFields.value.some(field => UNIQUE_FILTER_FIELD_KEYS.includes(field));
});

// 是否为零结果
const isZeroResult = computed(() => {
  return estimateResult.value?.estimatedCount === 0;
});

// 冲突检测函数
const detectConflicts = () => {
  const warnings: ConflictWarning[] = [];

  // 检测1: 标签与分群的逻辑互斥（标签值已与 constants/tagCategory 叶子统一，如 会员分层-流失客户）
  const selectedTags = quickFilters.value.tags;
  const selectedSegments: string[] = []; // 暂时为空，后续可接 existingSegment 字段

  // Mock 冲突规则：tag 需与 SEGMENT_TAG_OPTIONS 的 value 一致
  const conflictRules = [
    { tag: "会员分层-流失客户", segment: "seg_002", message: "「流失客户」标签与「高净值客户群」分群存在逻辑矛盾" },
    { tag: "售后行为-12个月内完成首保", segment: "seg_003", message: "「12个月内完成首保」与「年度保养提醒人群」分群存在矛盾" }
  ];

  conflictRules.forEach(rule => {
    if (selectedTags.includes(rule.tag) && Array.isArray(selectedSegments) && selectedSegments.includes(rule.segment)) {
      warnings.push({
        type: "标签-分群互斥",
        message: rule.message,
        fields: ["tags", "existingSegment"]
      });
    }
  });

  // 检测2: 车龄范围逻辑错误
  if (
    quickFilters.value.carAge.min !== undefined &&
    quickFilters.value.carAge.max !== undefined &&
    quickFilters.value.carAge.min > quickFilters.value.carAge.max
  ) {
    warnings.push({
      type: "数值范围错误",
      message: "车龄最小值大于最大值，请检查输入",
      fields: ["carAge"]
    });
  }

  // 检测3: 消费范围逻辑错误
  if (
    quickFilters.value.annualSpend.min !== undefined &&
    quickFilters.value.annualSpend.max !== undefined &&
    quickFilters.value.annualSpend.min > quickFilters.value.annualSpend.max
  ) {
    warnings.push({
      type: "数值范围错误",
      message: "年均消费最小值大于最大值，请检查输入",
      fields: ["annualSpend"]
    });
  }

  // 检测4: 90天到店频次范围错误
  if (
    quickFilters.value.visits90d.min !== undefined &&
    quickFilters.value.visits90d.max !== undefined &&
    quickFilters.value.visits90d.min > quickFilters.value.visits90d.max
  ) {
    warnings.push({
      type: "数值范围错误",
      message: "90天进店频次最小值大于最大值，请检查输入",
      fields: ["visits90d"]
    });
  }

  // 检测6: 总车价范围错误
  if (
    quickFilters.value.totalCarPrice.min !== undefined &&
    quickFilters.value.totalCarPrice.max !== undefined &&
    quickFilters.value.totalCarPrice.min > quickFilters.value.totalCarPrice.max
  ) {
    warnings.push({
      type: "数值范围错误",
      message: "总车价最小值大于最大值，请检查输入",
      fields: ["totalCarPrice"]
    });
  }

  // 检测7: 选配总价范围错误
  if (
    quickFilters.value.totalOptionPrice.min !== undefined &&
    quickFilters.value.totalOptionPrice.max !== undefined &&
    quickFilters.value.totalOptionPrice.min > quickFilters.value.totalOptionPrice.max
  ) {
    warnings.push({
      type: "数值范围错误",
      message: "选配总价最小值大于最大值，请检查输入",
      fields: ["totalOptionPrice"]
    });
  }

  // 检测8: 售后自费金额范围错误
  if (
    quickFilters.value.afterSalesSelfPayAmount.min !== undefined &&
    quickFilters.value.afterSalesSelfPayAmount.max !== undefined &&
    quickFilters.value.afterSalesSelfPayAmount.min > quickFilters.value.afterSalesSelfPayAmount.max
  ) {
    warnings.push({
      type: "数值范围错误",
      message: "售后自费金额最小值大于最大值，请检查输入",
      fields: ["afterSalesSelfPayAmount"]
    });
  }

  // 检测9: 已成交订单数范围错误
  if (
    quickFilters.value.completedOrderCount.min !== undefined &&
    quickFilters.value.completedOrderCount.max !== undefined &&
    quickFilters.value.completedOrderCount.min > quickFilters.value.completedOrderCount.max
  ) {
    warnings.push({
      type: "数值范围错误",
      message: "已成交订单数最小值大于最大值，请检查输入",
      fields: ["completedOrderCount"]
    });
  }

  // 检测10: 两年内进场次数范围错误
  if (
    quickFilters.value.visitsIn2Years.min !== undefined &&
    quickFilters.value.visitsIn2Years.max !== undefined &&
    quickFilters.value.visitsIn2Years.min > quickFilters.value.visitsIn2Years.max
  ) {
    warnings.push({
      type: "数值范围错误",
      message: "两年内进场次数最小值大于最大值，请检查输入",
      fields: ["visitsIn2Years"]
    });
  }

  // 检测11: 两年内自费金额范围错误
  if (
    quickFilters.value.selfPayAmountIn2Years.min !== undefined &&
    quickFilters.value.selfPayAmountIn2Years.max !== undefined &&
    quickFilters.value.selfPayAmountIn2Years.min > quickFilters.value.selfPayAmountIn2Years.max
  ) {
    warnings.push({
      type: "数值范围错误",
      message: "两年内自费金额最小值大于最大值，请检查输入",
      fields: ["selfPayAmountIn2Years"]
    });
  }

  // 检测12: 最近一年事故维修次数范围错误
  if (
    quickFilters.value.accidentRepairCountIn1Year.min !== undefined &&
    quickFilters.value.accidentRepairCountIn1Year.max !== undefined &&
    quickFilters.value.accidentRepairCountIn1Year.min > quickFilters.value.accidentRepairCountIn1Year.max
  ) {
    warnings.push({
      type: "数值范围错误",
      message: "最近一年事故维修次数最小值大于最大值，请检查输入",
      fields: ["accidentRepairCountIn1Year"]
    });
  }

  // 检测5: 快捷筛选与规则引擎冲突
  // 辅助函数：获取字段名称
  const getFieldLabel = (field: string) => {
    const opt = fieldOptions.value.find(o => o.field === field);
    return opt ? opt.label : field;
  };

  const checkValueConflict = (field: string, qValue: any, rOp: string, rValue: any): boolean => {
    // 空值跳过
    if (qValue === undefined || qValue === null || qValue === "") return false;
    if (Array.isArray(qValue) && qValue.length === 0) return false;
    if (typeof qValue === "object" && qValue.min === undefined && qValue.max === undefined && !Array.isArray(qValue))
      return false;

    const rValStr = String(rValue);

    // 字符串/枚举类型冲突
    if (["gender", "residenceArea", "lifecycleStatus", "lastMaintenanceStore", "lastReturnStore", "modelLine", "contactValidity"].includes(field)) {
      if (typeof qValue === "string") {
        if (rOp === "equals" && qValue !== rValStr) return true;
        if (rOp === "notEquals" && qValue === rValStr) return true;
      }
    }

    // 数组类型的冲突 (如年龄段)
    if (Array.isArray(qValue)) {
      // 如果规则是 等于，必须包含在数组中
      if (rOp === "equals" && !qValue.includes(rValStr)) return true;
      // 如果规则是 不等于，不能是数组中的 唯一值 (逻辑上有点弱，主要检測"等于"的互斥)
    }

    // 数值范围冲突
    // qValue: {min, max}
    if (typeof qValue === "object" && !Array.isArray(qValue)) {
      const qMin = qValue.min ?? -Infinity;
      const qMax = qValue.max ?? Infinity;
      const rValNum = Number(rValue);

      if (!isNaN(rValNum)) {
        if (rOp === "greaterThan" && qMax <= rValNum) return true; // (..10] vs > 20
        if (rOp === "lessThan" && qMin >= rValNum) return true; // [30..) vs < 20
        if (rOp === "equals" && (rValNum < qMin || rValNum > qMax)) return true;
      }
    }

    return false;
  };

  const traverseRuleTree = (node: any) => {
    if (!node) return;
    if (node.type === "predicate" && node.field) {
      if (node.field in quickFilters.value) {
        const qVal = (quickFilters.value as any)[node.field];
        if (checkValueConflict(node.field, qVal, node.operatorType, node.value)) {
          warnings.push({
            type: "规则冲突",
            message: `快捷筛选与高级规则存在冲突: [${getFieldLabel(node.field)}]`,
            fields: [node.field]
          });
        }
      }
    }
    if (node.children) {
      node.children.forEach(traverseRuleTree);
    }
  };

  if (ruleTree.value) {
    traverseRuleTree(ruleTree.value);
  }

  conflictWarnings.value = warnings;
};

// ========== 条件统计 ==========

// 快捷筛选条件数量
const quickFilterConditionsCount = computed(() => {
  let count = 0;
  const qf = quickFilters.value;
  // 基础属性
  if (qf.name) count++;
  if (qf.gender) count++;
  if (qf.ageGroup.length > 0) count++;
  if (qf.familyStatus.length > 0) count++;
  if (qf.residenceArea) count++;
  if (qf.lifecycleStatus) count++;
  if (qf.contactValidity) count++;
  if (qf.lastVisitTime) count++;
  if (qf.visits90d.min !== undefined || qf.visits90d.max !== undefined) count++;
  if (qf.annualOrderFreq.min !== undefined || qf.annualOrderFreq.max !== undefined) count++;
  if (qf.avgSpend.min !== undefined || qf.avgSpend.max !== undefined) count++;
  if (qf.accidentRepairCountIn1Year.min !== undefined || qf.accidentRepairCountIn1Year.max !== undefined) count++;
  // 客户价值
  if (qf.annualSpend.min !== undefined || qf.annualSpend.max !== undefined) count++;
  if (qf.compositeScore?.min !== undefined || qf.compositeScore?.max !== undefined) count++;
  if (qf.spendingLevel.length > 0) count++;
  if (qf.loyaltyLevel.length > 0) count++;
  // 车辆关联
  if (qf.modelLine) count++;
  if (qf.modelLines.length > 0) count++;
  if (qf.versionYear) count++;
  if (qf.carAge.min !== undefined || qf.carAge.max !== undefined) count++;
  if (qf.vin) count++;
  if (qf.licensePlate) count++;
  if (qf.vehicleAttribute) count++;
  if (qf.purchaseAttribute.length > 0) count++;
  if (qf.lastMaintenanceStore) count++;
  if (qf.lastReturnStore) count++;
  if (qf.tags.length > 0) count++;
  if (qf.totalCarPrice.min !== undefined || qf.totalCarPrice.max !== undefined) count++;
  if (qf.totalOptionPrice.min !== undefined || qf.totalOptionPrice.max !== undefined) count++;
  if (qf.afterSalesSelfPayAmount.min !== undefined || qf.afterSalesSelfPayAmount.max !== undefined) count++;
  // 客户价值分层
  if (qf.customerValueTier.length > 0) count++;
  if (qf.completedOrderCount.min !== undefined || qf.completedOrderCount.max !== undefined) count++;
  // 两年内进场
  if (qf.visitsIn2Years.min !== undefined || qf.visitsIn2Years.max !== undefined) count++;
  if (qf.selfPayAmountIn2Years.min !== undefined || qf.selfPayAmountIn2Years.max !== undefined) count++;
  if (qf.lastServiceOrderDate) count++;
  // 最后购车订单
  if (qf.lastPurchaseDeliveryDate) count++;
  return count;
});

// 规则树条件数量
const conditions = computed(() => {
  const countConditions = (node: RuleNode): number => {
    let count = 0;
    if (node.type === "predicate" && node.field) {
      count = 1;
    }
    if (node.children) {
      node.children.forEach(child => {
        count += countConditions(child);
      });
    }
    return count;
  };
  return Array(countConditions(ruleTree.value)).fill(0);
});

// 总条件数
const totalConditionsCount = computed(() => {
  return quickFilterConditionsCount.value + conditions.value.length;
});

// 是否可提交
const canSubmit = computed(() => {
  return totalConditionsCount.value > 0 && !hasConflict.value;
});

// 快捷筛选预览标签
const quickFilterPreviewTags = computed(() => {
  const tags: Array<{ label: string; conflict: boolean; field: string }> = [];
  const qf = quickFilters.value;
  const conflictFieldSet = new Set(conflictFields.value);

  // 基础属性
  if (qf.name) tags.push({ label: `姓名: ${qf.name}`, conflict: conflictFieldSet.has("name"), field: "name" });
  if (qf.gender)
    tags.push({
      label: `性别: ${qf.gender === "male" ? "男" : "女"}`,
      conflict: conflictFieldSet.has("gender"),
      field: "gender"
    });
  if (qf.ageGroup.length > 0)
    tags.push({ label: `年龄段: ${qf.ageGroup.length}项`, conflict: conflictFieldSet.has("ageGroup"), field: "ageGroup" });
  if (qf.familyStatus.length > 0)
    tags.push({
      label: `家庭状态: ${qf.familyStatus.length}项`,
      conflict: conflictFieldSet.has("familyStatus"),
      field: "familyStatus"
    });
  if (qf.residenceArea)
    tags.push({
      label: `${t("customer.listFields.residenceArea")}: ${qf.residenceArea}`,
      conflict: conflictFieldSet.has("residenceArea"),
      field: "residenceArea"
    });
  if (qf.lifecycleStatus)
    tags.push({
      label: `${t("customer.lifecycleStatus")}: ${t(`customer.lifecycleStatusOptions.${qf.lifecycleStatus}`)}`,
      conflict: conflictFieldSet.has("lifecycleStatus"),
      field: "lifecycleStatus"
    });
  if (qf.contactValidity)
    tags.push({
      label: `联系方式: ${qf.contactValidity === "verified" ? "已验证" : "未验证"}`,
      conflict: conflictFieldSet.has("contactValidity"),
      field: "contactValidity"
    });

  if (qf.lastVisitTime)
    tags.push({ label: `到店时间已选`, conflict: conflictFieldSet.has("lastVisitTime"), field: "lastVisitTime" });
  if (qf.visits90d.min !== undefined || qf.visits90d.max !== undefined) {
    tags.push({
      label: `90天到店: ${qf.visits90d.min ?? 0}-${qf.visits90d.max ?? "∞"}次`,
      conflict: conflictFieldSet.has("visits90d"),
      field: "visits90d"
    });
  }
  if (qf.annualOrderFreq.min !== undefined || qf.annualOrderFreq.max !== undefined) {
    tags.push({
      label: `年度频次: ${qf.annualOrderFreq.min ?? 0}-${qf.annualOrderFreq.max ?? "∞"}次`,
      conflict: conflictFieldSet.has("annualOrderFreq"),
      field: "annualOrderFreq"
    });
  }
  if (qf.avgSpend.min !== undefined || qf.avgSpend.max !== undefined) {
    tags.push({
      label: `平均消费: ${qf.avgSpend.min ?? 0}-${qf.avgSpend.max ?? "∞"}元`,
      conflict: conflictFieldSet.has("avgSpend"),
      field: "avgSpend"
    });
  }
  if (qf.accidentRepairCountIn1Year.min !== undefined || qf.accidentRepairCountIn1Year.max !== undefined) {
    tags.push({
      label: `最近一年事故维修: ${qf.accidentRepairCountIn1Year.min ?? 0}-${qf.accidentRepairCountIn1Year.max ?? "∞"}次`,
      conflict: conflictFieldSet.has("accidentRepairCountIn1Year"),
      field: "accidentRepairCountIn1Year"
    });
  }

  // 客户价值
  if (qf.annualSpend.min !== undefined || qf.annualSpend.max !== undefined) {
    tags.push({
      label: `${t("customerSegmentation.fields.annualSpend")}: ${qf.annualSpend.min ?? 0}-${qf.annualSpend.max ?? "∞"}元`,
      conflict: conflictFieldSet.has("annualSpend"),
      field: "annualSpend"
    });
  }
  if (qf.compositeScore?.min !== undefined || qf.compositeScore?.max !== undefined) {
    tags.push({
      label: `${t("customer.profile360.compositeScore")}: ${qf.compositeScore?.min ?? 0}-${qf.compositeScore?.max ?? "∞"}`,
      conflict: conflictFieldSet.has("compositeScore"),
      field: "compositeScore"
    });
  }
  if (qf.spendingLevel.length > 0) {
    const text = formatValueLabels(qf.spendingLevel, getSpendingLevelLabel) || `${qf.spendingLevel.length}项`;
    tags.push({
      label: `${t("customerSegmentation.fields.spendingLevel")}: ${text}`,
      conflict: conflictFieldSet.has("spendingLevel"),
      field: "spendingLevel"
    });
  }
  if (qf.loyaltyLevel.length > 0) {
    const text = formatValueLabels(qf.loyaltyLevel, getLoyaltyLevelLabel) || `${qf.loyaltyLevel.length}项`;
    tags.push({
      label: `${t("customerSegmentation.fields.loyaltyLevel")}: ${text}`,
      conflict: conflictFieldSet.has("loyaltyLevel"),
      field: "loyaltyLevel"
    });
  }
  // 车辆关联信息：车系、车型、版本/年款
  if (qf.modelLine)
    tags.push({ label: `车系: ${qf.modelLine}`, conflict: conflictFieldSet.has("modelLine"), field: "modelLine" });
  if (qf.modelLines.length > 0) {
    tags.push({
      label: `车型: ${qf.modelLines.length}项`,
      conflict: conflictFieldSet.has("modelLines"),
      field: "modelLines"
    });
  }
  if (qf.versionYear)
    tags.push({ label: `版本/年款: ${qf.versionYear}`, conflict: conflictFieldSet.has("versionYear"), field: "versionYear" });
  if (qf.carAge.min !== undefined || qf.carAge.max !== undefined) {
    tags.push({
      label: `车龄: ${qf.carAge.min ?? 0}-${qf.carAge.max ?? "∞"}年`,
      conflict: conflictFieldSet.has("carAge"),
      field: "carAge"
    });
  }
  if (qf.vin)
    tags.push({ label: `车架号: ${qf.vin}`, conflict: conflictFieldSet.has("vin"), field: "vin" });
  if (qf.licensePlate)
    tags.push({ label: `车牌号: ${qf.licensePlate}`, conflict: conflictFieldSet.has("licensePlate"), field: "licensePlate" });
  if (qf.vehicleAttribute)
    tags.push({
      label: `车辆属性: ${getVehicleAttributeLabel(qf.vehicleAttribute)}`,
      conflict: conflictFieldSet.has("vehicleAttribute"),
      field: "vehicleAttribute"
    });
  if (qf.purchaseAttribute.length > 0) {
    const text = qf.purchaseAttribute.map(getPurchaseAttributeLabel).join("、");
    tags.push({
      label: `购车属性: ${text}`,
      conflict: conflictFieldSet.has("purchaseAttribute"),
      field: "purchaseAttribute"
    });
  }
  if (qf.lastMaintenanceStore) {
    tags.push({
      label: `${t("customer.profile360.lastMaintenanceStore")}: ${getLastServiceStoreLabel(qf.lastMaintenanceStore)}`,
      conflict: conflictFieldSet.has("lastMaintenanceStore"),
      field: "lastMaintenanceStore"
    });
  }
  if (qf.lastReturnStore) {
    tags.push({
      label: `${t("customer.listFields.lastReturnStore")}: ${getLastServiceStoreLabel(qf.lastReturnStore)}`,
      conflict: conflictFieldSet.has("lastReturnStore"),
      field: "lastReturnStore"
    });
  }

  // 标签（展示已选标签名称，与 QuickFilters 选项统一）
  if (qf.tags.length > 0) {
    const tagText = formatTagLabels(qf.tags, getSegmentTagLabel) || `${qf.tags.length}项`;
    tags.push({
      label: `${t("customerSegmentation.quickFilters.tagLabel")}: ${tagText}`,
      conflict: conflictFieldSet.has("tags"),
      field: "tags"
    });
  }
  // 车价相关
  if (qf.totalCarPrice.min !== undefined || qf.totalCarPrice.max !== undefined) {
    tags.push({
      label: `总车价: ${qf.totalCarPrice.min ?? 0}-${qf.totalCarPrice.max ?? "∞"}万元`,
      conflict: conflictFieldSet.has("totalCarPrice"),
      field: "totalCarPrice"
    });
  }
  if (qf.totalOptionPrice.min !== undefined || qf.totalOptionPrice.max !== undefined) {
    tags.push({
      label: `选配总价: ${qf.totalOptionPrice.min ?? 0}-${qf.totalOptionPrice.max ?? "∞"}万元`,
      conflict: conflictFieldSet.has("totalOptionPrice"),
      field: "totalOptionPrice"
    });
  }
  if (qf.afterSalesSelfPayAmount.min !== undefined || qf.afterSalesSelfPayAmount.max !== undefined) {
    tags.push({
      label: `售后自费: ${qf.afterSalesSelfPayAmount.min ?? 0}-${qf.afterSalesSelfPayAmount.max ?? "∞"}元`,
      conflict: conflictFieldSet.has("afterSalesSelfPayAmount"),
      field: "afterSalesSelfPayAmount"
    });
  }

  // 客户价值分层
  if (qf.customerValueTier.length > 0) {
    const tierText = formatValueLabels(qf.customerValueTier, getCustomerValueTierLabel) || `${qf.customerValueTier.length}项`;
    tags.push({
      label: `${t("customerSegmentation.fields.customerValueTier")}: ${tierText}`,
      conflict: conflictFieldSet.has("customerValueTier"),
      field: "customerValueTier"
    });
  }

  if (qf.completedOrderCount.min !== undefined || qf.completedOrderCount.max !== undefined) {
    tags.push({
      label: `已成交订单: ${qf.completedOrderCount.min ?? 0}-${qf.completedOrderCount.max ?? "∞"}单`,
      conflict: conflictFieldSet.has("completedOrderCount"),
      field: "completedOrderCount"
    });
  }

  // 两年内进场
  if (qf.visitsIn2Years.min !== undefined || qf.visitsIn2Years.max !== undefined) {
    tags.push({
      label: `两年内进场: ${qf.visitsIn2Years.min ?? 0}-${qf.visitsIn2Years.max ?? "∞"}次`,
      conflict: conflictFieldSet.has("visitsIn2Years"),
      field: "visitsIn2Years"
    });
  }
  if (qf.selfPayAmountIn2Years.min !== undefined || qf.selfPayAmountIn2Years.max !== undefined) {
    tags.push({
      label: `两年内自费: ${qf.selfPayAmountIn2Years.min ?? 0}-${qf.selfPayAmountIn2Years.max ?? "∞"}元`,
      conflict: conflictFieldSet.has("selfPayAmountIn2Years"),
      field: "selfPayAmountIn2Years"
    });
  }
  if (qf.lastServiceOrderDate) {
    tags.push({
      label: `最近进店订单: 已选`,
      conflict: conflictFieldSet.has("lastServiceOrderDate"),
      field: "lastServiceOrderDate"
    });
  }

  // 最后购车订单
  if (qf.lastPurchaseDeliveryDate) {
    tags.push({
      label: `最后购车交车: 已选`,
      conflict: conflictFieldSet.has("lastPurchaseDeliveryDate"),
      field: "lastPurchaseDeliveryDate"
    });
  }

  return tags;
});

// 规则负载
const rulePayload = computed(() => {
  const hasQuickFilters = quickFilterConditionsCount.value > 0;
  const hasRuleTree = ruleTree.value.children && ruleTree.value.children.length > 0;

  if (!hasQuickFilters && !hasRuleTree) {
    return null;
  }
  // 类型转换，确保符合 RuleConfig 类型
  return { root: ruleTree.value as any, quickFilters: quickFilters.value } as any;
});

// 防抖定时器
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let timeoutTimer: ReturnType<typeof setTimeout> | null = null;

// 防抖预估
const handleEstimateDebounced = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    handleEstimate();
  }, 1000); // 1秒防抖
};

// 预估人数
const handleEstimate = async () => {
  // 先进行冲突检测
  detectConflicts();

  if (!rulePayload.value) {
    estimateResult.value = null;
    return;
  }

  estimateLoading.value = true;
  isCalculationTimeout.value = false;

  // 设置超时检测
  if (timeoutTimer) {
    clearTimeout(timeoutTimer);
  }
  timeoutTimer = setTimeout(() => {
    if (estimateLoading.value) {
      isCalculationTimeout.value = true;
    }
  }, 20000); // 20秒超时

  try {
    // 使用 mock 数据
    const mockData = await import("@/assets/json/customerSegmentationMockData.json");
    if (mockData.default?.estimate?.data) {
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      estimateResult.value = mockData.default.estimate.data;
      // 模拟变化数据
      changeFromLast.value = mockData.default.estimate.data.changeFromLast || null;
      return;
    }
    const res = await estimateCount(rulePayload.value);
    estimateResult.value = res.data;
  } catch (error) {
    console.error("预估失败:", error);
    // Mock fallback - 如果有冲突，返回0
    if (hasConflict.value) {
      estimateResult.value = {
        estimatedCount: 0,
        estimatedRate: "0%"
      };
    } else {
      const mockData = await import("@/assets/json/customerSegmentationMockData.json");
      if (mockData.default?.estimate?.data) {
        estimateResult.value = mockData.default.estimate.data;
        changeFromLast.value = mockData.default.estimate.data.changeFromLast || null;
      } else {
        estimateResult.value = {
          estimatedCount: Math.floor(Math.random() * 50000) + 1000,
          estimatedRate: (Math.random() * 10).toFixed(2) + "%"
        };
      }
    }
  } finally {
    estimateLoading.value = false;
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
    }
  }
};

// 快捷筛选变化
const handleQuickFilterChange = () => {
  detectConflicts();
  handleEstimateDebounced();
};

// 同步快捷筛选到规则树
const handleSyncToRuleTree = () => {
  ElMessage.info("漏斗筛选条件已同步到自定义筛选视图");
  // 这里可以实现将快捷筛选转换为规则树节点的逻辑
};

// 刷新样本
const handleRefreshSample = () => {
  // InsightPanel 内部处理
};

// 重置
const handleReset = () => {
  ElMessageBox.confirm("确认重置？所有筛选条件将被清空", "提示", { type: "warning" })
    .then(() => {
      quickFilters.value = getInitialFilterForm();
      ruleTree.value = {
        id: "root",
        type: "group",
        operator: "AND",
        children: []
      };
      // 强制重新渲染 RuleBuilder 组件以清空内部状态
      ruleBuilderKey.value++;
      form.name = "";
      form.description = "";
      form.businessReason = "";
      form.validityPeriod = undefined;
      estimateResult.value = null;
      changeFromLast.value = null;
      conflictWarnings.value = [];
      formRef.value?.clearValidate();
      ElMessage.success("已重置");
    })
    .catch(error => {
      console.warn("Reset canceled or failed:", error);
    });
};

// 导出
const handleExport = async () => {
  if (!rulePayload.value) {
    ElMessage.warning(t("customerSegmentation.messages.ruleRequired"));
    return;
  }

  exporting.value = true;
  try {
    // 使用 mock 数据模拟导出
    await import("@/assets/json/customerSegmentationMockData.json");
    await new Promise(resolve => setTimeout(resolve, 1500));
    ElMessage.success(t("customerSegmentation.messages.exportSuccess"));
    // 记录审计日志
    console.log("Export audit log:", {
      timestamp: new Date(),
      rulePayload: rulePayload.value,
      estimatedCount: estimateResult.value?.estimatedCount || 0
    });
  } catch (error) {
    ElMessage.error("导出失败");
  } finally {
    exporting.value = false;
  }
};

// 保存分群
const handleSaveSegment = () => {
  if (!rulePayload.value) {
    ElMessage.warning(t("customerSegmentation.messages.ruleRequired"));
    return;
  }
  if (hasConflict.value) {
    ElMessage.warning("存在逻辑冲突，请先解决冲突后再保存");
    return;
  }
  ElMessageBox.prompt("请输入分群名称", "保存为分群", {
    confirmButtonText: "保存",
    cancelButtonText: "取消",
    inputPattern: /\S+/,
    inputErrorMessage: "请输入有效的分群名称"
  }).then(async ({ value }) => {
    form.name = value;
    try {
      // 模拟直接保存
      await new Promise(resolve => setTimeout(resolve, 1000));
      ElMessage.success("保存成功");
    } catch (error) {
      ElMessage.error("保存失败");
    }
  });
};

// 加载字段选项
const loadFieldOptions = async () => {
  try {
    // 使用 mock 数据
    const mockData = await import("@/assets/json/customerSegmentationMockData.json");
    if (mockData.default?.fieldOptions?.data) {
      fieldOptions.value = mockData.default.fieldOptions.data as CustomerSegmentation.FieldOption[];
      return;
    }
    const res = await getFieldOptions();
    fieldOptions.value = res.data || [];
  } catch (error) {
    console.error("加载字段选项失败:", error);
    // Mock fallback
    const mockData = await import("@/assets/json/customerSegmentationMockData.json");
    if (mockData.default?.fieldOptions?.data) {
      fieldOptions.value = mockData.default.fieldOptions.data as CustomerSegmentation.FieldOption[];
      return;
    }
    fieldOptions.value = [
      {
        field: "ageGroup",
        label: "年龄段",
        operators: ["equals", "notEquals", "belongsTo"],
        inputType: "select",
        options: [
          { label: "18-25", value: "18-25" },
          { label: "26-35", value: "26-35" },
          { label: "36-45", value: "36-45" },
          { label: "46-55", value: "46-55" },
          { label: "55+", value: "55+" }
        ]
      },
      {
        field: "gender",
        label: "性别",
        operators: ["equals"],
        inputType: "radio",
        options: [
          { label: "男", value: "male" },
          { label: "女", value: "female" }
        ]
      },
      { field: "residenceArea", label: "居住区域", operators: ["equals"], inputType: "select" },
      { field: "lifecycleStatus", label: "OneID状态", operators: ["equals"], inputType: "select" },
      { field: "compositeScore", label: "价值综合评分", operators: ["between", "greaterThan", "lessThan"], inputType: "numberrange" },
      { field: "carAge", label: "车龄", operators: ["equals", "greaterThan", "lessThan", "between"], inputType: "numberrange" },
      { field: "annualSpend", label: "年均消费", operators: ["greaterThan", "lessThan", "between"], inputType: "numberrange" },
      { field: "lastVisit", label: "最近到店时间", operators: ["before", "after", "between"], inputType: "daterange" },
      { field: "systemTag", label: "系统标签", operators: ["contains", "notContains", "allMatch"], inputType: "tagselect" },
      { field: "existingSegment", label: "所属分群", operators: ["belongsTo", "notBelongsTo"], inputType: "select" },
      {
        field: "totalCarPrice",
        label: "总车价",
        operators: ["between", "greaterThan", "lessThan"],
        inputType: "numberrange",
        unit: "万元"
      },
      {
        field: "totalOptionPrice",
        label: "选配总价",
        operators: ["between", "greaterThan", "lessThan"],
        inputType: "numberrange",
        unit: "万元"
      },
      {
        field: "afterSalesSelfPayAmount",
        label: "售后自费金额",
        operators: ["between", "greaterThan", "lessThan"],
        inputType: "numberrange",
        unit: "元"
      },
      {
        field: "accidentRepairCountIn1Year",
        label: "最近一年事故维修次数",
        operators: ["between", "greaterThan", "lessThan"],
        inputType: "numberrange",
        unit: "次"
      },
      {
        field: "lastMaintenanceStore",
        label: "最近一次保养门店",
        operators: ["equals"],
        inputType: "select"
      },
      {
        field: "lastReturnStore",
        label: "最后一次返厂门店",
        operators: ["equals"],
        inputType: "select"
      },
      {
        field: "customerValueTier",
        label: "客户价值分层",
        operators: ["equals", "belongsTo"],
        inputType: "checkbox",
        options: [
          { label: "钻石", value: "diamond" },
          { label: "白金", value: "platinum" },
          { label: "黄金", value: "gold" },
          { label: "白银", value: "silver" }
        ]
      },
      {
        field: "modelLines",
        label: "车型（多选）",
        operators: ["belongsTo", "notBelongsTo", "contains"],
        inputType: "select",
        multiple: true
      },
      {
        field: "completedOrderCount",
        label: "已成交订单数",
        operators: ["between", "greaterThan", "lessThan", "equals"],
        inputType: "numberrange",
        unit: "单"
      },
      {
        field: "visitsIn2Years",
        label: "两年内进场次数",
        operators: ["between", "greaterThan", "lessThan"],
        inputType: "numberrange",
        unit: "次"
      },
      {
        field: "selfPayAmountIn2Years",
        label: "两年内自费金额",
        operators: ["between", "greaterThan", "lessThan"],
        inputType: "numberrange",
        unit: "元"
      },
      {
        field: "lastServiceOrderDate",
        label: "最近进店订单日期",
        operators: ["before", "after", "between"],
        inputType: "daterange"
      },
      {
        field: "lastPurchaseDeliveryDate",
        label: "最后购车订单交车日期",
        operators: ["before", "after", "between"],
        inputType: "daterange"
      }
    ] as CustomerSegmentation.FieldOption[];
  }
};

// 清空所有条件（用于切换 tab 时）
const clearAllConditions = () => {
  quickFilters.value = getInitialFilterForm();
  ruleTree.value = {
    id: "root",
    type: "group",
    operator: "AND",
    children: []
  };
  // 强制重新渲染 RuleBuilder 组件以清空内部状态
  ruleBuilderKey.value++;
  form.name = "";
  form.description = "";
  form.businessReason = "";
  form.validityPeriod = undefined;
  estimateResult.value = null;
  changeFromLast.value = null;
  conflictWarnings.value = [];
  formRef.value?.clearValidate();
};

// 监听筛选模式变化，切换时清空条件
watch(filterMode, (newMode, oldMode) => {
  // 只在模式真正改变时清空（避免初始化时触发）
  if (oldMode !== undefined && newMode !== oldMode) {
    clearAllConditions();
  }
});

// 监听快捷筛选变化，同步检测冲突
watch(
  quickFilters,
  () => {
    detectConflicts();
  },
  { deep: true }
);

onMounted(() => {
  loadFieldOptions();
});

onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  if (timeoutTimer) {
    clearTimeout(timeoutTimer);
  }
});
</script>

<style scoped lang="scss">
.segmentation-builder {
  min-height: 100vh;
  padding-bottom: 100px; // 增加底部内边距，避免被操作栏遮挡
  background-color: var(--el-bg-color-page);

  // 小屏响应式
  @media (width <= 768px) {
    padding-bottom: 120px; // 小屏时进一步增加，防止按钮换行后遮挡
  }

  // 页面头部
  .page-header {
    padding: 20px 24px;
    margin-bottom: 0;
    background: #ffffff;
    border-bottom: 1px solid #e4e7ed;
    border-radius: 8px;
    .header-content {
      display: flex;
      gap: 24px;
      align-items: center;
      justify-content: space-between;
      max-width: 1800px;
      margin: 0 auto;
      .title-section {
        flex: 1;
        min-width: 0;
        .page-title {
          margin: 0 0 4px;
          font-size: 20px;
          font-weight: 600;
          line-height: 28px;
          color: #303133;
        }
        .page-subtitle {
          font-size: 14px;
          line-height: 20px;
          color: #909399;
        }
      }
      .mode-switch {
        flex-shrink: 0;
        :deep(.el-segmented) {
          height: 40px;
          .el-segmented__item {
            height: 40px;
            padding: 0 20px;
            font-size: 14px;
            font-weight: 500;
            line-height: 40px;
          }
        }
      }
    }

    // 小屏响应式
    @media (width <= 768px) {
      padding: 16px;
      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
        .title-section {
          width: 100%;
        }
        .mode-switch {
          width: 100%;
          :deep(.el-segmented) {
            width: 100%;
            height: 36px;
            .el-segmented__item {
              flex: 1;
              height: 36px;
              padding: 0 12px;
              font-size: 13px;
              line-height: 36px;
            }
          }
        }
      }
    }
  }

  // 冲突警告横幅
  .conflict-banner {
    padding: 16px 0;
    margin: 0 auto;
    .conflict-title {
      display: flex;
      gap: 6px;
      align-items: center;
      font-weight: 600;
    }
    .conflict-list {
      margin-top: 8px;
      .conflict-item {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 4px;
        font-size: 13px;
      }
    }
  }

  // 主内容区
  .main-content {
    display: flex;
    gap: 24px;
    padding: 24px 0;
    padding-bottom: 24px; // 明确底部内边距

    // max-width: 1800px;
    margin: 0 auto;

    // 小屏响应式
    @media (width <= 768px) {
      flex-direction: column;
      gap: 16px;
      padding: 16px;
      padding-bottom: 16px;
    }

    // 左侧面板 (70%)
    .left-panel {
      flex: 7;
      min-width: 0;
      .rule-builder-card {
        margin-bottom: 20px;
        border: none;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
        :deep(.el-card__header) {
          padding: 16px 24px;
          background-color: var(--el-bg-color);
          border-bottom: 1px solid var(--el-border-color-light);
        }
        :deep(.el-card__body) {
          padding: 24px;
        }
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          .header-left {
            display: flex;
            gap: 8px;
            align-items: center;
            .header-icon {
              font-size: 18px;
              color: var(--el-color-primary);
            }
            .card-title {
              font-size: 16px;
              font-weight: 600;
              color: var(--el-text-color-primary);
            }
            .sync-tag {
              display: flex;
              gap: 4px;
              align-items: center;
            }
          }
          .header-right {
            display: flex;
            gap: 12px;
            align-items: center;
          }
        }
        .quick-filter-preview {
          padding: 12px 16px;
          margin-bottom: 16px;
          background-color: var(--el-color-success-light-9);
          border: 1px solid var(--el-color-success-light-8);
          border-radius: 8px;
          .preview-header {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
            margin-bottom: 8px;
            font-size: 13px;
            font-weight: 500;
            color: var(--el-color-success);
            .conflict-indicator {
              display: flex;
              gap: 4px;
              align-items: center;
              margin-left: auto;
            }
          }
          .preview-tags {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 8px;
            align-items: start;
            .condition-tag {
              box-sizing: border-box;
              display: inline-flex;
              align-items: center;
              justify-content: flex-start;
              width: 100%;
              height: auto;
              min-height: 28px;
              padding: 6px 10px;
              font-size: 12px;
              hyphens: auto;
              line-height: 1.5;
              text-align: left;
              word-break: break-word;

              // 确保标签内容完整显示
              overflow-wrap: break-word;
              white-space: normal;
            }
          }
        }
      }
    }

    // 右侧面板 (30%)
    .right-panel {
      flex: 3;
      min-width: 320px;
      max-width: 420px;

      // 小屏响应式
      @media (width <= 768px) {
        min-width: 100%;
        max-width: 100%;
      }
      .insight-card {
        position: sticky;
        top: 20px;
        overflow: hidden;
        border: none;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgb(0 0 0 / 10%);

        // 小屏时取消 sticky，避免布局问题
        @media (width <= 768px) {
          position: relative;
          top: 0;
        }
        :deep(.el-card__header) {
          padding: 16px 20px;
          color: var(--el-color-primary);
          background-color: var(--el-color-primary-light-9);
          border-bottom: 1px solid var(--el-color-primary-light-8);
        }
        :deep(.el-card__body) {
          max-height: calc(100vh - 200px);
          padding: 20px;
          overflow-y: auto;

          // 小屏时调整最大高度
          @media (width <= 768px) {
            max-height: none;
          }
        }
        .card-header {
          display: flex;
          gap: 8px;
          align-items: center;
          .header-icon {
            font-size: 18px;
            color: var(--el-color-primary);
            &.pulse {
              animation: pulse 2s ease-in-out infinite;
            }
          }
          .card-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--el-color-primary);
          }
          .conflict-tag {
            margin-left: auto;
          }
        }
        .zero-result-alert {
          margin-bottom: 16px;
        }
      }
    }
  }

  // 底部操作栏
  .action-bar {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 100;
    background-color: white;
    border-top: 1px solid #e5e7eb;
    box-shadow: 0 -4px 12px rgb(0 0 0 / 8%);
    .action-bar-content {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1800px;
      min-height: 72px; // 确保最小高度，防止内容被压缩
      padding: 16px 32px;
      margin: 0 auto;
      .left-actions,
      .right-actions {
        display: flex;
        flex-wrap: wrap; // 允许换行，但优先保持单行
        gap: 12px;
        align-items: center;
      }
      .conditions-count {
        font-size: 13px;
      }

      // 小屏响应式
      @media (width <= 768px) {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
        min-height: auto;
        padding: 12px 16px;
        .left-actions,
        .right-actions {
          gap: 8px;
          justify-content: space-between;
          width: 100%;
        }
        .right-actions {
          :deep(.el-button) {
            flex: 1; // 按钮平均分配宽度
            min-width: 0; // 允许缩小
          }
        }
      }

      // 超小屏
      @media (width <= 480px) {
        gap: 8px;
        padding: 12px;
        .left-actions {
          flex-wrap: wrap;
        }
        .conditions-count {
          width: 100%;
          margin-top: 4px;
          text-align: center;
        }
      }
    }
  }
}

// 脉冲动画
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
