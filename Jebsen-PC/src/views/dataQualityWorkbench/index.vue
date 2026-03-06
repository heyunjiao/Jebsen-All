<template>
  <div class="data-quality-workbench">
    <!-- 核心操作区：场景化入口 -->
    <el-card shadow="never" class="data-source-card">
      <template #header>
        <div class="card-header">
          <h2 class="card-title">{{ $t("dataQualityWorkbench.dataSource.title") }}</h2>
        </div>
      </template>
      <div class="data-source-tabs">
        <el-tabs v-model="selectedDataSource" type="card" class="main-tabs" @tab-change="handleDataSourceChange">
          <el-tab-pane v-for="source in dataSourceList" :key="source.value" :label="source.label" :name="source.value" />
        </el-tabs>
      </div>
    </el-card>

    <!-- 上传与预检区域 -->
    <el-card v-if="selectedDataSource" shadow="hover" class="upload-card">
      <!-- 拖拽上传区域 (Tabs) -->
      <div class="upload-area">
        <el-tabs v-model="activeReportId" class="report-tabs">
          <el-tab-pane v-for="report in currentPlatformReports" :key="report.id" :label="report.name" :name="report.id">
            <!-- 邮件通知规则 (Moved inside Report Tab) -->
            <div class="notification-tip-info">
              <div class="notification-card-new">
                <div class="card-left">
                  <div class="header-row">
                    <el-icon class="icon"><Bell /></el-icon>
                    <span class="title">{{ $t("dataQualityWorkbench.notification.title") }}</span>
                  </div>

                  <div class="info-row">
                    <div class="info-item">
                      <span class="label">{{ $t("dataQualityWorkbench.notification.deadlineTime") }}：</span>
                      <el-tag type="warning" size="small" effect="plain" class="deadline-tag">{{
                        getNotificationDeadline(selectedDataSource)
                      }}</el-tag>
                      <span class="desc">{{ $t("dataQualityWorkbench.notification.deadlineTimeDesc") }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">{{ $t("dataQualityWorkbench.notification.emailRecipients") }}：</span>
                      <span class="recipients">{{ getNotificationRecipients(selectedDataSource) }}</span>
                      <span class="desc">{{ $t("dataQualityWorkbench.notification.emailRecipientsDesc") }}</span>
                    </div>
                  </div>
                </div>

                <div class="card-right">
                  <div class="rules-timeline">
                    <div v-for="(rule, index) in getNotificationRules(selectedDataSource)" :key="index" class="timeline-item">
                      <div class="timeline-marker">
                        <el-tag :type="getStageTagType(index)" size="small" effect="dark" class="stage-tag">{{
                          rule.stage
                        }}</el-tag>
                      </div>
                      <div class="timeline-content">
                        <div class="time">{{ rule.time }}</div>
                        <div class="desc">{{ rule.description }}</div>
                        <div class="recipients-mini">{{ rule.recipients }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="tab-content">
              <!-- 报表状态/信息 -->
              <div class="report-info-bar">
                <el-tag
                  :type="getReportStatusTag(report.id) as 'success' | 'danger' | 'info' | 'warning' | 'primary'"
                  size="small"
                  class="status-tag"
                >
                  {{ getReportStatusLabel(report.id) }}
                </el-tag>
                <span class="last-upload-time" v-if="getReportLastUploadTime(report.id)">
                  {{ $t("dataQualityWorkbench.upload.lastUploadTime") }}: {{ getReportLastUploadTime(report.id) }}
                </span>
                <el-button type="primary" link :icon="Download" @click="downloadReportTemplate(report)" class="download-btn">
                  {{ $t("dataQualityWorkbench.dataSource.downloadTemplate") }}
                </el-button>
              </div>

              <!-- 专用上传区域 -->
              <el-upload
                class="upload-dragger"
                drag
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="file => handleReportFileChange(file, report)"
                accept=".xlsx"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  {{ $t("dataQualityWorkbench.upload.dragText") }} <em>{{ $t("dataQualityWorkbench.upload.clickUpload") }}</em>
                </div>
                <!-- 提示当前上传的是哪个报表 -->
                <template #tip>
                  <div class="el-upload__tip">
                    {{ $t("dataQualityWorkbench.upload.taskListTitle", { platform: report.name }) }}
                  </div>
                </template>
              </el-upload>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <!-- 批量上传与验证状态 (Global Loading) -->
    <div v-if="validating" class="global-loading-overlay">
      <div class="loading-content">
        <el-icon class="is-loading"><Loading /></el-icon>
        <p>{{ $t("dataQualityWorkbench.upload.validating") }}</p>
      </div>
    </div>

    <!-- 错误反馈区（已移除，错误时直接弹窗，不允许部分上传） -->
    <!-- 注意：有错误时不会显示此区域，直接显示错误弹窗并清空文件 -->

    <!-- 预检结果弹窗 -->
    <el-dialog
      v-model="preCheckDialogVisible"
      :title="
        preCheckResult?.hasErrors
          ? $t('dataQualityWorkbench.validation.orphanDataTitle')
          : $t('dataQualityWorkbench.validation.preCheck')
      "
      width="80%"
      :close-on-click-modal="false"
      :class="['pre-check-dialog', { 'pre-check-dialog-error': preCheckResult?.hasErrors }]"
      @close="handlePreCheckDialogClose"
    >
      <div class="pre-check-dialog-content">
        <!-- 预检状态提示（仅在成功时显示） -->
        <div v-if="!preCheckResult?.hasErrors" class="pre-check-status">
          <el-alert type="success" :closable="false" show-icon effect="light">
            <template #title>
              <div class="status-title-wrapper">
                <span class="status-title">
                  {{ $t("dataQualityWorkbench.validation.preCheckPassed") }}
                </span>
              </div>
            </template>
          </el-alert>
        </div>
        <!-- 操作提示信息（移到汇总信息下方） -->
        <div v-if="preCheckErrorRows && preCheckErrorRows.length > 0" class="pre-check-action-tips">
          <!-- 完善数据提示 -->
          <div class="improve-data-tip">
            <el-icon><InfoFilled /></el-icon>
            <div class="tip-content">
              <div class="tip-title">{{ $t("dataQualityWorkbench.validation.improveDataTip") }}</div>
            </div>
          </div>
          <!-- 关闭弹窗警告 -->
          <div class="close-dialog-warning">
            <el-icon><WarningFilled /></el-icon>
            <div class="warning-content">
              <div class="warning-title">{{ $t("dataQualityWorkbench.validation.closeDialogWarning") }}</div>
            </div>
          </div>
          <!-- 错误行提示 -->
          <!-- <div class="pre-check-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ $t("dataQualityWorkbench.validation.errorRowHighlight") }}</span>
          </div> -->
        </div>
        <!-- 汇总信息 -->
        <div v-if="preCheckResult && preCheckResult.total > 0" class="validation-summary-info">
          <div class="summary-title">{{ $t("dataQualityWorkbench.validation.summary") }}</div>
          <div class="summary-stats">
            <div class="stat-item total-stat">
              <span class="stat-label-text">{{ $t("dataQualityWorkbench.validation.totalRowsLabel") }}</span>
              <span class="stat-value">{{ preCheckResult.total }}</span>
              <span class="stat-unit">{{ $t("dataQualityWorkbench.validation.rowsUnit") }}</span>
            </div>
            <div class="stat-item success-stat">
              <span class="stat-label-text">{{ $t("dataQualityWorkbench.validation.successRowsLabel") }}</span>
              <span class="stat-value success">{{ preCheckResult.success }}</span>
              <span class="stat-unit">{{ $t("dataQualityWorkbench.validation.rowsUnit") }}</span>
            </div>
            <div class="stat-item error-stat">
              <span class="stat-label-text">{{ $t("dataQualityWorkbench.validation.errorRowsLabel") }}</span>
              <span class="stat-value error">{{ preCheckResult.error }}</span>
              <span class="stat-unit">{{ $t("dataQualityWorkbench.validation.rowsUnit") }}</span>
            </div>
          </div>
        </div>

        <!-- 错误详情表格 -->
        <div v-if="preCheckErrorRows && preCheckErrorRows.length > 0" class="error-details-section">
          <div class="section-header">
            <el-icon class="section-icon"><WarningFilled /></el-icon>
            <span class="section-title">{{ $t("dataQualityWorkbench.validation.errorDetails") }}</span>
          </div>
          <el-table
            :data="preCheckErrorRows"
            border
            :stripe="false"
            max-height="400"
            class="pre-check-error-table"
            :row-class-name="getErrorRowClassName"
          >
            <el-table-column :label="$t('dataQualityWorkbench.validation.rowNumber')" prop="rowIndex" width="80" align="center" />
            <el-table-column
              v-for="(col, index) in preCheckErrorColumns"
              :key="index"
              :label="getColumnLabel(col)"
              :prop="col"
              min-width="120"
              show-overflow-tooltip
            >
              <template #default="scope">
                <div
                  v-if="scope.row"
                  :class="{
                    'error-cell-wrapper': isErrorCell(scope.row.rowIndex, col, scope.row.errors || [])
                  }"
                >
                  <span
                    :class="{
                      'error-cell': isErrorCell(scope.row.rowIndex, col, scope.row.errors || [])
                    }"
                    :title="getCellErrorReason(scope.row.rowIndex, col, scope.row.errors || [])"
                  >
                    {{ scope.row[col] || "-" }}
                  </span>
                </div>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('dataQualityWorkbench.validation.errorReason')" prop="errors" min-width="200">
              <template #default="scope">
                <template v-if="scope.row && scope.row.errors && scope.row.errors.length > 0">
                  <el-tag v-for="(error, idx) in scope.row.errors" :key="idx" type="danger" size="small" class="error-tag">
                    {{ typeof error === "string" ? error : error.errorMessage || error }}
                  </el-tag>
                </template>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button size="default" @click="handlePreCheckDialogClose">
            {{ $t("dataQualityWorkbench.validation.cancel") }}
          </el-button>
          <el-button v-if="preCheckResult?.hasErrors" type="primary" size="default" :icon="Download" @click="downloadErrorReport">
            {{ $t("dataQualityWorkbench.validation.downloadErrorReport") }}
          </el-button>
          <el-button v-if="!preCheckResult?.hasErrors" type="primary" size="default" @click="handleImportData">
            {{ $t("dataQualityWorkbench.validation.importData") }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 错误弹窗（保留原有功能） -->
    <el-dialog
      v-model="errorDialogVisible"
      :title="$t('dataQualityWorkbench.messages.validationFailed')"
      width="900px"
      :close-on-click-modal="false"
      class="error-dialog"
      @close="handleErrorDialogClose"
    >
      <div class="error-dialog-content">
        <div class="error-summary">
          <el-alert type="error" :closable="false" show-icon>
            <template #title>
              <span class="error-title">{{ errorDialogMessage }}</span>
            </template>
          </el-alert>
        </div>
        <!-- 汇总信息：整批文件的统计 -->
        <div v-if="validationResult && validationResult.total > 0" class="validation-summary-info">
          <div class="summary-title">{{ $t("dataQualityWorkbench.validation.summary") }}</div>
          <div class="summary-stats">
            <span class="stat-label">{{
              $t("dataQualityWorkbench.validation.totalRows", { total: validationResult.total })
            }}</span>
            <span class="stat-label success">{{
              $t("dataQualityWorkbench.validation.successRows", { success: validationResult.success })
            }}</span>
            <span class="stat-label error">{{
              $t("dataQualityWorkbench.validation.errorRows", { error: validationResult.error })
            }}</span>
          </div>
        </div>
        <div v-if="errorDialogRows && errorDialogRows.length > 0" class="error-details-section">
          <div class="section-header">
            <el-icon class="section-icon"><WarningFilled /></el-icon>
            <span class="section-title"
              >{{ $t("dataQualityWorkbench.validation.errorDetails") }}（{{ $t("common.total") }} {{ errorDialogRows.length }}
              {{ $t("common.rows") }}）</span
            >
          </div>
          <el-table :data="errorDialogRows" border stripe max-height="400" class="error-dialog-table">
            <el-table-column :label="$t('dataQualityWorkbench.validation.rowNumber')" prop="rowIndex" width="80" align="center" />
            <el-table-column
              v-for="(col, index) in errorDialogColumns"
              :key="index"
              :label="getColumnLabel(col)"
              :prop="col"
              min-width="120"
              show-overflow-tooltip
            >
              <template #default="scope">
                <span
                  v-if="scope.row"
                  :class="{
                    'error-cell': isErrorCell(scope.row.rowIndex, col, scope.row.errors || [])
                  }"
                  :title="getCellErrorReason(scope.row.rowIndex, col, scope.row.errors || [])"
                >
                  {{ scope.row[col] || "-" }}
                </span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('dataQualityWorkbench.validation.errorReason')" prop="errors" min-width="200">
              <template #default="scope">
                <template v-if="scope.row && scope.row.errors && scope.row.errors.length > 0">
                  <el-tag v-for="(error, idx) in scope.row.errors" :key="idx" type="danger" size="small" class="error-tag">
                    {{ typeof error === "string" ? error : error.errorMessage || error }}
                  </el-tag>
                </template>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleErrorDialogClose">{{ $t("common.confirm") }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 底部：操作追溯日志 -->
    <el-card shadow="hover" class="audit-log-card table-box">
      <template #header>
        <div class="card-header">
          <h2 class="card-title">{{ $t("dataQualityWorkbench.auditLog.title") }}</h2>
        </div>
      </template>
      <pro-table
        ref="auditLogTableRef"
        :columns="auditLogColumns"
        :request-api="loadAuditLogApi"
        :init-param="{}"
        :pagination="true"
        :border="true"
        :row-key="'uploadTime'"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox, type UploadFile, type UploadFiles } from "element-plus";
import { useI18n } from "vue-i18n";
import { WarningFilled, CircleCheck, Download, UploadFilled, Loading, Check, Bell, InfoFilled } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";
import {
  uploadAndValidateFile,
  downloadTemplate as downloadTemplateApi,
  importValidData,
  submitAllData,
  getAuditLog,
  type ValidationResult
} from "@/api/modules/dataQualityWorkbench";
import { PLATFORM_REPORTS, PLATFORM_METADATA } from "@/views/collection/constants";

const { t } = useI18n();

// 状态数据（已移除，不再使用）

// 数据源选择（默认选中 DMS）
const selectedDataSource = ref<string>("poas");

const dataSourceList = computed(() => {
  return Object.keys(PLATFORM_METADATA).map(key => {
    const meta = PLATFORM_METADATA[key];
    // 使用国际化获取数据源名称和标签
    const i18nKey = `dataQualityWorkbench.dataSource.${key}`;
    return {
      value: key,
      label: t(`${i18nKey}.name`, meta.label), // 如果翻译不存在，使用 meta.label 作为后备
      tagType: meta.tagType,
      tagLabel: t(`${i18nKey}.tag`, meta.tagLabel) // 如果翻译不存在，使用 meta.tagLabel 作为后备
    };
  });
});

const uploadRef = ref();
const fileList = ref<UploadFile[]>([]);
const validating = ref(false);
const activeReportId = ref<string>("");

// 邮件通知配置信息（仅展示，业务人员查看）
// 获取邮件通知截止时间（仅展示）
const getNotificationDeadline = (dataSource: string): string => {
  const deadlines: Record<string, string> = {
    dms: "18:00",
    poas: "18:00",
    wws: "18:00",
    cap: "18:00",
    voucher: "18:00",
    manual: "18:00"
  };
  return deadlines[dataSource] || "18:00";
};

// 获取邮件通知收件人（仅展示）
const getNotificationRecipients = (dataSource: string): string => {
  const recipients: Record<string, string> = {
    dms: t("dataQualityWorkbench.notification.recipients.dataTeamLeaderAndBusiness"),
    poas: t("dataQualityWorkbench.notification.recipients.dataTeamLeaderAndBusiness"),
    wws: t("dataQualityWorkbench.notification.recipients.dataTeamLeader"),
    cap: t("dataQualityWorkbench.notification.recipients.dataTeamLeader"),
    voucher: t("dataQualityWorkbench.notification.recipients.dataTeamLeaderAndBusiness"),
    manual: t("dataQualityWorkbench.notification.recipients.dataTeamLeader")
  };
  return recipients[dataSource] || t("dataQualityWorkbench.notification.recipients.dataTeamLeader");
};

const validationResult = ref<{
  total: number;
  success: number;
  error: number;
  hasErrors: boolean;
  errorRows: Array<{
    rowIndex: number;
    [key: string]: any;
    errors: string[];
  }>;
} | null>(null);
const tableColumns = ref<string[]>([]);
const currentFileId = ref<string>(""); // 存储上传后的文件ID，用于后续操作

// 上传完成状态
const uploadCompleted = ref(false);
const completedTime = ref("");
const completedRows = ref(0);

// 今日完成状态（从操作日志中检查）
const todayCompletedStatus = ref<Record<string, boolean>>({});
// 今日已上传的文件信息
const todayUploadedFiles = ref<Record<string, any>>({});

// 检查今日是否已完成
const isTodayCompleted = (dataSource: string): boolean => {
  return todayCompletedStatus.value[dataSource] || false;
};

// 获取今日已上传的文件信息
const getTodayUploadedFile = (dataSource: string) => {
  return todayUploadedFiles.value[dataSource] || null;
};

// 检查今日完成状态
const checkTodayCompleted = async () => {
  try {
    const mockData = await import("@/assets/json/dataQualityWorkbenchMockData.json");
    if (mockData.default && mockData.default.auditLog && mockData.default.auditLog.data) {
      const { list } = mockData.default.auditLog.data;
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      // 重置状态
      todayCompletedStatus.value = {};
      todayUploadedFiles.value = {};

      // 检查每个数据源今日是否有成功的上传记录
      const dataSourceMap: Record<string, string> = {
        dms: "DMS",
        poas: "POAS",
        wws: "WWS",
        cap: "C@P",
        voucher: "Voucher",
        manual: "Manual Files"
      };

      Object.keys(dataSourceMap).forEach(key => {
        const sourceName = dataSourceMap[key];
        // 检查今日是否有成功的上传记录
        const todayRecords = list.filter((item: any) => {
          const uploadDate = item.uploadTime?.split(" ")[0]; // 提取日期部分
          return (
            uploadDate === today &&
            item.dataSource === sourceName &&
            item.uploadStatus === "success" &&
            item.validationResult === "passed"
          );
        });

        if (todayRecords.length > 0) {
          // 取最新的一条记录
          const latestRecord = todayRecords.sort((a: any, b: any) => {
            return new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime();
          })[0];
          todayCompletedStatus.value[key] = true;
          todayUploadedFiles.value[key] = latestRecord;
        }
      });

      // 为了演示效果，设置 C@P 为已完成（因为 mock 数据是历史数据）
      // 实际项目中应该从真实 API 获取今日数据
      // 这里为了演示，如果 C@P 有最近的成功记录，就标记为已完成
      const capRecords = list.filter((item: any) => {
        return item.dataSource === "C@P" && item.uploadStatus === "success" && item.validationResult === "passed";
      });

      // 如果有 C@P 的成功记录，标记为已完成（用于演示）
      if (capRecords.length > 0) {
        const latestCapRecord = capRecords.sort((a: any, b: any) => {
          return new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime();
        })[0];
        todayCompletedStatus.value["cap"] = true;
        todayUploadedFiles.value["cap"] = latestCapRecord;
      }

      console.log("今日完成状态:", todayCompletedStatus.value);
      console.log("今日已上传文件:", todayUploadedFiles.value);
    }
  } catch (error) {
    console.error("检查今日完成状态失败:", error);
  }
};

// 平台报表清单配置
const currentPlatformReports = computed(() => {
  const reports = PLATFORM_REPORTS[selectedDataSource.value] || [];
  // 使用国际化获取报表名称
  return reports.map(report => ({
    ...report,
    name: t(`dataQualityWorkbench.reports.${report.id}`, report.name) // 如果翻译不存在，使用 report.name 作为后备
  }));
});

// 初始化或监听 activeReportId
onMounted(() => {
  if (currentPlatformReports.value.length > 0 && !activeReportId.value) {
    activeReportId.value = currentPlatformReports.value[0].id;
  }
});

// 报表状态管理 (Mock)
// key: reportId, value: { status, lastUploadTime, ... }
const reportStatusMap = ref<Record<string, any>>({});

// 获取报表状态
const getReportStatusTag = (reportId: string) => {
  const status = reportStatusMap.value[reportId]?.status || "pending";
  const map: Record<string, string> = {
    pending: "info",
    uploaded: "success",
    error: "danger"
  };
  return map[status] || "info";
};

const getReportStatusLabel = (reportId: string) => {
  const status = reportStatusMap.value[reportId]?.status || "pending";
  const map: Record<string, string> = {
    pending: t("dataQualityWorkbench.auditLog.statusPending"),
    uploaded: t("dataQualityWorkbench.auditLog.uploadSuccess"),
    error: t("dataQualityWorkbench.auditLog.uploadFailed")
  };
  return map[status] || status;
};

const getReportLastUploadTime = (reportId: string) => {
  return reportStatusMap.value[reportId]?.lastUploadTime || "";
};

const isReportCompleted = (reportId: string) => {
  return reportStatusMap.value[reportId]?.status === "uploaded";
};

// 错误弹窗相关
const errorDialogVisible = ref(false);
const errorDialogMessage = ref("");
const errorDialogRows = ref<any[]>([]);
const errorDialogColumns = ref<string[]>([]);

// 预检弹窗相关
const preCheckDialogVisible = ref(false);
const preCheckResult = ref<{
  total: number;
  success: number;
  error: number;
  hasErrors: boolean;
  errorRows: Array<{
    rowIndex: number;
    [key: string]: any;
    errors: string[];
  }>;
} | null>(null);
const preCheckErrorRows = ref<any[]>([]);
const preCheckErrorColumns = ref<string[]>([]);
const currentPreCheckFile = ref<File | null>(null);
const currentPreCheckReport = ref<{ id: string; name: string } | null>(null);

// 列名映射（英文到中文）
const columnNameMapping = computed(() => ({
  VIN: t("dataQualityWorkbench.columnMapping.VIN"),
  Phone: t("dataQualityWorkbench.columnMapping.Phone"),
  Customer_Name: t("dataQualityWorkbench.columnMapping.Customer_Name"),
  Model: t("dataQualityWorkbench.columnMapping.Model"),
  Dealer_Code: t("dataQualityWorkbench.columnMapping.Dealer_Code"),
  Sales_Consultant: t("dataQualityWorkbench.columnMapping.Sales_Consultant"),
  Order_Date: t("dataQualityWorkbench.columnMapping.Order_Date"),
  Delivery_Date: t("dataQualityWorkbench.columnMapping.Delivery_Date"),
  Amount: t("dataQualityWorkbench.columnMapping.Amount"),
  Payment_Method: t("dataQualityWorkbench.columnMapping.Payment_Method"),
  Order_No: t("dataQualityWorkbench.columnMapping.Order_No"),
  Transaction_Date: t("dataQualityWorkbench.columnMapping.Transaction_Date"),
  Transaction_Type: t("dataQualityWorkbench.columnMapping.Transaction_Type"),
  Customer_Phone: t("dataQualityWorkbench.columnMapping.Customer_Phone"),
  Product_Name: t("dataQualityWorkbench.columnMapping.Product_Name"),
  Service_Order_No: t("dataQualityWorkbench.columnMapping.Service_Order_No"),
  Service_Date: t("dataQualityWorkbench.columnMapping.Service_Date"),
  License_Plate: t("dataQualityWorkbench.columnMapping.License_Plate"),
  Service_Type: t("dataQualityWorkbench.columnMapping.Service_Type"),
  Service_Amount: t("dataQualityWorkbench.columnMapping.Service_Amount"),
  Car_Model: t("dataQualityWorkbench.columnMapping.Car_Model"),
  Mileage: t("dataQualityWorkbench.columnMapping.Mileage"),
  Service_Consultant: t("dataQualityWorkbench.columnMapping.Service_Consultant")
}));

// 获取列的中文名称
const getColumnLabel = (column: string): string => {
  return columnNameMapping.value[column] || column;
};

// 操作追溯日志表格配置
const auditLogTableRef = ref();
const auditLogColumns: ColumnProps[] = [
  {
    prop: "uploadTime",
    label: t("dataQualityWorkbench.auditLog.uploadTime"),
    width: 180,
    search: {
      el: "date-picker",
      props: {
        type: "datetimerange",
        "value-format": "YYYY-MM-DD HH:mm:ss"
      }
    }
  },
  {
    prop: "dataSource",
    label: t("dataQualityWorkbench.auditLog.dataSource"),
    width: 150,
    search: {
      el: "select",
      props: {
        options: [
          { label: "DMS", value: "DMS" },
          { label: "POAS", value: "POAS" },
          { label: "WWS", value: "WWS" },
          { label: "C@P", value: "C@P" },
          { label: "Voucher", value: "Voucher" },
          { label: "Manual Files", value: "Manual Files" }
        ]
      }
    }
  },
  {
    prop: "fileName",
    label: t("dataQualityWorkbench.auditLog.fileName"),
    minWidth: 200,
    search: {
      el: "input",
      props: {
        placeholder: t("dataQualityWorkbench.auditLog.fileNamePlaceholder")
      }
    }
  },
  {
    prop: "operator",
    label: t("dataQualityWorkbench.auditLog.operator"),
    width: 180,
    search: {
      el: "input",
      props: {
        placeholder: t("dataQualityWorkbench.auditLog.operatorPlaceholder")
      }
    }
  },
  {
    prop: "validationResult",
    label: t("dataQualityWorkbench.auditLog.validationResult"),
    width: 120,
    align: "center",
    tag: true,
    enum: [
      { label: t("dataQualityWorkbench.auditLog.statusPassed"), value: "passed", tagType: "success" },
      { label: t("dataQualityWorkbench.auditLog.statusFailed"), value: "failed", tagType: "danger" },
      { label: t("dataQualityWorkbench.auditLog.statusPending"), value: "pending", tagType: "info" }
    ],
    search: {
      el: "select",
      props: {
        options: [
          { label: t("dataQualityWorkbench.auditLog.statusPassed"), value: "passed" },
          { label: t("dataQualityWorkbench.auditLog.statusFailed"), value: "failed" },
          { label: t("dataQualityWorkbench.auditLog.statusPending"), value: "pending" }
        ]
      }
    }
  },
  {
    prop: "uploadStatus",
    label: t("dataQualityWorkbench.auditLog.uploadStatus"),
    width: 120,
    align: "center",
    tag: true,
    enum: [
      { label: t("dataQualityWorkbench.auditLog.uploadSuccess"), value: "success", tagType: "success" },
      { label: t("dataQualityWorkbench.auditLog.uploadFailed"), value: "failed", tagType: "danger" },
      { label: t("dataQualityWorkbench.auditLog.uploadProcessing"), value: "processing", tagType: "warning" }
    ],
    search: {
      el: "select",
      props: {
        options: [
          { label: t("dataQualityWorkbench.auditLog.uploadSuccess"), value: "success" },
          { label: t("dataQualityWorkbench.auditLog.uploadFailed"), value: "failed" },
          { label: t("dataQualityWorkbench.auditLog.uploadProcessing"), value: "processing" }
        ]
      }
    }
  },
  {
    prop: "totalRows",
    label: t("dataQualityWorkbench.auditLog.totalRows"),
    width: 100,
    align: "right"
  },
  {
    prop: "successRows",
    label: t("dataQualityWorkbench.auditLog.successRows"),
    width: 100,
    align: "right"
  },
  {
    prop: "errorRows",
    label: t("dataQualityWorkbench.auditLog.errorRows"),
    width: 100,
    align: "right"
  }
];

// 操作追溯日志API请求函数（mock 数据由 API 拦截器处理）
// useTable hook 期望返回格式: { data: { list: [...], total: ... } }
const loadAuditLogApi = async (params: any) => {
  // 直接导入 mock 数据，确保数据能正确显示
  const mockData = await import("@/assets/json/dataQualityWorkbenchMockData.json");

  if (mockData.default && mockData.default.auditLog && mockData.default.auditLog.data) {
    const { list, total } = mockData.default.auditLog.data;

    // 模拟分页
    const page = params?.pageNum || params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const result = {
      data: {
        list: list.slice(start, end),
        total: total || list.length
      }
    };

    console.log("操作日志数据返回（直接使用 mock）:", result);
    return result;
  }

  // 如果直接导入失败，尝试通过 API
  try {
    const res = await getAuditLog(params);

    if (res && (res as any).data && (res as any).data.list) {
      const result = {
        data: {
          list: (res as any).data.list || [],
          total: (res as any).data.total || 0
        }
      };
      console.log("操作日志数据返回（通过 API）:", result);
      return result;
    }
  } catch (error) {
    console.error("加载操作日志失败:", error);
  }

  // 返回空数据
  return {
    data: {
      list: [],
      total: 0
    }
  };
};

// 处理数据源变更
const handleDataSourceChange = () => {
  fileList.value = [];
  validationResult.value = null;
  uploadCompleted.value = false;
  completedTime.value = "";
  completedRows.value = 0;

  // 重置选中的报表Tab
  if (currentPlatformReports.value.length > 0) {
    activeReportId.value = currentPlatformReports.value[0].id;
  } else {
    activeReportId.value = "";
  }

  // 重新检查今日完成状态
  checkTodayCompleted();
};

// 下载通用模板
const downloadTemplate = async () => {
  if (!selectedDataSource.value) {
    ElMessage.warning(t("dataQualityWorkbench.messages.fileRequired"));
    return;
  }
  try {
    const res = await downloadTemplateApi(selectedDataSource.value);
    // @ts-expect-error
    const blob = res instanceof Blob ? res : (res as any);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedDataSource.value.toUpperCase()}_template.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    ElMessage.success(t("dataQualityWorkbench.messages.uploadSuccess"));
  } catch (error) {
    console.error("下载模板失败:", error);
    ElMessage.error(t("dataQualityWorkbench.messages.uploadFailed"));
  }
};

// 下载模板 (具体报表)
const downloadReportTemplate = async (report: { id: string; name: string }) => {
  if (!selectedDataSource.value) {
    ElMessage.warning(t("dataQualityWorkbench.messages.fileRequired"));
    return;
  }
  try {
    // 模拟下载
    // const res = await downloadTemplateApi(selectedDataSource.value, report.id);
    // 暂时不做实际请求，仅提示
    ElMessage.success(t("dataQualityWorkbench.messages.uploadSuccess"));
  } catch (error) {
    console.error("下载模板失败:", error);
    ElMessage.error(t("dataQualityWorkbench.messages.uploadFailed"));
  }
};

// 模拟检查维修记录是否能在主数据库中匹配（通过客户手机号）
const checkDataAssociation = async (vin?: string, customerPhone?: string): Promise<boolean> => {
  // 模拟API调用，检查客户手机号是否能在主数据库中匹配
  // 实际项目中应该调用真实API
  await new Promise(resolve => setTimeout(resolve, 100)); // 模拟网络延迟

  // 模拟逻辑：如果客户手机号为空，或者包含特定字符（如"TEST"），则认为无法匹配
  if (customerPhone && customerPhone.includes("TEST")) return false;

  // 模拟：随机返回一些无法匹配的情况（约20%的数据无法匹配）
  return Math.random() > 0.2;
};

// 处理报表文件上传（增加预检功能）
const handleReportFileChange = async (file: UploadFile, report: { id: string; name: string }) => {
  if (!selectedDataSource.value) {
    ElMessage.warning(t("dataQualityWorkbench.messages.fileRequired"));
    return;
  }

  // Step 1: 前端基础校验
  const fileSize = file.size || 0;
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (fileSize > maxSize) {
    ElMessage.error(t("dataQualityWorkbench.upload.fileSizeError"));
    return;
  }

  if (!file.name.endsWith(".xlsx")) {
    ElMessage.error(t("dataQualityWorkbench.upload.fileFormatError"));
    return;
  }

  // Step 2: 对于Manual Files，执行预检流水线
  if (selectedDataSource.value === "manual") {
    await performPreCheck(file.raw as File, report);
    return;
  }

  // Step 3: 其他数据源调用后端API上传并校验
  validating.value = true;
  try {
    const res = await uploadAndValidateFile({
      file: file.raw as File,
      dataSource: selectedDataSource.value,
      reportType: report.id
    });

    validating.value = false;

    if (res.code === 200 && res.data) {
      if (res.data.hasErrors && res.data.errorRows.length > 0) {
        // 转换错误格式
        const errorRows = res.data.errorRows.map((row: any) => ({
          ...row,
          errors: row.errors.map((err: any) => err.errorMessage || err)
        }));

        showErrorDialog(errorRows, res.msg);
      } else {
        ElMessage.success(res.msg || `${report.name} ${t("dataQualityWorkbench.upload.validationComplete")}`);
        // 更新报表状态
        reportStatusMap.value[report.id] = {
          status: "uploaded",
          lastUploadTime: new Date().toLocaleString()
        };
        // 检查整个平台是否完成
        checkTodayCompleted();
      }
    } else {
      showErrorDialog([], res.msg || "上传失败");
    }
  } catch (error: any) {
    validating.value = false;
    console.error("上传文件失败:", error);
    const errorMsg = error?.msg || error?.message || "上传文件失败，请重试";
    showErrorDialog([], errorMsg);
  }
};

// 执行预检流水线（仅针对Manual Files）
const performPreCheck = async (file: File, report: { id: string; name: string }) => {
  validating.value = true;
  currentPreCheckFile.value = file;
  currentPreCheckReport.value = report;

  try {
    // 模拟读取Excel文件（实际项目中应该使用xlsx库解析）
    // 这里我们模拟一个预检结果
    await new Promise(resolve => setTimeout(resolve, 1500)); // 模拟预检过程

    // 模拟预检结果数据（维修记录）- 只保留一条记录，手机号错误
    const mockData = [
      {
        rowIndex: 2,
        Service_Order_No: "SV20240115001",
        Service_Date: "2024-01-15",
        Customer_Phone: "TEST12345678",
        Service_Type: "定期保养",
        Service_Amount: "2500.00",
        Car_Model: "911 Carrera",
        Mileage: "15000",
        Dealer_Code: "BJ001",
        Service_Consultant: "李顾问",
        errors: []
      }
    ];

    // 检查维修记录的客户手机号关联
    const errorRows: any[] = [];
    for (const row of mockData) {
      const customerPhone = row.Customer_Phone;
      const canAssociate = await checkDataAssociation(undefined, customerPhone);

      if (!canAssociate) {
        errorRows.push({
          ...row,
          errors: [t("dataQualityWorkbench.validation.cannotAssociate")]
        });
      }
    }

    // 构建预检结果
    const total = mockData.length;
    const error = errorRows.length;
    const success = total - error;

    preCheckResult.value = {
      total,
      success,
      error,
      hasErrors: error > 0,
      errorRows
    };

    // 提取表头
    if (mockData.length > 0) {
      const firstRow = mockData[0];
      preCheckErrorColumns.value = Object.keys(firstRow).filter(key => key !== "rowIndex" && key !== "errors");
    }

    preCheckErrorRows.value = errorRows;
    validating.value = false;

    // 显示预检结果弹窗
    preCheckDialogVisible.value = true;
  } catch (error: any) {
    validating.value = false;
    console.error("预检失败:", error);
    ElMessage.error("预检失败，请重试");
  }
};

// 显示错误弹窗
const showErrorDialog = (errorRows: any[], errorMessage: string) => {
  errorDialogMessage.value = errorMessage;
  errorDialogRows.value = errorRows || [];

  // 如果有错误行，提取表头
  if (errorRows && errorRows.length > 0 && errorRows[0]) {
    // 从第一行数据中提取所有列名（排除 rowIndex 和 errors）
    const firstRow = errorRows[0];
    errorDialogColumns.value = Object.keys(firstRow).filter(key => key !== "rowIndex" && key !== "errors");
  } else {
    errorDialogColumns.value = [];
  }

  // 确保 validationResult 存在，用于显示整批文件的汇总信息
  // validationResult 应该已经在 handleFileChange 中设置好了（包含整批文件的 total、success、error）
  // 只有在特殊情况下（如表头不匹配等）才需要创建默认值
  if (!validationResult.value) {
    // 这种情况通常发生在表头不匹配等错误，此时无法获取整批文件的统计信息
    // 创建一个默认的 validationResult，但不会显示有意义的汇总信息
    validationResult.value = {
      total: 0,
      success: 0,
      error: 0,
      hasErrors: true,
      errorRows: errorRows || []
    };
  }
  // 注意：如果 validationResult 已存在，不要覆盖它，因为它包含整批文件的完整统计信息

  errorDialogVisible.value = true;
};

// 关闭错误弹窗时清空文件
const handleErrorDialogClose = () => {
  errorDialogVisible.value = false;
  fileList.value = [];
  validationResult.value = null;
  tableColumns.value = [];
  currentFileId.value = "";
};

// 关闭预检弹窗
const handlePreCheckDialogClose = () => {
  preCheckDialogVisible.value = false;
  preCheckResult.value = null;
  preCheckErrorRows.value = [];
  preCheckErrorColumns.value = [];
  currentPreCheckFile.value = null;
  currentPreCheckReport.value = null;
};

// 获取错误行的类名（用于标红）
const getErrorRowClassName = ({ row }: { row: any }) => {
  if (row && row.errors && row.errors.length > 0) {
    return "error-row";
  }
  return "";
};

// 导出失败报告（CSV格式）
const downloadErrorReport = () => {
  if (!preCheckErrorRows.value || preCheckErrorRows.value.length === 0) {
    ElMessage.warning(t("dataQualityWorkbench.messages.noErrorsToShow"));
    return;
  }

  try {
    // 构建CSV内容
    const headers = ["行号", ...preCheckErrorColumns.value.map(col => getColumnLabel(col)), "错误原因"];
    const csvRows: string[] = [headers.join(",")];

    // 添加数据行
    for (const row of preCheckErrorRows.value) {
      const csvRow: string[] = [
        String(row.rowIndex || ""),
        ...preCheckErrorColumns.value.map(col => {
          const value = row[col] || "";
          // CSV格式处理：如果包含逗号、引号或换行符，需要用引号包裹并转义
          if (value.toString().includes(",") || value.toString().includes('"') || value.toString().includes("\n")) {
            return `"${value.toString().replace(/"/g, '""')}"`;
          }
          return value.toString();
        }),
        (row.errors || []).map((err: any) => (typeof err === "string" ? err : err.errorMessage || err)).join("; ")
      ];
      csvRows.push(csvRow.join(","));
    }

    // 创建Blob并下载
    const csvContent = csvRows.join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // 添加BOM以支持Excel正确显示中文
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `预检失败报告_${currentPreCheckReport.value?.name || "ManualFiles"}_${new Date().getTime()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    ElMessage.success("失败报告导出成功");
  } catch (error) {
    console.error("导出失败报告失败:", error);
    ElMessage.error("导出失败报告失败，请重试");
  }
};

// 处理入库数据
const handleImportData = async () => {
  if (!currentPreCheckFile.value || !currentPreCheckReport.value) {
    ElMessage.warning("数据异常，无法入库");
    return;
  }

  try {
    validating.value = true;
    // 调用入库API
    const res = await uploadAndValidateFile({
      file: currentPreCheckFile.value,
      dataSource: selectedDataSource.value,
      reportType: currentPreCheckReport.value.id
    });

    validating.value = false;

    if (res.code === 200) {
      ElMessage.success("数据入库成功");
      // 更新报表状态
      if (currentPreCheckReport.value) {
        reportStatusMap.value[currentPreCheckReport.value.id] = {
          status: "uploaded",
          lastUploadTime: new Date().toLocaleString()
        };
      }
      // 关闭预检弹窗
      handlePreCheckDialogClose();
      // 检查整个平台是否完成
      checkTodayCompleted();
    } else {
      ElMessage.error(res.msg || "数据入库失败");
    }
  } catch (error: any) {
    validating.value = false;
    console.error("数据入库失败:", error);
    ElMessage.error("数据入库失败，请重试");
  }
};

// 处理文件移除
const handleFileRemove = () => {
  validationResult.value = null;
  tableColumns.value = [];
};

// 判断是否为错误单元格
const isErrorCell = (rowIndex: number, column: string, errors: any[]): boolean => {
  if (!errors || errors.length === 0) return false;
  // 检查错误数组中是否有该列的错误
  return errors.some((err: any) => {
    const errorMsg = typeof err === "string" ? err : err.errorMessage || "";
    return errorMsg.includes(column) || column.includes(errorMsg.split(" ")[0]);
  });
};

// 获取单元格错误原因
const getCellErrorReason = (rowIndex: number, column: string, errors: any[]): string => {
  if (!errors || errors.length === 0) return "";
  const relevantErrors = errors
    .filter((err: any) => {
      const errorMsg = typeof err === "string" ? err : err.errorMessage || "";
      return errorMsg.includes(column) || column.includes(errorMsg.split(" ")[0]);
    })
    .map((err: any) => (typeof err === "string" ? err : err.errorMessage || ""));
  return relevantErrors.length > 0 ? relevantErrors.join("; ") : "";
};

// 取消上传
const handleCancelUpload = () => {
  fileList.value = [];
  validationResult.value = null;
  tableColumns.value = [];
};

// 已移除：仅导入正确数据功能（不允许部分上传，有错误必须全部退回）

// 获取数据源名称
const getDataSourceName = (dataSource: string): string => {
  const i18nKey = `dataQualityWorkbench.dataSource.${dataSource}.name`;
  const fallback = PLATFORM_METADATA[dataSource]?.label || dataSource;
  return t(i18nKey, fallback);
};

// 获取邮件通知规则
const getNotificationRules = (dataSource: string) => {
  const rules: Record<string, Array<{ stage: string; time: string; description: string; recipients: string }>> = {
    dms: [
      {
        stage: "T+0",
        time: "18:00",
        description: t("dataQualityWorkbench.notification.stageT0Desc"),
        recipients: t("dataQualityWorkbench.notification.recipients.dataTeamLeader")
      },
      {
        stage: "T+1",
        time: "09:00",
        description: t("dataQualityWorkbench.notification.stageT1Desc"),
        recipients: t("dataQualityWorkbench.notification.recipients.dataTeamLeaderAndBusiness")
      },
      {
        stage: "T+2",
        time: "09:00",
        description: t("dataQualityWorkbench.notification.stageT2Desc"),
        recipients: t("dataQualityWorkbench.notification.recipients.dataTeamBusinessManagement")
      }
    ],
    poas: [
      {
        stage: "T+0",
        time: "18:00",
        description: t("dataQualityWorkbench.notification.stageT0Desc"),
        recipients: t("dataQualityWorkbench.notification.recipients.dataTeamLeader")
      },
      {
        stage: "T+1",
        time: "09:00",
        description: t("dataQualityWorkbench.notification.stageT1Desc"),
        recipients: t("dataQualityWorkbench.notification.recipients.dataTeamLeaderAndBusiness")
      },
      {
        stage: "T+2",
        time: "09:00",
        description: t("dataQualityWorkbench.notification.stageT2Desc"),
        recipients: t("dataQualityWorkbench.notification.recipients.dataTeamBusinessManagement")
      }
    ],
    wws: [
      {
        stage: "T+0",
        time: "18:00",
        description: t("dataQualityWorkbench.notification.stageT0Desc"),
        recipients: t("dataQualityWorkbench.notification.recipients.dataTeamLeader")
      },
      {
        stage: "T+1",
        time: "09:00",
        description: t("dataQualityWorkbench.notification.stageT1Desc"),
        recipients: t("dataQualityWorkbench.notification.recipients.dataTeamLeaderAndBusiness")
      }
    ],
    cap: [
      {
        stage: "T+0",
        time: "18:00",
        description: t("dataQualityWorkbench.notification.stageT0Desc"),
        recipients: t("dataQualityWorkbench.notification.recipients.dataTeamLeader")
      },
      {
        stage: "T+1",
        time: "09:00",
        description: t("dataQualityWorkbench.notification.stageT1Desc"),
        recipients: t("dataQualityWorkbench.notification.recipients.dataTeamLeaderAndBusiness")
      }
    ],
    manual: [
      {
        stage: "T+0",
        time: "18:00",
        description: t("dataQualityWorkbench.notification.stageT0Desc"),
        recipients: t("dataQualityWorkbench.notification.recipients.dataTeamLeader")
      },
      {
        stage: "T+1",
        time: "09:00",
        description: t("dataQualityWorkbench.notification.stageT1Desc"),
        recipients: t("dataQualityWorkbench.notification.recipients.dataTeamLeaderAndBusiness")
      }
    ]
  };
  return rules[dataSource] || [];
};

// 获取阶段标签类型
const getStageTagType = (index: number): "info" | "warning" | "danger" => {
  const types: Array<"info" | "warning" | "danger"> = ["info", "warning", "danger"];
  return types[index] || "info";
};

// 模拟错误文件（用于测试）
const simulateErrorFile = () => {
  // 这个函数可以在开发时用于测试错误场景
  console.log("模拟错误文件功能");
};

// 页面加载时检查今日完成状态
onMounted(() => {
  // 检查今日完成状态
  checkTodayCompleted();
  // 监听操作日志表格刷新，更新完成状态
  // 可以通过定时器定期检查，或者在上传成功后刷新
});
</script>

<style lang="scss" scoped>
.data-quality-workbench {
  padding: 20px;
  background-color: var(--el-bg-color-page, #f5f7fa);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary, #303133);
      margin: 0 0 4px;
      display: flex;
      align-items: center;
      gap: 8px;

      &::before {
        content: "";
        width: 4px;
        height: 18px;
        background: linear-gradient(180deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
        border-radius: 2px;
      }
    }
  }

  .data-source-card {
    margin-bottom: 0px; /* Remove gap */
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom: none; /* Let the tabs handle the boundary */
    box-shadow: none; /* Remove shadow */
    position: relative;
    z-index: 2; /* Sit on top of upload card */

    :deep(.el-card__header) {
      padding: 18px 24px;
      border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
      background: linear-gradient(135deg, var(--el-bg-color-page, #fafbfc) 0%, var(--el-bg-color, #ffffff) 100%);
    }

    :deep(.el-card__body) {
      padding: 24px 24px 0 24px; /* Remove bottom padding so tabs sit flush */
      background: var(--el-bg-color, #ffffff);
    }

    .data-source-tabs {
      margin-bottom: 0px; /* Remove tab bottom margin */

      :deep(.el-tabs__header) {
        margin-bottom: 0;
        background-color: transparent;
        /* Restore standard border */
      }

      /* Optional: Customize top-level tabs to stand out */
      :deep(.el-tabs__item) {
        font-weight: 500;
        &.is-active {
          font-weight: 600;
          background-color: #fff;
          border-bottom-color: #fff; /* Connect to next card */
        }
      }
    }

    .template-download-area {
      margin-top: 20px;
      text-align: center;
      padding-bottom: 24px; /* Add padding back if download area exists */
    }
  }

  .upload-card {
    margin-bottom: 20px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    margin-top: -1px; /* Overlap borders */
    border-top: 1px solid var(--el-border-color-lighter, #dcdfe6); /* Ensure border matches */
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);

    /* Removed Header specific styles since header is gone */

    :deep(.el-card__body) {
      padding: 24px;
      background: #ffffff;
    }

    .notification-tip-info {
      margin-bottom: 24px;
      margin-top: 16px; /* Space from tabs */

      .notification-card-new {
        display: flex;
        /* Enterprise Info Block Style */
        border: 1px solid var(--el-color-primary-light-8);
        border-left: 4px solid var(--el-color-primary); /* Left Accent */
        background-color: var(--el-color-primary-light-9); /* Very light brand tint */
        border-radius: 4px; /* Slight rounding */
        overflow: hidden;

        /* Left Side: General Info */
        .card-left {
          width: 35%; /* More compact */
          padding: 16px 24px;
          border-right: 1px solid var(--el-color-primary-light-8); /* Match border */
          display: flex;
          flex-direction: column;
          justify-content: center;

          .header-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;

            .icon {
              font-size: 16px;
              color: var(--el-color-primary);
            }
            .title {
              font-size: 14px;
              font-weight: 600;
              color: var(--el-text-color-primary);
            }
          }

          .info-row {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .info-item {
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              font-size: 13px;
              line-height: 1.5;

              .label {
                color: var(--el-text-color-regular);
                min-width: 60px;
              }

              .deadline-tag {
                margin-right: 8px;
                border-radius: 2px; /* Sharper tags */
              }

              .recipients {
                color: var(--el-text-color-primary);
                font-weight: 500;
                margin-right: 8px;
              }

              .desc {
                color: var(--el-text-color-placeholder);
                font-size: 12px;
              }
            }
          }
        }

        /* Right Side: Timeline/Steps */
        .card-right {
          flex: 1;
          padding: 16px 24px;
          background-color: transparent; /* Inherit rounded corners from container */
          display: flex;
          flex-direction: column;
          justify-content: center;

          .rules-timeline {
            display: flex;
            flex-direction: column;
            gap: 4px; /* Tighter list */

            .timeline-item {
              display: flex;
              align-items: center;
              padding: 4px 0;

              .timeline-marker {
                margin-right: 12px;
                .stage-tag {
                  min-width: 40px;
                  text-align: center;
                  border: none;
                  border-radius: 2px; /* Sharper */
                  font-weight: 500;
                }
              }

              .timeline-content {
                flex: 1;
                display: flex;
                align-items: center;
                // justify-content: flex-start;
                gap: 12px;
                font-size: 13px;

                .time {
                  font-weight: 600;
                  color: var(--el-color-primary);
                  width: 45px;
                }
                .desc {
                  flex: 1;
                  color: var(--el-text-color-regular);
                }
                .recipients-mini {
                  color: var(--el-text-color-secondary);
                  font-size: 12px;
                }
              }
            }
          }
        }
      }
    }

    .upload-area {
      width: 100%;

      :deep(.el-upload-dragger) {
        width: 100%;
        padding: 48px 40px;
        border: 2px dashed var(--el-border-color, #d9d9d9);
        border-radius: 8px;
        background: linear-gradient(135deg, var(--el-bg-color-page, #fafbfc) 0%, var(--el-bg-color, #ffffff) 100%);
        transition: all 0.3s;

        &:hover {
          border-color: var(--el-color-primary);
          background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-8) 100%);
        }

        .el-icon--upload {
          font-size: 48px;
          color: var(--el-color-primary);
          margin-bottom: 16px;
        }

        .el-upload__text {
          color: var(--el-text-color-regular, #606266);
          font-size: 14px;
          line-height: 1.6;

          em {
            color: var(--el-color-primary);
            font-style: normal;
            font-weight: 500;
          }
        }
      }
    }

    .validation-status {
      margin-top: 16px;
      text-align: center;
      color: var(--el-color-primary);

      .el-icon {
        margin-right: 8px;
      }
    }

    .report-tabs {
      margin-top: 0;

      :deep(.el-tabs__header) {
        margin-bottom: 0;
        border-bottom: none; /* No layout border */
      }

      /* Tab Wrapping Styles - Force Override */
      :deep(.el-tabs__nav-wrap) {
        &.is-scrollable {
          padding: 0 !important;
          box-shadow: none !important;
        }
        /* Remove default bottom line of nav-wrap to avoid double lines if we add one to header */
        &::after {
          display: none;
        }
      }
      :deep(.el-tabs__nav-prev),
      :deep(.el-tabs__nav-next) {
        display: none !important;
      }
      :deep(.el-tabs__nav-scroll) {
        overflow: visible !important;
      }
      :deep(.el-tabs__nav) {
        white-space: normal !important;
        display: flex;
        flex-wrap: wrap;
        float: none !important;
        transform: none !important; /* Prevent JS scroll transform */
        border-bottom: none !important;
        gap: 12px; /* Gap between pills */
      }
      :deep(.el-tabs__item) {
        height: 36px;
        line-height: normal;
        padding: 0 20px;
        font-size: 14px;
        color: var(--el-text-color-regular);
        transition: all 0.3s;

        /* Pill Style */
        background-color: var(--el-fill-color-light, #f5f7fa);
        border-radius: 20px; /* Full pill shape */
        border: 1px solid transparent;

        margin-bottom: 0px; /* Gap handled by flex gap */
        display: inline-flex;
        align-items: center;
        justify-content: center;

        &:hover {
          color: var(--el-color-primary);
          background-color: var(--el-color-primary-light-9);
        }

        &.is-active {
          font-weight: 600;
          color: var(--el-color-primary);
          background-color: var(--el-color-primary-light-9);
          border-color: var(--el-color-primary-light-5);
          box-shadow: 0 2px 4px rgba(64, 158, 255, 0.1);
        }
      }
      /* Hide the active bar if wrapping makes it jump weirdly, or let it handle itself. 
          Usually easier to hide standard bar and use text color or separate indicator if multi-row.
          But Element Plus active bar might work if width calculation is dynamic. 
          Let's try hiding it for a cleaner multi-row text look similar to the image which looks like just text. */
      :deep(.el-tabs__active-bar) {
        display: none !important;
      }

      .tab-content {
        padding: 24px 0; /* Add top padding to content */
        .report-info-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding: 10px 16px;
          background-color: var(--el-bg-color-page, #f5f7fa);
          border-radius: 4px;

          .status-tag {
            margin-right: 12px;
          }

          .last-upload-time {
            font-size: 13px;
            color: var(--el-text-color-regular, #606266);
            flex: 1;
          }
        }
      }
    }

    .today-completed-info {
      margin-bottom: 20px;

      .today-completed-content {
        .completed-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;

          .completed-check-icon {
            font-size: 18px;
            color: var(--el-color-success);
          }

          .completed-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--el-color-success);
          }
        }

        .completed-file-info {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 16px;
          padding: 12px;
          background: linear-gradient(135deg, var(--el-color-success-light-9) 0%, #ffffff 100%);
          border-radius: 6px;
          border: 1px solid var(--el-color-success-light-7);

          .file-info-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;

            .file-info-label {
              color: var(--el-text-color-placeholder, #909399);
              font-weight: 500;
              min-width: 80px;

              &::after {
                content: "：";
              }
            }

            .file-info-value {
              color: var(--el-text-color-primary, #303133);
              font-weight: 500;
              flex: 1;
            }
          }
        }

        .completed-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
      }

      :deep(.el-alert) {
        border: 1px solid var(--el-color-success-light-7);
        background: linear-gradient(135deg, var(--el-color-success-light-9) 0%, #ffffff 100%);

        .el-alert__icon {
          color: var(--el-color-success);
        }
      }
    }
  }

  .validation-card {
    margin-bottom: 16px;

    .validation-summary {
      .summary-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary, #303133);
        margin-bottom: 16px;
      }

      .summary-stats {
        .stat-item {
          padding: 12px;
          margin-bottom: 8px;
          background: var(--el-bg-color-page, #f5f7fa);
          border-radius: 4px;

          &.success {
            background: #f0f9ff;
            color: #67c23a;
          }

          &.error {
            background: #fef0f0;
            color: #f56c6c;
          }

          .stat-label {
            font-size: 14px;
            font-weight: 500;
          }
        }
      }
    }

    .error-details {
      .details-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary, #303133);
        margin-bottom: 16px;
      }

      .error-table {
        :deep(.error-cell) {
          background-color: #fef0f0 !important;
          color: #f56c6c;
          font-weight: 500;
        }

        .error-tag {
          margin-right: 8px;
          margin-bottom: 4px;
        }
      }
    }

    .validation-actions {
      margin-top: 24px;
      text-align: right;

      .el-button {
        margin-left: 12px;
      }
    }
  }

  .success-card {
    margin-bottom: 20px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);

    :deep(.el-card__body) {
      padding: 32px;
      background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-bg-color, #ffffff) 100%);
    }
  }

  .upload-completed-card {
    margin-bottom: 20px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
    border: 1px solid var(--el-color-success-light-7);
    background: linear-gradient(135deg, var(--el-color-success-light-9) 0%, #ffffff 100%);

    :deep(.el-card__body) {
      padding: 24px;
    }

    .upload-completed-content {
      display: flex;
      align-items: flex-start;
      gap: 20px;

      .completed-icon-wrapper {
        flex-shrink: 0;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--el-color-success) 0%, var(--el-color-success-light-3) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);

        .completed-icon {
          font-size: 32px;
          color: #ffffff;
        }
      }

      .completed-info {
        flex: 1;

        .completed-title {
          margin: 0 0 8px;
          font-size: 18px;
          font-weight: 600;
          color: var(--el-text-color-primary, #303133);
        }

        .completed-desc {
          margin: 0 0 16px;
          font-size: 14px;
          color: var(--el-text-color-regular, #606266);
          line-height: 1.6;
        }

        .completed-details {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;

          .detail-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;

            .detail-label {
              color: var(--el-text-color-placeholder, #909399);

              &::after {
                content: "：";
              }
            }

            .detail-value {
              color: var(--el-text-color-primary, #303133);
              font-weight: 500;
            }
          }
        }
      }
    }
  }

  .audit-log-card {
    margin-bottom: 20px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);

    :deep(.el-card__header) {
      padding: 18px 24px;
      border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
      background: linear-gradient(135deg, var(--el-bg-color-page, #fafbfc) 0%, var(--el-bg-color, #ffffff) 100%);
    }

    :deep(.el-card__body) {
      padding: 24px;
      background: var(--el-bg-color, #ffffff);
    }

    :deep(.el-table) {
      border-radius: 4px;
      overflow: hidden;

      .el-table__header {
        background: var(--el-bg-color-page, #f5f7fa);

        th {
          background: var(--el-bg-color-page, #f5f7fa);
          color: var(--el-text-color-regular, #606266);
          font-weight: 600;
        }
      }

      .el-table__row {
        transition: all 0.2s;

        &:hover {
          background: var(--el-bg-color-page, #f5f7fa);
        }
      }
    }
  }

  // 预检弹窗样式
  :deep(.pre-check-dialog) {
    .el-dialog__header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
      background: linear-gradient(135deg, var(--el-color-primary-light-9, #ecf5ff) 0%, #ffffff 100%);

      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary, #303133);
        display: flex;
        align-items: center;
        gap: 8px;

        &::before {
          content: "";
          display: inline-block;
          width: 4px;
          height: 18px;
          background: var(--el-color-primary, #409eff);
          border-radius: 2px;
        }
      }
    }

    // 错误状态下的header样式
    &.pre-check-dialog-error {
      .el-dialog__header {
        background: linear-gradient(135deg, #fef0f0 0%, #ffffff 100%);
        border-bottom: 1px solid var(--el-color-danger-light-7, #fde2e2);

        .el-dialog__title {
          color: var(--el-color-danger, #f56c6c);

          &::before {
            background: var(--el-color-danger, #f56c6c);
          }
        }
      }
    }

    .el-dialog__body {
      padding: 24px;
      background: var(--el-bg-color, #ffffff);
    }

    .pre-check-dialog-content {
      .pre-check-status {
        margin-bottom: 24px;

        .status-title-wrapper {
          display: flex;
          align-items: center;
          width: 100%;
        }

        .status-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--el-text-color-primary, #303133);
          letter-spacing: 0.2px;
        }

        :deep(.el-alert) {
          border-radius: 6px;
          padding: 16px 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

          &.el-alert--error {
            background: #fef0f0;
            border: 1px solid var(--el-color-danger-light-7, #fde2e2);

            .el-alert__icon {
              color: var(--el-color-danger, #f56c6c);
              font-size: 20px;
              margin-right: 12px;
            }

            .status-title {
              color: var(--el-color-danger, #f56c6c);
            }
          }

          &.el-alert--success {
            background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
            border: 1px solid var(--el-color-success-light-7, #e1f3d8);

            .el-alert__icon {
              color: var(--el-color-success, #67c23a);
              font-size: 20px;
              margin-right: 12px;
            }

            .status-title {
              color: var(--el-color-success, #67c23a);
            }
          }

          .el-alert__content {
            width: 100%;
          }
        }
      }

      .validation-summary-info {
        margin-bottom: 24px;
        padding: 20px 24px;
        background: var(--el-bg-color-page, #f5f7fa);
        border-radius: 8px;
        border: 1px solid var(--el-border-color-lighter, #ebeef5);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

        .summary-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary, #303133);
          margin-bottom: 16px;
          letter-spacing: 0.2px;
        }

        .summary-stats {
          display: flex;
          gap: 40px;
          align-items: baseline;
          flex-wrap: wrap;

          .stat-item {
            display: flex;
            align-items: baseline;
            gap: 8px;

            .stat-label-text {
              font-size: 14px;
              color: var(--el-text-color-regular, #606266);
              font-weight: 400;
              white-space: nowrap;
            }

            .stat-value {
              font-size: 24px;
              font-weight: 600;
              color: var(--el-text-color-primary, #303133);
              line-height: 1.2;
              font-variant-numeric: tabular-nums;
              letter-spacing: -0.01em;

              &.success {
                color: var(--el-color-success, #67c23a);
              }

              &.error {
                color: var(--el-color-danger, #f56c6c);
              }
            }

            .stat-unit {
              font-size: 14px;
              color: var(--el-text-color-regular, #606266);
              font-weight: 400;
            }
          }

          .total-stat {
            .stat-value {
              color: var(--el-color-primary, #409eff);
            }
          }
        }
      }

      .error-details-section {
        margin-bottom: 16px;

        .section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);

          .section-icon {
            color: var(--el-color-danger, #f56c6c);
            font-size: 18px;
          }

          .section-title {
            font-size: 15px;
            font-weight: 600;
            color: var(--el-text-color-primary, #303133);
          }
        }
      }

      .pre-check-action-tips {
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 20px;

        .improve-data-tip {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
          border: 1px solid var(--el-color-primary-light-7, #b3d8ff);
          border-left: 4px solid var(--el-color-primary, #409eff);
          border-radius: 6px;
          box-shadow: 0 1px 4px rgba(64, 158, 255, 0.08);

          .el-icon {
            color: var(--el-color-primary, #409eff);
            font-size: 18px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .tip-content {
            flex: 1;

            .tip-title {
              font-size: 14px;
              color: var(--el-text-color-primary, #303133);
              line-height: 1.6;
              font-weight: 500;
            }
          }
        }

        .close-dialog-warning {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background: linear-gradient(135deg, #fff7e6 0%, #ffffff 100%);
          border: 1px solid var(--el-color-warning-light-7, #fce7b3);
          border-left: 4px solid var(--el-color-warning, #e6a23c);
          border-radius: 6px;
          box-shadow: 0 1px 4px rgba(230, 162, 60, 0.08);

          .el-icon {
            color: var(--el-color-warning, #e6a23c);
            font-size: 18px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .warning-content {
            flex: 1;

            .warning-title {
              font-size: 14px;
              color: var(--el-text-color-primary, #303133);
              line-height: 1.6;
              font-weight: 500;
            }
          }
        }

        .pre-check-tip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: var(--el-color-info-light-9, #f4f4f5);
          border-left: 3px solid var(--el-color-info, #909399);
          border-radius: 4px;
          font-size: 13px;
          color: var(--el-text-color-regular, #606266);
          line-height: 1.5;

          .el-icon {
            color: var(--el-color-info, #909399);
            font-size: 16px;
            flex-shrink: 0;
          }
        }
      }
    }

    .pre-check-error-table {
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

      :deep(.el-table__header) {
        th {
          background: var(--el-bg-color-page, #f5f7fa);
          color: var(--el-text-color-primary, #303133);
          font-weight: 600;
          font-size: 14px;
          padding: 12px 0;
          border-bottom: 2px solid var(--el-border-color, #e4e7ed);
        }
      }

      :deep(.el-table__body) {
        tr.error-row {
          background-color: #fef0f0 !important;
          transition: all 0.2s ease;

          &:hover {
            background-color: #fde2e2 !important;
          }

          td {
            background-color: #fef0f0 !important;
            border-color: #fde2e2 !important;
            padding: 12px 0;
            font-size: 14px;
          }

          &:hover td {
            background-color: #fde2e2 !important;
          }
        }

        tr:not(.error-row) {
          transition: all 0.2s ease;

          &:hover {
            background-color: var(--el-bg-color-page, #f5f7fa);
          }

          td {
            padding: 12px 0;
            font-size: 14px;
          }
        }
      }

      :deep(.error-cell-wrapper) {
        position: relative;
        padding-left: 4px;

        .error-cell {
          display: inline-block;
          background-color: #fef0f0;
          color: #f56c6c;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 3px;
          position: relative;
          cursor: help;
          transition: all 0.2s;

          &:hover {
            background-color: #fde2e2;
            box-shadow: 0 1px 3px rgba(245, 108, 108, 0.2);
          }
        }
      }

      :deep(.error-tag) {
        margin-right: 6px;
        margin-bottom: 4px;
        border-radius: 4px;
        font-size: 12px;
        padding: 4px 10px;
        border: none;
        background: var(--el-color-danger-light-8, #fef0f0);
        color: var(--el-color-danger, #f56c6c);
        font-weight: 500;
      }

      :deep(.el-table__row) {
        transition: all 0.2s ease;
      }

      :deep(.el-table__border-column) {
        border-right: 1px solid var(--el-border-color-lighter, #ebeef5);
      }

      :deep(.el-table__border-row) {
        border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
      background: var(--el-bg-color, #ffffff);

      .el-button {
        min-width: 110px;
        height: 36px;
        font-weight: 500;
        font-size: 14px;
        border-radius: 4px;
        transition: all 0.2s;

        &.el-button--primary {
          box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);

          &:hover {
            box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
            transform: translateY(-1px);
          }
        }

        &:not(.el-button--primary) {
          border-color: var(--el-border-color, #dcdfe6);

          &:hover {
            border-color: var(--el-color-primary, #409eff);
            color: var(--el-color-primary, #409eff);
          }
        }
      }
    }
  }

  // 错误弹窗样式
  :deep(.error-dialog) {
    .el-dialog__header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--el-border-color, #e4e7ed);
      background: var(--el-color-danger-light-9, #fef0f0);

      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-color-danger, #f56c6c);
        display: flex;
        align-items: center;
        gap: 8px;

        &::before {
          content: "";
          display: inline-block;
          width: 4px;
          height: 18px;
          background: var(--el-color-danger, #f56c6c);
          border-radius: 2px;
        }
      }
    }

    .el-dialog__body {
      padding: 24px;
    }

    .error-dialog-content {
      .error-summary {
        margin-bottom: 20px;

        .error-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary, #303133);
        }

        :deep(.el-alert) {
          border: 1px solid var(--el-color-danger-light-7, #fde2e2);
          background: var(--el-color-danger-light-9, #fef0f0);

          .el-alert__icon {
            color: var(--el-color-danger, #f56c6c);
            font-size: 20px;
          }
        }
      }

      .validation-summary-info {
        margin-bottom: 20px;
        padding: 16px;
        background: var(--el-bg-color-page, #f5f7fa);
        border-radius: 4px;

        .summary-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-regular, #606266);
          margin-bottom: 12px;
        }

        .summary-stats {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;

          .stat-label {
            font-size: 14px;
            color: var(--el-text-color-regular, #606266);

            &.success {
              color: var(--el-color-success, #67c23a);
            }

            &.error {
              color: var(--el-color-danger, #f56c6c);
            }
          }
        }
      }

      .error-details-section {
        .section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--el-border-color, #e4e7ed);

          .section-icon {
            color: var(--el-color-danger, #f56c6c);
            font-size: 18px;
          }

          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--el-text-color-primary, #303133);
          }
        }

        .error-dialog-table {
          :deep(.error-cell) {
            background-color: #fef0f0 !important;
            color: #f56c6c;
            font-weight: 500;
          }

          .error-tag {
            margin-right: 8px;
            margin-bottom: 4px;
          }
        }
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      padding: 16px 24px;
      border-top: 1px solid var(--el-border-color, #e4e7ed);
    }
  }
}
</style>

<style scoped lang="scss">
.data-source-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  width: 100%;
}

.data-source-item {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: var(--el-bg-color, #ffffff);
  border: 1px solid var(--el-border-color, #e4e7ed);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &:hover {
    border-color: var(--el-border-color-hover, #c0c4cc);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &.active {
    border-color: var(--el-color-primary, #409eff);
    background-color: var(--el-color-primary-light-9, #ecf5ff);
    box-shadow: 0 2px 8px var(--el-color-primary-light-7);

    .active-indicator {
      opacity: 1;
    }
  }

  .source-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .source-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .source-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary, #303133);
    line-height: 1.4;
  }

  .source-tag {
    flex-shrink: 0;
  }

  .completion-mark {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--el-color-success, #67c23a);
    font-weight: 500;
    background: var(--el-color-success-light-9);
    padding: 4px 8px;
    border-radius: 4px;
    align-self: flex-start;
  }

  .active-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: var(--el-color-primary, #409eff);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
}
</style>
