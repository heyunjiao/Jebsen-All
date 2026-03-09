<template>
  <el-dialog
    v-model="drawerVisible"
    :title="t('errorCorrection.feedbackResolution.title')"
    width="90%"
    :before-close="handleClose"
    append-to-body
    class="feedback-resolution-dialog unified-dialog"
    destroy-on-close
  >
    <template #header>
      <div class="dialog-header-row">
        <span class="dialog-title">{{ t("errorCorrection.feedbackResolution.title") }}</span>
        <el-tag v-if="task?.oneId" type="success" size="small" class="ml-12">OneID: {{ task.oneId }}</el-tag>
      </div>
    </template>
    <div v-if="task" class="drawer-content">
      <el-tabs v-model="activeTab" class="feedback-tabs">
        <el-tab-pane :label="t('errorCorrection.feedbackResolution.tabs.resolution')" name="resolution">
          <!-- 主体内容：左右分栏比对 -->
          <div class="comparison-section">
            <!-- 左侧：黄金记录 -->
            <div class="left-panel">
              <el-card shadow="hover" class="panel-card">
                <template #header>
                  <div class="card-header">
                    <span class="card-title">{{ t("errorCorrection.feedbackResolution.goldenRecord.title") }}</span>
                    <el-tag type="info" size="small">{{ t("errorCorrection.feedbackResolution.taskNo") }}: {{ task.taskId }}</el-tag>
                  </div>
                </template>

                <el-form :model="goldenRecordForm" label-width="100px" label-position="right" class="golden-record-form">
                  <el-form-item>
                    <template #label>
                      <div class="label-with-source">
                        <span class="label-text">{{ t("errorCorrection.feedbackResolution.goldenRecord.name") }}</span>
                        <el-tooltip v-if="task?.goldenRecord?.sources?.name" placement="top">
                          <template #content>
                            Source: {{ task.goldenRecord.sources.name.system }}
                            <template v-if="task.goldenRecord.sources.name.id">
                              (ID: {{ task.goldenRecord.sources.name.id }})</template>
                          </template>
                          <span class="source-tag-mini">{{ task.goldenRecord.sources.name.system }}</span>
                        </el-tooltip>
                      </div>
                    </template>
                    <div class="form-item-wrapper">
                      <el-input
                        v-model="goldenRecordForm.name"
                        :placeholder="t('errorCorrection.feedbackResolution.goldenRecord.name')"
                        @input="handleFieldChange('name')"
                      />
                      <el-tooltip
                        v-if="lockedFields.name"
                        :content="t('errorCorrection.feedbackResolution.goldenRecord.lockTooltip')"
                        placement="top"
                      >
                        <el-icon class="lock-icon"><Lock /></el-icon>
                      </el-tooltip>
                    </div>
                    <div v-if="lockedFields.name" class="lock-hint">
                      {{ t("errorCorrection.feedbackResolution.goldenRecord.locked") }}
                    </div>
                  </el-form-item>

                  <el-form-item>
                    <template #label>
                      <div class="label-with-source">
                        <span class="label-text">{{ t("errorCorrection.feedbackResolution.goldenRecord.phone") }}</span>
                        <el-tooltip v-if="task?.goldenRecord?.sources?.phone" placement="top">
                          <template #content>
                            Source: {{ task.goldenRecord.sources.phone.system }}
                            <template v-if="task.goldenRecord.sources.phone.id">
                              (ID: {{ task.goldenRecord.sources.phone.id }})</template>
                          </template>
                          <span class="source-tag-mini">{{ task.goldenRecord.sources.phone.system }}</span>
                        </el-tooltip>
                      </div>
                    </template>
                    <div class="form-item-wrapper">
                      <el-input
                        v-model="goldenRecordForm.phone"
                        :placeholder="t('errorCorrection.feedbackResolution.goldenRecord.phone')"
                        @input="handleFieldChange('phone')"
                      />
                      <el-tooltip
                        v-if="lockedFields.phone"
                        :content="t('errorCorrection.feedbackResolution.goldenRecord.lockTooltip')"
                        placement="top"
                      >
                        <el-icon class="lock-icon"><Lock /></el-icon>
                      </el-tooltip>
                    </div>
                    <div v-if="lockedFields.phone" class="lock-hint">
                      {{ t("errorCorrection.feedbackResolution.goldenRecord.locked") }}
                    </div>
                  </el-form-item>

                  <el-form-item>
                    <template #label>
                      <div class="label-with-source">
                        <span class="label-text">{{ t("errorCorrection.feedbackResolution.goldenRecord.jobTitle") }}</span>
                        <el-tooltip v-if="task?.goldenRecord?.sources?.title" placement="top">
                          <template #content>
                            Source: {{ task.goldenRecord.sources.title.system }}
                            <template v-if="task.goldenRecord.sources.title.id">
                              (ID: {{ task.goldenRecord.sources.title.id }})</template>
                          </template>
                          <span class="source-tag-mini">{{ task.goldenRecord.sources.title.system }}</span>
                        </el-tooltip>
                      </div>
                    </template>
                    <div class="form-item-wrapper">
                      <el-input
                        v-model="goldenRecordForm.title"
                        :placeholder="t('errorCorrection.feedbackResolution.goldenRecord.jobTitle')"
                        @input="handleFieldChange('title')"
                      />
                      <el-tooltip
                        v-if="lockedFields.title"
                        :content="t('errorCorrection.feedbackResolution.goldenRecord.lockTooltip')"
                        placement="top"
                      >
                        <el-icon class="lock-icon"><Lock /></el-icon>
                      </el-tooltip>
                    </div>
                    <div v-if="lockedFields.title" class="lock-hint">
                      {{ t("errorCorrection.feedbackResolution.goldenRecord.locked") }}
                    </div>
                  </el-form-item>

                  <el-form-item>
                    <template #label>
                      <div class="label-with-source">
                        <span class="label-text">{{ t("errorCorrection.feedbackResolution.goldenRecord.company") }}</span>
                        <el-tooltip v-if="task?.goldenRecord?.sources?.company" placement="top">
                          <template #content>
                            Source: {{ task.goldenRecord.sources.company.system }}
                            <template v-if="task.goldenRecord.sources.company.id">
                              (ID: {{ task.goldenRecord.sources.company.id }})</template>
                          </template>
                          <span class="source-tag-mini">{{ task.goldenRecord.sources.company.system }}</span>
                        </el-tooltip>
                      </div>
                    </template>
                    <div class="form-item-wrapper">
                      <el-input
                        v-model="goldenRecordForm.company"
                        :placeholder="t('errorCorrection.feedbackResolution.goldenRecord.company')"
                        @input="handleFieldChange('company')"
                      />
                      <el-tooltip
                        v-if="lockedFields.company"
                        :content="t('errorCorrection.feedbackResolution.goldenRecord.lockTooltip')"
                        placement="top"
                      >
                        <el-icon class="lock-icon"><Lock /></el-icon>
                      </el-tooltip>
                    </div>
                    <div v-if="lockedFields.company" class="lock-hint">
                      {{ t("errorCorrection.feedbackResolution.goldenRecord.locked") }}
                    </div>
                  </el-form-item>

                  <el-form-item :label="t('errorCorrection.feedbackResolution.goldenRecord.tags')">
                    <el-select
                      v-model="goldenRecordForm.tags"
                      multiple
                      filterable
                      allow-create
                      :placeholder="t('errorCorrection.feedbackResolution.goldenRecord.tags')"
                      style="width: 100%"
                      @change="handleFieldChange('tags')"
                    >
                      <el-option v-for="tag in availableTags" :key="tag" :label="tag" :value="tag" />
                    </el-select>
                  </el-form-item>
                </el-form>
              </el-card>
            </div>

            <!-- 右侧：反馈与核实 -->
            <div class="right-panel">
              <el-card shadow="hover" class="panel-card">
                <template #header>
                  <div class="card-header">
                    <span class="card-title">{{ t("errorCorrection.feedbackResolution.feedback.title") }}</span>
                  </div>
                </template>

                <!-- 区域 A：原始反馈 -->
                <div class="feedback-section">
                  <div class="section-title">{{ t("errorCorrection.feedbackResolution.feedback.rawInput.title") }}</div>
                  <el-alert type="info" :closable="false" class="feedback-alert">
                    <template #default>
                      <div class="feedback-content">
                        <div class="feedback-text">{{ task.feedbackText }}</div>
                        <div class="feedback-meta">
                          <span class="reporter-label">{{ t("errorCorrection.feedbackResolution.feedback.rawInput.submittedBy") }}：</span>
                          <el-avatar :size="24" :src="task.reporter.avatar" class="reporter-avatar" />
                          <span class="reporter-name">{{ task.reporter.name }}</span>
                          <span class="reporter-time">{{ task.reporter.time }}</span>
                        </div>
                      </div>
                    </template>
                  </el-alert>
                </div>

                <!-- H5 纠错明细（结构化字段） -->
                <div v-if="task.correction" class="feedback-section correction-detail-section">
                  <div class="section-title">{{ t("errorCorrection.feedbackResolution.feedback.correctionDetail.title") }}</div>
                  <el-descriptions :column="1" border size="small" class="correction-detail-desc">
                    <el-descriptions-item :label="t('errorCorrection.feedbackResolution.feedback.correctionDetail.field')">
                      {{ task.correction.field }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="t('errorCorrection.feedbackResolution.feedback.correctionDetail.currentValue')">
                      {{ task.correction.currentValue }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="t('errorCorrection.feedbackResolution.feedback.correctionDetail.correctValue')">
                      <span class="correct-value">{{ task.correction.correctValue }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item v-if="task.correction.note" :label="t('errorCorrection.feedbackResolution.feedback.correctionDetail.note')">
                      {{ task.correction.note }}
                    </el-descriptions-item>
                  </el-descriptions>
                </div>

                <!-- 区域 B：智能辅助 -->
                <div class="suggestion-section">
                  <div class="section-title">{{ t("errorCorrection.feedbackResolution.feedback.smartSuggestion.title") }}</div>
                  <div class="suggestion-tags">
                    <el-tag
                      v-for="(phone, index) in extractedPhones"
                      :key="`phone-${index}`"
                      type="warning"
                      class="suggestion-tag"
                      @click="fillField('phone', phone)"
                    >
                      {{ t("errorCorrection.feedbackResolution.feedback.smartSuggestion.extractedPhone") }}: {{ phone }}
                      <el-icon class="tag-icon"><ArrowRight /></el-icon>
                    </el-tag>
                    <el-tag
                      v-for="(name, index) in extractedNames"
                      :key="`name-${index}`"
                      type="primary"
                      class="suggestion-tag"
                      @click="fillField('name', name)"
                    >
                      {{ t("errorCorrection.feedbackResolution.feedback.smartSuggestion.extractedName") }}: {{ name }}
                      <el-icon class="tag-icon"><ArrowRight /></el-icon>
                    </el-tag>
                    <div v-if="extractedPhones.length === 0 && extractedNames.length === 0" class="no-suggestion">
                      <el-text type="info" size="small">{{
                        t("errorCorrection.feedbackResolution.feedback.smartSuggestion.clickToFill")
                      }}</el-text>
                    </div>
                  </div>
                </div>

                <!-- 区域 C：核实记录 -->
                <div class="verification-section">
                  <div class="section-title">{{ t("errorCorrection.feedbackResolution.feedback.verification.title") }}</div>
                  <el-input
                    v-model="verificationRecord"
                    type="textarea"
                    :rows="4"
                    :placeholder="t('errorCorrection.feedbackResolution.feedback.verification.placeholder')"
                    maxlength="500"
                    show-word-limit
                  />
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>

        <!-- 身份血缘溯源 -->
        <el-tab-pane :label="t('errorCorrection.mergeWorkbench.tabs.lineage')" name="lineage">
          <LineageTrace :lineage-data="lineageData" :one-id="task.oneId" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 底部：决策操作栏 -->
    <template #footer v-if="activeTab === 'resolution'">
      <div class="drawer-footer">
        <div class="footer-right">
          <el-button type="danger" :loading="ignoring" @click="handleIgnore">
            {{ t("errorCorrection.feedbackResolution.actions.ignore") }}
          </el-button>
          <el-button @click="handleClose">{{ t("errorCorrection.feedbackResolution.actions.cancel") }}</el-button>
          <el-button type="primary" :loading="submitting" @click="handleConfirm">
            {{ t("errorCorrection.feedbackResolution.actions.save") }}
          </el-button>
        </div>
      </div>
    </template>

    <!-- 驳回对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      :title="t('errorCorrection.feedbackResolution.rejectDialog.title')"
      width="500px"
      append-to-body
      class="unified-dialog"
    >
      <el-form :model="rejectForm" label-width="100px">
        <el-form-item :label="t('errorCorrection.feedbackResolution.rejectDialog.reason')" required>
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            :placeholder="t('errorCorrection.feedbackResolution.rejectDialog.reasonPlaceholder')"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer-buttons">
          <el-button @click="rejectDialogVisible = false">{{
            t("errorCorrection.feedbackResolution.rejectDialog.cancel")
          }}</el-button>
          <el-button type="danger" @click="handleRejectConfirm">{{
            t("errorCorrection.feedbackResolution.rejectDialog.confirm")
          }}</el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { Lock, ArrowRight } from "@element-plus/icons-vue";
import LineageTrace, { type LineageItem } from "./LineageTrace.vue";

const { t } = useI18n();

// ==================== Props & Emits ====================
/** H5 提交的纠错明细（与 H5 submitFieldCorrection 一致） */
export interface CorrectionDetail {
  field: string;
  currentValue: string | number;
  correctValue: string | number;
  note?: string;
}

export interface FeedbackTask {
  taskId: string;
  oneId?: string;
  status: "pending" | "inProgress" | "resolved" | "rejected";
  reporter: {
    name: string;
    avatar: string;
    time: string;
  };
  feedbackText: string;
  /** H5 提交的结构化纠错信息（字段、当前值、纠错值、备注） */
  correction?: CorrectionDetail;
  goldenRecord: {
    name: string;
    phone: string;
    title: string;
    company?: string;
    tags?: string[];
    sources?: Record<string, { system: string; id?: string }>; // 各字段来源
  };
  slaDeadline?: string;
}

interface Props {
  visible: boolean;
  task: FeedbackTask | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  close: [];
  reject: [taskId: string, reason: string];
  ignore: [taskId: string];
  confirm: [taskId: string, corrections: Record<string, any>, verification: string];
}>();

// ==================== 响应式数据 ====================
const drawerVisible = computed({
  get: () => props.visible,
  set: value => emit("update:visible", value)
});

const goldenRecordForm = reactive<Record<string, any>>({
  name: "",
  phone: "",
  title: "",
  company: "",
  tags: []
});

const lockedFields = reactive<Record<string, boolean>>({
  name: false,
  phone: false,
  title: false,
  company: false
});

const verificationRecord = ref("");
const submitting = ref(false);
const rejectDialogVisible = ref(false);
const rejectForm = reactive({
  reason: ""
});

const availableTags = ref(["VIP", "高价值客户", "流失预警", "黄金会员"]);

const activeTab = ref("resolution");

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

// ==================== 计算属性 ====================
// 智能提取：从反馈文本中提取疑似电话和姓名
const extractedPhones = computed(() => {
  if (!props.task?.feedbackText) return [];
  const phoneRegex = /1[3-9]\d{9}/g;
  const matches = props.task.feedbackText.match(phoneRegex);
  return matches ? [...new Set(matches)] : [];
});

const extractedNames = computed(() => {
  if (!props.task?.feedbackText) return [];
  // 简单的姓名提取：匹配常见的中文姓名模式（2-4个汉字）
  const nameRegex =
    /[张李王刘陈杨黄赵吴周徐孙马朱胡郭何高林罗郑梁谢宋唐许韩冯邓曹彭曾肖田董袁潘于蒋蔡余杜叶程苏魏吕丁任沈姚卢姜崔钟谭陆汪范金石廖贾夏韦付方白邹孟熊秦邱江尹薛闫段雷侯龙史陶黎贺顾毛郝龚邵万钱严覃武戴莫孔向汤][伟芳娜敏静丽强磊军洋勇艳杰娟涛明超秀英华文辉力建平刚桂英][伟芳娜敏静丽强磊军洋勇艳杰娟涛明超秀英华文辉力建平刚桂英]?/g;
  const matches = props.task.feedbackText.match(nameRegex);
  return matches ? [...new Set(matches)] : [];
});

// ==================== 方法 ====================
const handleClose = () => {
  emit("close");
};

const handleFieldChange = (field: string) => {
  // 当字段值改变时，自动锁定该字段
  if (
    goldenRecordForm[field] &&
    goldenRecordForm[field] !== props.task?.goldenRecord[field as keyof typeof props.task.goldenRecord]
  ) {
    lockedFields[field] = true;
    ElMessage.info(t("errorCorrection.feedbackResolution.messages.fieldLocked"));
  }
};

const fillField = (field: string, value: string) => {
  goldenRecordForm[field] = value;
  handleFieldChange(field);
  ElMessage.success(t("errorCorrection.feedbackResolution.feedback.smartSuggestion.clickToFill"));
};

const ignoring = ref(false);

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
      emit("ignore", props.task.taskId);
      emit("close");
    } finally {
      ignoring.value = false;
    }
  } catch (e) {
    // User cancelled
  }
};

const handleReject = () => {
  rejectForm.reason = "";
  rejectDialogVisible.value = true;
};

const handleRejectConfirm = () => {
  if (!rejectForm.reason.trim()) {
    ElMessage.warning(t("errorCorrection.feedbackResolution.rejectDialog.reasonRequired"));
    return;
  }
  if (!props.task) return;
  emit("reject", props.task.taskId, rejectForm.reason);
  rejectDialogVisible.value = false;
  ElMessage.success(t("errorCorrection.feedbackResolution.messages.rejectSuccess"));
};

const handleConfirm = () => {
  if (!props.task) return;
  if (!verificationRecord.value.trim()) {
    ElMessage.warning(t("errorCorrection.feedbackResolution.messages.pleaseEnterVerification"));
    return;
  }

  ElMessageBox.confirm(
    t("errorCorrection.feedbackResolution.messages.confirmMessage"),
    t("errorCorrection.feedbackResolution.messages.confirmTitle"),
    {
      type: "warning"
    }
  ).then(() => {
    submitting.value = true;
    const corrections: Record<string, any> = {};
    Object.keys(lockedFields).forEach(field => {
      if (lockedFields[field]) {
        corrections[field] = goldenRecordForm[field];
      }
    });

    if (props.task) {
      emit("confirm", props.task.taskId, corrections, verificationRecord.value);
    }
    ElMessage.success(t("errorCorrection.feedbackResolution.messages.confirmSuccess"));
    submitting.value = false;
  });
};

// ==================== Watch ====================
watch(
  () => props.task,
  newTask => {
    if (newTask) {
      // 初始化表单数据
      goldenRecordForm.name = newTask.goldenRecord.name || "";
      goldenRecordForm.phone = newTask.goldenRecord.phone || "";
      goldenRecordForm.title = newTask.goldenRecord.title || "";
      goldenRecordForm.company = newTask.goldenRecord.company || "";
      goldenRecordForm.tags = newTask.goldenRecord.tags || [];
      verificationRecord.value = "";
      // 重置锁定状态
      Object.keys(lockedFields).forEach(key => {
        lockedFields[key] = false;
      });
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.feedback-resolution-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
    margin: 0;
  }

  .drawer-content {
    padding: 20px;
    background: #f5f7fa;
    min-height: 600px;
    max-height: 75vh;
    overflow-y: auto;
  }

  .dialog-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding-right: 30px;

    .dialog-title {
      font-size: 18px;
      color: #303133;
    }
  }

  // 主体内容：左右分栏
  .comparison-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;

    .left-panel,
    .right-panel {
      .panel-card {
        height: 100%;
        border-radius: 8px;

        :deep(.el-card__header) {
          padding: 16px 20px;
          border-bottom: 1px solid #e4e7ed;

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .card-title {
              font-size: 16px;
              font-weight: 600;
              color: #303133;
            }
          }
        }

        :deep(.el-card__body) {
          padding: 20px;
        }
      }
    }

    // 左侧：黄金记录表单
    .golden-record-form {
      .form-item-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;

        .el-input {
          flex: 1;
        }

        .lock-icon {
          color: #409eff;
          font-size: 18px;
          cursor: pointer;
          flex-shrink: 0;
        }
      }

      .lock-hint {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }

      .label-with-source {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        width: 100%;
        gap: 4px;

        .label-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .source-tag-mini {
          font-size: 10px;
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
          padding: 0 4px;
          height: 16px;
          line-height: 14px;
          border-radius: 4px;
          border: 1px solid var(--el-color-primary-light-8);
          font-weight: normal;
          cursor: help;
          flex-shrink: 0;
        }
      }
    }

    // 右侧：反馈与核实
    .feedback-section,
    .correction-detail-section,
    .suggestion-section,
    .verification-section {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
      }
    }

    .feedback-alert {
      :deep(.el-alert__content) {
        width: 100%;
      }

      .feedback-content {
        .feedback-text {
          font-size: 14px;
          color: #606266;
          line-height: 1.6;
          margin-bottom: 12px;
          white-space: pre-wrap;
        }

        .feedback-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #909399;

          .reporter-label {
            color: #909399;
            flex-shrink: 0;
          }

          .reporter-avatar {
            flex-shrink: 0;
          }

          .reporter-name {
            font-weight: 500;
            color: #606266;
          }

          .reporter-time {
            margin-left: auto;
          }
        }
      }
    }

    .correction-detail-section {
      .correction-detail-desc {
        margin-top: 8px;
      }
      .correct-value {
        color: var(--el-color-success);
        font-weight: 500;
      }
    }

    .suggestion-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .suggestion-tag {
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 4px;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .tag-icon {
          font-size: 12px;
        }
      }

      .no-suggestion {
        padding: 12px;
        text-align: center;
      }
    }
  }

  // 底部操作栏
  .drawer-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 16px 20px;
    border-top: 1px solid #e4e7ed;
    background: #ffffff;

    .footer-right {
      display: flex;
      gap: 12px;
    }
  }
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
  .dialog-footer-buttons,
  .footer-right {
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

      // 危险按钮（忽略、确认驳回）
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

      // 默认按钮（驳回、取消）
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

// 响应式设计
@media (max-width: 1200px) {
  .feedback-resolution-drawer {
    .comparison-section {
      grid-template-columns: 1fr;
    }
  }
}
</style>
