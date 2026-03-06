<template>
  <div class="condition-value-input">
    <!-- 多选框 -->
    <el-checkbox-group v-if="fieldOption?.inputType === 'checkbox'" v-model="localValue" @change="handleChange">
      <el-checkbox v-for="opt in fieldOption.options" :key="opt.value" :label="opt.value">
        {{ opt.label }}
      </el-checkbox>
    </el-checkbox-group>

    <!-- 单选框 -->
    <el-radio-group v-else-if="fieldOption?.inputType === 'radio'" v-model="localValue" @change="handleChange">
      <el-radio v-for="opt in fieldOption.options" :key="opt.value" :label="opt.value">
        {{ opt.label }}
      </el-radio>
    </el-radio-group>

    <!-- 级联选择器（多选+搜索） -->
    <el-cascader
      v-else-if="fieldOption?.inputType === 'cascader' && cascaderOptions && cascaderOptions.length > 0"
      v-model="localValue"
      :options="cascaderOptions"
      :props="{ expandTrigger: 'hover', multiple: true }"
      multiple
      clearable
      filterable
      @change="handleChange"
      style="width: 100%"
    />

    <!-- 树形选择器 -->
    <el-tree-select
      v-else-if="fieldOption?.inputType === 'treeselect'"
      v-model="localValue"
      :data="treeSelectOptions"
      :props="{ label: 'label', children: 'children' }"
      clearable
      @change="handleChange"
      style="width: 100%"
    />

    <!-- 日期范围选择器 -->
    <el-date-picker
      v-else-if="fieldOption?.inputType === 'daterange'"
      v-model="localValue"
      type="daterange"
      format="YYYY-MM-DD"
      value-format="YYYY-MM-DD"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      @change="handleChange"
      style="width: 100%"
    />

    <!-- 单个日期 -->
    <el-date-picker
      v-else-if="fieldOption?.inputType === 'date'"
      v-model="localValue"
      type="date"
      format="YYYY-MM-DD"
      value-format="YYYY-MM-DD"
      placeholder="选择日期"
      @change="handleChange"
      style="width: 100%"
    />

    <!-- 数字输入 -->
    <el-input-number
      v-else-if="fieldOption?.inputType === 'number'"
      v-model="localValue"
      :min="0"
      :precision="fieldOption.field === 'carAge' || fieldOption.field === 'visits90D' ? 0 : 2"
      @change="handleChange"
      style="width: 100%"
    />

    <!-- 数字范围输入 -->
    <div v-else-if="fieldOption?.inputType === 'numberrange'" class="number-range">
      <el-input-number
        v-model="numberRangeMin"
        :min="0"
        :precision="0"
        placeholder="最小值"
        style="width: 48%"
        @change="handleNumberRangeChange"
      />
      <span class="range-separator">-</span>
      <el-input-number
        v-model="numberRangeMax"
        :min="0"
        :precision="0"
        placeholder="最大值"
        style="width: 48%"
        @change="handleNumberRangeChange"
      />
    </div>

    <!-- 下拉选择（多选+搜索） -->
    <el-select
      v-else-if="fieldOption?.inputType === 'select'"
      v-model="localValue"
      :placeholder="$t('customerSegmentation.ruleBuilder.enterValue')"
      multiple
      clearable
      filterable
      @change="handleChange"
      style="width: 100%"
    >
      <el-option v-for="opt in fieldOption.options" :key="opt.value" :label="opt.label" :value="opt.value" />
    </el-select>

    <!-- 标签选择器（多选） -->
    <el-select
      v-else-if="fieldOption?.inputType === 'tagselect'"
      v-model="localValue"
      :placeholder="$t('customerSegmentation.ruleBuilder.enterValue')"
      multiple
      clearable
      filterable
      @change="handleChange"
      style="width: 100%"
    >
      <el-option v-for="opt in fieldOption.options" :key="opt.value" :label="opt.label" :value="opt.value" />
    </el-select>

    <!-- 默认文本输入 -->
    <el-input
      v-else
      v-model="localValue"
      :placeholder="$t('customerSegmentation.ruleBuilder.enterValue')"
      clearable
      @change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import type { CustomerSegmentation } from "@/api/modules/customerSegmentation";

const { t } = useI18n();

const props = defineProps<{
  modelValue: any;
  fieldOption?: CustomerSegmentation.FieldOption;
  operator: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: any];
  change: [];
}>();

const localValue = ref(props.modelValue);
const numberRangeMin = ref<number | null>(null);
const numberRangeMax = ref<number | null>(null);

// 级联选择器选项（示例数据）
const cascaderOptions = computed(() => {
  // 这里可以根据实际需求从 API 获取城市数据
  return [
    {
      value: "beijing",
      label: "北京市",
      children: [
        { value: "chaoyang", label: "朝阳区" },
        { value: "haidian", label: "海淀区" }
      ]
    },
    {
      value: "shanghai",
      label: "上海市",
      children: [
        { value: "huangpu", label: "黄浦区" },
        { value: "pudong", label: "浦东新区" }
      ]
    }
  ];
});

// 树形选择器选项（示例数据）
const treeSelectOptions = computed(() => {
  // 这里可以根据实际需求从 API 获取车型数据
  return [
    {
      label: "BMW",
      value: "bmw",
      children: [
        {
          label: "3系",
          value: "3series",
          children: [
            { label: "325Li", value: "325li" },
            { label: "330Li", value: "330li" }
          ]
        },
        {
          label: "5系",
          value: "5series",
          children: [
            { label: "530Li", value: "530li" },
            { label: "540Li", value: "540li" }
          ]
        }
      ]
    }
  ];
});

watch(
  () => props.modelValue,
  newVal => {
    localValue.value = newVal;
    if (Array.isArray(newVal) && newVal.length === 2) {
      numberRangeMin.value = newVal[0];
      numberRangeMax.value = newVal[1];
    }
  }
);

const handleChange = (value: any) => {
  localValue.value = value;
  emit("update:modelValue", value);
  emit("change");
};

const handleNumberRangeChange = () => {
  if (numberRangeMin.value !== null && numberRangeMax.value !== null) {
    localValue.value = [numberRangeMin.value, numberRangeMax.value];
    emit("update:modelValue", localValue.value);
    emit("change");
  }
};
</script>

<style scoped lang="scss">
.condition-value-input {
  .number-range {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;

    .range-separator {
      color: #909399;
      font-weight: 500;
      flex-shrink: 0;
    }
  }
}
</style>
