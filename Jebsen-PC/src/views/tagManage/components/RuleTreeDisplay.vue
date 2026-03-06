<template>
  <div class="rule-tree-display">
    <div class="node-item" :style="{ marginLeft: `${level * 20}px` }">
      <!-- 组节点 -->
      <div v-if="node.type === 'group'" class="group-node">
        <span class="group-label">{{ level === 0 ? "ROOT" : "组" }}</span>
        <span class="operator-label">{{ node.operator || "AND" }}</span>
        <div class="children">
          <RuleTreeDisplay v-for="child in node.children" :key="child.id" :node="child" :level="level + 1" />
        </div>
      </div>

      <!-- 标签节点 -->
      <div v-else-if="node.type === 'tag'" class="tag-node">
        <span class="tag-label">标签：</span>
        <el-tag
          v-for="(tagName, index) in node.tagNames || node.tagIds || []"
          :key="index"
          size="small"
          style="margin-right: 4px"
        >
          {{ tagName }}
        </el-tag>
      </div>

      <!-- 条件节点 -->
      <div v-else class="predicate-node">
        <span class="field-label">{{ getFieldLabel(node.field || "") }}</span>
        <span class="operator-label">{{ getOperatorLabel(node.operatorType || "") }}</span>
        <span class="value-label">{{ node.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RuleNode } from "./RuleEditor.vue";

const props = defineProps<{
  node: RuleNode;
  level?: number;
}>();

const level = props.level || 0;

const getFieldLabel = (field: string) => {
  const fieldMap: Record<string, string> = {
    age: "年龄",
    annualConsumption: "年消费金额",
    gender: "性别",
    visitCount90Days: "90天到店次数",
    vehicleType: "车辆类型",
    lastVisitDays: "最后到店天数",
    totalConsumption: "累计消费"
  };
  return fieldMap[field] || field;
};

const getOperatorLabel = (operator: string) => {
  const operatorMap: Record<string, string> = {
    eq: "等于",
    ne: "不等于",
    gt: "大于",
    gte: "大于等于",
    lt: "小于",
    lte: "小于等于",
    contains: "包含",
    notContains: "不包含"
  };
  return operatorMap[operator] || operator;
};
</script>

<style lang="scss" scoped>
.rule-tree-display {
  .node-item {
    margin-bottom: 8px;
  }

  .group-node {
    .group-label {
      display: inline-block;
      padding: 2px 8px;
      background-color: var(--el-color-primary);
      color: white;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-right: 8px;
    }

    .operator-label {
      color: var(--el-color-primary);
      font-weight: 600;
      margin-right: 8px;
    }

    .children {
      margin-top: 8px;
    }
  }

  .tag-node {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    background-color: var(--el-bg-color-page);
    border-radius: 4px;

    .tag-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }

  .predicate-node {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    background-color: var(--el-bg-color-page);
    border-radius: 4px;

    .field-label,
    .operator-label,
    .value-label {
      font-size: 13px;
    }

    .operator-label {
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
