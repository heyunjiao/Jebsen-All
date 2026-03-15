<template>
  <div class="rule-editor">
    <div class="rule-editor-container">
      <!-- 左侧：规则配置 -->
      <div class="rule-config-panel">
        <div class="panel-header">
          <h3>规则配置</h3>
        </div>
        <div class="rule-tree-container">
          <RuleTreeNode
            :node="ruleTree"
            :level="0"
            :available-tags="availableTags"
            :disabled="disabled"
            @update:node="handleNodeUpdate"
            @add-condition="handleAddCondition"
            @add-group="handleAddGroup"
            @add-tag="handleAddTag"
            @remove-node="handleRemoveNode"
          />
        </div>
      </div>

      <!-- 右侧：实时校验和预览 -->
      <div class="rule-preview-panel">
        <div class="panel-header">
          <h3>实时校验 & 预览</h3>
        </div>

        <!-- 校验状态 -->
        <div class="validation-status">
          <el-icon v-if="validationStatus.valid" class="status-icon success">
            <Check />
          </el-icon>
          <el-icon v-else class="status-icon error">
            <Close />
          </el-icon>
          <span :class="validationStatus.valid ? 'success-text' : 'error-text'">
            {{ validationStatus.message }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { Check, Close } from "@element-plus/icons-vue";
import RuleTreeNode from "./RuleTreeNode.vue";

export interface RuleNode {
  id: string;
  type: "group" | "predicate" | "tag";
  operator?: "AND" | "OR";
  field?: string;
  operatorType?: string;
  value?: any;
  children?: RuleNode[];
  // 标签节点专用
  tagIds?: string[]; // 选中的标签ID列表
  tagNames?: string[]; // 标签名称（用于显示）
  /** 是/否：是=拥有该标签，否=不拥有该标签 */
  tagMatch?: "yes" | "no";
}

const props = withDefaults(
  defineProps<{
    modelValue: RuleNode;
    availableTags?: Array<{ tagId: string; tagName: string; category: string }>;
    disabled?: boolean;
  }>(),
  { disabled: false }
);

const emit = defineEmits<{
  "update:modelValue": [value: RuleNode];
}>();

const cloneRuleTree = (value: RuleNode) => JSON.parse(JSON.stringify(value));

// 本地状态，避免 props 与本地互相触发的递归更新
const ruleTree = ref<RuleNode>(cloneRuleTree(props.modelValue));
const syncingFromProps = ref(false);

// 监听外部变化，同步到本地，但不反向触发 emit
watch(
  () => props.modelValue,
  newVal => {
    syncingFromProps.value = true;
    ruleTree.value = cloneRuleTree(newVal);
    // 等待本次同步完成后再允许向外 emit，避免递归更新
    nextTick(() => {
      syncingFromProps.value = false;
    });
  },
  { deep: true }
);

// 监听本地变化，向父组件透传，但在 props 同步阶段不触发
watch(
  ruleTree,
  newVal => {
    if (syncingFromProps.value) return;
    emit("update:modelValue", cloneRuleTree(newVal));
  },
  { deep: true }
);

// 可用标签列表
const availableTags = computed(() => props.availableTags || []);

// 校验状态
const validationStatus = computed(() => {
  const validateNode = (node: RuleNode): { valid: boolean; message: string } => {
    if (node.type === "group") {
      if (!node.children || node.children.length === 0) {
        return { valid: false, message: "结构校验失败：组内不能为空" };
      }
      if (!node.operator) {
        return { valid: false, message: "结构校验失败：组必须选择逻辑运算符" };
      }

      for (const child of node.children) {
        const result = validateNode(child);
        if (!result.valid) {
          return result;
        }
      }
      return { valid: true, message: "结构校验通过" };
    } else if (node.type === "tag") {
      // tag
      if (!node.tagIds || node.tagIds.length === 0) {
        return { valid: false, message: "结构校验失败：请至少选择一个标签" };
      }
      return { valid: true, message: "结构校验通过" };
    } else {
      // predicate
      if (!node.field || !node.operatorType || node.value === undefined || node.value === "") {
        return { valid: false, message: "结构校验失败：条件不完整" };
      }
      return { valid: true, message: "结构校验通过" };
    }
  };

  return validateNode(ruleTree.value);
});

// 节点更新
const handleNodeUpdate = (node: RuleNode) => {
  ruleTree.value = node;
};

// 添加条件
const handleAddCondition = (parentId: string) => {
  const addConditionToNode = (node: RuleNode): boolean => {
    if (node.id === parentId && node.type === "group") {
      if (!node.children) {
        node.children = [];
      }
      node.children.push({
        id: generateId(),
        type: "predicate",
        field: "age",
        operatorType: "eq",
        value: ""
      });
      return true;
    }

    if (node.children) {
      for (const child of node.children) {
        if (addConditionToNode(child)) {
          return true;
        }
      }
    }

    return false;
  };

  addConditionToNode(ruleTree.value);
};

// 添加组
const handleAddGroup = (parentId: string) => {
  const addGroupToNode = (node: RuleNode): boolean => {
    if (node.id === parentId && node.type === "group") {
      if (!node.children) {
        node.children = [];
      }
      node.children.push({
        id: generateId(),
        type: "group",
        operator: "AND",
        children: []
      });
      return true;
    }

    if (node.children) {
      for (const child of node.children) {
        if (addGroupToNode(child)) {
          return true;
        }
      }
    }

    return false;
  };

  addGroupToNode(ruleTree.value);
};

// 添加标签节点
const handleAddTag = (parentId: string) => {
  const addTagToNode = (node: RuleNode): boolean => {
    if (node.id === parentId && node.type === "group") {
      if (!node.children) {
        node.children = [];
      }
      node.children.push({
        id: generateId(),
        type: "tag",
        tagIds: [],
        tagNames: [],
        tagMatch: "yes"
      });
      return true;
    }

    if (node.children) {
      for (const child of node.children) {
        if (addTagToNode(child)) {
          return true;
        }
      }
    }

    return false;
  };

  addTagToNode(ruleTree.value);
};

// 删除节点
const handleRemoveNode = (nodeId: string) => {
  const removeNode = (node: RuleNode, parent?: RuleNode, index?: number): boolean => {
    if (node.id === nodeId) {
      if (parent && index !== undefined && parent.children) {
        parent.children.splice(index, 1);
      }
      return true;
    }

    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        if (removeNode(node.children[i], node, i)) {
          return true;
        }
      }
    }

    return false;
  };

  // 不能删除根节点
  if (ruleTree.value.id === nodeId) {
    return;
  }

  removeNode(ruleTree.value);
};

// 生成唯一ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
</script>

<style lang="scss" scoped>
.rule-editor {
  width: 100%;

  .rule-editor-container {
    display: flex;
    gap: 20px;
    min-height: 600px;
  }

  .rule-config-panel,
  .rule-preview-panel {
    flex: 1;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    padding: 16px;
    background-color: var(--el-bg-color);
  }

  .panel-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color);

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .rule-tree-container {
    min-height: 500px;
    overflow: visible;
    position: relative;
  }

  .validation-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background-color: var(--el-bg-color-page);
    border-radius: 4px;
    margin-bottom: 16px;

    .status-icon {
      font-size: 20px;

      &.success {
        color: var(--el-color-success);
      }

      &.error {
        color: var(--el-color-danger);
      }
    }

    .success-text {
      color: var(--el-color-success);
      font-weight: 500;
    }

    .error-text {
      color: var(--el-color-danger);
      font-weight: 500;
    }
  }
}
</style>
