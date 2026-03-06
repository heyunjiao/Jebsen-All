<template>
  <div class="rule-builder-simple">
    <!-- 条件组合方式 -->
    <div class="condition-operator">
      <span class="operator-label">{{ $t("customerSegmentation.ruleBuilder.rootOperator") }}：</span>
      <el-radio-group v-model="rootOperator" size="default" @change="handleRootOperatorChange">
        <el-radio-button value="AND">{{ $t("customerSegmentation.ruleBuilder.all") }}</el-radio-button>
        <el-radio-button value="OR">{{ $t("customerSegmentation.ruleBuilder.any") }}</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 条件列表 -->
    <div class="conditions-list">
      <div v-for="(condition, index) in localConditions" :key="condition.id" class="condition-row">
        <div class="condition-content">
          <!-- 条件连接符（第二个条件开始显示） -->
          <div v-if="index > 0" class="condition-connector">
            <el-tag
              size="small"
              :type="condition.logic === 'AND' ? 'success' : 'warning'"
              class="connector-tag"
              @click="toggleConditionLogic(index)"
              title="点击切换逻辑"
            >
              {{
                condition.logic === "AND" ? $t("customerSegmentation.ruleBuilder.and") : $t("customerSegmentation.ruleBuilder.or")
              }}
            </el-tag>
          </div>

          <!-- 条件输入 -->
          <div class="condition-inputs">
            <!-- 字段选择（多选+搜索） -->
            <el-select
              v-model="condition.field"
              :placeholder="$t('customerSegmentation.ruleBuilder.selectField')"
              multiple
              filterable
              clearable
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="1"
              @change="() => onFieldChange(condition)"
            >
              <el-option v-for="option in fieldOptions" :key="option.field" :label="option.label" :value="option.field" />
            </el-select>

            <!-- 操作符选择（多选+搜索） -->
            <el-select
              v-model="condition.operator"
              :placeholder="$t('customerSegmentation.ruleBuilder.selectOperator')"
              multiple
              filterable
              clearable
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="1"
              :disabled="!condition.field"
            >
              <el-option
                v-for="op in getAvailableOperators(condition.field)"
                :key="op"
                :label="getOperatorLabel(op)"
                :value="op"
              />
            </el-select>

            <!-- 值输入 -->
            <div class="value-input-wrapper">
              <ConditionValueInput
                v-if="condition.field && condition.operator"
                v-model="condition.value"
                :field-option="getFieldOption(condition.field)"
                :operator="condition.operator"
              />
            </div>

            <!-- 删除按钮 -->
            <el-button type="danger" :icon="Delete" circle size="small" @click="removeCondition(index)" />
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="localConditions.length === 0" class="empty-state">
        <el-empty :description="$t('customerSegmentation.messages.ruleRequired')" :image-size="80">
          <el-button type="primary" :icon="Plus" @click="addCondition">
            {{ $t("customerSegmentation.ruleBuilder.addCondition") }}
          </el-button>
        </el-empty>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions-bar">
      <el-button type="primary" :icon="Plus" @click="addCondition">
        {{ $t("customerSegmentation.ruleBuilder.addCondition") }}
      </el-button>
      <el-button type="info" :icon="FolderAdd" @click="addGroup">
        {{ $t("customerSegmentation.ruleBuilder.addConditionGroup") }}
      </el-button>
      <el-button v-if="localConditions.length > 0 || localGroups.length > 0" type="warning" :icon="RefreshLeft" @click="clearAll">
        清空所有条件
      </el-button>
    </div>

    <!-- 条件组列表（嵌套条件） -->
    <div v-if="localGroups.length > 0" class="condition-groups">
      <div v-for="(group, groupIndex) in localGroups" :key="group.id" class="condition-group-item">
        <div class="group-header">
          <!-- 组连接符 (第一个组如果前面有条件显示，或非第一个组显示) -->
          <div v-if="groupIndex > 0 || localConditions.length > 0" class="group-connector" style="margin-right: 12px">
            <el-tag
              size="small"
              :type="group.logic === 'AND' ? 'success' : 'warning'"
              class="connector-tag"
              @click="toggleGroupLogic(groupIndex)"
              title="点击切换逻辑"
            >
              {{ group.logic === "AND" ? $t("customerSegmentation.ruleBuilder.and") : $t("customerSegmentation.ruleBuilder.or") }}
            </el-tag>
          </div>

          <el-tag type="info" size="small">条件组 {{ groupIndex + 1 }}</el-tag>

          <!-- 组内逻辑 -->
          <span style="font-size: 13px; color: var(--el-text-color-secondary); margin-left: 8px">组内关系：</span>
          <el-radio-group v-model="group.operator" size="small">
            <el-radio-button value="AND">{{ $t("customerSegmentation.ruleBuilder.all") }}</el-radio-button>
            <el-radio-button value="OR">{{ $t("customerSegmentation.ruleBuilder.any") }}</el-radio-button>
          </el-radio-group>

          <el-button type="danger" :icon="Delete" link size="small" style="margin-left: auto" @click="removeGroup(groupIndex)">
            删除组
          </el-button>
        </div>
        <div class="group-content">
          <div v-for="(condition, index) in group.conditions" :key="condition.id" class="condition-row">
            <div class="condition-content">
              <div v-if="index > 0" class="condition-connector">
                <el-tag
                  size="small"
                  :type="group.operator === 'AND' ? 'success' : 'warning'"
                  class="connector-tag"
                  @click="toggleGroupInnerOperator(group)"
                  title="点击切换组内逻辑"
                >
                  {{
                    group.operator === "AND"
                      ? $t("customerSegmentation.ruleBuilder.and")
                      : $t("customerSegmentation.ruleBuilder.or")
                  }}
                </el-tag>
              </div>
              <div class="condition-inputs">
                <el-select
                  v-model="condition.field"
                  :placeholder="$t('customerSegmentation.ruleBuilder.selectField')"
                  multiple
                  filterable
                  clearable
                  collapse-tags
                  collapse-tags-tooltip
                  :max-collapse-tags="1"
                  @change="() => onFieldChange(condition)"
                >
                  <el-option v-for="option in fieldOptions" :key="option.field" :label="option.label" :value="option.field" />
                </el-select>
                <el-select
                  v-model="condition.operator"
                  :placeholder="$t('customerSegmentation.ruleBuilder.selectOperator')"
                  multiple
                  filterable
                  clearable
                  collapse-tags
                  collapse-tags-tooltip
                  :max-collapse-tags="1"
                  :disabled="!condition.field"
                >
                  <el-option
                    v-for="op in getAvailableOperators(condition.field)"
                    :key="op"
                    :label="getOperatorLabel(op)"
                    :value="op"
                  />
                </el-select>
                <div class="value-input-wrapper">
                  <ConditionValueInput
                    v-if="condition.field && condition.operator"
                    v-model="condition.value"
                    :field-option="getFieldOption(condition.field)"
                    :operator="condition.operator"
                  />
                </div>
                <el-button type="danger" :icon="Delete" circle size="small" @click="removeGroupCondition(groupIndex, index)" />
              </div>
            </div>
          </div>
          <el-button type="primary" link @click="addGroupCondition(groupIndex)">
            <el-icon><Plus /></el-icon> 添加组内条件
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Plus, Delete, FolderAdd, RefreshLeft } from "@element-plus/icons-vue";
import ConditionValueInput from "./ConditionValueInput.vue";
import type { CustomerSegmentation } from "@/api/modules/customerSegmentation";
import type { RuleNode } from "@/views/tagManage/components/RuleEditor.vue";

const { t } = useI18n();

const props = defineProps<{
  modelValue: RuleNode;
  fieldOptions: CustomerSegmentation.FieldOption[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: RuleNode];
  estimate: [];
}>();

interface Condition {
  id: string;
  field: string | string[]; // 支持多选
  operator: string | string[]; // 支持多选
  value: any;
  logic: "AND" | "OR"; // 与前一个条件的连接逻辑
}

interface ConditionGroup {
  id: string;
  operator: "AND" | "OR"; // 组内逻辑
  conditions: Condition[];
  logic: "AND" | "OR"; // 与前一个元素的连接逻辑
}

// 本地状态
const rootOperator = ref<"AND" | "OR" | "MIXED">("AND"); // 仅作为批量操作的UI状态
const localConditions = ref<Condition[]>([]);
const localGroups = ref<ConditionGroup[]>([]);

// 生成唯一ID
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 从外部 modelValue 初始化
let initialized = false;
const initFromModelValue = () => {
  if (initialized) return;
  initialized = true;

  const node = props.modelValue;
  if (!node) return;

  // DNF 扁平化处理：将 OR(AND(...), AND(...)) 结构拍平为线性列表
  // 如果是简单结构 AND(...)，也是一种特殊的 DNF (只有1项)

  const conditions: Condition[] = [];
  const groups: ConditionGroup[] = [];

  // 辅助函数：解析 predicate 节点
  const parsePredicate = (child: RuleNode, logic: "AND" | "OR"): Condition => ({
    id: child.id || generateId(),
    field: child.field || "",
    operator: child.operatorType || "",
    value: child.value,
    logic
  });

  // 辅助函数：解析 group 节点 (作为普通组)
  const parseGroup = (child: RuleNode, logic: "AND" | "OR"): ConditionGroup => {
    const groupConditions: Condition[] = [];
    child.children?.forEach(gc => {
      if (gc.type === "predicate") {
        groupConditions.push(parsePredicate(gc, "AND")); // 组内默认无 logic 概念，使用 operator
      }
    });
    return {
      id: child.id || generateId(),
      operator: (child.operator as "AND" | "OR") || "AND",
      conditions: groupConditions,
      logic
    };
  };

  // 顶层处理
  if (node.type === "group") {
    const topOp = (node.operator as "AND" | "OR") || "AND";
    rootOperator.value = topOp;

    if (node.children) {
      if (topOp === "OR") {
        // 如果顶层是 OR，尝试 DNF 拆解
        // 子节点可能是 Predicate 或 Group(AND)
        // 任何 Group(AND) 的子节点视为连续的 AND 序列
        // Predicate 视为单独项

        node.children.forEach((child, index) => {
          // 第一项逻辑无所谓，但后续项由父级 Operator 决定 (这里是 OR)
          // DNF 结构中，顶层是 OR，所以每个 Chunk 之间是 OR
          // Chunk 内部是 AND
          const chunkLogic = index === 0 ? "AND" : "OR";

          if (child.type === "predicate") {
            conditions.push(parsePredicate(child, chunkLogic));
          } else if (child.type === "group") {
            const childOp = child.operator || "AND";
            if (childOp === "AND") {
              // 将 Group(AND) 展平加入 conditions
              child.children?.forEach((grandChild, gIndex) => {
                if (grandChild.type === "predicate") {
                  // 第一个元素继承 ChunkLogic，后续元素是 AND
                  const itemLogic = gIndex === 0 ? chunkLogic : "AND";
                  conditions.push(parsePredicate(grandChild, itemLogic));
                } else {
                  // 暂不支持深层嵌套展平，放入 groups
                  groups.push(parseGroup(grandChild, gIndex === 0 ? chunkLogic : "AND"));
                }
              });
            } else {
              // OR 组内嵌 OR 组？直接作为独立组
              groups.push(parseGroup(child, chunkLogic));
            }
          }
        });
      } else {
        // 顶层是 AND (或其它)，简单平铺
        node.children.forEach((child, index) => {
          const logic = index === 0 ? "AND" : "AND"; // 全是 AND
          if (child.type === "predicate") {
            conditions.push(parsePredicate(child, logic));
          } else if (child.type === "group") {
            groups.push(parseGroup(child, logic));
          }
        });
      }
    }
  }

  localConditions.value = conditions;
  localGroups.value = groups;
};

// 初始化
initFromModelValue();

// 构建 RuleNode 输出 (DNF 构造)
const buildRuleNode = (): RuleNode => {
  // 策略：
  // 1. 将 conditions 和 groups 视为一个连续序列
  // 2. 根据 logic === 'OR' 进行切分，形成多个 Segments (Chunks)
  // 3. 每个 Segment 内部是 AND 关系 (AND Group)
  // 4. 所有 Segments 之间是 OR 关系 (Root OR Group)

  const allItems = [
    ...localConditions.value.map(c => ({ type: "condition", data: c })),
    ...localGroups.value.map(g => ({ type: "group", data: g }))
  ];

  if (allItems.length === 0) {
    return { id: "root", type: "group", operator: "AND", children: [] };
  }

  // 分段
  const segments: any[][] = [];
  let currentSegment: any[] = [];

  allItems.forEach((item, index) => {
    // 第一项无论 logic 是什么，都开启新段 (或归入第一段)
    // 后续项如果 logic 是 OR，开启新段
    if (index === 0) {
      currentSegment.push(item);
    } else {
      const logic = item.type === "condition" ? (item.data as Condition).logic : (item.data as ConditionGroup).logic;
      if (logic === "OR") {
        segments.push(currentSegment);
        currentSegment = [item];
      } else {
        currentSegment.push(item);
      }
    }
  });
  if (currentSegment.length > 0) segments.push(currentSegment);

  // 构造 AND Groups
  const segmentNodes = segments.map(segment => {
    // 转换 segment 内的项目为 RuleNode
    const nodes = segment.map(item => {
      if (item.type === "condition") {
        const c = item.data as Condition;
        return {
          id: c.id,
          type: "predicate",
          field: c.field,
          operatorType: c.operator,
          value: c.value
        } as RuleNode;
      } else {
        const g = item.data as ConditionGroup;
        return {
          id: g.id,
          type: "group",
          operator: g.operator,
          children: g.conditions.map(c => ({
            id: c.id,
            type: "predicate",
            field: c.field,
            operatorType: c.operator,
            value: c.value
          }))
        } as RuleNode;
      }
    });

    // 如果 Segment 只有1个节点，直接返回该节点；否则包裹在 AND Group 中
    if (nodes.length === 1) return nodes[0];
    return {
      id: generateId(),
      type: "group",
      operator: "AND",
      children: nodes
    } as RuleNode;
  });

  // 构造 Root OR Group
  // 如果只有一个 Segment，直接返回该 Segment 的节点
  if (segmentNodes.length === 1) {
    // 为了保持 Root 总是 Group 类型以便外层识别，如果根节点是 Predicate，需要包裹
    // 但是标准 RuleNode 根通常是 Group
    const single = segmentNodes[0];
    if (single.type === "group") return single;
    return {
      id: "root",
      type: "group",
      operator: "AND", // 单个 Predicate 实际上无所谓，包裹一层 AND
      children: [single]
    };
  }

  return {
    id: "root",
    type: "group",
    operator: "OR",
    children: segmentNodes
  };
};

// 通知父组件更新
const emitUpdate = () => {
  const ruleNode = buildRuleNode();
  emit("update:modelValue", ruleNode);
  emit("estimate");
};

// 监听本地变化，通知父组件 (移除 rootOperator，因为它是纯UI状态)
watch(
  [localConditions, localGroups],
  () => {
    syncRootOperator();
    emitUpdate();
  },
  { deep: true }
);

// 同步 Top Toggle 状态
const syncRootOperator = () => {
  // 收集所有生效的连接符逻辑 (排除第一个条件，因为它的 logic 实际上不起作用/不可见)
  const logics: string[] = [];

  if (localConditions.value.length > 1) {
    localConditions.value.slice(1).forEach(c => logics.push(c.logic));
  }

  // Group 的 logic 是它与前一个元素的连接逻辑
  localGroups.value.forEach((g, index) => {
    // 如果 Group 是第一个元素且没有 conditions，logic 也许不可见？
    // UI逻辑：groupIndex > 0 || localConditions.length > 0 显示连接符
    if (index > 0 || localConditions.value.length > 0) {
      logics.push(g.logic);
    }
  });

  if (logics.length === 0) {
    // 只有一个元素或没有元素，默认保持当前状态，或者重置为 AND
    return;
  }

  const allAnd = logics.every(l => l === "AND");
  const allOr = logics.every(l => l === "OR");

  if (allAnd) {
    rootOperator.value = "AND";
  } else if (allOr) {
    rootOperator.value = "OR";
  } else {
    rootOperator.value = "MIXED";
  }
};

// 批量修改 logic
const handleRootOperatorChange = (val: string | number | boolean | undefined) => {
  const op = val as "AND" | "OR";
  if (!op) return;
  // 更新所有项的 logic
  localConditions.value.forEach(c => (c.logic = op));
  localGroups.value.forEach(g => (g.logic = op));
};

// 切换 Condition Logic
const toggleConditionLogic = (index: number) => {
  const c = localConditions.value[index];
  c.logic = c.logic === "AND" ? "OR" : "AND";
};

// 切换 Group Logic
const toggleGroupLogic = (index: number) => {
  const g = localGroups.value[index];
  g.logic = g.logic === "AND" ? "OR" : "AND";
};

// 切换 Group 内部 Operator
const toggleGroupInnerOperator = (group: ConditionGroup) => {
  group.operator = group.operator === "AND" ? "OR" : "AND";
};

// Helper Functions ...
const getFieldOption = (field: string | string[]) => {
  const fieldValue = Array.isArray(field) ? (field.length > 0 ? field[0] : "") : field;
  return props.fieldOptions.find(opt => opt.field === fieldValue);
};
const getAvailableOperators = (field: string | string[]) => {
  const fieldValue = Array.isArray(field) ? (field.length > 0 ? field[0] : "") : field;
  return getFieldOption(fieldValue)?.operators || [];
};
const getOperatorLabel = (op: string) => {
  const opMap: Record<string, string> = {
    equals: "等于",
    contains: "包含",
    notContains: "不包含",
    greaterThan: "大于",
    lessThan: "小于",
    between: "介于",
    belongsTo: "属于",
    notBelongsTo: "不属于",
    before: "早于",
    after: "晚于",
    allMatch: "全部匹配"
  };
  return opMap[op] || op;
};

const onFieldChange = (condition: Condition) => {
  condition.operator = "";
  // 支持多选：如果是数组，取第一个值；否则直接使用
  const fieldValue = Array.isArray(condition.field) ? (condition.field.length > 0 ? condition.field[0] : "") : condition.field;
  const fieldOpt = getFieldOption(fieldValue);
  if (fieldOpt && ["checkbox", "tagselect", "image_select"].includes(fieldOpt.inputType || "")) {
    condition.value = [];
  } else {
    condition.value = null;
  }
};

const addCondition = () => {
  localConditions.value.push({
    id: generateId(),
    field: "",
    operator: "",
    value: null,
    logic: rootOperator.value // 新增时跟随当前选择的 Global Operator
  });
};

const removeCondition = (index: number) => localConditions.value.splice(index, 1);

const clearAll = () => {
  localConditions.value = [];
  localGroups.value = [];
};

const addGroup = () => {
  localGroups.value.push({
    id: generateId(),
    operator: "AND",
    logic: rootOperator.value,
    conditions: [
      {
        id: generateId(),
        field: "",
        operator: "",
        value: null,
        logic: "AND"
      }
    ]
  });
};

const removeGroup = (index: number) => localGroups.value.splice(index, 1);

const addGroupCondition = (groupIndex: number) => {
  localGroups.value[groupIndex].conditions.push({
    id: generateId(),
    field: "",
    operator: "",
    value: null,
    logic: "AND"
  });
};

const removeGroupCondition = (groupIndex: number, conditionIndex: number) => {
  localGroups.value[groupIndex].conditions.splice(conditionIndex, 1);
};
</script>

<style scoped lang="scss">
.rule-builder-simple {
  .condition-operator {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding: 12px 16px;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
    flex-wrap: wrap;

    .operator-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-regular);
    }
  }

  .conditions-list {
    min-height: 100px;

    .condition-row {
      margin-bottom: 12px;
      width: 100%;

      .condition-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;

        .condition-connector {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
        }

        .condition-inputs {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
          width: 100%;

          // 字段选择器
          :deep(.el-select) {
            flex-shrink: 0;

            &:first-of-type {
              min-width: 180px;
              max-width: 250px;
              flex: 0 0 auto;
            }

            &:nth-of-type(2) {
              min-width: 120px;
              max-width: 180px;
              flex: 0 0 auto;
            }
          }

          .value-input-wrapper {
            min-width: 200px;
            flex: 1 1 auto;
            max-width: 100%;
          }

          // 删除按钮
          .el-button {
            flex-shrink: 0;
            margin-top: 0;
          }
        }

        .connector-tag {
          cursor: pointer;
          transition: all 0.3s;
          user-select: none;

          &:hover {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      }
    }

    .empty-state {
      padding: 20px 0;
    }
  }

  .actions-bar {
    display: flex;
    gap: 12px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px dashed var(--el-border-color);
    flex-wrap: wrap;
  }

  // 响应式优化
  @media (max-width: 768px) {
    .condition-inputs {
      flex-direction: column;
      align-items: stretch;

      :deep(.el-select) {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 100% !important;
      }

      .value-input-wrapper {
        width: 100%;
        min-width: 100%;
      }
    }
  }

  .condition-groups {
    margin-top: 20px;

    .condition-group-item {
      padding: 16px;
      background-color: var(--el-color-primary-light-9);
      border-radius: 8px;
      border: 1px solid var(--el-color-primary-light-8);
      margin-bottom: 16px;
      overflow: hidden;

      .group-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px dashed var(--el-color-primary-light-5);
      }

      .group-content {
        .condition-row {
          margin-bottom: 12px;
          width: 100%;

          .condition-content {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;

            .condition-connector {
              display: flex;
              align-items: center;
              margin-bottom: 4px;
            }

            .condition-inputs {
              display: flex;
              align-items: flex-start;
              gap: 12px;
              flex-wrap: wrap;
              width: 100%;

              // 字段选择器
              :deep(.el-select) {
                flex-shrink: 0;

                &:first-of-type {
                  min-width: 180px;
                  max-width: 250px;
                  flex: 0 0 auto;
                }

                &:nth-of-type(2) {
                  min-width: 120px;
                  max-width: 180px;
                  flex: 0 0 auto;
                }
              }

              .value-input-wrapper {
                min-width: 200px;
                flex: 1 1 auto;
                max-width: 100%;
              }

              // 删除按钮
              .el-button {
                flex-shrink: 0;
                margin-top: 0;
              }
            }
            .connector-tag {
              cursor: pointer;
              transition: all 0.3s;
              user-select: none;

              &:hover {
                transform: scale(1.1);
                opacity: 0.8;
              }
            }
          }
        }
      }
    }
  }
}
</style>
