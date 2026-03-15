<template>
  <el-dialog
    :model-value="visible"
    :title="
      isAssociationException
        ? t('errorCorrection.taxonomy.consistency.name')
        : t('errorCorrection.common.correctionTitle')
    "
    width="700px"
    :close-on-click-modal="false"
    append-to-body
    class="unified-dialog"
    @update:model-value="handleClose"
  >
    <!-- 只读模式：显示处理结果 -->
    <!-- 只读模式：查看处理结果（用于已处理任务 & 关联性异常） -->
    <template v-if="task?.readonly">
      <el-alert :title="getStatusLabel()" :type="getStatusType()" show-icon :closable="false" class="mb-16">
        <template #default>
          {{ task?.errorMessage }}
        </template>
      </el-alert>

      <!-- 处理信息（关联性异常不展示，只保留简单提示） -->
      <div class="section" v-if="!isAssociationException">
        <div class="section-title">
          <el-icon><InfoFilled /></el-icon>
          {{ t("errorCorrection.quickEdit.processInfo") }}
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="t('errorCorrection.table.taskNo')">
            {{ task?.taskNo }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('errorCorrection.table.status')">
            <el-tag :type="getStatusTagType()">{{ getStatusLabel() }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('errorCorrection.table.handler')">
            {{ task?.handler || "-" }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('errorCorrection.quickEdit.processTime')">
            {{ task?.updateTime || "-" }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('errorCorrection.quickEdit.createTime')" :span="2">
            {{ task?.createTime || "-" }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 处理结果详情 -->
      <div class="section" v-if="task?.conflictInfo || task?.statusConflict">
        <div class="section-title">
          <el-icon><CircleCheck /></el-icon>
          {{ t("errorCorrection.quickEdit.processResult") }}
        </div>
        <el-card shadow="hover" class="result-card">
          <div v-if="task?.conflictInfo">
            <div class="result-item">
              <span class="result-label">{{ t("errorCorrection.quickEdit.trustedSource") }}:</span>
              <el-tag type="success">{{ task.conflictInfo.trustedSource || "-" }}</el-tag>
            </div>
          </div>
          <div v-if="task?.statusConflict">
            <div class="result-item">
              <span class="result-label">{{ t("errorCorrection.quickEdit.trustedSystem") }}:</span>
              <el-tag type="success">{{ task.statusConflict.trustedSource || "-" }}</el-tag>
            </div>
            <div class="result-item" v-if="task.statusConflict.dms && task.statusConflict.crm">
              <span class="result-label">DMS:</span>
              <span>{{ task.statusConflict.dms }}</span>
              <span class="result-label" style="margin-left: 16px">CRM:</span>
              <span>{{ task.statusConflict.crm }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </template>

    <!-- 编辑模式：有效性 / 完整性异常，提供修正表单 -->
    <template v-else>
      <el-alert :title="t('errorCorrection.quickEdit.alertTitle')" type="warning" show-icon :closable="false" class="mb-16">
        <template #default>
          {{ t("errorCorrection.quickEdit.alertDescNoField") }}
        </template>
      </el-alert>

      <!-- 原始数据预览 -->
      <div class="section" v-if="originalFields.length">
        <div class="section-title">
          <el-icon><Document /></el-icon>
          {{ t("errorCorrection.quickEdit.originalData") }}
        </div>
        <el-descriptions :column="2" border class="mb-16">
          <el-descriptions-item v-for="field in originalFields" :key="field" :label="field">
            <span>{{ task?.originalData[field] ?? "-" }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 修正表单：按字段提供输入，留空则表示不修改 -->
      <div class="section">
        <div class="section-title">
          <el-icon><Edit /></el-icon>
          {{ t("errorCorrection.quickEdit.correction") }}
        </div>
        <el-form label-width="120px">
          <el-form-item
            v-for="field in originalFields"
            :key="field"
            :label="field"
          >
            <el-input
              v-model="form.corrections[field]"
              :placeholder="String(task?.originalData[field] ?? t('errorCorrection.quickEdit.currentValue'))"
              clearable
            />
          </el-form-item>
        </el-form>
        <div class="field-hint">
          <el-icon><InfoFilled /></el-icon>
          <span>
            {{ t("errorCorrection.quickEdit.enterCorrectValue") }}，
            {{ t("errorCorrection.quickEdit.pleaseEnterCorrection") }}
          </span>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="dialog-footer-buttons">
        <el-button v-if="!task?.readonly" type="danger" :loading="ignoring" @click="handleIgnore">
          {{ t("errorCorrection.ignore") }}
        </el-button>
        <el-button @click="handleClose">
          {{ task?.readonly ? t("common.close") : t("common.cancel") }}
        </el-button>
        <el-button v-if="!task?.readonly" type="primary" :loading="saving" @click="handleSave">
          {{ t("errorCorrection.quickEdit.saveAndReprocess") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { Document, Warning, Edit, InfoFilled, CircleCheck } from "@element-plus/icons-vue";

export interface QuickEditTask {
  id: string;
  taskNo: string;
  // 不再在前端展示或按字段录入“报错字段”信息，只保留必要的上下文字段
  originalData: Record<string, any>;
  errorType: string;
  errorMessage: string;
  readonly?: boolean; // 是否只读模式
  suggestedFix?: string; // 修复建议
  valueMapping?: Record<string, string>; // 值映射关系
  sourceSystem?: string; // 源系统
  sourceId?: string; // 源系统ID
  // 处理历史信息（只读模式使用）
  status?: string; // 处理状态
  handler?: string; // 处理人
  createTime?: string; // 创建时间
  updateTime?: string; // 处理时间
  conflictInfo?: Record<string, any>; // 冲突信息
  statusConflict?: Record<string, string>; // 状态冲突信息
}

const props = defineProps<{
  visible: boolean;
  task: QuickEditTask | null;
}>();

const emit = defineEmits<{
  (e: "update:visible", visible: boolean): void;
  (e: "save", taskId: string, corrections: Record<string, string>): void;
  (e: "ignore", taskId: string): void;
}>();

const { t } = useI18n();

const saving = ref(false);
const ignoring = ref(false);

const form = reactive({
  // 已不再按字段维度收集修正，仅保留结构以便后续根据新需求扩展
  corrections: {} as Record<string, string>
});

// 是否为“关联性异常”（只读查看模式标题需要区分）
const isAssociationException = computed(() => props.task?.errorType === "consistency");

// 原始数据字段列表（用于生成表单）
const originalFields = computed(() => {
  if (!props.task || !props.task.originalData) return [] as string[];
  return Object.keys(props.task.originalData);
});

// 获取状态标签
const getStatusLabel = () => {
  if (!props.task?.status) return "";
  const statusMap: Record<string, string> = {
    pending: t("errorCorrection.status.pending"),
    draft: t("errorCorrection.status.draft"),
    processing: t("errorCorrection.status.processing"),
    resolved: t("errorCorrection.status.resolved"),
    rejected: t("errorCorrection.status.rejected"),
    ignored: t("errorCorrection.status.ignored")
  };
  return statusMap[props.task.status] || props.task.status;
};

// 获取状态类型（用于 Alert）
const getStatusType = (): "success" | "warning" | "info" | "error" => {
  if (!props.task?.status) return "info";
  const typeMap: Record<string, "success" | "warning" | "info" | "error"> = {
    pending: "warning",
    draft: "info",
    processing: "warning",
    resolved: "success",
    rejected: "warning",
    ignored: "info"
  };
  return typeMap[props.task.status] || "info";
};

// 获取状态 Tag 类型
const getStatusTagType = (): "success" | "warning" | "info" | "danger" => {
  if (!props.task?.status) return "info";
  const typeMap: Record<string, "success" | "warning" | "info" | "danger"> = {
    pending: "warning",
    draft: "info",
    processing: "warning",
    resolved: "success",
    rejected: "warning",
    ignored: "info"
  };
  return typeMap[props.task.status] || "info";
};

watch(
  () => props.task,
  () => {
    // 暂不按字段维度初始化修正表单
    form.corrections = {};
  },
  { immediate: true }
);

const handleClose = () => {
  emit("update:visible", false);
};

const handleSave = async () => {
  if (!props.task) return;

  // 验证至少填写了一个修正值
  const hasCorrection = Object.values(form.corrections).some(v => v.trim());
  if (!hasCorrection) {
    ElMessage.warning(t("errorCorrection.quickEdit.pleaseEnterCorrection"));
    return;
  }

  saving.value = true;
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800));
    await new Promise(resolve => setTimeout(resolve, 800));
    emit("save", props.task.id, form.corrections);
    ElMessage.success(t("errorCorrection.quickEdit.saveSuccess"));
    handleClose();
  } finally {
    saving.value = false;
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
.mb-16 {
  margin-bottom: 16px;
}

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

.error-fields {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.field-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  code {
    background: #f5f7fa;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    color: #606266;
  }

  .source-tag-inline {
    font-size: 11px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    padding: 0 6px;
    border-radius: 4px;
    border: 1px solid var(--el-color-primary-light-8);
  }
}

.result-card {
  border-radius: 8px;

  :deep(.el-card__body) {
    padding: 16px;
  }

  .result-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .result-label {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      min-width: 100px;
    }
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

      // 主要按钮（保存）
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

      // 默认按钮（取消、关闭）
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
