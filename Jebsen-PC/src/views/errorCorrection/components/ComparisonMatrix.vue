<template>
  <div class="comparison-matrix">
    <el-table :data="fields" border size="small" :row-class-name="tableRowClassName" max-height="500">
      <el-table-column prop="label" label="属性名称" width="100" align="center" fixed="left">
        <template #default="scope">
          <span class="field-label">{{ scope.row.label }}</span>
          <el-icon v-if="scope.row.hasConflict" color="#E6A23C" class="ml-4"><Warning /></el-icon>
        </template>
      </el-table-column>

      <el-table-column v-for="(system, idx) in sourceSystems" :key="system.code" width="160" align="center">
        <template #header>
          <div class="header-with-id">
            <span v-if="system.id" class="system-id">{{ system.id }}</span>
            <span class="system-name">（{{ system.name }}）</span>
          </div>
        </template>
        <template #default="scope">
          <div
            class="field-value"
            :class="{
              'conflict-value':
                scope.row.sourceValues[system.code] && scope.row.sourceValues[system.code] !== scope.row.goldValue,
              'selected-value': isSelected(scope.row, system.code),
              'empty-value': !scope.row.sourceValues[system.code]
            }"
          >
            <div v-if="scope.row.sourceValues[system.code]" class="value-header">
              <el-checkbox
                v-if="!props.readonly && !scope.row.locked"
                :model-value="isSelected(scope.row, system.code)"
                @change="toggleSource(scope.row, system.code)"
                @click.stop
                class="source-checkbox"
              />
              <el-tag v-if="scope.row.primarySource === system.code" type="warning" size="small" class="primary-badge">主值</el-tag>
              <el-icon v-if="isSelected(scope.row, system.code)" class="selected-icon"><Check /></el-icon>
            </div>
            <el-tooltip
              :content="getTooltipContent(scope.row.sourceValues[system.code] || '(空)', scope.row)"
              placement="top"
              :disabled="!shouldShowTooltip(scope.row.sourceValues[system.code])"
            >
              <div
                class="value-content"
                @click="scope.row.sourceValues[system.code] ? toggleSource(scope.row, system.code) : null"
              >
                <SensitiveFieldViewer
                  v-if="isSensitiveField(scope.row.key) && scope.row.sourceValues[system.code]"
                  :value="scope.row.sourceValues[system.code]"
                  :field-key="scope.row.key"
                  :field-label="scope.row.label"
                  :one-id="props.oneId || ''"
                />
                <span
                  v-else-if="scope.row.sourceValues[system.code]"
                  v-html="formatValue(scope.row, scope.row.sourceValues[system.code])"
                />
                <span v-else class="empty-text">(空)</span>
              </div>
            </el-tooltip>
            <el-tooltip
              v-if="scope.row.sourceValueTimes?.[system.code] && scope.row.sourceValues[system.code]"
              :content="scope.row.sourceValueTimes[system.code]"
              placement="top"
            >
              <div class="value-time">
                {{ scope.row.sourceValueTimes[system.code] }}
              </div>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="合并采纳值" min-width="300" align="center" fixed="right">
        <template #default="scope">
          <div v-if="scope.row.locked || props.readonly" class="text-muted suggested-value-display">
            <!-- 只读模式：显示合并后的值列表 -->
            <div class="merged-values-list readonly">
              <div
                v-for="(val, idx) in getMergedValues(scope.row)"
                :key="idx"
                class="merged-value-item readonly"
                :class="{ 'is-primary': isPrimaryValue(scope.row, val) }"
              >
                <el-tag v-if="isPrimaryValue(scope.row, val)" type="warning" size="small" class="primary-badge">主值</el-tag>
                <SensitiveFieldViewer
                  v-if="isSensitiveField(scope.row.key)"
                  :value="val"
                  :field-key="scope.row.key"
                  :field-label="scope.row.label"
                  :one-id="props.oneId || ''"
                />
                <span v-else>{{ val }}</span>
                <span class="value-source-link">({{ getSourceLabel(scope.row, val) }})</span>
              </div>
            </div>
            <el-tag v-if="props.readonly && getMergedValues(scope.row).length > 0" type="warning" size="small" class="ml-6">专员建议</el-tag
            >
          </div>
          <div v-else class="final-editor">
            <!-- 多值合并展示区域 -->
            <div class="merged-values-container">
              <!-- 显示已选中的值（支持拖拽） -->
              <draggable
                v-if="getMergedValues(scope.row).length > 0"
                v-model="scope.row.suggestedValue"
                class="merged-values-list"
                item-key="index"
                :disabled="props.readonly || scope.row.locked"
                @change="handleDragChange(scope.row)"
              >
                <template #item="{ element: val, index: idx }">
                  <div class="merged-value-item draggable-item" :class="{ 'is-primary': isPrimaryValue(scope.row, val) }">
                    <el-icon class="drag-handle" v-if="!props.readonly && !scope.row.locked"><Rank /></el-icon>
                    <el-tag v-if="isPrimaryValue(scope.row, val)" type="warning" size="small" class="primary-badge">主值</el-tag>
                    <SensitiveFieldViewer
                      v-if="isSensitiveField(scope.row.key)"
                      :value="val"
                      :field-key="scope.row.key"
                      :field-label="scope.row.label"
                      :one-id="props.oneId || ''"
                    />
                    <span v-else>{{ val }}</span>
                    <span class="value-source-link">({{ getSourceLabel(scope.row, val) }})</span>
                    <el-icon
                      v-if="!props.readonly && !scope.row.locked"
                      class="remove-icon"
                      @click="removeMergedValue(scope.row, val)"
                    >
                      <Close />
                    </el-icon>
                  </div>
                </template>
              </draggable>
              <!-- 手动输入区域 -->
              <div v-if="!props.readonly && !scope.row.locked" class="manual-input-section">
                <!-- 手动输入框（点击添加按钮后一直显示） -->
                <div v-if="isAddingManual(scope.row)" class="manual-input-item">
                  <el-input
                    :ref="el => setManualInputRef(scope.row, el)"
                    :model-value="getTempManualValue(scope.row)"
                    @update:model-value="val => handleManualInputChange(scope.row, val)"
                    size="small"
                    placeholder="请输入..."
                    @keyup.enter.prevent="confirmManualValue(scope.row)"
                    @focus="handleManualInputFocus(scope.row)"
                    @keyup.esc="cancelManualInput(scope.row)"
                  />
                  <!-- 确认和取消按钮（只在有内容时显示） -->
                  <template v-if="shouldShowManualButtons(scope.row)">
                    <el-button
                      link
                      type="primary"
                      size="small"
                      :icon="Check"
                      @mousedown.prevent
                      @click="confirmManualValue(scope.row)"
                    />
                    <el-button
                      link
                      type="danger"
                      size="small"
                      :icon="Close"
                      @mousedown.prevent
                      @click="cancelManualInput(scope.row)"
                    />
                  </template>
                </div>
                <!-- 添加按钮 -->
                <el-button
                  v-if="!isAddingManual(scope.row)"
                  link
                  type="primary"
                  size="small"
                  :icon="Plus"
                  @click="startManualInput(scope.row)"
                  class="add-manual-btn"
                >
                  添加手动输入
                </el-button>
              </div>
            </div>
            <el-tag v-if="scope.row.isManual" type="warning" size="small" class="ml-6">人工</el-tag>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from "vue";
import { Warning, Check, Close, Plus, Rank } from "@element-plus/icons-vue";
import draggable from "vuedraggable";
import SensitiveFieldViewer from "./SensitiveFieldViewer.vue";
import { isSensitiveField } from "../utils/dataMasking";

export interface SourceSystem {
  code: string;
  name: string;
  id?: string;
}

export interface ComparisonField {
  key: string;
  label: string;
  goldValue: string; // 黄金记录值
  goldValueTime?: string; // 黄金记录更新时间
  sourceValues: Record<string, string>; // 各源系统的值
  sourceValueTimes?: Record<string, string>; // 各源系统值的更新时间
  suggestedValue?: string | string[]; // 建议更正值（支持数组）
  selectedSources?: string[]; // 选中的源系统（多选：'gold' | 源系统代码数组）
  primarySource?: string; // 主值标记（'gold' | 源系统代码）
  hasConflict?: boolean; // 是否有冲突
  locked?: boolean; // 是否锁定
  type?: "money" | "bool" | "tags" | "number" | undefined;
  isManual?: boolean; // 是否手动编辑
  isEditing?: boolean; // 是否正在编辑（用于敏感字段）
  manualValues?: string[]; // 手动输入的多条值
}

interface Props {
  fields: ComparisonField[];
  sourceSystems: SourceSystem[];
  readonly?: boolean; // 是否只读（审核模式）
  oneId?: string; // OneID，用于审计日志
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "field-change", field: ComparisonField): void;
}>();

const formatValue = (row: ComparisonField, val?: string) => {
  if (!val || val === "(空)") return '<span class="text-muted">(空)</span>';
  if (row.type === "money") return `<span class="money-font">¥ ${Number(val).toLocaleString()}</span>`;
  if (row.type === "bool") return val === "是" ? '<span class="text-danger">是</span>' : '<span class="text-success">否</span>';
  if (row.type === "tags")
    return val
      .split(",")
      .map(tag => `<span class="tag-chip">${tag}</span>`)
      .join("");
  return val;
};

// 判断是否选中
const isSelected = (row: ComparisonField, source: string): boolean => {
  if (!row.selectedSources) {
    row.selectedSources = [];
  }
  return row.selectedSources.includes(source);
};

// 切换选中状态（多选）
const toggleSource = (row: ComparisonField, source: string) => {
  if (props.readonly || row.locked) return;

  if (!row.selectedSources) {
    row.selectedSources = [];
  }

  const index = row.selectedSources.indexOf(source);
  if (index > -1) {
    // 取消选中
    row.selectedSources.splice(index, 1);
    // 如果取消的是主值，清除主值标记
    if (row.primarySource === source) {
      row.primarySource = row.selectedSources.length > 0 ? row.selectedSources[0] : undefined;
    }
  } else {
    // 选中
    row.selectedSources.push(source);
    // 如果还没有主值，自动设置为第一个选中的
    if (!row.primarySource) {
      row.primarySource = source;
    }
  }

  updateSuggestedValue(row);
  emit("field-change", row);
};

// 设置主值
const setPrimary = (row: ComparisonField, source: string) => {
  if (props.readonly || row.locked) return;
  row.primarySource = source;
  emit("field-change", row);
};

// 获取值的来源标签
const getSourceLabel = (row: ComparisonField, value: string) => {
  if (!row.selectedSources || row.selectedSources.length === 0) return "";

  // 查找最后一个拥有此值的来源（最后勾选的为准）
  for (let i = row.selectedSources.length - 1; i >= 0; i--) {
    const sourceCode = row.selectedSources[i];
    const sourceVal = sourceCode === "gold" ? row.goldValue : row.sourceValues[sourceCode];
    if (sourceVal === value) {
      const system = props.sourceSystems.find(s => s.code === sourceCode);
      return system ? (system.id ? `${system.id}（${system.name}）` : system.name) : sourceCode;
    }
  }
  return "手动";
};

// 更新建议值（合并所有选中的值）
const updateSuggestedValue = (row: ComparisonField) => {
  const values: string[] = [];

  // 按照勾选顺序收集值，如果值重复，最后勾选的覆盖前面的（在显示上由 getSourceLabel 处理）
  // 实际上这里只需要保证值唯一，且顺序正确
  if (row.selectedSources && row.selectedSources.length > 0) {
    row.selectedSources.forEach(source => {
      let value: string;
      if (source === "gold") {
        value = row.goldValue;
      } else {
        value = row.sourceValues[source] || "";
      }
      if (value && value !== "(空)") {
        const existingIdx = values.indexOf(value);
        if (existingIdx > -1) {
          // 如果值已存在，先移除旧的，把新的（最后勾选的）放到最后
          values.splice(existingIdx, 1);
        }
        values.push(value);
      }
    });
  }

  // 添加手动输入的值
  if (row.manualValues && row.manualValues.length > 0) {
    row.manualValues.forEach(val => {
      if (val && val.trim() && !values.includes(val.trim())) {
        values.push(val.trim());
      }
    });
  }

  // 更新建议值（数组形式）
  if (values.length > 0) {
    row.suggestedValue = values;
  } else {
    // 如果没有选中任何值，使用黄金记录值
    row.suggestedValue = row.goldValue ? [row.goldValue] : [];
  }
};

// 获取合并后的值列表（去重且保持顺序）
const getMergedValues = (row: ComparisonField): string[] => {
  // 优先使用建议值数组，如果没有则返回空
  if (Array.isArray(row.suggestedValue)) {
    return row.suggestedValue;
  }
  if (row.suggestedValue) {
    return [row.suggestedValue];
  }
  return [];
};

// 判断是否是主值
const isPrimaryValue = (row: ComparisonField, value: string): boolean => {
  if (!row.primarySource) return false;

  if (row.primarySource === "gold") {
    return value === row.goldValue;
  }
  return value === row.sourceValues[row.primarySource];
};

// 移除合并值
const removeMergedValue = (row: ComparisonField, value: string) => {
  if (props.readonly || row.locked) return;

  let removed = false;

  // 先尝试从选中的源中移除
  if (row.selectedSources) {
    const sourceToRemove = row.selectedSources.find(source => {
      if (source === "gold") return value === row.goldValue;
      return value === row.sourceValues[source];
    });
    if (sourceToRemove) {
      const index = row.selectedSources.indexOf(sourceToRemove);
      if (index > -1) {
        row.selectedSources.splice(index, 1);
        removed = true;
        if (row.primarySource === sourceToRemove) {
          row.primarySource = row.selectedSources.length > 0 ? row.selectedSources[0] : undefined;
        }
      }
    }
  }

  // 如果没从源中移除，尝试从手动输入中移除
  if (!removed && row.manualValues) {
    const index = row.manualValues.findIndex(val => val && val.trim() === value);
    if (index > -1) {
      row.manualValues.splice(index, 1);
      removed = true;
    }
  }

  if (removed) {
    updateSuggestedValue(row);
    emit("field-change", row);
  }
};

// 处理拖拽变更
const handleDragChange = (row: ComparisonField) => {
  // 确保 suggestedValue 保持同步
  emit("field-change", row);
};

// 临时输入值存储（用于正在输入的值）
const tempManualInputs = ref<Map<string, string>>(new Map());
const manualInputRefs = ref<Map<string, any>>(new Map());
const isConfirmingManual = ref(false); // 标记是否正在确认，避免blur事件冲突
const showButtonsForFields = ref<Map<string, boolean>>(new Map()); // 标记哪些字段应该显示按钮
const focusingFieldKey = ref<string | null>(null); // 当前正在聚焦的字段key

// 获取手动输入的值列表（已确认的值）
const getManualValues = (row: ComparisonField): string[] => {
  if (!row.manualValues) {
    row.manualValues = [];
  }
  return row.manualValues.filter(val => val && val.trim());
};

// 判断是否正在添加手动输入
const isAddingManual = (row: ComparisonField): boolean => {
  const key = `${row.key}`;
  return tempManualInputs.value.has(key);
};

// 获取临时输入值
const getTempManualValue = (row: ComparisonField): string => {
  const key = `${row.key}`;
  return tempManualInputs.value.get(key) || "";
};

// 设置临时输入值
const setTempManualValue = (row: ComparisonField, value: string) => {
  const key = `${row.key}`;
  tempManualInputs.value.set(key, value);
};

// 设置输入框引用
const setManualInputRef = (row: ComparisonField, el: any) => {
  if (!el) return;

  const fieldKey = `${row.key}`;
  manualInputRefs.value.set(fieldKey, el);

  // 只有在当前字段刚被激活时才自动聚焦
  if (focusingFieldKey.value === fieldKey) {
    nextTick(() => {
      focusingFieldKey.value = null; // 清除标记
      // Element Plus 的 el-input 组件，需要访问内部的 input 元素
      if (el && el.$el) {
        const input = el.$el.querySelector("input");
        if (input) {
          input.focus();
        }
      } else if (el && typeof el.focus === "function") {
        el.focus();
      }
    });
  }
};

// 开始手动输入
const startManualInput = (row: ComparisonField) => {
  if (props.readonly || row.locked) return;
  const key = `${row.key}`;

  // 清除其他字段的聚焦状态
  focusingFieldKey.value = key; // 标记当前字段需要聚焦

  tempManualInputs.value.set(key, "");
  showButtonsForFields.value.set(key, false); // 初始不显示按钮
  row.isManual = true;
};

// 处理手动输入值变化
const handleManualInputChange = (row: ComparisonField, value: string) => {
  const key = `${row.key}`;
  tempManualInputs.value.set(key, value);
  // 如果有内容，显示按钮
  if (value && value.trim()) {
    showButtonsForFields.value.set(key, true);
  } else {
    showButtonsForFields.value.set(key, false);
  }
};

// 处理手动输入框获得焦点
const handleManualInputFocus = (row: ComparisonField) => {
  const key = `${row.key}`;
  focusingFieldKey.value = key; // 标记当前字段正在聚焦

  const value = tempManualInputs.value.get(key) || "";
  // 如果有内容，显示按钮
  if (value && value.trim()) {
    showButtonsForFields.value.set(key, true);
  }
};

// 判断是否应该显示按钮
const shouldShowManualButtons = (row: ComparisonField): boolean => {
  const key = `${row.key}`;
  return showButtonsForFields.value.get(key) || false;
};

// 确认手动输入值
const confirmManualValue = (row: ComparisonField) => {
  // 如果正在确认中，直接返回，避免重复执行
  if (isConfirmingManual.value) {
    return;
  }

  isConfirmingManual.value = true;
  const key = `${row.key}`;
  const value = tempManualInputs.value.get(key) || "";

  if (value && value.trim()) {
    // 添加到手动输入列表
    if (!row.manualValues) {
      row.manualValues = [];
    }
    const trimmedValue = value.trim();
    // 检查是否已存在，避免重复添加
    if (!row.manualValues.includes(trimmedValue)) {
      row.manualValues.push(trimmedValue);
      updateSuggestedValue(row);
      emit("field-change", row);
    }
  }

  // 清空输入框内容，但保留输入框
  tempManualInputs.value.set(key, "");
  // 隐藏按钮
  showButtonsForFields.value.set(key, false);
  // 清除聚焦标记
  if (focusingFieldKey.value === key) {
    focusingFieldKey.value = null;
  }

  // 延迟重置标记
  setTimeout(() => {
    isConfirmingManual.value = false;
  }, 100);
};

// 取消手动输入
const cancelManualInput = (row: ComparisonField) => {
  const key = `${row.key}`;
  // 清空输入框内容，但保留输入框
  tempManualInputs.value.set(key, "");
  // 隐藏按钮
  showButtonsForFields.value.set(key, false);
  // 清除聚焦标记
  if (focusingFieldKey.value === key) {
    focusingFieldKey.value = null;
  }
};

// 移除手动输入值
const removeManualValue = (row: ComparisonField, index: number) => {
  if (props.readonly || row.locked) return;
  if (row.manualValues) {
    row.manualValues.splice(index, 1);
    updateSuggestedValue(row);
    emit("field-change", row);
  }
};

// 保留handleManualEdit用于兼容（已废弃，使用新的多值机制）
const handleManualEdit = (row: ComparisonField) => {
  if (props.readonly || row.locked) return;
  // 不再使用，保留以兼容旧代码
};

const startEdit = (row: ComparisonField) => {
  if (props.readonly || row.locked) return;
  row.isEditing = true;
};

const endEdit = (row: ComparisonField) => {
  row.isEditing = false;
  row.isManual = true;
  handleManualEdit(row);
};

const tableRowClassName = ({ row }: { row: ComparisonField }) => {
  return row.hasConflict ? "conflict-row" : "";
};

// 判断是否显示 tooltip（内容超过一定长度时显示）
const shouldShowTooltip = (value?: string): boolean => {
  if (!value || value === "(空)") return false;
  return value.length > 12; // 超过12个字符显示 tooltip
};

// 获取 tooltip 内容（处理 HTML 标签）
const getTooltipContent = (value: string, row: ComparisonField): string => {
  if (!value || value === "(空)") return value;
  // 如果是敏感字段，返回脱敏后的值作为提示
  if (isSensitiveField(row.key)) {
    return value; // tooltip 显示明文（需要权限）
  }
  // 移除 HTML 标签，只显示纯文本
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = formatValue(row, value);
  return tempDiv.textContent || tempDiv.innerText || value;
};
</script>

<style scoped lang="scss">
.comparison-matrix {
  .field-label {
    font-weight: 600;
  }

  .field-value {
    padding: 10px 12px;
    border: 1.5px solid var(--el-border-color);
    border-radius: 6px;
    min-height: 60px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    background-color: var(--el-bg-color);
    width: 100%;
    box-sizing: border-box;
    gap: 6px;

    .value-header {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      flex-shrink: 0;
    }

    .value-content {
      width: 100%;
      flex: 1;
      display: flex;
      align-items: center;
      min-width: 0;
      overflow: hidden;
      padding: 4px 0;
      word-break: break-word;

      :deep(.sensitive-field-viewer) {
        width: 100%;
        min-width: 0;
      }

      :deep(span) {
        display: block;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .value-time {
      font-size: 11px;
      color: var(--el-text-color-secondary);
      line-height: 1.3;
      opacity: 0.75;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      flex-shrink: 0;
    }

    .empty-text {
      color: var(--el-text-color-placeholder);
      font-style: italic;
    }

    &.gold-record {
      background: linear-gradient(135deg, #fff9e6 0%, #fffbe6 100%);
      border-color: #ffd591;
      font-weight: 500;

      .value-time {
        color: var(--el-text-color-regular);
        font-weight: normal;
      }
    }

    &.conflict-value {
      background-color: #fff1f0;
      border-color: #ffccc7;

      .value-content {
        color: #cf1322;
        font-weight: 500;
      }
    }

    &.empty-value {
      background-color: var(--el-fill-color-lighter);
      border-color: var(--el-border-color-lighter);
      cursor: default;
    }

    &.selected-value {
      border: 2px solid var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
    }

    &:hover:not(.gold-record):not(.locked-field):not(.empty-value) {
      border-color: var(--el-color-primary);
      background-color: var(--el-fill-color-light);
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    }
  }

  .selected-icon {
    color: var(--el-color-primary);
    font-size: 14px;
    font-weight: bold;
    background: var(--el-color-primary);
    color: #fff;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-left: auto;
  }

  .primary-badge {
    font-size: 11px;
    padding: 2px 6px;
    flex-shrink: 0;
  }

  .use-source-btn {
    font-size: 10px;
    padding: 1px 4px;
    height: auto;
    line-height: 1.2;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .suggested-value-display {
    padding: 6px 8px;
    border-radius: 4px;
    min-height: 32px;
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;

    .suggested-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }
  }

  .final-editor {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    box-sizing: border-box;

    .sensitive-display {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      min-height: 32px;
      padding: 4px 8px;
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      background: var(--el-bg-color);
      box-sizing: border-box;
      position: relative;
      overflow: hidden;

      :deep(.sensitive-field-viewer) {
        flex: 1;
        min-width: 0;
      }

      .edit-btn {
        margin-left: auto;
        flex-shrink: 0;
        white-space: nowrap;
      }
    }

    .sensitive-input {
      flex: 1;
      min-width: 0;
      width: 100%;
    }

    :deep(.el-input) {
      width: 100%;

      .el-input__wrapper {
        min-height: 34px;
        padding: 0 11px;
      }

      .el-input__inner {
        height: 34px;
        line-height: 34px;
      }
    }
  }

  .text-muted {
    color: var(--el-text-color-secondary);
  }

  .text-danger {
    color: var(--el-color-error);
  }

  .text-success {
    color: var(--el-color-success);
  }

  .money-font {
    font-family: Consolas, "Courier New", monospace;
    font-weight: bold;
    color: var(--el-color-success);
  }

  .tag-chip {
    background: var(--el-fill-color-lighter);
    padding: 2px 6px;
    border-radius: 3px;
    margin-right: 4px;
    font-size: 12px;
  }

  :deep(.conflict-row) {
    background: var(--el-color-warning-light-9) !important;
  }

  .ml-4 {
    margin-left: 4px;
  }

  .ml-6 {
    margin-left: 6px;
  }

  .source-checkbox {
    flex-shrink: 0;

    :deep(.el-checkbox__label) {
      display: none;
    }
  }

  .merged-values-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .merged-values-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .merged-value-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border: 1.5px solid var(--el-border-color);
    border-radius: 6px;
    background: var(--el-fill-color-lighter);
    position: relative;
    transition: all 0.2s;
    text-align: left;

    &.is-primary {
      border-color: var(--el-color-warning);
      background: var(--el-color-warning-light-9);
      box-shadow: 0 2px 4px rgba(230, 162, 60, 0.15);
    }

    &.draggable-item {
      cursor: grab;
      &:active {
        cursor: grabbing;
      }
      .drag-handle {
        font-size: 16px;
        color: var(--el-text-color-placeholder);
        cursor: grab;
        margin-right: 4px;
      }
    }

    .primary-badge {
      flex-shrink: 0;
      font-size: 11px;
      padding: 2px 6px;
    }

    .remove-icon {
      cursor: pointer;
      color: var(--el-text-color-secondary);
      font-size: 16px;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s;

      &:hover {
        color: var(--el-color-danger);
        background: var(--el-color-danger-light-9);
      }
    }

    &:hover {
      border-color: var(--el-color-primary);
      background: var(--el-fill-color);
    }

    :deep(.sensitive-field-viewer) {
      width: auto;
    }
  }

  .manual-input-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 2px dashed var(--el-border-color-lighter);
  }

  .manual-value-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border: 1.5px solid var(--el-border-color);
    border-radius: 6px;
    background: var(--el-fill-color-lighter);
    position: relative;
    transition: all 0.2s;

    .remove-icon {
      margin-left: auto;
      cursor: pointer;
      color: var(--el-text-color-secondary);
      font-size: 16px;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s;

      &:hover {
        color: var(--el-color-danger);
        background: var(--el-color-danger-light-9);
      }
    }

    &:hover {
      border-color: var(--el-color-primary);
      background: var(--el-fill-color);
    }
  }

  .manual-input-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;

    :deep(.el-input) {
      flex: 1;
    }
  }

  .add-manual-btn {
    align-self: flex-start;
    margin-top: 4px;
    font-weight: 500;
  }

  .header-with-id {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.3;
    .system-id {
      font-size: 13px;
      font-weight: bold;
      color: var(--el-text-color-primary);
    }
    .system-name {
      font-size: 11px;
      color: var(--el-text-color-secondary);
    }
  }

  .value-source-link {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    margin-left: auto;
    white-space: nowrap;
  }
}
</style>
