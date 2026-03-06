<template>
  <div class="lead-list-container table-box">
    <!-- 统计面板 -->
    <div class="stats-panel">
      <div class="stats-card primary-card">
        <div class="stats-icon-wrapper">
          <el-icon><Opportunity /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(leadStats.leadTotal) }}</div>
          <div class="stats-label">{{ t("leadManagement.stats.leadTotal") }}</div>
        </div>
      </div>
      <div class="stats-card info-card">
        <div class="stats-icon-wrapper">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(leadStats.pendingCount) }}</div>
          <div class="stats-label">{{ t("leadManagement.stats.pendingCount") }}</div>
        </div>
      </div>
      <div class="stats-card warning-card">
        <div class="stats-icon-wrapper">
          <el-icon><Loading /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(leadStats.processingCount) }}</div>
          <div class="stats-label">{{ t("leadManagement.stats.processingCount") }}</div>
        </div>
      </div>
      <div class="stats-card success-card">
        <div class="stats-icon-wrapper">
          <el-icon><Check /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ formatNumber(leadStats.completedCount) }}</div>
          <div class="stats-label">{{ t("leadManagement.stats.completedCount") }}</div>
        </div>
      </div>
      <div class="stats-card success-card">
        <div class="stats-icon-wrapper">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="stats-content">
          <div class="stats-number">{{ leadStats.pushSuccessRate }} <span class="sub-value">%</span></div>
          <div class="stats-label">{{ t("leadManagement.stats.pushSuccessRate") }}</div>
        </div>
      </div>
    </div>

    <pro-table
      ref="proTableRef"
      :columns="columns"
      :request-api="loadData"
      :init-param="initParam"
      :pagination="true"
      :tool-button="toolButton"
      :border="true"
      row-key="id"
    >
      <!-- <template #tableHeader>
        <el-button type="primary" :icon="Upload" @click="handlePush">
          {{ $t("leadManagement.buttons.batchPush") }}
        </el-button>
        <el-button type="warning" :icon="Refresh" @click="handleReload">
          {{ $t("leadManagement.buttons.reloadLeads") }}
        </el-button>
        <el-button type="info" :icon="Refresh" @click="handleRetryFailed">
          {{ $t("leadManagement.buttons.retryFailed") }}
        </el-button>
      </template> -->

      <!-- 商机类型列 -->
      <template #leadType="scope">
        <el-tag :type="getTypeTagType(scope.row.leadType)" size="small">
          {{
            $t(`leadManagement.enums.leadType.${scope.row.leadType}`) !== `leadManagement.enums.leadType.${scope.row.leadType}`
              ? $t(`leadManagement.enums.leadType.${scope.row.leadType}`)
              : scope.row.leadType
          }}
        </el-tag>
      </template>

      <!-- 优先级列 -->
      <template #priority="scope">
        <el-tag :type="getPriorityTagType(scope.row.priority)" size="small">
          {{ getPriorityLabel(scope.row.priority) }}
        </el-tag>
      </template>

      <!-- 状态列 -->
      <template #status="scope">
        <span class="status-text">{{ getStatusLabel(scope.row.status) }}</span>
      </template>
    </pro-table>

    <!-- 推送配置抽屉 -->
    <PushDrawer
      v-model="pushDrawerVisible"
      :lead-ids="selectedLeadIds"
      :default-advisor="defaultAdvisor"
      :contacts="contactList"
      @success="handlePushSuccess"
    />

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" :title="$t('leadManagement.messages.detailTitle')" width="800px" append-to-body>
      <div v-if="currentLead" class="lead-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('leadManagement.columns.oneId')">{{ currentLead.oneId }}</el-descriptions-item>
          <el-descriptions-item :label="$t('leadManagement.columns.customerName')">{{
            currentLead.customerName
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('customer.phone')">{{ currentLead.phone || "-" }}</el-descriptions-item>
          <el-descriptions-item :label="$t('leadManagement.columns.leadType')">{{ currentLead.leadType }}</el-descriptions-item>
          <el-descriptions-item :label="$t('leadManagement.columns.priority')">
            <el-tag :type="getPriorityTagType(currentLead.priority)" size="small">
              {{ getPriorityLabel(currentLead.priority) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('leadManagement.columns.status')">
            <el-tag :type="getStatusTagType(currentLead.status)" size="small">
              {{ getStatusLabel(currentLead.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('leadManagement.columns.pushTarget')">{{
            currentLead.pushTarget || "-"
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('leadManagement.columns.assignedAdvisor')">{{
            currentLead.assignedAdvisor || "-"
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('leadManagement.columns.createdAt')">{{ currentLead.createdAt }}</el-descriptions-item>
          <el-descriptions-item :label="$t('leadManagement.columns.pushStatus')">{{
            currentLead.pushTime || "-"
          }}</el-descriptions-item>
        </el-descriptions>
        <el-divider />
        <div class="payload-section">
          <div class="section-title">{{ $t("leadManagement.messages.payloadTitle") }}</div>
          <pre class="payload-content">{{ JSON.stringify(currentLead.payload, null, 2) }}</pre>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { View, Upload, Refresh, Opportunity, Clock, Loading, Check, TrendCharts } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps } from "@/components/ProTable/interface";
import { getLeadList, pushLeads, reloadLead } from "@/api/modules/lead";
import type { Lead } from "@/api/modules/lead";
import { LEAD_STATUS_OPTIONS, PRIORITY_OPTIONS, PUSH_TARGET_OPTIONS } from "../interface";
import PushDrawer from "./PushDrawer.vue";

const route = useRoute();
const { t } = useI18n();
const proTableRef = ref();
const detailVisible = ref(false);
const currentLead = ref<Lead.LeadInfo | null>(null);
const pushDrawerVisible = ref(false);
const selectedLeadIds = ref<string[]>([]);
const defaultAdvisor = ref<{ id: string; name: string; role: string; department: string } | null>(null);
const contactList = ref<any[]>([]);

// 商机统计数据
const leadStats = reactive({
  leadTotal: 0,
  pendingCount: 0,
  processingCount: 0,
  completedCount: 0,
  pushSuccessRate: 0
});

// 格式化数字
const formatNumber = (num: number) => {
  return num.toLocaleString("zh-CN");
};

// 从路由查询参数初始化过滤条件
const getInitialParams = () => {
  const query = route.query;
  const params: Record<string, any> = {
    pageNum: 1,
    pageSize: 10
  };

  // 处理分类过滤
  if (query.category) {
    params.category = query.category;
  }

  // 处理日期范围过滤
  if (query.startDate && query.endDate) {
    params.startDate = query.startDate;
    params.endDate = query.endDate;
  }

  // 处理其他可能的过滤参数
  if (query.status) {
    params.status = query.status;
  }
  if (query.pushTarget) {
    params.pushTarget = query.pushTarget;
  }
  if (query.oneId) {
    params.oneId = query.oneId;
  }

  return params;
};

const initParam = reactive(getInitialParams());

const toolButton: ("refresh" | "setting" | "search")[] = ["refresh", "setting", "search"];

const columns = computed<ColumnProps<Lead.LeadInfo>[]>(() => [
  // {
  //   type: "selection",
  //   width: 50,
  //   align: "center",
  //   fixed: "left"
  // },
  {
    prop: "oneId",
    label: t("leadManagement.columns.oneId"),
    minWidth: 180,
    search: {
      el: "input",
      props: { placeholder: t("leadManagement.placeholders.oneId") }
    }
  },
  {
    prop: "customerName",
    label: t("leadManagement.columns.customerName"),
    minWidth: 120
  },
  {
    prop: "leadType",
    label: t("leadManagement.columns.leadType"),
    minWidth: 140
  },
  {
    prop: "priority",
    label: t("leadManagement.columns.priority"),
    minWidth: 100
  },
  {
    prop: "status",
    label: t("leadManagement.columns.status"),
    minWidth: 100,
    search: {
      el: "select",
      props: { placeholder: t("leadManagement.placeholders.status") },
      options: LEAD_STATUS_OPTIONS
    }
  },
  {
    prop: "pushTarget",
    label: t("leadManagement.columns.pushTarget"),
    minWidth: 120,
    search: {
      el: "select",
      props: { placeholder: t("leadManagement.placeholders.pushTarget") },
      options: PUSH_TARGET_OPTIONS
    }
  },
  {
    prop: "assignedAdvisor",
    label: t("leadManagement.columns.assignedAdvisor"),
    minWidth: 120
  },
  {
    prop: "createdAt",
    label: t("leadManagement.columns.createdAt"),
    minWidth: 180
  }
]);

const loadData = async (params: any) => {
  const res = await getLeadList(params);

  // 更新统计数据
  if (res.data?.list) {
    updateStats(res.data.list);
  }

  return res;
};

// 更新统计数据
const updateStats = (list: Lead.LeadInfo[]) => {
  leadStats.leadTotal = list.length;
  leadStats.pendingCount = list.filter(item => item.status === "pending").length;
  leadStats.processingCount = list.filter(item => item.status === "processing").length;
  leadStats.completedCount = list.filter(item => item.status === "completed").length;

  // 计算推送成功率
  const pushedLeads = list.filter(item => item.pushStatus === "success");
  const totalPushed = list.filter(item => item.pushStatus).length;
  leadStats.pushSuccessRate = totalPushed > 0 ? Math.round((pushedLeads.length / totalPushed) * 100) : 0;
};

// 刷新表格方法，供父组件调用
const refreshTable = () => {
  proTableRef.value?.getTableList();
};

// 设置过滤条件方法，供父组件调用
const setFilters = (filters: Record<string, any>) => {
  Object.assign(initParam, filters);
  // 触发表格刷新
  refreshTable();
};

// 暴露方法供父组件调用
defineExpose({
  refreshTable,
  setFilters
});

const viewDetail = (row: Lead.LeadInfo) => {
  currentLead.value = row;
  detailVisible.value = true;
};

const handlePush = async () => {
  const selectedRows = proTableRef.value?.selectedList || [];
  if (selectedRows.length === 0) {
    ElMessage.warning(t("leadManagement.messages.selectPush"));
    return;
  }

  // 打开推送配置抽屉
  selectedLeadIds.value = selectedRows.map((row: Lead.LeadInfo) => row.id);

  // 模拟获取默认顾问和联系人信息（实际应该从API获取）
  defaultAdvisor.value = {
    id: "1",
    name: "张顾问",
    role: "服务顾问",
    department: "北京朝阳店"
  };

  contactList.value = [
    {
      id: "1",
      source: "DMS",
      relation: "本人",
      phone: "138****8888",
      status: "有效",
      weight: 5,
      selected: true
    }
  ];

  pushDrawerVisible.value = true;
};

const handlePushSuccess = () => {
  ElMessage.success(t("leadManagement.messages.pushSuccess"));
  proTableRef.value?.getTableList();
};

const handlePushSingle = async (row: Lead.LeadInfo) => {
  // 打开推送配置抽屉
  selectedLeadIds.value = [row.id];

  // 模拟获取默认顾问和联系人信息
  defaultAdvisor.value = {
    id: "1",
    name: "张顾问",
    role: "服务顾问",
    department: "北京朝阳店"
  };

  contactList.value = [
    {
      id: "1",
      source: "DMS",
      relation: "本人",
      phone: row.phone || "138****8888",
      status: "有效",
      weight: 5,
      selected: true
    }
  ];

  pushDrawerVisible.value = true;
};

const handleRetryFailed = async () => {
  // 获取所有推送失败的商机
  const allRows = proTableRef.value?.tableData || [];
  const failedRows = allRows.filter((row: Lead.LeadInfo) => row.pushStatus === "failed");

  if (failedRows.length === 0) {
    ElMessage.info(t("leadManagement.messages.noFailed"));
    return;
  }

  try {
    await ElMessageBox.confirm(
      t("leadManagement.messages.retryConfirm", { count: failedRows.length }),
      t("leadManagement.messages.retryTitle"),
      {
        confirmButtonText: t("leadManagement.buttons.confirm"),
        cancelButtonText: t("leadManagement.buttons.cancel"),
        type: "warning"
      }
    );

    // 打开推送配置抽屉，允许客户修正数据后重试
    selectedLeadIds.value = failedRows.map((row: Lead.LeadInfo) => row.id);
    pushDrawerVisible.value = true;
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || t("leadManagement.messages.operationFailed"));
    }
  }
};

const handleReload = async () => {
  const selectedRows = proTableRef.value?.selectedList || [];
  if (selectedRows.length === 0) {
    ElMessage.warning(t("leadManagement.messages.selectReload"));
    return;
  }

  try {
    await ElMessageBox.confirm(t("leadManagement.messages.reloadConfirmBatch"), t("common.confirm"), {
      confirmButtonText: t("leadManagement.buttons.confirm"),
      cancelButtonText: t("leadManagement.buttons.cancel"),
      type: "warning"
    });

    for (const row of selectedRows) {
      await reloadLead(row.id);
    }

    ElMessage.success(t("leadManagement.messages.reloadSuccess"));
    proTableRef.value?.getTableList();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || t("leadManagement.messages.reloadFailed"));
    }
  }
};

const handleReloadSingle = async (row: Lead.LeadInfo) => {
  try {
    await ElMessageBox.confirm(t("leadManagement.messages.reloadConfirmSingle"), t("common.confirm"), {
      confirmButtonText: t("leadManagement.buttons.confirm"),
      cancelButtonText: t("leadManagement.buttons.cancel"),
      type: "warning"
    });

    await reloadLead(row.id);
    ElMessage.success(t("leadManagement.messages.reloadSuccess"));
    proTableRef.value?.getTableList();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || t("leadManagement.messages.reloadFailed"));
    }
  }
};

const getStatusLabel = (status: Lead.LeadStatus) => {
  const option = LEAD_STATUS_OPTIONS.find(opt => opt.value === status);
  return option?.label || status;
};

const getStatusTagType = (status: Lead.LeadStatus): "primary" | "success" | "warning" | "danger" | "info" => {
  const typeMap: Record<Lead.LeadStatus, "primary" | "success" | "warning" | "danger" | "info"> = {
    pending: "info",
    pushed: "warning",
    processing: "primary",
    completed: "success",
    rejected: "danger",
    failed: "danger"
  };
  return typeMap[status] || "info";
};

const getPriorityLabel = (priority: "low" | "medium" | "high") => {
  const option = PRIORITY_OPTIONS.find(opt => opt.value === priority);
  return option?.label || priority;
};

const getPriorityTagType = (priority: "low" | "medium" | "high"): "primary" | "success" | "warning" | "danger" | "info" => {
  const typeMap: Record<string, "primary" | "success" | "warning" | "danger" | "info"> = {
    low: "info",
    medium: "warning",
    high: "danger"
  };
  return typeMap[priority] || "info";
};

const getTypeTagType = (type: string): "primary" | "success" | "warning" | "danger" | "info" => {
  const typeMap: Record<string, "primary" | "success" | "warning" | "danger" | "info"> = {
    new_to_renew: "primary",
    renew_to_renew: "success",
    in_repair_no_insurance: "warning",
    dormant: "info",
    pending_activation: "danger",
    active: "success",
    diamond: "danger",
    gold: "warning",
    silver: "info"
  };
  return typeMap[type] || "primary";
};

const getPushStatusLabel = (status: "pending" | "success" | "failed") => {
  // 使用新的翻译
  return t(`leadManagement.enums.pushStatus.${status}`);
};

const getPushStatusTagType = (
  status: "pending" | "success" | "failed"
): "primary" | "success" | "warning" | "danger" | "info" => {
  const typeMap: Record<string, "primary" | "success" | "warning" | "danger" | "info"> = {
    pending: "warning",
    success: "success",
    failed: "danger"
  };
  return typeMap[status] || "info";
};
</script>

<style scoped lang="scss">
.lead-list-container {
  .status-text {
    display: inline-block;
    padding: 0 8px;
    color: #303133;
    font-size: 14px;
    line-height: 22px;
  }

  .lead-detail {
    .payload-section {
      margin-top: 20px;

      .section-title {
        font-weight: 600;
        margin-bottom: 12px;
        font-size: 14px;
      }

      .payload-content {
        background: #f5f7fa;
        padding: 16px;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 12px;
        line-height: 1.6;
        font-family: monospace;
      }
    }
  }

  .stats-panel {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }

  .stats-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: #ffffff;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border-color: transparent;
    }

    .stats-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.3s ease;
      font-size: 24px;
    }

    .stats-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 0;
    }

    .stats-number {
      font-size: 28px;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;

      .sub-value {
        font-size: 14px;
        font-weight: 400;
        color: #909399;
        margin-left: 4px;
      }
    }

    .stats-label {
      font-size: 14px;
      font-weight: 400;
      color: #606266;
      line-height: 1.5;
      word-break: break-word;
    }

    // 各类型卡片颜色配置
    &.primary-card {
      .stats-icon-wrapper {
        background-color: rgba(64, 158, 255, 0.12);
        color: #409eff;
      }
      .stats-number {
        color: #409eff;
      }
      &:hover .stats-icon-wrapper {
        background-color: rgba(64, 158, 255, 0.2);
      }
    }

    &.success-card {
      .stats-icon-wrapper {
        background-color: rgba(103, 194, 58, 0.12);
        color: #67c23a;
      }
      .stats-number {
        color: #67c23a;
      }
      &:hover .stats-icon-wrapper {
        background-color: rgba(103, 194, 58, 0.2);
      }
    }

    &.warning-card {
      .stats-icon-wrapper {
        background-color: rgba(230, 162, 60, 0.12);
        color: #e6a23c;
      }
      .stats-number {
        color: #e6a23c;
      }
      &:hover .stats-icon-wrapper {
        background-color: rgba(230, 162, 60, 0.2);
      }
    }

    &.info-card {
      .stats-icon-wrapper {
        background-color: rgba(144, 147, 153, 0.12);
        color: #909399;
      }
      .stats-number {
        color: #909399;
      }
      &:hover .stats-icon-wrapper {
        background-color: rgba(144, 147, 153, 0.2);
      }
    }
  }

  // 响应式设计
  @media (max-width: 1400px) {
    .stats-panel {
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
    }

    .stats-card {
      padding: 14px 16px;
      gap: 12px;

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

  @media (max-width: 768px) {
    .stats-panel {
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }

    .stats-card {
      padding: 12px 14px;
      gap: 12px;

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

  @media (max-width: 480px) {
    .stats-panel {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .stats-card {
      padding: 10px 12px;
      gap: 10px;

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
}
</style>
