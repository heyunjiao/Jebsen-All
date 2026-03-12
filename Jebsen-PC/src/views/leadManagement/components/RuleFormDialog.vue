<template>
  <el-dialog
    :model-value="modelValue"
    :title="dialogTitle"
    width="900px"
    append-to-body
    :close-on-click-modal="false"
    @update:model-value="emit('update:modelValue', $event)"
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
        <el-select
          v-model="form.leadType"
          style="width: 100%"
          disabled
        >
          <el-option :label="t('ruleConfig.enums.leadType.system')" value="system" />
        </el-select>
      </el-form-item>

      <el-form-item :label="t('ruleConfig.form.pushPlatform')" prop="pushTarget">
        <el-select
          v-model="form.pushTarget"
          :placeholder="t('ruleConfig.placeholders.selectTarget')"
          style="width: 100%"
          disabled
        >
          <el-option
            v-for="target in pushTargetOptions"
            :key="target.value"
            :label="target.label"
            :value="target.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="t('ruleConfig.form.pushRole')" prop="pushRole">
        <el-select
          v-model="form.pushRole"
          :placeholder="t('ruleConfig.placeholders.selectPushRole')"
          style="width: 100%"
          clearable
        >
          <el-option :label="t('ruleConfig.enums.pushRole.SA')" value="SA" />
          <el-option :label="t('ruleConfig.enums.pushRole.SC')" value="SC" />
          <el-option :label="t('ruleConfig.enums.pushRole.other')" value="other" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer right-actions">
        <el-button @click="handleDialogClose">{{ t("ruleConfig.buttons.cancel") }}</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ t("ruleConfig.buttons.confirmSubmit") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import { saveRule } from "@/api/modules/lead";
import { getSegmentList } from "@/api/modules/segment";
import { getTagList } from "@/api/modules/tagManage";
import type { Lead } from "@/api/modules/lead";
import type { Segment } from "@/api/modules/segment";
import type { TagManage } from "@/api/modules/tagManage";

interface Props {
  modelValue: boolean;
  /** 弹窗标题，如「新增商机」或「编辑」 */
  title?: string;
  /** 编辑时分发数据，为空则为新增 */
  editData?: Partial<Lead.RuleConfig> | null;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  editData: null
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const { t } = useI18n();
const formRef = ref();
const submitting = ref(false);
const segmentList = ref<Segment.SegmentInfo[]>([]);
const tagList = ref<TagManage.TagInfo[]>([]);

const dialogTitle = computed(() => {
  if (props.title) return props.title;
  return props.editData ? t("ruleConfig.buttons.edit") : t("ruleConfig.buttons.add");
});

const tagOptions = computed(() =>
  (tagList.value || []).map(tag => ({
    label: `${tag.tagName} (${tag.category || "-"})`,
    value: tag.tagId
  }))
);

const pushTargetOptions = computed(() => [
  { label: t("ruleConfig.enums.pushTarget.BDC外呼系统"), value: "BDC外呼系统" }
]);

/** 商机类型固定为系统商机 */
const LEAD_TYPE_SYSTEM = "system";

const form = reactive<
  Lead.RuleConfig & {
    leadTitle?: string;
    defaultAssign?: string;
    pushRole?: string;
    deduplication: { enabled: boolean; days: number };
    triggerConfig: {
      segmentId?: string;
      eventType?: string;
      schedule?: string;
      conditions?: Array<{ field: string; operator: string; value: any }>;
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
  leadType: LEAD_TYPE_SYSTEM,
  priority: "medium",
  pushTarget: "BDC外呼系统",
  pushRole: "SA",
  enabled: true,
  creator: "",
  createdAt: "",
  leadTitle: "",
  defaultAssign: "by_store",
  deduplication: { enabled: true, days: 30 }
});

const rules = computed(() => ({
  name: [{ required: true, message: t("ruleConfig.placeholders.name"), trigger: "blur" }],
  leadType: [{ required: true, message: t("ruleConfig.placeholders.selectLeadType"), trigger: "change" }],
  pushTarget: [{ required: true, message: t("ruleConfig.placeholders.selectTarget"), trigger: "change" }],
  pushRole: [{ required: true, message: t("ruleConfig.placeholders.selectPushRole"), trigger: "change" }],
  triggerConfig: {
    segmentId: [{ required: true, message: t("ruleConfig.placeholders.selectSegment"), trigger: "change" }]
  }
}));

function applyRuleToForm(row?: Partial<Lead.RuleConfig>) {
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
    leadType: row?.leadType ?? LEAD_TYPE_SYSTEM,
    priority: (row?.priority as Lead.RuleConfig["priority"]) ?? "medium",
    pushTarget: (row?.pushTarget as Lead.RuleConfig["pushTarget"]) ?? "BDC外呼系统",
    pushRole: (row as any)?.pushRole ?? "SA",
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
}

async function loadSegments() {
  try {
    const res = await getSegmentList({ pageNum: 1, pageSize: 1000 });
    if ((res.code as any) == 200) segmentList.value = res.data.list || [];
  } catch (e) {
    console.error("加载分群列表失败:", e);
  }
}

async function loadTags() {
  try {
    const res = await getTagList({ pageNum: 1, pageSize: 1000, status: "active" });
    if ((res.code as any) === 200) tagList.value = res.data.list || [];
  } catch (e) {
    console.error("加载标签列表失败:", e);
  }
}

watch(
  () => props.modelValue,
  val => {
    if (val) {
      if (props.editData) applyRuleToForm(props.editData);
      else {
        applyRuleToForm();
        formRef.value?.resetFields();
      }
      loadSegments();
      loadTags();
    }
  }
);

watch(
  () => props.editData,
  val => {
    if (props.modelValue && val) applyRuleToForm(val);
  },
  { deep: true }
);

const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    submitting.value = true;
    await saveRule(form);
    emit("update:modelValue", false);
    emit("success");
    ElMessageBox.alert(
      t("ruleConfig.messages.approvalMessage"),
      t("ruleConfig.messages.submittedToApproval"),
      {
        confirmButtonText: t("ruleConfig.buttons.iKnow"),
        type: "success",
        dangerouslyUseHTMLString: true
      }
    );
  } catch (error: any) {
    if (error !== false) ElMessage.error(error.message || t("ruleConfig.messages.operationFailed"));
  } finally {
    submitting.value = false;
  }
};

const handleDialogClose = () => {
  emit("update:modelValue", false);
  applyRuleToForm();
  formRef.value?.resetFields();
};
</script>

<style scoped lang="scss">
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}
</style>
