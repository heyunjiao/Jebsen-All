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
            <div class="system-main-info">
              <span v-if="system.id" class="system-id">{{ system.id }}</span>
              <span class="system-name">（{{ system.name }}）</span>
            </div>
            <!-- 客户123选择器 -->
            <div class="group-selector-mini" v-if="!props.readonly">
              <el-select v-model="systemGroupMap[system.code]" size="small" class="mini-select" @change="handleGroupChange">
                <el-option label="客户123 1" value="1" />
                <el-option label="客户123 2" value="2" />
                <el-option label="不合并" value="none" />
              </el-select>
            </div>
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
              v-if="scope.row.sourceValues[system.code]"
              placement="top"
              :disabled="!shouldShowTooltip(scope.row.sourceValues[system.code])"
            >
              <template #content>
                <div class="field-tooltip-content">
                  <div class="tooltip-main-val">{{ getTooltipContent(scope.row.sourceValues[system.code], scope.row) }}</div>
                  <div class="tooltip-source-info" v-if="system.id">ID: {{ system.id }} ({{ system.name }})</div>
                  <div class="tooltip-source-info" v-else>{{ system.name }}</div>
                  <div class="tooltip-time" v-if="scope.row.sourceValueTimes?.[system.code]">
                    {{ scope.row.sourceValueTimes[system.code] }}
                  </div>
                </div>
              </template>
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
            <div class="value-footer" v-if="scope.row.sourceValues[system.code]">
              <div class="source-label-mini">
                <span class="source-sys">{{ system.name }}</span>
                <span v-if="system.id" class="source-id">{{ system.id }}</span>
              </div>
              <div v-if="scope.row.sourceValueTimes?.[system.code]" class="value-time">
                {{ scope.row.sourceValueTimes[system.code].split(" ")[0] }}
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-for="groupId in activeGroups"
        :key="groupId"
        :label="activeGroups.length > 1 ? `客户123 ${groupId} 采纳值` : '合并采纳值'"
        min-width="300"
        align="center"
        fixed="right"
      >
        <template #default="scope">
          <div v-if="scope.row.locked || props.readonly" class="text-muted suggested-value-display">
            <!-- 只读模式：显示合并后的值列表 -->
            <div class="merged-values-list readonly">
              <div
                v-for="(val, vIdx) in getMergedValues(scope.row, groupId)"
                :key="vIdx"
                class="merged-value-item"
                :class="{ 'is-primary': isPrimaryValue(scope.row, val, groupId) }"
              >
                <el-tag v-if="isPrimaryValue(scope.row, val, groupId)" type="warning" size="small" class="primary-badge">主值</el-tag>
                <SensitiveFieldViewer
                  v-if="isSensitiveField(scope.row.key)"
                  :value="val"
                  :field-key="scope.row.key"
                  :field-label="scope.row.label"
                  :one-id="props.oneId || ''"
                />
                <span v-else>{{ val }}</span>
                <span class="value-source-link">({{ getSourceLabel(scope.row, val, groupId) }})</span>
              </div>
            </div>
          </div>
          <div v-else class="final-editor">
            <!-- 多值合并展示区域 -->
            <div class="merged-values-container">
              <!-- 显示已选中的值（支持拖拽） -->
              <draggable
                v-if="getMergedValues(scope.row, groupId).length > 0"
                :model-value="getMergedValues(scope.row, groupId)"
                @update:model-value="val => updateGroupSuggestedValue(scope.row, groupId, val)"
                class="merged-values-list"
                item-key="index"
                :disabled="props.readonly || scope.row.locked"
              >
                <template #item="{ element: val, index: idx }">
                  <div
                    class="merged-value-item draggable-item"
                    :class="{ 'is-primary': isPrimaryValue(scope.row, val, groupId) }"
                  >
                    <el-icon class="drag-handle" v-if="!props.readonly && !scope.row.locked"><Rank /></el-icon>
                    <el-tag v-if="isPrimaryValue(scope.row, val, groupId)" type="warning" size="small" class="primary-badge">主值</el-tag>
                    <SensitiveFieldViewer
                      v-if="isSensitiveField(scope.row.key)"
                      :value="val"
                      :field-key="scope.row.key"
                      :field-label="scope.row.label"
                      :one-id="props.oneId || ''"
                    />
                    <span v-else>{{ val }}</span>
                    <span class="value-source-link">({{ getSourceLabel(scope.row, val, groupId) }})</span>
                    <el-icon
                      v-if="!props.readonly && !scope.row.locked"
                      class="remove-icon"
                      @click="removeMergedValue(scope.row, val, groupId)"
                    >
                      <Close />
                    </el-icon>
                  </div>
                </template>
              </draggable>
              <!-- 手动输入区域 -->
              <div v-if="!props.readonly && !scope.row.locked" class="manual-input-section">
                <!-- 手动输入框（点击添加按钮后一直显示） -->
                <div v-if="isAddingManual(scope.row, groupId)" class="manual-input-item">
                  <el-input
                    :ref="el => setManualInputRef(scope.row, el, groupId)"
                    :model-value="getTempManualValue(scope.row, groupId)"
                    @update:model-value="val => handleManualInputChange(scope.row, val, groupId)"
                    size="small"
                    :placeholder="scope.row.singleSelect ? '请输入最终保留值...' : '请输入...'"
                    @keyup.enter.prevent="confirmManualValue(scope.row, groupId)"
                    @keyup.esc="cancelManualInput(scope.row, groupId)"
                  />
                  <template v-if="shouldShowManualButtons(scope.row, groupId)">
                    <el-button link type="primary" size="small" :icon="Check" @click="confirmManualValue(scope.row, groupId)" />
                    <el-button link type="danger" size="small" :icon="Close" @click="cancelManualInput(scope.row, groupId)" />
                  </template>
                </div>
                <!-- 添加按钮（单选模式下，如果已有值则可以点击修改，或者隐藏） -->
                <el-button
                  v-if="
                    !isAddingManual(scope.row, groupId) &&
                    (!scope.row.singleSelect || getMergedValues(scope.row, groupId).length === 0)
                  "
                  link
                  type="primary"
                  size="small"
                  :icon="Plus"
                  @click="startManualInput(scope.row, groupId)"
                  class="add-manual-btn"
                >
                  添加手动输入
                </el-button>
              </div>
            </div>
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
  suggestedValue?: string | string[]; // 建议更正值（多选：数组）- 默认给分组1使用
  groupSuggestedValues?: Record<string, string[]>; // 按分组存储的建议值
  selectedSources?: string[]; // 选中的源系统（旧逻辑保留兼容）
  groupSelectedSources?: Record<string, string[]>; // 按分组存储选中的源系统
  primarySource?: string; // 旧逻辑主值
  groupPrimarySource?: Record<string, string>; // 按分组存储的主值
  hasConflict?: boolean; // 是否有冲突
  locked?: boolean; // 是否锁定
  type?: "money" | "bool" | "tags" | "number" | undefined;
  isManual?: boolean; // 是否手动编辑
  isEditing?: boolean; // 是否正在编辑（用于敏感字段）
  manualValues?: string[]; // 旧逻辑手动输入
  groupManualValues?: Record<string, string[]>; // 按分组存储的手动输入
  singleSelect?: boolean; // 新增：是否只能单选（用于姓名/性别）
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

// 记录各系统的分组
const systemGroupMap = ref<Record<string, string>>({});

// --- 核心工具函数 (已移至上方以避免 ReferenceError) ---

// 获取合并后的值列表
const getMergedValues = (row: ComparisonField, groupId: string): string[] => {
  return row.groupSuggestedValues?.[groupId] || [];
};

// 判断是否选中
const isSelected = (row: ComparisonField, source: string): boolean => {
  const groupId = systemGroupMap.value[source];
  if (groupId === "none") return false;

  if (!row.groupSelectedSources) row.groupSelectedSources = {};
  if (!row.groupSelectedSources[groupId]) row.groupSelectedSources[groupId] = [];

  return row.groupSelectedSources[groupId].includes(source);
};

// 更新建议值（按分组）
const updateSuggestedValue = (row: ComparisonField, groupId: string) => {
  const values: string[] = [];
  const sources = row.groupSelectedSources?.[groupId] || [];

  sources.forEach(source => {
    let value = source === "gold" ? row.goldValue : row.sourceValues[source] || "";
    if (value && value !== "(空)") {
      if (!values.includes(value)) {
        values.push(value);
      }
    }
  });

  // 添加该分组的手动输入
  const manual = row.groupManualValues?.[groupId] || [];
  manual.forEach(val => {
    if (val && val.trim() && !values.includes(val.trim())) {
      values.push(val.trim());
    }
  });

  if (!row.groupSuggestedValues) row.groupSuggestedValues = {};
  if (values.length > 0) {
    row.groupSuggestedValues[groupId] = values;
  } else {
    row.groupSuggestedValues[groupId] = [];
  }

  // 为保持兼容性，将分组1的值也赋给 suggestedValue (旧逻辑)
  if (groupId === "1") {
    row.suggestedValue = row.groupSuggestedValues[groupId];
    row.selectedSources = sources;
    row.primarySource = row.groupPrimarySource?.["1"];
  }
};

// 直接更新分组的建议值（拖拽后）
const updateGroupSuggestedValue = (row: ComparisonField, groupId: string, newValues: string[]) => {
  if (!row.groupSuggestedValues) row.groupSuggestedValues = {};
  row.groupSuggestedValues[groupId] = newValues;
  if (groupId === "1") row.suggestedValue = newValues;
  emit("field-change", row);
};

// 判断是否是主值
const isPrimaryValue = (row: ComparisonField, value: string, groupId: string): boolean => {
  const primarySource = row.groupPrimarySource?.[groupId];
  if (!primarySource) return false;

  const primaryValue = primarySource === "gold" ? row.goldValue : row.sourceValues[primarySource];
  return value === primaryValue;
};

// 将旧格式数据同步到分组格式
const syncSelectedToGroups = () => {
  props.fields.forEach(field => {
    if (field.selectedSources && (!field.groupSelectedSources || Object.keys(field.groupSelectedSources).length === 0)) {
      if (!field.groupSelectedSources) field.groupSelectedSources = {};
      // 默认同步到第一组
      const sources = [...(field.selectedSources || [])];
      field.groupSelectedSources["1"] = field.singleSelect ? sources.slice(0, 1) : sources;

      if (!field.groupPrimarySource) field.groupPrimarySource = {};
      if (field.primarySource) field.groupPrimarySource["1"] = field.primarySource;

      if (!field.groupManualValues) field.groupManualValues = {};
      if (field.manualValues) {
        const manual = [...field.manualValues];
        field.groupManualValues["1"] = field.singleSelect ? manual.slice(0, 1) : manual;
      }

      updateSuggestedValue(field, "1");
    }
  });
};

// --- 重置位置结束 ---

// 初始化分组，默认全为组1
watch(
  () => props.sourceSystems,
  newVal => {
    if (newVal) {
      newVal.forEach(s => {
        if (!systemGroupMap.value[s.code]) {
          systemGroupMap.value[s.code] = "1";
        }
      });
      syncSelectedToGroups();
    }
  },
  { immediate: true }
);

watch(
  () => props.fields,
  () => {
    syncSelectedToGroups();
  },
  { deep: true }
);

// 当前活跃的分组列表
const activeGroups = computed(() => {
  const groups = new Set<string>();
  Object.values(systemGroupMap.value).forEach(g => {
    if (g !== "none") groups.add(g);
  });
  return Array.from(groups).sort();
});

// 处理分组变更
const handleGroupChange = () => {
  props.fields.forEach(field => {
    recalculateAllGroups(field);
  });
};

// 重新计算字段在所有分组下的合并值
const recalculateAllGroups = (row: ComparisonField) => {
  activeGroups.value.forEach(groupId => {
    updateSuggestedValue(row, groupId);
  });
  emit("field-change", row);
};

// 切换选中状态（考虑分组和单选限制）
const toggleSource = (row: ComparisonField, source: string) => {
  if (props.readonly || row.locked) return;

  const groupId = systemGroupMap.value[source];
  if (groupId === "none") return;

  if (!row.groupSelectedSources) row.groupSelectedSources = {};
  if (!row.groupSelectedSources[groupId]) row.groupSelectedSources[groupId] = [];

  const sources = row.groupSelectedSources[groupId];
  const index = sources.indexOf(source);

  if (index > -1) {
    // 取消选中
    sources.splice(index, 1);
    if (row.groupPrimarySource?.[groupId] === source) {
      row.groupPrimarySource[groupId] = sources.length > 0 ? sources[0] : "";
    }
  } else {
    // 选中
    if (row.singleSelect) {
      // 单选限制：清空该分组其他选中项和手动输入项
      sources.splice(0, sources.length, source);
      if (row.groupManualValues) {
        row.groupManualValues[groupId] = [];
      }
    } else {
      sources.push(source);
    }

    if (!row.groupPrimarySource) row.groupPrimarySource = {};
    if (!row.groupPrimarySource[groupId]) {
      row.groupPrimarySource[groupId] = source;
    }
  }

  updateSuggestedValue(row, groupId);
  emit("field-change", row);
};

// 设置主值
const setPrimary = (row: ComparisonField, source: string, groupId: string) => {
  if (props.readonly || row.locked) return;
  if (!row.groupPrimarySource) row.groupPrimarySource = {};
  row.groupPrimarySource[groupId] = source;
  emit("field-change", row);
};

// 获取值的来源标签
const getSourceLabel = (row: ComparisonField, value: string, groupId: string) => {
  const sources = row.groupSelectedSources?.[groupId] || [];
  if (sources.length === 0) return "手动";

  for (let i = sources.length - 1; i >= 0; i--) {
    const sourceCode = sources[i];
    const sourceVal = sourceCode === "gold" ? row.goldValue : row.sourceValues[sourceCode];
    if (sourceVal === value) {
      const system = props.sourceSystems.find(s => s.code === sourceCode);
      return system ? (system.id ? `${system.id}（${system.name}）` : system.name) : sourceCode;
    }
  }
  return "手动";
};

// 移除合并值
const removeMergedValue = (row: ComparisonField, value: string, groupId: string) => {
  if (props.readonly || row.locked) return;

  const sources = row.groupSelectedSources?.[groupId] || [];
  const sourceIdx = sources.findIndex(s => {
    const val = s === "gold" ? row.goldValue : row.sourceValues[s];
    return val === value;
  });

  if (sourceIdx > -1) {
    const removedSource = sources.splice(sourceIdx, 1)[0];
    if (row.groupPrimarySource?.[groupId] === removedSource) {
      row.groupPrimarySource[groupId] = sources.length > 0 ? sources[0] : "";
    }
  } else {
    // 尝试从手动输入中移除
    const manuals = row.groupManualValues?.[groupId] || [];
    const manualIdx = manuals.findIndex(v => v.trim() === value);
    if (manualIdx > -1) {
      manuals.splice(manualIdx, 1);
    }
  }

  updateSuggestedValue(row, groupId);
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

// 获取临时输入值
const getTempManualValue = (row: ComparisonField, groupId: string): string => {
  const key = `${row.key}_${groupId}`;
  return tempManualInputs.value.get(key) || "";
};

// 设置输入框引用
const setManualInputRef = (row: ComparisonField, el: any, groupId: string) => {
  if (!el) return;
  const fieldKey = `${row.key}_${groupId}`;
  manualInputRefs.value.set(fieldKey, el);
  if (focusingFieldKey.value === fieldKey) {
    nextTick(() => {
      focusingFieldKey.value = null;
      if (el && el.$el) {
        const input = el.$el.querySelector("input");
        if (input) input.focus();
      } else if (el && typeof el.focus === "function") {
        el.focus();
      }
    });
  }
};

// 开始手动输入
const startManualInput = (row: ComparisonField, groupId: string) => {
  if (props.readonly || row.locked) return;
  const key = `${row.key}_${groupId}`;
  focusingFieldKey.value = key;
  tempManualInputs.value.set(key, "");
  showButtonsForFields.value.set(key, false);
  row.isManual = true;
};

// 处理手动输入值变化
const handleManualInputChange = (row: ComparisonField, value: string, groupId: string) => {
  const key = `${row.key}_${groupId}`;
  tempManualInputs.value.set(key, value);
  showButtonsForFields.value.set(key, !!(value && value.trim()));
};

// 判断是否正在添加手动输入
const isAddingManual = (row: ComparisonField, groupId: string): boolean => {
  return tempManualInputs.value.has(`${row.key}_${groupId}`);
};

// 判断是否应该显示按钮
const shouldShowManualButtons = (row: ComparisonField, groupId: string): boolean => {
  return showButtonsForFields.value.get(`${row.key}_${groupId}`) || false;
};

// 确认手动输入值
const confirmManualValue = (row: ComparisonField, groupId: string) => {
  if (isConfirmingManual.value) return;

  isConfirmingManual.value = true;
  const key = `${row.key}_${groupId}`;
  const value = (tempManualInputs.value.get(key) || "").trim();

  if (value) {
    if (!row.groupManualValues) row.groupManualValues = {};
    if (!row.groupManualValues[groupId]) row.groupManualValues[groupId] = [];

    if (row.singleSelect) {
      // 单选模式：清空源选择和其他手动输入
      if (row.groupSelectedSources?.[groupId]) {
        row.groupSelectedSources[groupId] = [];
      }
      row.groupManualValues[groupId] = [value];
      if (row.groupPrimarySource) {
        row.groupPrimarySource[groupId] = "";
      }
    } else if (!row.groupManualValues[groupId].includes(value)) {
      row.groupManualValues[groupId].push(value);
    }

    updateSuggestedValue(row, groupId);
    emit("field-change", row);
  }

  tempManualInputs.value.set(key, "");
  showButtonsForFields.value.set(key, false);
  setTimeout(() => {
    isConfirmingManual.value = false;
  }, 100);
};

// 取消手动输入
const cancelManualInput = (row: ComparisonField, groupId: string) => {
  const key = `${row.key}_${groupId}`;
  tempManualInputs.value.set(key, "");
  showButtonsForFields.value.set(key, false);
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
  .header-with-id {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 4px 0;

    .system-main-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1.2;
    }

    .group-selector-mini {
      width: 100%;
      padding: 0 8px;

      :deep(.el-select.mini-select) {
        .el-input__wrapper {
          padding: 0 4px;
          background-color: var(--el-fill-color-light);
          box-shadow: none !important;
          border: 1px solid var(--el-border-color);

          &:hover {
            border-color: var(--el-color-primary);
          }
        }
        .el-input__inner {
          font-size: 11px;
          height: 22px;
          color: var(--el-color-primary);
          font-weight: bold;
          text-align: center;
        }
        .el-input__suffix {
          display: none;
        }
      }
    }
  }

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

  .value-footer {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4px;
    padding-top: 4px;
    border-top: 1px solid var(--el-border-color-lighter);
    gap: 4px;

    .source-label-mini {
      display: flex;
      align-items: center;
      gap: 4px;
      overflow: hidden;
      flex: 1;

      .source-sys {
        font-size: 10px;
        color: var(--el-color-primary);
        font-weight: bold;
        white-space: nowrap;
      }

      .source-id {
        font-size: 10px;
        color: var(--el-text-color-secondary);
        font-family: monospace;
        background: var(--el-fill-color-light);
        padding: 0 4px;
        border-radius: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .value-time {
      font-size: 10px;
      color: var(--el-text-color-placeholder);
      white-space: nowrap;
    }
  }

  .field-tooltip-content {
    padding: 4px;
    .tooltip-main-val {
      font-weight: bold;
      margin-bottom: 4px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding-bottom: 4px;
    }
    .tooltip-source-info {
      font-size: 12px;
      opacity: 0.9;
    }
    .tooltip-time {
      font-size: 11px;
      opacity: 0.7;
      margin-top: 2px;
    }
  }

  .value-source-link {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    margin-left: auto;
    white-space: nowrap;
    background: var(--el-fill-color);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid var(--el-border-color-lighter);
  }
}
</style>
