<template>
  <el-dialog
    v-model="visible"
    :title="$t('customerSegmentation.approvalModal.title')"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="approval-modal"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" label-position="top">
      <!-- 分群名称 -->
      <el-form-item :label="$t('customerSegmentation.approvalModal.segmentName')" prop="name">
        <el-input
          v-model="form.name"
          :placeholder="$t('customerSegmentation.approvalModal.segmentNamePlaceholder')"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <!-- 优先级 -->
      <el-form-item :label="$t('customerSegmentation.approvalModal.priority')" prop="priority">
        <el-radio-group v-model="form.priority" class="priority-group">
          <el-radio-button value="high">
            <el-icon class="priority-icon high"><Top /></el-icon>
            {{ $t("customerSegmentation.approvalModal.priorityHigh") }}
          </el-radio-button>
          <el-radio-button value="medium">
            <el-icon class="priority-icon medium"><Minus /></el-icon>
            {{ $t("customerSegmentation.approvalModal.priorityMedium") }}
          </el-radio-button>
          <el-radio-button value="low">
            <el-icon class="priority-icon low"><Bottom /></el-icon>
            {{ $t("customerSegmentation.approvalModal.priorityLow") }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 业务理由 -->
      <el-form-item :label="$t('customerSegmentation.approvalModal.businessReason')" prop="businessReason">
        <el-input
          v-model="form.businessReason"
          type="textarea"
          :rows="4"
          :placeholder="$t('customerSegmentation.approvalModal.businessReasonPlaceholder')"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 规则快照 -->
      <el-form-item :label="$t('customerSegmentation.approvalModal.ruleSnapshot')">
        <div class="rule-snapshot">
          <el-icon class="snapshot-icon"><Document /></el-icon>
          <div class="snapshot-content">
            <code>{{ ruleSnapshotText }}</code>
          </div>
        </div>
      </el-form-item>

      <!-- 预估人数提示 -->
      <el-alert
        v-if="estimatedCount"
        :title="`预估覆盖人数: ${estimatedCount.toLocaleString()} 人`"
        type="info"
        :closable="false"
        show-icon
        class="estimate-alert"
      />
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <div class="footer-left">
          <el-button type="success" :icon="View" @click="handleSimulate">模拟验证</el-button>
          <div v-if="simulateResult" class="simulate-result">
            <span class="simulate-item">
              预估覆盖人数：<strong>{{ simulateResult.estimatedCount.toLocaleString() }}</strong> 人
            </span>
            <span class="simulate-item">
              预估覆盖率：<strong>{{ simulateResult.estimatedRate }}</strong>
            </span>
          </div>
        </div>
        <div class="footer-right">
          <el-button @click="handleCancel">{{ $t("common.cancel") }}</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            <el-icon><Check /></el-icon>
            {{ $t("common.confirm") }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>

  <!-- 成功反馈弹窗 -->
  <el-dialog v-model="successVisible" title="" width="420px" :show-close="false" class="success-modal">
    <div class="success-content">
      <el-icon class="success-icon"><CircleCheck /></el-icon>
      <h3 class="success-title">提交成功！</h3>
      <p class="success-message">
        规则 ID: <strong>#{{ submittedId }}</strong>
      </p>
      <p class="success-desc">已进入审批队列，预计 2 小时内完成审核。</p>
    </div>
    <template #footer>
      <el-button type="primary" @click="handleSuccessClose"> 查看我的申请记录 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { Top, Minus, Bottom, Document, Check, CircleCheck, View } from "@element-plus/icons-vue";
import type { RuleNode } from "@/views/tagManage/components/RuleEditor.vue";
import { simulateRule } from "@/api/modules/customerSegmentation";
import type { CustomerSegmentation } from "@/api/modules/customerSegmentation";

const { t } = useI18n();
const router = useRouter();

const props = defineProps<{
  modelValue: boolean;
  ruleTree: RuleNode;
  quickFilters?: any;
  estimatedCount?: number;
  initialName?: string;
  initialDescription?: string;
  initialReason?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [data: SubmitData];
}>();

export interface SubmitData {
  name: string;
  priority: "high" | "medium" | "low";
  businessReason: string;
  rulePayload: any;
}

const formRef = ref<FormInstance>();
const submitting = ref(false);
const successVisible = ref(false);
const submittedId = ref("");
const simulateResult = ref<CustomerSegmentation.ResSimulate | null>(null);

const visible = computed({
  get: () => props.modelValue,
  set: val => emit("update:modelValue", val)
});

const form = reactive({
  name: "",
  priority: "medium" as "high" | "medium" | "low",
  businessReason: ""
});

const rules: FormRules = {
  name: [{ required: true, message: t("customerSegmentation.messages.nameRequired"), trigger: "blur" }],
  priority: [{ required: true, message: "请选择优先级", trigger: "change" }],
  businessReason: [{ required: true, message: t("customerSegmentation.messages.reasonRequired"), trigger: "blur" }]
};

// 生成规则快照文字描述
const ruleSnapshotText = computed(() => {
  const parts: string[] = [];

  // 快捷筛选部分
  if (props.quickFilters) {
    const qf = props.quickFilters;
    const qfParts: string[] = [];

    if (qf.keyword) qfParts.push(`关键字="${qf.keyword}"`);
    if (qf.tags?.length > 0) qfParts.push(`标签=[${qf.tags.join(",")}]`);
    if (qf.storeId) qfParts.push(`门店="${qf.storeId}"`);
    if (qf.carAgeMin !== undefined || qf.carAgeMax !== undefined) {
      qfParts.push(`车龄=${qf.carAgeMin || 0}-${qf.carAgeMax || "∞"}年`);
    }
    if (qf.gender) qfParts.push(`性别="${qf.gender === "male" ? "男" : "女"}"`);
    if (qf.ageGroup?.length > 0) qfParts.push(`年龄段=[${qf.ageGroup.join(",")}]`);
    if (qf.city?.length > 0) {
      // 支持单选（string[]）和多选（string[][]）
      const cityStr =
        Array.isArray(qf.city[0]) && Array.isArray(qf.city[0])
          ? (qf.city as string[][]).map(path => path.join("/")).join(",")
          : (qf.city as string[]).join(",");
      qfParts.push(`城市=[${cityStr}]`);
    }
    if (qf.existingSegment?.length > 0) qfParts.push(`分群=[${qf.existingSegment.join(",")}]`);

    if (qfParts.length > 0) {
      parts.push(`【漏斗筛选】${qfParts.join(" 且 ")}`);
    }
  }

  // 规则树部分
  const ruleText = generateRuleText(props.ruleTree);
  if (ruleText !== "（无筛选条件）") {
    parts.push(`【高级规则】${ruleText}`);
  }

  if (parts.length === 0) {
    return "（无筛选条件）";
  }

  return parts.join("\n且\n");
});

const generateRuleText = (node: RuleNode): string => {
  if (!node.children || node.children.length === 0) {
    return "（无筛选条件）";
  }

  const operator = node.operator === "AND" ? " 且 " : " 或 ";
  const conditions: string[] = [];

  node.children.forEach(child => {
    if (child.type === "predicate" && child.field) {
      const opLabel = getOperatorLabel(child.operatorType || "");
      const valueStr = formatValue(child.value);
      conditions.push(`[${child.field} ${opLabel} ${valueStr}]`);
    } else if (child.type === "group" && child.children) {
      const subText = generateRuleText(child);
      conditions.push(`(${subText})`);
    }
  });

  return conditions.join(operator);
};

const getOperatorLabel = (op: string): string => {
  const opMap: Record<string, string> = {
    equals: "=",
    notEquals: "≠",
    contains: "包含",
    notContains: "不包含",
    greaterThan: ">",
    lessThan: "<",
    between: "介于",
    belongsTo: "属于",
    notBelongsTo: "不属于"
  };
  return opMap[op] || op;
};

const formatValue = (value: any): string => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "object" && value !== null) {
    if (value.min !== undefined || value.max !== undefined) {
      return `${value.min || ""} - ${value.max || ""}`;
    }
    return JSON.stringify(value);
  }
  return String(value ?? "");
};

// 模拟验证
const handleSimulate = async () => {
  if (!props.ruleTree || !props.ruleTree.children || props.ruleTree.children.length === 0) {
    ElMessage.warning("请先配置规则");
    return;
  }
  try {
    // 构建规则配置
    const ruleConfig = { root: props.ruleTree };
    const result = await simulateRule({ ruleConfig });
    simulateResult.value = result.data;
    ElMessage.success("模拟验证完成");
  } catch (error) {
    console.error("模拟验证失败:", error);
    ElMessage.error("模拟验证失败，请稍后重试");
  }
};

const handleCancel = () => {
  visible.value = false;
  simulateResult.value = null;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async valid => {
    if (!valid) return;

    submitting.value = true;
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      submittedId.value = String(Math.floor(Math.random() * 10000) + 8000);

      emit("submit", {
        name: form.name,
        priority: form.priority,
        businessReason: form.businessReason,
        rulePayload: { root: props.ruleTree }
      });

      visible.value = false;
      successVisible.value = true;
      simulateResult.value = null;
    } finally {
      submitting.value = false;
    }
  });
};

const handleSuccessClose = () => {
  successVisible.value = false;
  // 跳转到我的申请记录页面
  // router.push("/my-applications");
};

// 同步初始值
watch(
  () => props.modelValue,
  val => {
    if (val) {
      form.name = props.initialName || "";
      form.businessReason = props.initialReason || "";
      simulateResult.value = null;
    }
  }
);
</script>

<style scoped lang="scss">
.approval-modal {
  :deep(.el-dialog__body) {
    padding: 20px 24px;
  }

  .priority-group {
    display: flex;
    gap: 12px;

    :deep(.el-radio-button__inner) {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .priority-icon {
      font-size: 14px;

      &.high {
        color: #ef4444;
      }

      &.medium {
        color: #f59e0b;
      }

      &.low {
        color: #6b7280;
      }
    }
  }

  .rule-snapshot {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    background-color: #f8fafc;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    width: 100%;

    .snapshot-icon {
      color: #64748b;
      font-size: 18px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .snapshot-content {
      flex: 1;
      overflow-x: auto;

      code {
        font-family: "SF Mono", Monaco, "Cascadia Code", monospace;
        font-size: 13px;
        color: #475569;
        word-break: break-all;
        white-space: pre-wrap;
      }
    }
  }

  .estimate-alert {
    margin-top: 16px;
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .footer-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;

      .simulate-result {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 8px 16px;
        background-color: var(--el-bg-color-page);
        border-radius: 4px;
        font-size: 14px;
        color: var(--el-text-color-regular);

        .simulate-item {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;

          strong {
            color: var(--el-color-success);
            font-weight: 600;
            margin-left: 4px;
          }
        }
      }
    }

    .footer-right {
      display: flex;
      gap: 12px;
    }
  }
}

.success-modal {
  :deep(.el-dialog__body) {
    padding: 40px 24px;
  }

  .success-content {
    text-align: center;

    .success-icon {
      font-size: 64px;
      color: #22c55e;
      margin-bottom: 16px;
    }

    .success-title {
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 12px 0;
    }

    .success-message {
      font-size: 16px;
      color: #475569;
      margin: 0 0 8px 0;

      strong {
        color: #3b82f6;
      }
    }

    .success-desc {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }
  }
}
</style>
