<template>
  <el-dialog v-model="visible" :title="$t('customer.feedback.title')" width="600px" :before-close="handleClose" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" v-loading="loading">
      <el-form-item :label="$t('customer.oneId')">
        <el-input v-model="form.oneId" disabled />
      </el-form-item>

      <el-form-item :label="$t('customer.feedback.field')" prop="field">
        <el-select v-model="form.field" :placeholder="$t('customer.feedback.selectField')" style="width: 100%">
          <el-option v-for="field in fieldOptions" :key="field.value" :label="field.label" :value="field.value" />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('customer.feedback.currentValue')">
        <el-input v-model="form.currentValue" disabled />
      </el-form-item>

      <el-form-item :label="$t('customer.feedback.reportedValue')" prop="reportedValue">
        <el-input v-model="form.reportedValue" :placeholder="$t('customer.feedback.reportedValuePlaceholder')" />
      </el-form-item>

      <el-form-item :label="$t('customer.feedback.reason')" prop="reason">
        <el-input v-model="form.reason" type="textarea" :rows="4" :placeholder="$t('customer.feedback.reasonPlaceholder')" />
      </el-form-item>

      <!-- 反馈状态追踪 -->
      <el-form-item v-if="form.status && form.status !== 'pending'" :label="$t('customer.feedback.status')">
        <el-tag :type="form.status === 'approved' ? 'success' : 'danger'" size="small">
          {{ getStatusLabel(form.status) }}
        </el-tag>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">{{ $t("common.cancel") }}</el-button>
        <el-button v-if="!form.status || form.status === 'pending'" type="primary" :loading="submitting" @click="handleSubmit">
          {{ $t("customer.feedback.submit") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { FeedbackForm, Customer } from "../interface";

const { t } = useI18n();

interface Props {
  modelValue: boolean;
  customer?: Customer;
  field?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [form: FeedbackForm];
}>();

const visible = ref(props.modelValue);
const loading = ref(false);
const submitting = ref(false);
const formRef = ref();

const form = reactive<FeedbackForm>({
  oneId: "",
  field: "",
  currentValue: "",
  reportedValue: "",
  reason: "",
  reporter: "当前客户", // 实际应从客户信息获取
  status: "pending"
});

const fieldOptions = computed(() => {
  if (!props.customer) return [];

  return [
    { label: t("customer.name"), value: "name" },
    { label: t("customer.phone"), value: "phone" },
    { label: t("customer.address"), value: "address" },
    { label: t("customer.licensePlate"), value: "licensePlate" },
    { label: t("customer.vinInfo"), value: "vinInfo" },
    { label: t("customer.carSeriesModel"), value: "carSeriesModel" }
  ];
});

const rules = {
  field: [{ required: true, message: t("customer.feedback.fieldRequired"), trigger: "change" }],
  reportedValue: [{ required: true, message: t("customer.feedback.reportedValueRequired"), trigger: "blur" }],
  reason: [{ required: true, message: t("customer.feedback.reasonRequired"), trigger: "blur" }]
};

watch(
  () => props.modelValue,
  val => {
    visible.value = val;
    if (val && props.customer) {
      initForm();
    }
  }
);

watch(visible, val => {
  emit("update:modelValue", val);
});

const initForm = () => {
  if (!props.customer) return;

  form.oneId = props.customer.oneId || props.customer.userId;
  form.field = props.field || "";

  // 根据选中的字段设置当前值
  if (form.field && props.customer) {
    const customer = props.customer as any;
    form.currentValue = customer[form.field] || "--";
  }
};

// 监听字段变化，更新当前值
watch(
  () => form.field,
  newField => {
    if (newField && props.customer) {
      const customer = props.customer as any;
      form.currentValue = customer[newField] || "--";
    }
  }
);

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: t("customer.feedback.statusPending"),
    approved: t("customer.feedback.statusApproved"),
    rejected: t("customer.feedback.statusRejected")
  };
  return map[status] || status;
};

const handleClose = () => {
  visible.value = false;
  formRef.value?.resetFields();
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    submitting.value = true;

    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 500));

    emit("submit", { ...form });
    ElMessage.success(t("customer.feedback.submitSuccess"));
    handleClose();
  } catch (error) {
    console.error("表单验证失败:", error);
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
