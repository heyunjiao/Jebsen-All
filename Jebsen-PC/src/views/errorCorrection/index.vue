<template>
  <div class="error-correction table-box">
    <!-- 统计面板 -->
    <el-card shadow="never" class="stats-panel-card">
      <div class="header-content">
        <StatsPanel :stats="pageStats" />
      </div>
    </el-card>

    <!-- 一级导航 (L1) - PageHeader -->
    <div class="page-header">
      <el-tabs v-model="activeStatusTab" class="l1-tabs" @tab-change="handleStatusTabChange">
        <el-tab-pane :label="t('errorCorrection.tabs.pending')" />
        <el-tab-pane :label="t('errorCorrection.tabs.processed')" />
      </el-tabs>
    </div>

    <!-- 二级筛选 (L2) - 灰色内容区 -->
    <div class="content-area">
      <el-card shadow="never" class="table-card">
        <!-- 二级筛选器 -->
        <div class="l2-filter-wrapper">
          <el-radio-group v-model="activeErrorType" class="l2-segmented" @change="handleErrorTypeChange">
            <el-radio-button value="all">
              <span>{{ t("errorCorrection.errorType.all") }}</span>
              <el-badge :value="errorTypeCounts.all" :max="99" class="filter-badge" />
            </el-radio-button>
            <el-radio-button value="h5Feedback">
              <span>人工反馈</span>
              <el-badge :value="errorTypeCounts.h5Feedback" :max="99" class="filter-badge" type="warning" />
            </el-radio-button>
            <el-radio-button value="validity">
              <span>{{ t("errorCorrection.taxonomy.validity.name") }}</span>
              <el-badge :value="errorTypeCounts.validity" :max="99" class="filter-badge" type="warning" />
            </el-radio-button>
            <el-radio-button value="uniqueness">
              <span>{{ t("errorCorrection.taxonomy.uniqueness.name") }}</span>
              <el-badge :value="errorTypeCounts.uniqueness" :max="99" class="filter-badge" type="danger" />
            </el-radio-button>
            <el-radio-button value="completeness">
              <span>{{ t("errorCorrection.taxonomy.completeness.name") }}</span>
              <el-badge :value="errorTypeCounts.completeness" :max="99" class="filter-badge" type="info" />
            </el-radio-button>
          </el-radio-group>
        </div>

        <ProTable
          ref="tableRef"
          :key="`table-${activeErrorType}`"
          row-key="id"
          :border="true"
          :request-api="fetchTaskList"
          :columns="columns"
          :tool-button="['refresh', 'setting', 'search']"
          @selection-change="handleSelectionChange"
        >
          <!-- 表格 header 按钮 -->
          <template #tableHeader> </template>
        </ProTable>
      </el-card>
    </div>

    <!-- 身份冲突解决工作台 (Mode A) - 保持不变 -->
    <MergeWorkbenchDialog
      v-model:visible="mergeDialogVisible"
      :task="currentMergeTask"
      :user-role="userRole"
      @split="handleSplit"
      @submit="handleSubmit"
      @save-draft="handleSaveDraft"
      @confirm-merge="handleConfirmMerge"
      @ignore="handleTaskIgnore"
      @close="handleMergeClose"
    />

    <!-- 数据质量快速编辑 (Mode B) -->
    <QuickEditDialog
      v-model:visible="quickEditVisible"
      :task="currentQuickEditTask"
      @save="handleQuickEditSave"
      @ignore="handleTaskIgnore"
    />

    <!-- 同步失败重试 (Mode C) -->
    <SyncRetryDialog v-model:visible="syncRetryVisible" :task="currentSyncTask" @retry-success="handleSyncRetrySuccess" />

    <!-- H5 提交的数据纠错反馈 (Mode D) -->
    <FeedbackResolutionDrawer
      v-model:visible="feedbackDrawerVisible"
      :task="currentFeedbackTask"
      @close="handleFeedbackClose"
      @reject="handleFeedbackReject"
      @confirm="handleFeedbackConfirm"
    />

    <!-- 移动端模拟区域 - 保持不变 -->
    <div v-if="showMobile" class="mobile-overlay">
      <div class="exit-bar">
        <el-button type="info" round size="small" :icon="Close" @click="showMobile = false">{{
          t("errorCorrection.exitDemo")
        }}</el-button>
      </div>
      <div class="mobile-title">
        <h3>
          <el-icon><ChatDotSquare /></el-icon> {{ t("errorCorrection.weComSidebar") }}
        </h3>
      </div>
      <div class="mobile-frame">
        <div class="m-header">
          <el-icon @click="showMobile = false"><ArrowLeft /></el-icon>
          <span>{{ t("errorCorrection.customerProfile") }}</span>
          <el-icon @click="openMobileMenu"><More /></el-icon>
        </div>
        <div class="profile">
          <el-avatar :size="60" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
          <div class="profile-name" @click="editName">
            {{ mobileData.name }}
            <el-icon class="ml-4" color="#1890ff"><EditPen /></el-icon>
          </div>
          <div class="profile-id">ID: {{ mobileData.id }}</div>
          <!-- 手机号展示区域 -->
          <div class="profile-phone-section">
            <div class="phone-header">
              <span class="phone-label">{{ t("errorCorrection.mobile.phoneNumber") }}</span>
              <el-button text type="primary" size="small" @click="openPhoneDialog">
                <el-icon><EditPen /></el-icon>
                {{ t("errorCorrection.mobile.editPhone") }}
              </el-button>
            </div>
            <div v-if="mobileData.phoneConflict" class="phone-conflict-alert">
              <el-icon color="#909399"><Warning /></el-icon>
              <span>{{ t("errorCorrection.mobile.phoneConflict") }}</span>
            </div>
            <div class="phone-list">
              <div
                v-for="(phone, index) in mobileData.phones"
                :key="index"
                class="phone-item"
                :class="{ primary: phone.isPrimary, conflict: phone.hasConflict }"
              >
                <div class="phone-info">
                  <span class="phone-number">{{ phone.number }}</span>
                  <span class="phone-source">{{ phone.source }}</span>
                  <el-tag v-if="phone.isPrimary" size="small" type="success" class="phone-tag">
                    {{ t("errorCorrection.mobile.phonePrimary") }}
                  </el-tag>
                  <el-tag v-if="phone.hasConflict" size="small" type="danger" class="phone-tag">
                    {{ t("errorCorrection.mobile.phoneConflict") }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
          <!-- 服务偏好 -->
          <div class="profile-preference">
            <div class="preference-title">{{ t("errorCorrection.servicePreference") }}</div>
            <div class="preference">
              <span
                v-for="(pref, index) in preferencesWithTranslation"
                :key="index"
                :class="['m-tag', 'm-tag-blue', { active: pref.selected }]"
                @click="togglePreference(pref)"
              >
                {{ pref.name }}
              </span>
            </div>
          </div>
          <!-- 标签展示区域 -->
          <div class="profile-tags">
            <div class="tags-title">{{ t("errorCorrection.mobile.myTags") }}</div>
            <div class="tags-list">
              <span
                v-for="(tag, index) in availableTags"
                :key="index"
                :class="['m-tag', `m-tag-${tag.color}`, { active: tag.selected }]"
                @click="toggleTag(tag)"
              >
                {{ tag.icon }} {{ tag.name }}
              </span>
            </div>
          </div>
        </div>
        <div class="m-tabs">
          <div class="m-tab-item" :class="{ active: activeTab === '360' }" @click="activeTab = '360'">
            <span class="tab-text">{{ t("errorCorrection.fullView") }}</span>
          </div>
          <div class="m-tab-item" :class="{ active: activeTab === 'timeline' }" @click="activeTab = 'timeline'">
            <span class="tab-text">{{ t("errorCorrection.interactionTimeline") }}</span>
          </div>
          <div class="m-tab-item" :class="{ active: activeTab === 'opp' }" @click="activeTab = 'opp'">
            <span class="tab-text">{{ t("errorCorrection.opportunities") }}</span>
            <span class="tab-count">2</span>
          </div>
          <div class="m-tab-item" :class="{ active: activeTab === 'conflicts' }" @click="activeTab = 'conflicts'">
            <span class="tab-text">{{ t("errorCorrection.mobile.dataConflict") }}</span>
            <el-badge v-if="otherConflictsCount > 0" :value="otherConflictsCount" :max="99" class="tab-badge" />
          </div>
        </div>
        <div class="m-body">
          <div v-if="activeTab === '360'">
            <div class="m-card" @click="showStatDetail">
              <div class="m-grid">
                <div class="m-stat-item">
                  <div class="m-stat-num money-font">¥177k</div>
                  <div class="m-stat-desc">{{ t("errorCorrection.totalConsumption") }}</div>
                </div>
                <div class="m-stat-item">
                  <div class="m-stat-num highlight">12{{ t("errorCorrection.mobile.times") }}</div>
                  <div class="m-stat-desc">{{ t("errorCorrection.visitFrequency") }}</div>
                </div>
              </div>
            </div>
            <div class="m-card" @click="showCarDetail">
              <div class="m-card-title">
                <span>{{ t("errorCorrection.myVehicles") }} (1)</span>
                <span class="m-tag m-tag-blue">{{ t("errorCorrection.certifiedOwner") }}</span>
              </div>
              <div class="car-main">
                <div>
                  <div class="car-name">{{ mobileData.car }}</div>
                  <div class="car-plate">{{ mobileData.plate }}</div>
                  <div class="car-vin">VIN: {{ mobileData.vin }}</div>
                </div>
                <img src="https://img.icons8.com/color/96/porsche.png" class="car-img" />
              </div>
              <div class="car-footer">
                <span>{{ t("errorCorrection.currentMileage") }}: 147,275km</span>
                <span class="danger">{{ t("errorCorrection.outOfWarranty") }}</span>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'timeline'">
            <div class="m-timeline">
              <div class="m-timeline-item active" @click="showTimelineDetail(t('errorCorrection.mobile.repairAtStore'))">
                <div class="m-time">2025-06-06 14:30</div>
                <div class="m-content">
                  {{ t("errorCorrection.mobile.repairAtStore") }} - {{ t("errorCorrection.mobile.changeTire") }}
                </div>
                <div class="m-sub">SA: Kevin | {{ t("errorCorrection.mobile.consumption") }} ¥2,317</div>
              </div>
              <div class="m-timeline-item" @click="showTimelineDetail(t('errorCorrection.mobile.wechatChat'))">
                <div class="m-time">2025-05-20 10:00</div>
                <div class="m-content">
                  {{ t("errorCorrection.mobile.wechatChat") }} - {{ t("errorCorrection.mobile.askMaintenance") }}
                </div>
                <div class="m-sub">BDC: Alice | {{ t("errorCorrection.mobile.duration") }} 5min</div>
              </div>
              <div class="m-timeline-item" @click="showTimelineDetail(t('errorCorrection.mobile.routineMaintenance'))">
                <div class="m-time">2025-01-15 09:00</div>
                <div class="m-content">
                  {{ t("errorCorrection.mobile.routineMaintenance") }} ({{ t("errorCorrection.mobile.changeTire") }})
                </div>
                <div class="m-sub">SA: Kevin | {{ t("errorCorrection.mobile.satisfaction") }} 5星</div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'opp'">
            <div class="m-card warning-card">
              <div class="m-card-title">
                <span>🔥 {{ t("errorCorrection.highIntent") }}：{{ t("errorCorrection.airConditioningCleaning") }}</span>
                <span class="time-label">{{ t("errorCorrection.justNow") }}</span>
              </div>
              <div class="m-card-desc">{{ t("errorCorrection.mobile.systemDetectSummer") }}</div>
              <el-button type="danger" plain size="small" :loading="pushLoading" @click="handlePushCoupon">{{
                t("errorCorrection.mobile.pushCoupon")
              }}</el-button>
            </div>
            <div class="m-card info-card">
              <div class="m-card-title">
                <span>{{ t("errorCorrection.mobile.insuranceReminder") }}</span>
                <span class="time-label">{{ t("errorCorrection.mobile.daysAgo", { count: 3 }) }}</span>
              </div>
              <div class="m-card-desc">{{ t("errorCorrection.mobile.expireSoon") }}</div>
              <el-button type="warning" plain size="small" @click="handleFollowUp">{{
                t("errorCorrection.mobile.followQuote")
              }}</el-button>
            </div>
          </div>

          <!-- 数据冲突Tab -->
          <div v-if="activeTab === 'conflicts'">
            <div v-if="otherConflicts.length === 0" class="empty-conflicts">
              <el-empty :description="t('errorCorrection.mobile.noConflicts')" :image-size="100" />
            </div>
            <div v-else>
              <div class="conflict-readonly-tip">
                <el-icon color="#909399"><InfoFilled /></el-icon>
                <span>{{ t("errorCorrection.mobile.conflictReadonlyTip") }}</span>
              </div>
              <div
                v-for="(conflict, index) in otherConflicts"
                :key="index"
                class="m-card conflict-detail-card readonly"
                @click="showConflictDetail(conflict)"
              >
                <div class="conflict-card-header">
                  <div class="conflict-icon-wrapper">
                    <el-icon color="#909399" :size="20"><Warning /></el-icon>
                  </div>
                  <div class="conflict-card-content">
                    <div class="conflict-field-name">{{ conflict.fieldName }}</div>
                    <div class="conflict-current-value-text">
                      {{ t("errorCorrection.mobile.currentValue") }}: {{ conflict.currentValue }}
                    </div>
                  </div>
                </div>
                <div class="conflict-sources-list">
                  <div v-for="(source, sIndex) in conflict.sources" :key="sIndex" class="conflict-source-item">
                    <span class="source-label">{{ source.system }}:</span>
                    <span class="source-value">{{ source.value }}</span>
                  </div>
                </div>
                <div class="conflict-view-only">
                  <el-icon><View /></el-icon>
                  <span>{{ t("errorCorrection.mobile.viewOnly") }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <template v-if="sheetVisible">
          <div class="mobile-mask" @click.stop="closeMobileMenu"></div>
          <div class="mobile-action-sheet show" @click.stop>
            <div class="action-item" @click="sheetAction('addTag')">{{ t("errorCorrection.mobile.addTag") }}</div>
            <div class="action-item" @click="sheetAction('share')">{{ t("errorCorrection.mobile.shareCard") }}</div>
            <div class="action-item" @click="sheetAction('report')">{{ t("errorCorrection.mobile.feedback") }}</div>
            <div class="action-item cancel" @click="closeMobileMenu">{{ t("errorCorrection.mobile.cancel") }}</div>
          </div>
        </template>

        <el-dialog
          v-model="mobileTicketVisible"
          :title="t('errorCorrection.mobile.newTicket')"
          width="320px"
          append-to-body
          top="20vh"
          :close-on-click-modal="false"
        >
          <el-form label-position="top" size="small">
            <el-form-item :label="t('errorCorrection.mobile.ticketType')">
              <el-select :value="t('errorCorrection.mobile.repair')" style="width: 100%">
                <el-option :value="t('errorCorrection.mobile.repair')" :label="t('errorCorrection.mobile.repair')" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('errorCorrection.mobile.remark')">
              <el-input type="textarea" :rows="2" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button size="small" @click="mobileTicketVisible = false">{{ t("errorCorrection.mobile.cancel") }}</el-button>
            <el-button size="small" type="primary" @click="submitTicket">{{ t("errorCorrection.mobile.submit") }}</el-button>
          </template>
        </el-dialog>

        <!-- 手机号编辑对话框 -->
        <el-dialog
          v-model="phoneDialogVisible"
          :title="t('errorCorrection.mobile.editPhone')"
          width="320px"
          append-to-body
          top="20vh"
          :close-on-click-modal="false"
        >
          <div class="phone-dialog-content">
            <!-- 手机号列表 -->
            <div class="phone-list-section">
              <div class="section-title">{{ t("errorCorrection.mobile.phoneList") }}</div>
              <div
                v-for="(phone, index) in mobileData.phones"
                :key="index"
                class="phone-item-dialog"
                :class="{ primary: phone.isPrimary, conflict: phone.hasConflict }"
              >
                <div class="phone-item-info">
                  <div class="phone-number-dialog">{{ phone.number }}</div>
                  <div class="phone-meta">
                    <span class="phone-source-dialog">{{ phone.source }}</span>
                    <el-tag v-if="phone.isPrimary" size="small" type="success">{{
                      t("errorCorrection.mobile.phonePrimary")
                    }}</el-tag>
                    <el-tag v-if="phone.hasConflict" size="small" type="danger">{{
                      t("errorCorrection.mobile.phoneConflict")
                    }}</el-tag>
                  </div>
                </div>
                <div class="phone-actions">
                  <el-button v-if="!phone.isPrimary" text type="primary" size="small" @click="setPrimaryPhone(phone)">
                    {{ t("errorCorrection.mobile.setAsPrimary") }}
                  </el-button>
                  <el-button text type="danger" size="small" @click="deletePhone(phone)">
                    {{ t("errorCorrection.mobile.delete") }}
                  </el-button>
                </div>
              </div>
            </div>
            <!-- 添加手机号表单 -->
            <div class="add-phone-section">
              <div class="section-title">{{ t("errorCorrection.mobile.addPhone") }}</div>
              <el-form label-position="top" size="small">
                <el-form-item :label="t('errorCorrection.mobile.phoneNumber')">
                  <el-input
                    v-model="phoneForm.number"
                    :placeholder="t('errorCorrection.mobile.phoneValidation')"
                    maxlength="11"
                  />
                </el-form-item>
                <el-form-item :label="t('errorCorrection.mobile.phoneSource')">
                  <el-select v-model="phoneForm.source" style="width: 100%">
                    <el-option label="手动添加" value="手动添加" />
                    <el-option label="DMS" value="DMS" />
                    <el-option label="CRM" value="CRM" />
                    <el-option label="APP" value="APP" />
                  </el-select>
                </el-form-item>
              </el-form>
            </div>
          </div>
          <template #footer>
            <el-button size="small" @click="phoneDialogVisible = false">{{ t("errorCorrection.mobile.cancel") }}</el-button>
            <el-button size="small" type="primary" @click="savePhone">{{ t("errorCorrection.mobile.save") }}</el-button>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { reactive, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ProTable from "@/components/ProTable/index.vue";
import type { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import MergeWorkbenchDialog, { type ConflictTask } from "./MergeWorkbenchDialog.vue";
import StatsPanel from "./components/StatsPanel.vue";
import QuickEditDialog, { type QuickEditTask } from "./components/QuickEditDialog.vue";
import SyncRetryDialog, { type SyncTask } from "./components/SyncRetryDialog.vue";
import FeedbackResolutionDrawer, { type FeedbackTask } from "./components/FeedbackResolutionDrawer.vue";
import errorCorrectionMockData from "@/assets/json/errorCorrectionMockData.json";
import { EXCEPTION_TAXONOMY, getAllCategories, type ExceptionCategory, type ExceptionSubType } from "./utils/exceptionTaxonomy";
import {
  Cellphone,
  Collection,
  Close,
  ChatDotSquare,
  ArrowLeft,
  More,
  EditPen,
  ChatRound,
  Phone,
  Plus,
  Warning,
  InfoFilled,
  View
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, ElNotification, ElTag, ElTooltip, ElIcon, ElButton } from "element-plus";

const { t } = useI18n();

// ==================== 类型定义 ====================
type TaskStatus = "pending" | "processed";
type Severity = "low" | "medium" | "high";

interface ExceptionTask {
  id: string;
  taskNo: string;
  oneId: string;
  sourceName: string;
  targetName?: string;
  score?: number;
  category: ExceptionCategory; // 异常大类
  subType: ExceptionSubType; // 异常细分类型
  errorField: string;
  errorMessage: string;
  sourceSystem: string;
  targetSystem?: string;
  status: TaskStatus;
  updateTime: string;
  sourceId?: string; // 源系统ID
  // 原始数据和错误字段
  originalData?: Record<string, any>;
  errorFields?: string[];
  // H5 提交的纠错明细（与 H5 submitFieldCorrection 一致）
  correction?: {
    field: string;
    currentValue: string | number;
    correctValue: string | number;
    note?: string;
  };
  // 修复建议
  suggestedFix?: string;
  valueMapping?: Record<string, string>;
  // 冲突记录（主键冲突）
  conflictRecords?: Array<Record<string, any>>;
  // 冲突信息（逻辑冲突、状态冲突）
  conflictInfo?: Record<string, any>;
  statusConflict?: Record<string, string>;
}

// ==================== 数据模型 ====================
const tableRef = ref<ProTableInstance>();
const selectedTasks = ref<ExceptionTask[]>([]);

// 从 Mock 数据加载
const baseTasks = reactive<ExceptionTask[]>(
  (errorCorrectionMockData.exceptionTasks as any[]).map(task => ({
    ...task
  })) as ExceptionTask[]
);

// 页面统计 - 5大类异常
const pageStats = computed(() => {
  const pendingList = baseTasks.filter(t => t.status === "pending");
  return {
    validity: pendingList.filter(t => t.category === "validity").length,
    uniqueness: pendingList.filter(t => t.category === "uniqueness").length,
    completeness: pendingList.filter(t => t.category === "completeness").length,
    consistency: pendingList.filter(t => t.category === "consistency").length,
    compliance: pendingList.filter(t => t.category === "compliance").length,
    autoMergeRate: errorCorrectionMockData.stats.autoMergeRate,
    totalProcessed: errorCorrectionMockData.stats.totalProcessed,
    totalVolume: errorCorrectionMockData.stats.totalVolume,
    successCount: errorCorrectionMockData.stats.successCount,
    manualMergeNeeded: errorCorrectionMockData.stats.manualMergeNeeded,
    autoMergedCount: errorCorrectionMockData.stats.autoMergedCount
  };
});

// 错误类型 Tab 状态
const activeErrorType = ref<string>("all");

// 各类型数量统计 - 5大类异常
const errorTypeCounts = computed(() => {
  let list = baseTasks;
  if (activeStatusTab.value === "pending") {
    list = list.filter(item => item.status === "pending");
  } else {
    list = list.filter(item => item.status === "processed");
  }
  return {
    all: list.length,
    validity: list.filter(t => t.category === "validity").length,
    uniqueness: list.filter(t => t.category === "uniqueness").length,
    completeness: list.filter(t => t.category === "completeness").length,
    consistency: list.filter(t => t.category === "consistency").length,
    compliance: list.filter(t => t.category === "compliance").length,
    h5Feedback: list.filter(t => {
      const isH5 = t.errorField === "H5_FEEDBACK" || t.errorMessage?.includes("H5") || t.sourceSystem === "H5";
      return isH5;
    }).length
  };
});

// 切换错误类型 Tab
const handleErrorTypeChange = () => {
  tableRef.value?.getTableList();
};

const activeStatusTab = ref<"pending" | "processed">("pending");

const handleStatusTabChange = () => {
  tableRef.value?.getTableList();
};

// ==================== 弹窗状态 ====================
// Mode A: 身份冲突
const mergeDialogVisible = ref(false);
const currentMergeTask = ref<ConflictTask | null>(null);
const userRole = ref<"executor" | "reviewer" | "viewer">("executor");

// Mode B: 数据质量
const quickEditVisible = ref(false);
const currentQuickEditTask = ref<QuickEditTask | null>(null);

// Mode C: 同步失败
const syncRetryVisible = ref(false);
const currentSyncTask = ref<SyncTask | null>(null);

// Mode D: H5 提交的数据纠错反馈
const feedbackDrawerVisible = ref(false);
const currentFeedbackTask = ref<FeedbackTask | null>(null);

// ==================== 表格配置 ====================
const getStatusMap = () => ({
  pending: { label: t("errorCorrection.status.pending"), type: "warning" },
  processed: { label: t("errorCorrection.status.processed"), type: "success" }
});

const getErrorTypeMap = () => {
  const categories = getAllCategories();
  const map: Record<string, { label: string; color: string }> = {};
  categories.forEach(cat => {
    map[cat.code] = {
      label: t(cat.nameKey),
      color: cat.color
    };
  });
  return map;
};

const getSeverityMap = () => ({
  low: { label: t("errorCorrection.severity.low"), type: "info" },
  medium: { label: t("errorCorrection.severity.medium"), type: "warning" },
  high: { label: t("errorCorrection.severity.high"), type: "danger" }
});

const getSlaCountdown = (deadline: string) => {
  const now = new Date().getTime();
  const deadlineTime = new Date(deadline).getTime();
  const diff = deadlineTime - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (diff <= 0) return { text: t("errorCorrection.sla.expired"), type: "danger" };
  if (hours < 2) return { text: `${hours}h ${minutes}m`, type: "danger" };
  if (hours < 12) return { text: `${hours}h ${minutes}m`, type: "warning" };
  return { text: `${hours}h`, type: "info" };
};

const columns = computed<ColumnProps<ExceptionTask>[]>(() => {
  const baseColumns: ColumnProps<ExceptionTask>[] = [
    { type: "selection", fixed: "left", width: 50 },
    {
      prop: "taskNo",
      label: t("errorCorrection.table.taskNo"),
      minWidth: 140,
      search: { el: "input", props: { placeholder: t("errorCorrection.table.taskNo") } }
    },
    {
      prop: "oneId",
      label: t("errorCorrection.table.oneId"),
      width: 120,
      search: { el: "input", props: { placeholder: t("errorCorrection.table.oneId") } }
    },
    {
      prop: "sourceName",
      label: t("errorCorrection.table.customerName"),
      align: "center",
      width: 120,
      search: { el: "input", props: { placeholder: t("errorCorrection.table.customerName") } }
    }
  ];

  // 只有在"全部"tab时才显示【异常类型】和【主要问题】列
  if (activeErrorType.value === "all") {
    baseColumns.push({
      prop: "category",
      label: t("errorCorrection.table.errorType"),
      width: 120,
      search: {
        el: "select",
        props: { placeholder: t("errorCorrection.filter.errorType"), clearable: true },
        options: getAllCategories().map(cat => ({
          label: t(cat.nameKey),
          value: cat.code
        }))
      },
      render: scope => {
        const info = getErrorTypeMap()[scope.row.category];
        const subTypeConfig = EXCEPTION_TAXONOMY[scope.row.category]?.subTypes.find(st => st.code === scope.row.subType);
        return (
          <div style="display: flex; align-items: center; gap: 6px;">
            <ElTag style={{ background: info.color, color: "#fff", border: "none" }} size="small">
              {info.label}
            </ElTag>
          </div>
        );
      }
    });
  }

  baseColumns.push({
    prop: "status",
    label: t("errorCorrection.table.status"),
    width: 100,
    search: {
      el: "select",
      props: { placeholder: t("errorCorrection.filter.status"), clearable: true },
      options: [
        { label: t("errorCorrection.status.pending"), value: "pending" },
        { label: t("errorCorrection.status.processed"), value: "processed" }
      ]
    },
    render: scope => {
      const statusInfo = getStatusMap()[scope.row.status];
      return <ElTag type={statusInfo.type as any}>{statusInfo.label}</ElTag>;
    }
  });

  baseColumns.push({
    prop: "severity",
    label: t("errorCorrection.table.severity"),
    width: 100,
    search: {
      el: "select",
      props: { placeholder: t("errorCorrection.filter.severity"), clearable: true },
      options: [
        { label: t("errorCorrection.severity.high"), value: "high" },
        { label: t("errorCorrection.severity.medium"), value: "medium" },
        { label: t("errorCorrection.severity.low"), value: "low" }
      ]
    },
    render: scope => {
      const info = getSeverityMap()[scope.row.severity];
      return <ElTag type={info.type as any}>{info.label}</ElTag>;
    }
  });

  baseColumns.push({
    prop: "createTime",
    label: "冲突创建日期",
    width: 140,
    render: scope => {
      const isHighSeverity = scope.row.severity === "high";
      const isMediumSeverity = scope.row.severity === "medium";
      let iconColor = "#909399";
      let icon = InfoFilled;
      let tooltipContent = "正常状态";

      if (isHighSeverity) {
        iconColor = "#F56C6C";
        icon = Warning;
        tooltipContent = "高严重性警告";
      } else if (isMediumSeverity) {
        iconColor = "#E6A23C";
        icon = Warning;
        tooltipContent = "中等严重性警告";
      }

      return (
        <div style="display: flex; align-items: center; gap: 4px;">
          <span>{scope.row.createTime ? scope.row.createTime.split(" ")[0] : "-"}</span>
          <ElTooltip content={tooltipContent} placement="top">
            <ElIcon color={iconColor} size={16} style="cursor: pointer;">
              <icon />
            </ElIcon>
          </ElTooltip>
        </div>
      );
    }
  });

  // 只有在"全部"tab时才显示【主要问题】列
  if (activeErrorType.value === "all") {
    baseColumns.push({ prop: "errorField", label: t("errorCorrection.table.mainIssue"), minWidth: 180 });
  }

  baseColumns.push(
    {
      prop: "sourceSystem",
      label: t("errorCorrection.table.sourceSystem"),
      width: 100,
      search: {
        el: "select",
        props: { placeholder: t("errorCorrection.filter.sourceSystem"), clearable: true },
        options: [
          { label: "BDC", value: "BDC" },
          { label: "DMS", value: "DMS" },
          { label: "WeCom", value: "WeCom" }
        ]
      }
    },
    { prop: "handler", label: t("errorCorrection.table.handler"), width: 100 },
    {
      prop: "operation",
      label: t("errorCorrection.table.operation"),
      width: 160,
      fixed: "right",
      render: scope => {
        const canHandle = scope.row.status === "pending";
        const canView = scope.row.status === "processed";
        return (
          <div>
            {canHandle && (
              <ElButton type="primary" size="small" onClick={() => openTaskDialog(scope.row)}>
                {t("errorCorrection.handle")}
              </ElButton>
            )}

            {canView && (
              <ElButton type="info" size="small" onClick={() => openTaskDialog(scope.row)}>
                {t("errorCorrection.view")}
              </ElButton>
            )}
          </div>
        );
      }
    }
  );

  return baseColumns;
});

// ==================== API 请求 ====================
const fetchTaskList = (params: any) => {
  const { pageNum = 1, pageSize = 10, sourceName, taskNo, oneId, status, sourceSystem, severity } = params;
  let list = [...baseTasks];

  // 1. 根据主 Tab (Status) 筛选
  if (activeStatusTab.value === "pending") {
    // 待处理：pending
    list = list.filter(item => item.status === "pending");
  } else {
    // 已处理：processed
    list = list.filter(item => item.status === "processed");
  }

  // 2. 根据错误类型 Tab 筛选（5大类 + H5反馈）
  if (activeErrorType.value && activeErrorType.value !== "all") {
    if (activeErrorType.value === "h5Feedback") {
      // H5 反馈：通过 errorField、errorMessage 或 sourceSystem 判断
      list = list.filter(item => {
        const isH5 = item.errorField === "H5_FEEDBACK" || item.errorMessage?.includes("H5") || item.sourceSystem === "H5";
        return isH5;
      });
    } else {
      list = list.filter(item => item.category === activeErrorType.value);
    }
  }

  // 3. 应用其他搜索筛选条件
  if (taskNo) list = list.filter(item => item.taskNo.includes(taskNo));
  if (oneId) list = list.filter(item => item.oneId.includes(oneId));
  if (sourceName) list = list.filter(item => item.sourceName.includes(sourceName));
  if (status) list = list.filter(item => item.status === status);
  if (sourceSystem) list = list.filter(item => item.sourceSystem === sourceSystem);
  if (severity) list = list.filter(item => item.severity === severity);
  if (params.category) list = list.filter(item => item.category === params.category);

  const start = (pageNum - 1) * pageSize;
  const end = pageNum * pageSize;
  const pageList = list.slice(start, end);

  return Promise.resolve({
    data: {
      list: pageList,
      total: list.length
    }
  });
};

// ==================== 事件处理 ====================
const handleSelectionChange = (selection: ExceptionTask[]) => {
  selectedTasks.value = selection;
};

const handleBatchIgnore = () => {
  if (selectedTasks.value.length === 0) return;

  ElMessageBox.confirm(
    t("errorCorrection.batchIgnoreConfirm", { count: selectedTasks.value.length }),
    t("errorCorrection.messages.ignoreConfirmTitle"),
    {
      type: "warning"
    }
  ).then(() => {
    selectedTasks.value.forEach(task => {
      const idx = baseTasks.findIndex(t => t.id === task.id);
      if (idx !== -1) {
        baseTasks[idx].status = "processed";
        baseTasks[idx].updateTime = new Date().toLocaleString("zh-CN");
      }
    });
    ElMessage.success(t("errorCorrection.messages.batchIgnoreCompleted", { count: selectedTasks.value.length }));
    tableRef.value?.getTableList();
    selectedTasks.value = [];
  });
};

const openTaskDialog = (task: ExceptionTask) => {
  // 判断是否为已处理状态（在已处理tab下，或者任务状态为已处理）
  const isProcessed = activeStatusTab.value === "processed" || task.status === "processed";

  // 如果当前在 H5 反馈 Tab 下，直接打开 FeedbackResolutionDrawer
  if (activeErrorType.value === "h5Feedback") {
    const isH5 = task.errorField === "H5_FEEDBACK" || task.errorMessage?.includes("H5") || task.sourceSystem === "H5";
    if (isH5) {
      currentFeedbackTask.value = {
        taskId: task.taskNo,
        status: (() => {
          const statusMap: Record<TaskStatus, "pending" | "inProgress" | "resolved" | "rejected"> = {
            pending: "pending",
            processed: "resolved"
          };
          return statusMap[task.status];
        })(),
        reporter: {
          name: task.handler || "业务员",
          avatar: "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
          time: task.createTime
        },
        feedbackText: task.errorMessage || "",
        correction: task.correction,
        goldenRecord: {
          name: task.originalData?.name ?? task.sourceName ?? "",
          phone: task.originalData?.phone || "",
          title: task.originalData?.title || "",
          company: task.originalData?.company || "",
          tags: task.originalData?.tags || [],
          sources: task.originalData?.fieldSources || {
            name: { system: task.sourceSystem, id: task.sourceId },
            phone: { system: task.sourceSystem, id: task.sourceId },
            title: { system: task.sourceSystem, id: task.sourceId },
            company: { system: task.sourceSystem, id: task.sourceId }
          }
        },
        slaDeadline: task.slaDeadline
      };
      feedbackDrawerVisible.value = true;
      return;
    }
  }

  switch (task.category) {
    case "uniqueness":
      // 唯一性异常：疑似重复或主键冲突
      if (task.subType === "suspected_duplicate") {
        // 使用现有的合并工作台
        currentMergeTask.value = {
          id: task.id,
          taskNo: task.taskNo,
          oneId: task.oneId,
          sourceName: task.sourceName,
          targetName: task.targetName || task.sourceName,
          score: task.score || 0,
          conflictField: task.errorField,
          sourceSystem: task.sourceSystem,
          conflictType: "系统自动检测",
          status: (() => {
            const statusMap: Record<TaskStatus, "pending" | "draft" | "review" | "resolved" | "rejected"> = {
              pending: "pending",
              processed: "resolved"
            };
            return statusMap[task.status];
          })(),
          urgency: (task.severity === "high" ? "high" : task.severity === "medium" ? "medium" : "low") as
            | "low"
            | "medium"
            | "high",
          slaDeadline: task.slaDeadline,
          handler: task.handler,
          reviewer: task.handler,
          createTime: task.createTime,
          updateTime: task.updateTime
        };
        if (isProcessed) {
          userRole.value = "viewer";
        } else {
          userRole.value = "executor";
        }
        mergeDialogVisible.value = true;
      } else if (task.subType === "primary_key_conflict") {
        // 主键冲突
        if (isProcessed) {
          // 已处理：显示查看弹窗
          currentQuickEditTask.value = {
            id: task.id,
            taskNo: task.taskNo,
            errorField: task.errorField,
            errorFields: task.errorFields,
            originalData: task.originalData || {},
            errorType: task.category,
            errorMessage: task.errorMessage,
            readonly: true,
            status: task.status,
            handler: task.handler,
            createTime: task.createTime,
            updateTime: task.updateTime
          };
          quickEditVisible.value = true;
        } else {
          // 未处理：显示冲突记录选择
          ElMessageBox.alert(`主键冲突：${task.errorMessage}\n\n请选择要保留的记录或丢弃。`, "主键冲突处理", {
            confirmButtonText: "确定"
          });
        }
      }
      break;
    case "validity":
    case "completeness":
      // 有效性异常和完整性异常：使用快速编辑
      currentQuickEditTask.value = {
        id: task.id,
        taskNo: task.taskNo,
        errorField: task.errorField,
        errorFields: task.errorFields,
        originalData: task.originalData || {},
        errorType: task.category,
        errorMessage: task.errorMessage,
        readonly: isProcessed,
        suggestedFix: task.suggestedFix,
        valueMapping: task.valueMapping,
        // 处理历史信息
        status: task.status,
        handler: task.handler,
        createTime: task.createTime,
        updateTime: task.updateTime,
        conflictInfo: task.conflictInfo,
        statusConflict: task.statusConflict,
        sourceSystem: task.sourceSystem,
        sourceId: task.sourceId
      };
      quickEditVisible.value = true;
      break;
    case "consistency":
      // 关联性异常：逻辑冲突或状态冲突
      if (isProcessed) {
        // 已处理：显示查看弹窗
        currentQuickEditTask.value = {
          id: task.id,
          taskNo: task.taskNo,
          errorField: task.errorField,
          errorFields: task.errorFields,
          originalData: task.originalData || {},
          errorType: task.category,
          errorMessage: task.errorMessage,
          readonly: true,
          status: task.status,
          handler: task.handler,
          createTime: task.createTime,
          updateTime: task.updateTime,
          conflictInfo: task.conflictInfo,
          statusConflict: task.statusConflict
        };
        quickEditVisible.value = true;
      } else {
        // 未处理：显示操作弹窗
        if (task.subType === "logical_conflict") {
          // 逻辑互斥：信任选择
          ElMessageBox.confirm(`逻辑互斥：${task.errorMessage}\n\n请选择信任的字段值。`, "逻辑冲突处理", {
            confirmButtonText: "选择信任值",
            cancelButtonText: "取消"
          }).then(() => {
            ElMessage.success("已选择信任值");
          });
        } else if (task.subType === "status_conflict") {
          // 状态冲突：信任源
          ElMessageBox.confirm(`状态冲突：${task.errorMessage}\n\n请选择信任的源系统。`, "状态冲突处理", {
            confirmButtonText: "选择信任源",
            cancelButtonText: "取消"
          }).then(() => {
            ElMessage.success("已选择信任源");
          });
        }
      }
      break;
    case "compliance":
      // 合规性异常：授权缺失或 H5 反馈
      // 检查是否为 H5 提交的数据纠错反馈（通过 errorField 或 errorMessage 判断）
      const isH5Feedback = task.errorField === "H5_FEEDBACK" || task.errorMessage?.includes("H5") || task.sourceSystem === "H5";
      if (isH5Feedback) {
        // H5 提交的数据纠错反馈：使用 FeedbackResolutionDrawer
        currentFeedbackTask.value = {
          taskId: task.taskNo,
          oneId: task.oneId,
          status: (() => {
            const statusMap: Record<TaskStatus, "pending" | "inProgress" | "resolved" | "rejected"> = {
              pending: "pending",
              draft: "pending",
              processing: "inProgress",
              resolved: "resolved",
              rejected: "rejected",
              ignored: "rejected"
            };
            return statusMap[task.status];
          })(),
          reporter: {
            name: task.handler || "业务员",
            avatar: "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
            time: task.createTime
          },
          feedbackText: task.errorMessage || "客户张伟手机号错了，应该是 13912345678，而且他现在是采购经理了。",
          correction: task.correction,
          goldenRecord: {
            name: task.originalData?.name ?? task.sourceName ?? "",
            phone: task.originalData?.phone || "",
            title: task.originalData?.title || "",
            company: task.originalData?.company || "",
            tags: task.originalData?.tags || [],
            sources: task.originalData?.fieldSources || {
              name: { system: task.sourceSystem, id: task.sourceId },
              phone: { system: task.sourceSystem, id: task.sourceId },
              title: { system: task.sourceSystem, id: task.sourceId },
              company: { system: task.sourceSystem, id: task.sourceId }
            }
          },
          slaDeadline: task.slaDeadline
        };
        feedbackDrawerVisible.value = true;
      } else {
        // 合规性异常：授权缺失
        if (isProcessed) {
          // 已处理：显示查看弹窗
          currentQuickEditTask.value = {
            id: task.id,
            taskNo: task.taskNo,
            errorField: task.errorField,
            errorFields: task.errorFields,
            originalData: task.originalData || {},
            errorType: task.category,
            errorMessage: task.errorMessage,
            readonly: true,
            status: task.status,
            handler: task.handler,
            createTime: task.createTime,
            updateTime: task.updateTime
          };
          quickEditVisible.value = true;
        } else {
          // 未处理：显示操作弹窗
          ElMessageBox.confirm(`授权缺失：${task.errorMessage}\n\n该数据将被冻结，暂时保留但不可用于营销。`, "合规性异常处理", {
            confirmButtonText: "确认冻结",
            cancelButtonText: "取消",
            type: "warning"
          }).then(() => {
            const idx = baseTasks.findIndex(t => t.id === task.id);
            if (idx !== -1) {
              baseTasks[idx].status = "processed";
              baseTasks[idx].updateTime = new Date().toLocaleString("zh-CN");
              ElMessage.success("数据已冻结");
              tableRef.value?.getTableList();
            }
          });
        }
      }
      break;
  }
};

const handleTaskIgnore = (taskId: string) => {
  const idx = baseTasks.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    baseTasks[idx].status = "processed";
    baseTasks[idx].updateTime = new Date().toLocaleString("zh-CN");
    ElMessage.success(t("errorCorrection.messages.ignoreCompleted"));
    tableRef.value?.getTableList();
  }
};

// Mode A 事件处理
const handleSplit = (reason: string) => {
  console.log("拆分理由:", reason);
  if (currentMergeTask.value) {
    const idx = baseTasks.findIndex(t => t.id === currentMergeTask.value?.id);
    if (idx !== -1) {
      baseTasks.splice(idx, 1);
      tableRef.value?.getTableList();
    }
  }
  handleMergeClose();
};

const handleSubmit = (task: any, reason: string) => {
  if (task) {
    const idx = baseTasks.findIndex(t => t.id === task.id);
    if (idx !== -1) {
      baseTasks[idx].status = "processed";
      baseTasks[idx].updateTime = new Date().toLocaleString("zh-CN");
      ElMessage.success(t("errorCorrection.messages.submitForApproval"));
      tableRef.value?.getTableList();
    }
  }
  handleMergeClose();
};

const handleSaveDraft = (task: any, fields: any[]) => {
  if (task) {
    const idx = baseTasks.findIndex(t => t.id === task.id);
    if (idx !== -1) {
      baseTasks[idx].status = "pending";
      baseTasks[idx].updateTime = new Date().toLocaleString("zh-CN");
      ElMessage.success("已保存");
      tableRef.value?.getTableList();
    }
  }
  handleMergeClose();
};

const handleConfirmMerge = (task: any) => {
  if (task) {
    const idx = baseTasks.findIndex(t => t.id === task.id);
    if (idx !== -1) {
      baseTasks[idx].status = "processed";
      baseTasks[idx].updateTime = new Date().toLocaleString("zh-CN");
      tableRef.value?.getTableList();
    }
  }
  handleMergeClose();
};

const handleMergeClose = () => {
  mergeDialogVisible.value = false;
  currentMergeTask.value = null;
  tableRef.value?.clearSelection();
};

// Mode B 事件处理
const handleQuickEditSave = (taskId: string, corrections: Record<string, string>, markAsInvalid?: boolean) => {
  const idx = baseTasks.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    baseTasks[idx].status = "processed";
    baseTasks[idx].updateTime = new Date().toLocaleString("zh-CN");
    tableRef.value?.getTableList();
    ElMessage.success(t("errorCorrection.messages.submitForApproval"));
  }
};

// Mode C 事件处理
const handleSyncRetrySuccess = (taskId: string) => {
  const idx = baseTasks.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    baseTasks[idx].status = "processed";
    baseTasks[idx].updateTime = new Date().toLocaleString("zh-CN");
    tableRef.value?.getTableList();
    ElMessage.success(t("errorCorrection.messages.submitForApproval"));
  }
};

// Mode D 事件处理
const handleFeedbackClose = () => {
  feedbackDrawerVisible.value = false;
  currentFeedbackTask.value = null;
};

const handleFeedbackReject = (taskId: string, reason: string) => {
  const task = baseTasks.find(t => t.taskNo === taskId);
  if (task) {
    const idx = baseTasks.findIndex(t => t.id === task.id);
    if (idx !== -1) {
      baseTasks[idx].status = "processed";
      baseTasks[idx].updateTime = new Date().toLocaleString("zh-CN");
      tableRef.value?.getTableList();
    }
  }
  handleFeedbackClose();
};

const handleFeedbackConfirm = (taskId: string, corrections: Record<string, any>, verification: string) => {
  const task = baseTasks.find(t => t.taskNo === taskId);
  if (task) {
    const idx = baseTasks.findIndex(t => t.id === task.id);
    if (idx !== -1) {
      baseTasks[idx].status = "processed";
      baseTasks[idx].updateTime = new Date().toLocaleString("zh-CN");
      // 更新原始数据
      const o = { ...(baseTasks[idx].originalData || {}) };
      if (corrections.name !== undefined) o.name = corrections.name;
      if (corrections.phone !== undefined) o.phone = corrections.phone;
      if (corrections.title !== undefined) o.title = corrections.title;
      if (corrections.company !== undefined) o.company = corrections.company;
      if (corrections.tags !== undefined) o.tags = corrections.tags;
      if (corrections.address !== undefined) o.address = corrections.address;
      baseTasks[idx].originalData = o;
      tableRef.value?.getTableList();
    }
  }
  handleFeedbackClose();
};

// ==================== 移动端模拟 ====================
const showMobile = ref(false);
const activeTab = ref<"360" | "timeline" | "opp" | "conflicts">("360");
const sheetVisible = ref(false);
const pushLoading = ref(false);
const mobileTicketVisible = ref(false);
// 可用标签列表
const availableTags = reactive([
  { id: "1", name: "流失预警", icon: "⚠️", color: "red", selected: true },
  { id: "2", name: "黄金会员", icon: "💎", color: "gold", selected: true },
  { id: "3", name: "高价值客户", icon: "⭐", color: "blue", selected: false },
  { id: "4", name: "VIP", icon: "👑", color: "purple", selected: false },
  { id: "5", name: "潜在客户", icon: "🔍", color: "green", selected: false }
]);

const mobileData = reactive({
  id: "C360-001",
  name: "张伟",
  phone: "150****6988",
  loyalty: "流失预警",
  habit: "下午联系",
  car: "911 Carrera S",
  vin: "73L***M4YV",
  plate: "京C·88888",
  lastDate: "2025-06-06",
  avgSpend: "2,317",
  // 手机号数据
  phoneConflict: true,
  phones: [
    { number: "138****5678", source: "DMS", isPrimary: true, hasConflict: false },
    { number: "139****1234", source: "CRM", isPrimary: false, hasConflict: true },
    { number: "150****6988", source: "APP", isPrimary: false, hasConflict: true }
  ],
  // 数据冲突（不包含手机号，手机号冲突在phones中处理）
  conflicts: [
    {
      field: "name",
      fieldName: "客户姓名",
      currentValue: "张伟",
      sources: [
        { system: "DMS", value: "张伟" },
        { system: "CRM", value: "张伟先生" }
      ]
    },
    {
      field: "address",
      fieldName: "地址",
      currentValue: "北京市朝阳区",
      sources: [
        { system: "DMS", value: "北京市朝阳区" },
        { system: "CRM", value: "北京市朝阳区建国路88号" }
      ]
    }
  ],
  // 服务偏好（使用computed动态获取翻译）
  preferences: [
    { id: "1", nameKey: "errorCorrection.afternoonContact", selected: true },
    { id: "2", nameKey: "errorCorrection.wechatContact", selected: true },
    { id: "3", nameKey: "errorCorrection.needShuttle", selected: false }
  ]
});

// 计算属性：获取带翻译的偏好列表
const preferencesWithTranslation = computed(() => {
  return mobileData.preferences.map(pref => ({
    ...pref,
    name: t(pref.nameKey)
  }));
});

// 计算属性：其他冲突（排除手机号）
const otherConflicts = computed(() => {
  return mobileData.conflicts.filter(conflict => conflict.field !== "phone");
});

// 计算属性：其他冲突数量
const otherConflictsCount = computed(() => {
  return otherConflicts.value.length;
});

const openMobileMenu = () => {
  sheetVisible.value = true;
};

const closeMobileMenu = () => {
  sheetVisible.value = false;
};

const sheetAction = (type: string) => {
  sheetVisible.value = false;
  if (type === "addTag") ElMessage.info("打开标签选择器...");
  if (type === "share") ElMessage.success("名片已生成，可发送给客户");
  if (type === "report") ElMessage.warning("进入反馈流程");
};

const editName = () => {
  ElMessageBox.prompt("修改客户备注名:", "编辑资料", {
    inputValue: mobileData.name,
    confirmButtonText: "保存"
  }).then(({ value }) => {
    mobileData.name = value;
    ElMessage.success("修改成功");
  });
};

// 标签选中/取消选中
const toggleTag = (tag: any) => {
  tag.selected = !tag.selected;
  ElMessage.success(tag.selected ? `已添加标签：${tag.name}` : `已移除标签：${tag.name}`);
};

// 服务偏好选中/取消选中
const togglePreference = (pref: any) => {
  pref.selected = !pref.selected;
  ElMessage.success(pref.selected ? `已选择：${pref.name}` : `已取消：${pref.name}`);
};

// 显示冲突详情
const showConflictDetail = (conflict: any) => {
  const sourcesText = conflict.sources.map((s: any) => `${s.system}: ${s.value}`).join("\n");
  ElMessageBox.alert(
    `${t("errorCorrection.mobile.conflictField")}: ${conflict.fieldName}\n${t("errorCorrection.mobile.currentValue")}: ${conflict.currentValue}\n\n${t("errorCorrection.mobile.conflictSource")}:\n${sourcesText}`,
    t("errorCorrection.mobile.conflictDetail"),
    {
      confirmButtonText: t("errorCorrection.mobile.close")
    }
  );
};

// 处理冲突（仅用于手机号，其他冲突只能查看）
const resolveConflict = (conflict: any) => {
  // 只有手机号冲突可以处理
  if (conflict.field === "phone") {
    ElMessageBox.confirm(
      `${t("errorCorrection.mobile.conflictField")}: ${conflict.fieldName}\n\n${t("errorCorrection.mobile.selectTrustedSource")}`,
      t("errorCorrection.mobile.resolveConflict"),
      {
        confirmButtonText: t("errorCorrection.mobile.confirm"),
        cancelButtonText: t("errorCorrection.mobile.cancel")
      }
    ).then(() => {
      // 从冲突列表中移除
      const index = mobileData.conflicts.findIndex((c: any) => c.field === conflict.field);
      if (index !== -1) {
        mobileData.conflicts.splice(index, 1);
        ElMessage.success(t("errorCorrection.mobile.conflictResolved"));
      }
    });
  } else {
    // 其他冲突只能查看
    showConflictDetail(conflict);
  }
};

// 打开手机号编辑对话框
const phoneDialogVisible = ref(false);
const phoneForm = reactive({
  number: "",
  source: "手动添加"
});

const openPhoneDialog = () => {
  phoneForm.number = "";
  phoneForm.source = "手动添加";
  phoneDialogVisible.value = true;
};

// 手机号验证
const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// 保存手机号
const savePhone = () => {
  if (!phoneForm.number) {
    ElMessage.warning(t("errorCorrection.mobile.phoneRequired"));
    return;
  }
  if (!validatePhone(phoneForm.number)) {
    ElMessage.warning(t("errorCorrection.mobile.phoneValidation"));
    return;
  }
  // 检查是否重复
  if (mobileData.phones.some((p: any) => p.number === phoneForm.number)) {
    ElMessage.warning(t("errorCorrection.mobile.phoneDuplicate"));
    return;
  }
  // 添加手机号
  mobileData.phones.push({
    number: phoneForm.number,
    source: phoneForm.source,
    isPrimary: false,
    hasConflict: false
  });
  phoneDialogVisible.value = false;
  ElMessage.success(t("errorCorrection.mobile.phoneAddSuccess"));
};

// 设置主号码
const setPrimaryPhone = (phone: any) => {
  mobileData.phones.forEach((p: any) => {
    p.isPrimary = p === phone;
  });
  ElMessage.success(t("errorCorrection.mobile.phoneSetPrimarySuccess"));
};

// 删除手机号
const deletePhone = (phone: any) => {
  ElMessageBox.confirm(t("errorCorrection.mobile.confirmDeletePhone"), t("errorCorrection.mobile.delete"), {
    type: "warning"
  }).then(() => {
    const index = mobileData.phones.findIndex((p: any) => p === phone);
    if (index !== -1) {
      mobileData.phones.splice(index, 1);
      ElMessage.success(t("errorCorrection.mobile.phoneDeleteSuccess"));
    }
  });
};

const showStatDetail = () => {
  ElMessage.info("正在拉取 BI 消费明细报表...");
};

const showCarDetail = () => {
  ElMessage.info("车辆详情: 911 Carrera S / 2021款 / 红色");
};

const showTimelineDetail = (title: string) => {
  ElMessageBox.alert(`查看【${title}】的完整跟进记录?`, "互动详情", { confirmButtonText: "查看" });
};

const handlePushCoupon = () => {
  pushLoading.value = true;
  setTimeout(() => {
    pushLoading.value = false;
    ElNotification({ title: "推送成功", message: "¥200 空调清洗券已发送至客户微信", type: "success" });
  }, 1000);
};

const handleFollowUp = () => {
  ElMessage.success("已生成跟进任务，跳转至报价系统...");
};

const handleMobileFooter = (type: "call" | "wechat") => {
  if (type === "call") {
    ElMessageBox.confirm(`呼叫 ${mobileData.phone} ?`, "系统拨号", { confirmButtonText: "呼叫" }).then(() =>
      ElMessage.success("通话中...")
    );
  }
  if (type === "wechat") {
    ElMessage.success("正在打开企业微信会话窗口...");
  }
};

const openTicketDialog = () => {
  mobileTicketVisible.value = true;
};

const submitTicket = () => {
  mobileTicketVisible.value = false;
  ElMessage.success("工单已创建 (单号: WO-20260107)");
};
</script>

<style scoped lang="scss">
.error-correction {
  padding: 0;
  box-sizing: border-box;
  background: #f5f7fa;
  min-height: 100vh;

  // 统计面板卡片
  .stats-panel-card {
    margin-bottom: 16px;
    border-radius: 8px;
    overflow: visible;

    :deep(.el-card__body) {
      padding: 16px 20px;
    }

    .header-content {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
    }
  }

  // 一级导航 (L1) - PageHeader
  .page-header {
    background: #ffffff;
    padding: 0;
    margin-bottom: 0;

    .l1-tabs {
      :deep(.el-tabs__header) {
        margin: 0;
        border-bottom: 1px solid #e4e7ed;
        padding: 0 24px;
      }

      :deep(.el-tabs__nav-wrap) {
        margin-bottom: 0;
      }

      :deep(.el-tabs__nav-wrap::after) {
        display: none;
      }

      :deep(.el-tabs__item) {
        font-size: 15px;
        font-weight: 500;
        color: #606266;
        padding: 0 24px;
        height: 48px;
        line-height: 48px;
        transition: all 0.2s ease;
        position: relative;

        &:hover {
          color: #409eff;
        }

        &.is-active {
          color: #409eff;
          font-weight: 600;
        }
      }

      :deep(.el-tabs__active-bar) {
        background-color: #409eff;
        height: 3px;
        border-radius: 2px 2px 0 0;
      }
    }
  }

  // 二级筛选 (L2) - 灰色内容区
  .content-area {
    padding: 0;
    background: #f5f7fa;
    min-height: calc(100vh - 200px);

    .table-card {
      background: #ffffff;
      border-radius: 0;
      border: none;
      border-top: 1px solid #e4e7ed;
      overflow: visible !important;
      box-shadow: none;

      :deep(.el-card__body) {
        padding: 24px;
      }

      // 二级筛选器容器
      .l2-filter-wrapper {
        background: #f0f2f5;
        padding: 3px;
        border-radius: 6px;
        margin-bottom: 24px;
        display: inline-flex;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);

        .l2-segmented {
          display: flex;
          gap: 2px;

          :deep(.el-radio-button) {
            margin: 0;

            .el-radio-button__inner {
              background: transparent;
              border: none;
              border-radius: 4px;
              padding: 6px 14px;
              font-size: 13px;
              font-weight: 400;
              color: #606266;
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              display: flex;
              align-items: center;
              gap: 6px;
              white-space: nowrap;

              &:hover {
                color: #409eff;
                background: rgba(64, 158, 255, 0.08);
              }
            }

            &.is-active .el-radio-button__inner {
              background: #ffffff;
              color: #409eff;
              font-weight: 500;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .filter-badge {
              margin-left: 4px;

              :deep(.el-badge__content) {
                font-size: 10px;
                height: 16px;
                line-height: 16px;
                padding: 0 4px;
                min-width: 16px;
                border-radius: 8px;
              }
            }
          }
        }
      }
    }
  }

  .top-panel {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 14px;
  }

  .page-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-shrink: 0;

    .el-button {
      height: 36px;
      padding: 0 16px;
      font-weight: 500;
      border-radius: 6px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

    .admin-tag {
      font-size: 12px;
      padding: 4px 10px;
      height: auto;
      line-height: 1.5;
      border-radius: 4px;
      font-weight: 500;
    }
  }

  // 表格容器滚动优化
  .table-card {
    :deep(.table-main) {
      overflow-x: auto;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;

      @media (max-width: 768px) {
        overflow-x: auto;
        overflow-y: auto;

        .el-table {
          min-width: 800px;
        }
      }
    }

    :deep(.el-table) {
      width: 100%;
    }

    :deep(.card) {
      overflow-x: auto !important;
      overflow-y: auto !important;

      @media (max-width: 768px) {
        -webkit-overflow-scrolling: touch;
      }
    }

    :deep(.el-table__body-wrapper) {
      overflow-x: auto;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
  }

  /* 移动端模拟区域 - 保持原样 */
  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    box-sizing: border-box;
  }

  .exit-bar {
    position: absolute;
    top: 16px;
    right: 16px;
  }

  .mobile-title {
    color: #fff;
    margin-bottom: 10px;
    text-align: center;
  }

  .mobile-frame {
    width: 375px;
    height: 812px;
    max-height: 90vh;
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .m-header {
    background: #ffffff;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid #e4e7ed;
    flex-shrink: 0;
    z-index: 10;

    .el-icon {
      font-size: 18px;
      color: #303133;
      cursor: pointer;
      padding: 4px;
      transition: color 0.2s;

      &:hover {
        color: #409eff;
      }
    }

    span {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .profile {
    background: #ffffff;
    padding: 16px;
    text-align: center;
    border-bottom: 1px solid #e4e7ed;
    flex-shrink: 0;
    max-height: 25vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    :deep(.el-avatar) {
      width: 56px !important;
      height: 56px !important;
      border: 1px solid #e4e7ed;
    }
  }

  .profile-name {
    margin-top: 12px;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;

    .el-icon {
      font-size: 14px;
      color: #909399;
    }

    &:hover {
      color: #409eff;

      .el-icon {
        color: #409eff;
      }
    }
  }

  .profile-id {
    color: #909399;
    font-size: 12px;
    margin-top: 4px;
    font-weight: 400;
  }

  .profile-phone-section {
    margin-top: 16px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
  }

  .phone-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .phone-label {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }

  .phone-header .el-button {
    padding: 0;
    font-size: 12px;
  }

  .phone-conflict-alert {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 4px;
    color: #606266;
    font-size: 12px;
    font-weight: 400;
    margin-bottom: 12px;
    border: 1px solid #e4e7ed;

    .el-icon {
      font-size: 14px;
      color: #909399;
    }
  }

  .phone-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .phone-item {
    padding: 12px;
    background: #ffffff;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    margin-bottom: 8px;

    &.primary {
      border-color: #409eff;
      background: #f5f7fa;
    }

    &.conflict {
      border-color: #e4e7ed;
      background: #f5f7fa;
    }
  }

  .phone-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .phone-number {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }

  .phone-source {
    font-size: 12px;
    color: #909399;
    font-weight: 400;
  }

  .phone-tag {
    margin-left: 4px;

    :deep(.el-tag) {
      background: #f5f7fa;
      border-color: #e4e7ed;
      color: #606266;
    }
  }

  .conflict-section {
    margin-top: 10px;
    padding: 10px;
    background: linear-gradient(135deg, #fff1f0 0%, #ffe7e5 100%);
    border-radius: 8px;
    border: 1.5px solid rgba(255, 59, 48, 0.2);
    box-shadow: 0 2px 6px rgba(255, 59, 48, 0.1);
  }

  .conflict-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 700;
    color: #ff3b30;
    margin-bottom: 12px;
    letter-spacing: -0.2px;

    .el-icon {
      font-size: 18px;
    }
  }

  .conflict-item {
    padding: 12px 14px;
    background: #ffffff;
    border-radius: 10px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid rgba(255, 59, 48, 0.1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

    &:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(255, 59, 48, 0.15);
    }

    &:active {
      transform: translateX(2px) scale(0.98);
    }
  }

  .conflict-field {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }

  .conflict-sources {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }

  .conflict-source-tag {
    font-size: 12px;
    padding: 2px 6px;
    background: #f0f0f0;
    border-radius: 4px;
    color: #606266;
  }

  .profile-preference {
    margin-top: 16px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
  }

  .preference-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
  }

  .profile-tags {
    margin-top: 16px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
  }

  .tags-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .m-tag {
    cursor: pointer;
    user-select: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;
    position: relative;
    z-index: 1;
    pointer-events: auto;
    -webkit-tap-highlight-color: transparent;
    border: 1px solid #e4e7ed;

    &.active {
      background: #ecf5ff !important;
      border-color: #409eff !important;
      color: #409eff !important;
      font-weight: 500;
      opacity: 1;
    }

    &:not(.active) {
      opacity: 0.7;
    }

    &:hover:not(.active) {
      opacity: 1;
      background: #f5f7fa;
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .m-tag-add {
    border: 1.5px dashed #409eff;
    color: #409eff;
    background: rgba(64, 158, 255, 0.06);
    transition: all 0.2s ease;

    &:hover {
      background: rgba(64, 158, 255, 0.12);
      border-color: #66b1ff;
    }
  }

  .m-tabs {
    display: flex;
    background: #ffffff;
    border-bottom: 1px solid #e4e7ed;
    flex-shrink: 0;
    position: relative;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    height: 44px;
    width: 100%;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .m-tab-item {
    flex: 0 0 auto;
    min-width: auto;
    text-align: center;
    padding: 12px 12px;
    font-size: 13px;
    color: #606266;
    cursor: pointer;
    position: relative;
    font-weight: 400;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    white-space: nowrap;
    user-select: none;

    .tab-text {
      display: inline-block;
      line-height: 1.2;
      max-width: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tab-count {
      font-size: 11px;
      opacity: 0.6;
      margin-left: 2px;
      flex-shrink: 0;
    }

    &:hover {
      color: #409eff;
    }

    &.active {
      color: #409eff;
      font-weight: 600;
    }

    &.active::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 2px;
      background: #409eff;
      border-radius: 1px 1px 0 0;
    }
  }

  .tab-badge {
    margin-left: 4px;
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;

    :deep(.el-badge__content) {
      background: #909399;
      border: 1px solid #ffffff;
      font-size: 10px;
      height: 16px;
      line-height: 16px;
      padding: 0 4px;
      min-width: 16px;
      border-radius: 8px;
      font-weight: 500;
    }
  }

  .m-body {
    flex: 1 1 auto;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px;
    background: #f5f7fa;
    -webkit-overflow-scrolling: touch;
    min-height: 0;
    height: 0;
  }

  .m-card {
    background: #ffffff;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid #e4e7ed;
    cursor: pointer;
    transition: border-color 0.2s;

    &:hover {
      border-color: #409eff;
    }
  }

  .m-card-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .m-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .m-stat-item {
    text-align: center;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
  }

  .m-stat-num {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  .money-font {
    font-family:
      "DIN",
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    font-variant-numeric: tabular-nums;
  }

  .highlight {
    color: #303133;
    font-size: 20px;
  }

  .m-stat-desc {
    font-size: 12px;
    color: #909399;
    font-weight: 400;
  }

  .car-main {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }

  .car-name {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  .car-plate {
    background: #606266;
    color: #ffffff;
    padding: 4px 8px;
    border-radius: 4px;
    font-family: monospace;
    display: inline-block;
    font-size: 12px;
    font-weight: 500;
  }

  .car-vin {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
    font-weight: 400;
    font-family: monospace;
  }

  .car-img {
    width: 56px;
    height: 56px;
  }

  .car-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e4e7ed;
    font-size: 12px;
    color: #909399;
    font-weight: 400;
  }

  .danger {
    color: #606266;
    font-weight: 400;
  }

  .preference {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .m-timeline {
    padding-left: 16px;
    border-left: 2px solid #e4e7ed;
    margin-left: 8px;
  }

  .m-timeline-item {
    position: relative;
    padding-left: 16px;
    padding-bottom: 16px;
  }

  .m-timeline-item::before {
    content: "";
    position: absolute;
    left: -9px;
    top: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #c0c4cc;
    border: 2px solid #ffffff;
  }

  .m-timeline-item.active::before {
    background: #606266;
    border-color: #ffffff;
  }

  .m-time {
    font-size: 12px;
    color: #909399;
    margin-bottom: 8px;
    font-weight: 400;
  }

  .m-content {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .m-sub {
    font-size: 12px;
    color: #909399;
    background: #f5f7fa;
    padding: 8px 12px;
    border-radius: 4px;
    margin-top: 8px;
    font-weight: 400;
    border: 1px solid #e4e7ed;
  }

  .warning-card {
    border-left: 3px solid #e4e7ed;

    .m-card-title {
      color: #303133;
    }
  }

  .info-card {
    border-left: 3px solid #e4e7ed;

    .m-card-title {
      color: #303133;
    }
  }

  .conflict-card {
    border-left: 4px solid #ff3b30;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #fff1f0 0%, #ffffff 100%);
    box-shadow:
      0 4px 16px rgba(255, 59, 48, 0.15),
      0 0 0 1px rgba(255, 59, 48, 0.1);
  }

  .conflict-detail-card {
    border-left: 3px solid #e4e7ed;
    background: #ffffff;
    cursor: pointer;

    &.readonly {
      cursor: default;
    }
  }

  .conflict-readonly-tip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    margin-bottom: 12px;
    background: #f5f7fa;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    color: #606266;
    font-size: 12px;
    font-weight: 400;

    .el-icon {
      font-size: 14px;
      color: #909399;
    }
  }

  .conflict-view-only {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 12px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 6px;
    color: #8e8e93;
    font-size: 12px;
    font-weight: 500;

    .el-icon {
      font-size: 14px;
    }
  }

  .conflict-card-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
  }

  .conflict-icon-wrapper {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    background: #f5f7fa;
    border: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .conflict-card-content {
    flex: 1;
  }

  .conflict-field-name {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  .conflict-current-value-text {
    font-size: 12px;
    color: #909399;
    font-weight: 400;
  }

  .resolve-btn {
    margin-top: 12px;
    width: 100%;
  }

  .empty-conflicts {
    padding: 60px 20px;
    text-align: center;
  }

  .conflict-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .conflict-card-item {
    padding: 12px;
    background: #fef0f0;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &:active {
      background: #fde2e2;
    }
  }

  .conflict-field-name {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 6px;
  }

  .conflict-current-value {
    font-size: 13px;
    color: #606266;
    margin-bottom: 8px;
  }

  .conflict-sources-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 10px;
  }

  .conflict-source-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
  }

  .source-label {
    color: #909399;
  }

  .source-value {
    color: #303133;
    font-weight: 500;
  }

  .phone-dialog-content {
    max-height: 400px;
    overflow-y: auto;
  }

  .phone-list-section {
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
  }

  .phone-item-dialog {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: #f9f9f9;
    border-radius: 6px;
    margin-bottom: 8px;

    &.primary {
      background: #f0f9ff;
      border: 1px solid #67c23a;
    }

    &.conflict {
      background: #fef0f0;
      border: 1px solid #f56c6c;
    }
  }

  .phone-item-info {
    flex: 1;
  }

  .phone-number-dialog {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }

  .phone-meta {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .phone-source-dialog {
    font-size: 12px;
    color: #909399;
  }

  .phone-actions {
    display: flex;
    gap: 8px;
  }

  .add-phone-section {
    padding-top: 16px;
    border-top: 1px solid #e4e7ed;
  }

  .time-label {
    font-size: 12px;
    color: #999;
  }

  .m-card-desc {
    font-size: 14px;
    color: #8e8e93;
    margin-bottom: 16px;
    line-height: 1.6;
    font-weight: 400;
    letter-spacing: -0.1px;
  }

  .time-label {
    font-size: 12px;
    color: #8e8e93;
    font-weight: 500;
    padding: 2px 8px;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 4px;
  }

  .m-footer {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    background: #ffffff;
    border-top: 1px solid #e4e7ed;
    flex-shrink: 0;
    height: 64px;
    box-sizing: border-box;
  }

  .m-btn {
    flex: 1;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    gap: 4px;
    transition: all 0.2s;
  }

  .outline {
    border: 1px solid #dcdfe6;
    background: #ffffff;
    color: #606266;

    &:hover {
      background: #f5f7fa;
      border-color: #c0c4cc;
      color: #409eff;
    }
  }

  .primary {
    background: #409eff;
    color: #ffffff;
    border: none;

    &:hover {
      background: #66b1ff;
    }

    &:active {
      background: #3a8ee6;
    }
  }

  .mobile-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10;
  }

  .mobile-action-sheet {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #ffffff;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    z-index: 20;
    transform: translateY(100%);
    transition: transform 0.3s;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
    visibility: hidden;
    opacity: 0;
  }

  .mobile-action-sheet.show {
    transform: translateY(0);
    visibility: visible;
    opacity: 1;
  }

  .action-item {
    padding: 14px;
    text-align: center;
    border-bottom: 1px solid #e4e7ed;
    font-size: 14px;
    color: #303133;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f5f7fa;
    }
  }

  .action-item.cancel {
    border-top: 8px solid #f5f7fa;
    color: #909399;
    font-weight: 400;
  }

  .m-tag {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
  }

  .m-tag-blue,
  .m-tag-red,
  .m-tag-gold,
  .m-tag-purple,
  .m-tag-green {
    background: #f5f7fa;
    color: #606266;
    border: 1px solid #e4e7ed;

    &.active {
      background: #ecf5ff !important;
      border-color: #409eff !important;
      color: #409eff !important;
    }
  }

  // 响应式设计
  @media (max-width: 1200px) {
    .stats-panel-card {
      :deep(.el-card__body) {
        padding: 14px 16px;
      }

      .header-content {
        gap: 16px;
      }
    }
  }

  @media (max-width: 768px) {
    .error-correction {
      .stats-panel-card {
        margin-bottom: 12px;

        :deep(.el-card__body) {
          padding: 12px;
        }

        .header-content {
          gap: 12px;
        }
      }

      .page-header {
        .l1-tabs {
          :deep(.el-tabs__header) {
            padding: 0 20px;
          }

          :deep(.el-tabs__item) {
            font-size: 14px;
            padding: 0 16px;
          }
        }
      }

      .content-area {
        .table-card {
          :deep(.el-card__body) {
            padding: 20px;
          }

          .l2-filter-wrapper {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;

            .l2-segmented {
              flex-wrap: nowrap;
              min-width: max-content;

              :deep(.el-radio-button__inner) {
                padding: 6px 12px;
                font-size: 13px;
                white-space: nowrap;
              }
            }
          }
        }
      }
    }
  }

  @media (max-width: 480px) {
    .error-correction {
      .stats-panel-card {
        :deep(.el-card__body) {
          padding: 10px;
        }
      }

      .page-header {
        .l1-tabs {
          :deep(.el-tabs__header) {
            padding: 0 16px;
          }

          :deep(.el-tabs__item) {
            font-size: 13px;
            padding: 0 12px;
            height: 40px;
            line-height: 40px;
          }
        }
      }

      .content-area {
        .table-card {
          :deep(.el-card__body) {
            padding: 16px;
          }

          .l2-filter-wrapper {
            .l2-segmented {
              :deep(.el-radio-button__inner) {
                padding: 5px 10px;
                font-size: 12px;
              }
            }
          }
        }
      }

      // 小屏幕上确保表格可以滚动
      .table-card {
        :deep(.table-main) {
          overflow-x: auto !important;
          overflow-y: auto !important;

          .el-table {
            min-width: 700px;
          }
        }
      }
    }
  }
}
</style>
