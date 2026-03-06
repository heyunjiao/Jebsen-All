<template>
  <el-dialog
    :model-value="visible"
    :title="t('errorCorrection.syncRetry.title')"
    width="650px"
    :close-on-click-modal="false"
    append-to-body
    class="unified-dialog"
    @update:model-value="handleClose"
  >
    <div class="retry-content">
      <!-- 错误信息 -->
      <div class="section">
        <div class="section-title">
          <el-icon color="#F56C6C"><WarningFilled /></el-icon>
          {{ t("errorCorrection.syncRetry.errorInfo") }}
        </div>
        <el-card shadow="hover" class="error-card">
          <div class="error-header">
            <el-tag type="danger">{{ task?.httpStatus || "Error" }}</el-tag>
            <span class="error-time">{{ task?.failedAt || "-" }}</span>
          </div>
          <div class="error-message">{{ task?.errorMessage || "-" }}</div>
        </el-card>
      </div>

      <!-- 目标系统 -->
      <div class="section">
        <div class="section-title">
          <el-icon><Connection /></el-icon>
          {{ t("errorCorrection.syncRetry.targetSystem") }}
        </div>
        <div class="system-info">
          <span class="label">{{ t("errorCorrection.syncRetry.system") }}:</span>
          <el-tag>{{ task?.targetSystem || "-" }}</el-tag>
          <span class="label ml-16">{{ t("errorCorrection.syncRetry.endpoint") }}:</span>
          <code class="endpoint">{{ task?.endpoint || "-" }}</code>
        </div>
      </div>

      <!-- 请求体 -->
      <div class="section">
        <div class="section-title">
          <el-icon><Document /></el-icon>
          {{ t("errorCorrection.syncRetry.requestPayload") }}
          <el-button text size="small" @click="togglePayload">
            {{ showPayload ? t("common.collapse") : t("common.expand") }}
          </el-button>
        </div>
        <el-collapse-transition>
          <el-card v-show="showPayload" shadow="hover" class="code-card">
            <pre class="json-view">{{ formatJson(task?.requestPayload) }}</pre>
          </el-card>
        </el-collapse-transition>
      </div>

      <!-- 重试结果 -->
      <div v-if="retryResult" class="section">
        <div class="section-title">
          <el-icon :color="retryResult.success ? '#67C23A' : '#F56C6C'">
            <component :is="retryResult.success ? 'CircleCheckFilled' : 'CircleCloseFilled'" />
          </el-icon>
          {{ t("errorCorrection.syncRetry.retryResult") }}
        </div>
        <el-alert
          :type="retryResult.success ? 'success' : 'error'"
          :title="retryResult.success ? t('errorCorrection.syncRetry.retrySuccess') : t('errorCorrection.syncRetry.retryFailed')"
          :description="retryResult.message"
          show-icon
          :closable="false"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer-buttons">
        <el-button v-if="!task?.readonly" type="danger" :loading="ignoring" @click="handleIgnore">
          {{ t("errorCorrection.ignore") }}
        </el-button>
        <el-button @click="handleClose">{{ t("common.cancel") }}</el-button>
        <el-button
          v-if="!task?.readonly"
          type="primary"
          :loading="retrying"
          :disabled="retryResult?.success"
          @click="handleRetry"
        >
          <el-icon v-if="!retrying"><Refresh /></el-icon>
          {{ retrying ? t("errorCorrection.syncRetry.retrying") : t("errorCorrection.syncRetry.retryNow") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessageBox } from "element-plus";
import { WarningFilled, Connection, Document, Refresh, CircleCheckFilled, CircleCloseFilled } from "@element-plus/icons-vue";

export interface SyncTask {
  id: string;
  taskNo: string;
  targetSystem: string;
  endpoint: string;
  httpStatus: string;
  errorMessage: string;
  failedAt: string;
  requestPayload: Record<string, any>;
  retryCount: number;
  readonly?: boolean; // 是否只读模式
}

interface RetryResult {
  success: boolean;
  message: string;
}

const props = defineProps<{
  visible: boolean;
  task: SyncTask | null;
}>();

const emit = defineEmits<{
  (e: "update:visible", visible: boolean): void;
  (e: "retry-success", taskId: string): void;
  (e: "ignore", taskId: string): void;
}>();

const { t } = useI18n();

const retrying = ref(false);
const ignoring = ref(false);
const showPayload = ref(false);
const retryResult = ref<RetryResult | null>(null);

const formatJson = (data: any) => {
  if (!data) return "{}";
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};

const togglePayload = () => {
  showPayload.value = !showPayload.value;
};

watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      // 重置状态
      retryResult.value = null;
      showPayload.value = false;
    }
  }
);

const handleClose = () => {
  emit("update:visible", false);
};

const handleRetry = async () => {
  if (!props.task) return;

  retrying.value = true;
  retryResult.value = null;

  try {
    // 模拟API重试调用
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 模拟成功率80%
    const success = Math.random() > 0.2;

    if (success) {
      retryResult.value = {
        success: true,
        message: t("errorCorrection.syncRetry.successMessage", { system: props.task.targetSystem })
      };
      // 延迟关闭并通知父组件
      setTimeout(() => {
        emit("retry-success", props.task!.id);
        handleClose();
      }, 1500);
    } else {
      retryResult.value = {
        success: false,
        message: t("errorCorrection.syncRetry.failedMessage")
      };
    }
  } finally {
    retrying.value = false;
  }
};

const handleIgnore = async () => {
  if (!props.task) return;

  try {
    await ElMessageBox.confirm(t("errorCorrection.ignoreConfirm"), t("errorCorrection.ignore"), {
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel"),
      type: "warning"
    });

    ignoring.value = true;
    try {
      emit("ignore", props.task.id);
      handleClose();
    } finally {
      ignoring.value = false;
    }
  } catch (e) {
    // User cancelled
  }
};
</script>

<style scoped lang="scss">
.retry-content {
  .section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #303133;
    }
  }
}

.error-card {
  border-radius: 8px;
  border: 1px solid #fde2e2;

  :deep(.el-card__body) {
    padding: 16px;
  }

  .error-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    .error-time {
      font-size: 12px;
      color: #909399;
    }
  }

  .error-message {
    font-family: monospace;
    font-size: 13px;
    color: #f56c6c;
    word-break: break-word;
    line-height: 1.6;
  }
}

.system-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;

  .label {
    color: #909399;
    font-size: 14px;
  }

  .endpoint {
    background: #f5f7fa;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: #606266;
    font-family: monospace;
  }

  .ml-16 {
    margin-left: 16px;
  }
}

.code-card {
  border-radius: 8px;

  :deep(.el-card__body) {
    padding: 16px;
  }

  .json-view {
    margin: 0;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 12px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 200px;
    overflow-y: auto;
    color: #606266;
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
  }
}

// 统一按钮间距
.dialog-footer-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
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
  .dialog-footer-buttons {
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

      // 危险按钮（忽略）
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
      }

      // 主要按钮（重试）
      &.el-button--primary {
        background-color: #409eff;
        border-color: #409eff;
        color: #ffffff;

        &:hover {
          background-color: #66b1ff;
          border-color: #66b1ff;
        }

        &:active {
          background-color: #3a8ee6;
          border-color: #3a8ee6;
        }
      }

      // 默认按钮（取消）
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
