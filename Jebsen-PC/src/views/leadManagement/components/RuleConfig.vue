<template>
  <div class="rule-config-container table-box">
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
      <template #tableHeader>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ t("ruleConfig.buttons.add") }}
        </el-button>
      </template>

      <!-- 商机类型列：展示商机类型名称 -->
      <template #leadType="scope">
        <span class="text-ellipsis">
          {{ getLeadTypeLabel(scope.row.leadType) }}
        </span>
      </template>

      <!-- 启用状态列：使用标签样式显示 -->
      <template #enabled="scope">
        <div class="status-cell">
          <el-tag :type="scope.row.enabled ? 'success' : 'info'" size="small" effect="plain">
            {{ scope.row.enabled ? t("ruleConfig.enums.status.enable") : t("ruleConfig.enums.status.disable") }}
          </el-tag>
        </div>
      </template>

      <!-- 操作列 -->
      <template #operation="scope">
        <el-button link type="primary" @click="handleEdit(scope.row)">
          <el-icon><Edit /></el-icon>
          {{ t("ruleConfig.buttons.edit") }}
        </el-button>
      </template>
    </pro-table>

    <!-- 分发配置对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      append-to-body
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item :label="t('ruleConfig.form.name')" prop="name">
          <el-input v-model="form.name" :placeholder="t('ruleConfig.placeholders.name')" maxlength="50" />
        </el-form-item>
        <el-form-item :label="t('ruleConfig.form.description')" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            :placeholder="t('ruleConfig.placeholders.description')"
            maxlength="200"
          />
        </el-form-item>

        <!-- 叠加标签 -->
        <el-form-item :label="t('ruleConfig.form.overlayTags')">
          <el-select
            v-model="form.triggerConfig.additionalTags"
            multiple
            :placeholder="t('ruleConfig.tips.overlayTags')"
            filterable
            clearable
            collapse-tags
            style="width: 100%"
          >
            <el-option v-for="tag in tagOptions" :key="tag.value" :label="tag.label" :value="tag.value" />
          </el-select>
          <div class="form-tip">{{ t("ruleConfig.tips.overlayTags") }}</div>
        </el-form-item>

        <!-- 分群配置 -->
        <el-form-item :label="t('ruleConfig.form.selectSegment')" prop="triggerConfig.segmentId">
          <el-select
            v-model="form.triggerConfig.segmentId"
            :placeholder="t('ruleConfig.placeholders.selectSegment')"
            filterable
            clearable
            style="width: 100%"
          >
            <el-option v-for="segment in segmentList" :key="segment.id" :label="segment.name" :value="segment.id" />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('ruleConfig.form.leadType')" prop="leadType">
          <el-select v-model="form.leadType" :placeholder="t('ruleConfig.placeholders.selectLeadType')" style="width: 100%">
            <el-option v-for="type in leadTypeOptions" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('ruleConfig.form.priority')" prop="priority">
          <el-radio-group v-model="form.priority">
            <el-radio value="low">{{ t("ruleConfig.enums.priority.low") }}</el-radio>
            <el-radio value="medium">{{ t("ruleConfig.enums.priority.medium") }}</el-radio>
            <el-radio value="high">{{ t("ruleConfig.enums.priority.high") }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="t('ruleConfig.form.pushTarget')" prop="pushTarget">
          <el-select
            v-model="form.pushTarget"
            :placeholder="t('ruleConfig.placeholders.selectTarget')"
            style="width: 100%"
            disabled
          >
            <el-option v-for="target in pushTargetOptions" :key="target.value" :label="target.label" :value="target.value" />
          </el-select>
        </el-form-item>

        <!-- 有效期 -->
        <el-divider content-position="left">{{ t("ruleConfig.form.validity") }}</el-divider>

        <template v-if="form.deduplication.enabled">
          <el-form-item :label="t('ruleConfig.form.validityDays')">
            <el-input-number v-model="form.deduplication.days" :min="1" :max="30" :precision="0" />
            <span style="margin-left: 8px">{{ t("ruleConfig.form.days") }}</span>
          </el-form-item>
        </template>

        <el-form-item :label="t('ruleConfig.form.enabled')">
          <el-switch v-model="form.enabled" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer right-actions">
          <el-button @click="handleDialogClose">{{ t("ruleConfig.buttons.cancel") }}</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">{{
            t("ruleConfig.buttons.confirmSubmit")
          }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Edit, Delete } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps } from "@/components/ProTable/interface";
import { getRuleList, saveRule, toggleRule, deleteRule } from "@/api/modules/lead";
import { getSegmentList } from "@/api/modules/segment";
import { getTagList, type TagManage } from "@/api/modules/tagManage";
import type { Lead } from "@/api/modules/lead";
import type { Segment } from "@/api/modules/segment";
import { LEAD_TYPE_OPTIONS } from "../interface";

const { t } = useI18n();
const proTableRef = ref();
const formRef = ref();
const dialogVisible = ref(false);
const submitting = ref(false);
const segmentList = ref<Segment.SegmentInfo[]>([]);
const tagList = ref<TagManage.TagInfo[]>([]);

const initParam = reactive({
  pageNum: 1,
  pageSize: 10
});

// 从 LEAD_TYPE_OPTIONS 生成所有商机类型选项，并使用 i18n 翻译
const leadTypeOptions = computed(() => {
  return LEAD_TYPE_OPTIONS.map(option => {
    // 尝试从 i18n 获取翻译，如果没有则使用原始 label
    const i18nKey = `ruleConfig.enums.leadType.${option.value}`;
    const translatedLabel = t(i18nKey);
    // 如果翻译返回的是 key 本身，说明没有翻译，使用原始 label
    const label = translatedLabel !== i18nKey ? translatedLabel : option.label;
    return {
      label,
      value: option.value
    };
  });
});

const tagOptions = computed(() =>
  (tagList.value || []).map(tag => ({
    label: `${tag.tagName} (${tag.category || "-"})`,
    value: tag.tagId
  }))
);

const pushTargetOptions = computed(() => [{ label: t("ruleConfig.enums.pushTarget.BDC外呼系统"), value: "BDC外呼系统" }]);

const toolButton: ("refresh" | "setting" | "search")[] = ["refresh", "setting", "search"];

const columns = computed<ColumnProps<Lead.RuleConfig>[]>(() => [
  {
    prop: "leadType",
    label: t("ruleConfig.columns.leadType"),
    width: 160,
    enum: leadTypeOptions,
    search: {
      el: "select",
      props: { placeholder: t("ruleConfig.placeholders.selectLeadType") }
    }
  },
  {
    prop: "priority",
    label: t("ruleConfig.columns.priority"),
    width: 90,
    enum: [
      { label: t("ruleConfig.enums.priority.high"), value: "high" },
      { label: t("ruleConfig.enums.priority.medium"), value: "medium" },
      { label: t("ruleConfig.enums.priority.low"), value: "low" }
    ],
    search: {
      el: "select",
      props: { placeholder: t("ruleConfig.placeholders.selectPriority") }
    }
  },
  {
    prop: "pushTarget",
    label: t("ruleConfig.columns.pushTarget"),
    width: 130,
    enum: pushTargetOptions,
    search: {
      el: "select",
      props: { placeholder: t("ruleConfig.placeholders.selectTarget") }
    }
  },
  {
    prop: "enabled",
    label: t("ruleConfig.columns.enabled"),
    width: 100,
    enum: [
      { label: t("ruleConfig.enums.status.enable"), value: true },
      { label: t("ruleConfig.enums.status.disable"), value: false }
    ],
    search: {
      el: "select",
      props: { placeholder: t("ruleConfig.placeholders.selectStatus") }
    }
  },
  {
    prop: "creator",
    label: t("ruleConfig.columns.creator"),
    width: 110
  },
  {
    prop: "createdAt",
    label: t("ruleConfig.columns.createdAt"),
    minWidth: 170
  },
  {
    prop: "operation",
    label: t("ruleConfig.columns.operation"),
    width: 90,
    fixed: "right"
  }
]);

const form = reactive<
  Lead.RuleConfig & {
    leadTitle?: string;
    defaultAssign?: string;
    deduplication: {
      enabled: boolean;
      days: number;
    };
    triggerConfig: {
      segmentId?: string;
      eventType?: string;
      schedule?: string;
      conditions?: Array<{
        field: string;
        operator: string;
        value: any;
      }>;
      additionalTags?: string[];
    };
  }
>({
  name: "",
  description: "",
  triggerType: "segment",
  triggerConfig: {
    segmentId: "",
    eventType: "",
    schedule: "",
    conditions: [],
    additionalTags: []
  },
  leadType: "",
  priority: "medium",
  pushTarget: "BDC外呼系统",
  enabled: true,
  creator: "",
  createdAt: "",
  leadTitle: "",
  defaultAssign: "by_store",
  deduplication: {
    enabled: true,
    days: 30
  }
});

const getLeadTypeLabel = (type: string) => {
  const option = leadTypeOptions.value.find(item => item.value === type);
  return option ? option.label : type;
};

const rules = computed(() => ({
  name: [{ required: true, message: t("ruleConfig.placeholders.name"), trigger: "blur" }],
  leadType: [{ required: true, message: t("ruleConfig.placeholders.selectLeadType"), trigger: "change" }],
  pushTarget: [{ required: true, message: t("ruleConfig.placeholders.selectTarget"), trigger: "change" }],
  triggerConfig: {
    segmentId: [{ required: true, message: t("ruleConfig.placeholders.selectSegment"), trigger: "change" }]
  }
}));

const dialogTitle = ref(t("ruleConfig.buttons.add"));

const loadData = async (params: any) => {
  const res = await getRuleList(params);
  return res;
};

const loadSegments = async () => {
  try {
    const res = await getSegmentList({ pageNum: 1, pageSize: 1000 });
    if ((res.code as any) == 200) {
      segmentList.value = res.data.list || [];
    }
  } catch (error) {
    console.error("加载分群列表失败:", error);
  }
};

const loadTags = async () => {
  try {
    // 仅加载「已启用」状态的标签，保持与标签管理模块状态值一致（active）
    const res = await getTagList({ pageNum: 1, pageSize: 1000, status: "active" });
    if ((res.code as any) === 200) {
      tagList.value = res.data.list || [];
    }
  } catch (error) {
    console.error("加载标签列表失败:", error);
  }
};

const applyRuleToForm = (row?: Partial<Lead.RuleConfig>) => {
  const triggerConfig = row?.triggerConfig || {};
  Object.assign(form, {
    id: row?.id,
    name: row?.name ?? "",
    description: row?.description ?? "",
    triggerConfig: {
      segmentId: triggerConfig.segmentId ?? "",
      eventType: triggerConfig.eventType ?? "",
      schedule: triggerConfig.schedule ?? "",
      conditions: triggerConfig.conditions ?? [],
      additionalTags: triggerConfig.additionalTags ?? []
    },
    leadType: row?.leadType ?? "",
    priority: (row?.priority as Lead.RuleConfig["priority"]) ?? "medium",
    pushTarget: (row?.pushTarget as Lead.RuleConfig["pushTarget"]) ?? "BDC外呼系统",
    enabled: row?.enabled ?? true,
    creator: row?.creator ?? "",
    createdAt: row?.createdAt ?? "",
    leadTitle: (row as any)?.leadTitle ?? "",
    defaultAssign: (row as any)?.defaultAssign ?? "by_store",
    deduplication: {
      enabled: (row as any)?.deduplication?.enabled ?? true,
      days: (row as any)?.deduplication?.days ?? 30
    }
  });
};

const handleAdd = () => {
  dialogTitle.value = t("ruleConfig.buttons.add");
  resetForm();
  dialogVisible.value = true;
  loadSegments();
  loadTags();
};

const handleEdit = (row: Lead.RuleConfig) => {
  dialogTitle.value = t("ruleConfig.buttons.edit");
  applyRuleToForm(row);
  dialogVisible.value = true;
  loadSegments();
  loadTags();
};

const handleDelete = async () => {
  if (!form.id) return;
  try {
    await ElMessageBox.confirm(t("ruleConfig.messages.deleteConfirm"), t("ruleConfig.messages.confirmTitle"), {
      confirmButtonText: t("ruleConfig.buttons.confirm"),
      cancelButtonText: t("ruleConfig.buttons.cancel"),
      type: "warning"
    });

    await deleteRule(form.id);

    dialogVisible.value = false;
    proTableRef.value?.getTableList();

    ElMessageBox.alert(t("ruleConfig.messages.approvalMessage"), t("ruleConfig.messages.submittedToApproval"), {
      confirmButtonText: t("ruleConfig.buttons.iKnow"),
      type: "success",
      dangerouslyUseHTMLString: true
    });
  } catch (error: any) {
    if ((error as any) !== "cancel") {
      ElMessage.error(error.message || t("ruleConfig.messages.operationFailed"));
    }
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    await saveRule(form);
    dialogVisible.value = false;
    proTableRef.value?.getTableList();

    ElMessageBox.alert(t("ruleConfig.messages.approvalMessage"), t("ruleConfig.messages.submittedToApproval"), {
      confirmButtonText: t("ruleConfig.buttons.iKnow"),
      type: "success",
      dangerouslyUseHTMLString: true
    });
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || t("ruleConfig.messages.operationFailed"));
    }
  } finally {
    submitting.value = false;
  }
};

const handleDialogClose = () => {
  dialogVisible.value = false;
  resetForm();
};

const resetForm = () => {
  applyRuleToForm();
  formRef.value?.resetFields();
};
</script>

<style scoped lang="scss">
.rule-config-container {
  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
    line-height: 1.5;
  }
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}
.text-ellipsis {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}
.status-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}
.status-text {
  font-size: 14px;
  color: #303133;
  line-height: 22px;
  padding: 0 8px;
}
.start-audit {
  cursor: help;
}
.schedule-input-wrapper {
  width: 100%;
  .schedule-input {
    :deep(.el-input__inner) {
      cursor: default;
    }
  }
}
.cron-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}
</style>
