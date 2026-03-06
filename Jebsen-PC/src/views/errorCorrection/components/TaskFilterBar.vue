<template>
  <div class="task-filter-bar">
    <div class="filter-section">
      <el-select
        v-model="filters.errorType"
        :placeholder="t('errorCorrection.filter.errorType')"
        clearable
        style="width: 150px"
        @change="handleFilterChange"
      >
        <el-option v-for="item in errorTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>

      <el-select
        v-model="filters.severity"
        :placeholder="t('errorCorrection.filter.severity')"
        clearable
        style="width: 120px"
        @change="handleFilterChange"
      >
        <el-option v-for="item in severityOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>

      <el-select
        v-model="filters.sourceSystem"
        :placeholder="t('errorCorrection.filter.sourceSystem')"
        clearable
        style="width: 130px"
        @change="handleFilterChange"
      >
        <el-option v-for="item in sourceSystemOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>

      <el-select
        v-model="filters.status"
        :placeholder="t('errorCorrection.filter.status')"
        clearable
        style="width: 130px"
        @change="handleFilterChange"
      >
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>

    <div class="action-section">
      <el-button :disabled="selectedCount === 0" @click="handleBatchIgnore">
        <el-icon><CircleClose /></el-icon>
        {{ t("errorCorrection.batchIgnore") }}
        <span v-if="selectedCount > 0">({{ selectedCount }})</span>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from "vue";
import { useI18n } from "vue-i18n";
import { CircleClose } from "@element-plus/icons-vue";

interface FilterValues {
  errorType: string;
  severity: string;
  sourceSystem: string;
  status: string;
}

const props = defineProps<{
  selectedCount: number;
}>();

const emit = defineEmits<{
  (e: "filter-change", filters: FilterValues): void;
  (e: "batch-ignore"): void;
}>();

const { t } = useI18n();

const filters = reactive<FilterValues>({
  errorType: "",
  severity: "",
  sourceSystem: "",
  status: ""
});

const errorTypeOptions = computed(() => [
  { label: t("errorCorrection.errorType.identityConflict"), value: "identity_conflict" },
  { label: t("errorCorrection.errorType.dataQuality"), value: "data_quality" },
  { label: t("errorCorrection.errorType.syncFailure"), value: "sync_failure" }
]);

const severityOptions = computed(() => [
  { label: t("errorCorrection.severity.high"), value: "high" },
  { label: t("errorCorrection.severity.medium"), value: "medium" },
  { label: t("errorCorrection.severity.low"), value: "low" }
]);

const sourceSystemOptions = computed(() => [
  { label: "BDC", value: "BDC" },
  { label: "DMS", value: "DMS" },
  { label: "WeCom", value: "WeCom" }
]);

const statusOptions = computed(() => [
  { label: t("errorCorrection.status.pending"), value: "pending" },
  { label: t("errorCorrection.status.processing"), value: "processing" },
  { label: t("errorCorrection.status.ignored"), value: "ignored" },
  { label: t("errorCorrection.status.resolved"), value: "resolved" }
]);

const handleFilterChange = () => {
  emit("filter-change", { ...filters });
};

const handleBatchIgnore = () => {
  emit("batch-ignore");
};
</script>

<style scoped lang="scss">
.task-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 0;

  .filter-section {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .action-section {
    display: flex;
    gap: 8px;
  }
}
</style>
