<template>
  <div class="rule-condition">
    <div class="condition-content">
      <el-select
        v-model="localField"
        :placeholder="$t('customerSegmentation.ruleBuilder.selectField')"
        multiple
        filterable
        clearable
        style="width: 180px"
        @change="handleFieldChange"
      >
        <el-option v-for="option in fieldOptions" :key="option.field" :label="option.label" :value="option.field" />
      </el-select>

      <el-select
        v-model="localOperator"
        :placeholder="$t('customerSegmentation.ruleBuilder.selectOperator')"
        multiple
        filterable
        clearable
        style="width: 150px"
        :disabled="!localField"
        @change="handleOperatorChange"
      >
        <el-option v-for="op in availableOperators" :key="op" :label="getOperatorLabel(op)" :value="op" />
      </el-select>

      <!-- 值输入 -->
      <div class="value-input" v-if="localField && localOperator">
        <!-- 多选框 -->
        <el-checkbox-group v-if="currentFieldOption?.inputType === 'checkbox'" v-model="localValue" @change="handleValueChange">
          <el-checkbox v-for="opt in currentFieldOption.options" :key="opt.value" :label="opt.value">
            {{ opt.label }}
          </el-checkbox>
        </el-checkbox-group>

        <!-- 单选框 -->
        <el-radio-group v-else-if="currentFieldOption?.inputType === 'radio'" v-model="localValue" @change="handleValueChange">
          <el-radio v-for="opt in currentFieldOption.options" :key="opt.value" :label="opt.value">
            {{ opt.label }}
          </el-radio>
        </el-radio-group>

        <!-- 级联选择器（多选+搜索） -->
        <el-cascader
          v-else-if="
            currentFieldOption?.inputType === 'cascader' && currentFieldOption.options && currentFieldOption.options.length > 0
          "
          v-model="localValue"
          :options="currentFieldOption.options"
          :props="{ expandTrigger: 'hover', multiple: true }"
          multiple
          filterable
          clearable
          @change="handleValueChange"
          style="width: 200px"
        />

        <!-- 树形选择器 -->
        <el-tree-select
          v-else-if="currentFieldOption?.inputType === 'treeselect'"
          v-model="localValue"
          :data="currentFieldOption.options || []"
          @change="handleValueChange"
          style="width: 200px"
        />

        <!-- 日期范围选择器 -->
        <el-date-picker
          v-else-if="currentFieldOption?.inputType === 'daterange'"
          v-model="localValue"
          type="daterange"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleValueChange"
          style="width: 200px"
        />

        <!-- 数字输入 -->
        <el-input-number
          v-else-if="currentFieldOption?.inputType === 'number'"
          v-model="localValue"
          :min="0"
          :precision="2"
          @change="handleValueChange"
          style="width: 200px"
        />

        <!-- 数字范围输入 -->
        <div v-else-if="currentFieldOption?.inputType === 'numberrange'" class="number-range">
          <el-input-number
            v-model="numberRangeMin"
            :min="0"
            :precision="0"
            placeholder="最小值"
            style="width: 90px"
            @change="handleNumberRangeChange"
          />
          <span class="range-separator">-</span>
          <el-input-number
            v-model="numberRangeMax"
            :min="0"
            :precision="0"
            placeholder="最大值"
            style="width: 90px"
            @change="handleNumberRangeChange"
          />
        </div>

        <!-- 下拉选择（多选+搜索） -->
        <el-select
          v-else-if="currentFieldOption?.inputType === 'select' || currentFieldOption?.inputType === 'tagselect'"
          v-model="localValue"
          multiple
          filterable
          clearable
          :placeholder="$t('customerSegmentation.ruleBuilder.enterValue')"
          @change="handleValueChange"
          style="width: 200px"
        >
          <el-option v-for="opt in currentFieldOption?.options" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>

        <!-- 默认文本输入 -->
        <el-input
          v-else
          v-model="localValue"
          :placeholder="$t('customerSegmentation.ruleBuilder.enterValue')"
          @change="handleValueChange"
          style="width: 200px"
        />
      </div>

      <el-button type="danger" link size="small" @click="handleRemove">
        {{ $t("customerSegmentation.ruleBuilder.remove") }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { TagManage } from "@/api/modules/tagManage";
import type { CustomerSegmentation } from "@/api/modules/customerSegmentation";
import type { RuleNode } from "@/views/tagManage/components/RuleEditor.vue";

const { t } = useI18n();

const props = defineProps<{
  node: RuleNode;
  fieldOptions: CustomerSegmentation.FieldOption[];
}>();

const emit = defineEmits<{
  "update:node": [node: RuleNode];
  remove: [nodeId: string];
}>();

const localField = ref(props.node.field || "");
const localOperator = ref(props.node.operatorType || "");
const localValue = ref(props.node.value);
const numberRangeMin = ref<number | null>(null);
const numberRangeMax = ref<number | null>(null);

const currentFieldOption = computed(() => {
  return props.fieldOptions.find(opt => opt.field === localField.value);
});

const availableOperators = computed(() => {
  return currentFieldOption.value?.operators || [];
});

const getOperatorLabel = (op: string) => {
  const key = `customerSegmentation.operators.${op}`;
  return t(key) || op;
};

const handleNumberRangeChange = () => {
  if (numberRangeMin.value !== null && numberRangeMax.value !== null) {
    localValue.value = [numberRangeMin.value, numberRangeMax.value];
    handleValueChange(localValue.value);
  }
};

const handleFieldChange = (value: string | string[]) => {
  // 支持多选：如果是数组，取第一个值；否则直接使用
  const fieldValue = Array.isArray(value) ? (value.length > 0 ? value[0] : "") : value;
  props.node.field = fieldValue;
  // 重置操作符和值
  props.node.operatorType = "";
  props.node.value = null;
  localOperator.value = "";
  localValue.value = null;
  emit("update:node", props.node);
};

const handleOperatorChange = (value: string | string[]) => {
  // 支持多选：如果是数组，取第一个值；否则直接使用
  const operatorValue = Array.isArray(value) ? (value.length > 0 ? value[0] : "") : value;
  props.node.operatorType = operatorValue;
  emit("update:node", props.node);
};

const handleValueChange = (value: any) => {
  props.node.value = value;
  localValue.value = value;
  emit("update:node", props.node);
};

const handleRemove = () => {
  emit("remove", props.node.id);
};

watch(
  () => props.node,
  newVal => {
    localField.value = newVal.field || "";
    localOperator.value = newVal.operatorType || "";
    localValue.value = newVal.value;
    // 处理数字范围
    if (Array.isArray(newVal.value) && newVal.value.length === 2) {
      numberRangeMin.value = newVal.value[0];
      numberRangeMax.value = newVal.value[1];
    }
  },
  { deep: true }
);
</script>

<style scoped lang="scss">
.rule-condition {
  .condition-content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    .value-input {
      flex: 1;
      min-width: 200px;

      .number-range {
        display: flex;
        align-items: center;
        gap: 8px;

        .range-separator {
          color: #909399;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
