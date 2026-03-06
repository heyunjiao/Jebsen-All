<template>
  <div class="rule-tree-node" :style="{ marginLeft: `${level * 24}px` }">
    <!-- 组节点 -->
    <div v-if="node.type === 'group'" class="node-group">
      <div class="node-header">
        <span class="node-label" :class="{ 'root-label': level === 0 }">
          {{ level === 0 ? "ROOT" : "组" }}
        </span>
        <div class="operator-buttons">
          <el-button :type="node.operator === 'AND' ? 'primary' : 'default'" size="small" @click="updateOperator('AND')">
            且
          </el-button>
          <el-button :type="node.operator === 'OR' ? 'primary' : 'default'" size="small" @click="updateOperator('OR')">
            或
          </el-button>
        </div>
        <el-button v-if="level > 0" type="danger" :icon="Delete" circle size="small" @click="handleRemove" />
      </div>

      <div class="node-children">
        <RuleTreeNode
          v-for="(child, index) in node.children"
          :key="child.id"
          :node="child"
          :level="level + 1"
          :available-tags="availableTags"
          @update:node="handleChildUpdate"
          @add-condition="handleAddCondition"
          @add-group="handleAddGroup"
          @add-tag="handleAddTag"
          @remove-node="handleRemoveNode"
        />

        <!-- 添加按钮 -->
        <div class="add-buttons">
          <el-button type="primary" :icon="Plus" plain size="small" @click="handleAddCondition(node.id)"> 添加条件 </el-button>
          <el-tooltip
            effect="dark"
            :content="availableTags && availableTags.length > 0 ? '基于已有标签分群' : '暂无可用标签，请先发布标签'"
            placement="top"
          >
            <el-button
              type="warning"
              :icon="Plus"
              plain
              size="small"
              :disabled="!availableTags || availableTags.length === 0"
              @click="handleAddTag(node.id)"
            >
              添加标签
            </el-button>
          </el-tooltip>
          <el-button type="success" :icon="Plus" plain size="small" @click="handleAddGroup(node.id)"> 添加组 </el-button>
        </div>
      </div>
    </div>

    <!-- 标签节点 -->
    <div v-else-if="node.type === 'tag'" class="node-tag">
      <div class="tag-row">
        <el-select
          v-model="localNode.tagIds"
          placeholder="选择标签"
          multiple
          style="width: 100%"
          popper-class="rule-select-dropdown"
          :teleported="false"
          @change="handleTagChange"
        >
          <el-option v-for="tag in availableTags" :key="tag.tagId" :label="tag.tagName" :value="tag.tagId">
            <span>{{ tag.tagName }}</span>
            <el-tag :type="getCategoryType(tag.category)" size="small" style="margin-left: 8px">
              {{ tag.category }}
            </el-tag>
          </el-option>
        </el-select>

        <el-button type="danger" :icon="Delete" circle size="small" @click="handleRemove" />
      </div>
    </div>

    <!-- 条件节点 -->
    <div v-else class="node-predicate">
      <div class="predicate-row">
        <el-select
          v-model="localNode.field"
          placeholder="选择字段"
          style="width: 150px"
          popper-class="rule-select-dropdown"
          :teleported="false"
          @change="handleUpdate"
        >
          <el-option label="年龄" value="age" />
          <el-option label="年消费金额" value="annualConsumption" />
          <el-option label="性别" value="gender" />
          <el-option label="90天到店次数" value="visitCount90Days" />
          <el-option label="车辆类型" value="vehicleType" />
          <el-option label="最后到店天数" value="lastVisitDays" />
          <el-option label="累计消费" value="totalConsumption" />
        </el-select>

        <el-select
          v-model="localNode.operatorType"
          placeholder="操作符"
          style="width: 120px"
          popper-class="rule-select-dropdown"
          :teleported="false"
          @change="handleUpdate"
        >
          <el-option label="等于" value="eq" />
          <el-option label="不等于" value="ne" />
          <el-option label="大于" value="gt" />
          <el-option label="大于等于" value="gte" />
          <el-option label="小于" value="lt" />
          <el-option label="小于等于" value="lte" />
          <el-option label="包含" value="contains" />
          <el-option label="不包含" value="notContains" />
        </el-select>

        <el-input v-model="localNode.value" placeholder="输入值" style="width: 150px" @input="handleUpdate" />

        <el-button type="danger" :icon="Delete" circle size="small" @click="handleRemove" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Plus, Delete } from "@element-plus/icons-vue";
import type { RuleNode } from "./RuleEditor.vue";

const props = defineProps<{
  node: RuleNode;
  level: number;
  availableTags?: Array<{ tagId: string; tagName: string; category: string }>;
}>();

const emit = defineEmits<{
  "update:node": [node: RuleNode];
  "add-condition": [parentId: string];
  "add-group": [parentId: string];
  "add-tag": [parentId: string];
  "remove-node": [nodeId: string];
}>();

const localNode = ref<RuleNode>(JSON.parse(JSON.stringify(props.node)));

// 默认标签列表（如果没有传入）
const availableTags = computed(() => props.availableTags || []);

// 获取分类类型
const getCategoryType = (category: string) => {
  // 根据分类名称动态分配颜色类型
  const categoryMap: Record<string, string> = {
    意向级别: "primary",
    车牌类型: "success",
    所在城市: "warning",
    特殊标识: "danger",
    爱好: "info",
    SC: "success",
    续保: "warning",
    保险到期月份: "info",
    POC: "primary",
    线上活动: "success",
    保时捷: "warning",
    新能源: "success"
  };
  return categoryMap[category] || "info";
};

// 标签选择变化
const handleTagChange = () => {
  // 更新标签名称
  if (localNode.value.tagIds && availableTags.value.length > 0) {
    localNode.value.tagNames = localNode.value.tagIds
      .map(id => {
        const tag = availableTags.value.find(t => t.tagId === id);
        return tag?.tagName || "";
      })
      .filter(Boolean);
  }
  handleUpdate();
};

watch(
  () => props.node,
  newVal => {
    localNode.value = JSON.parse(JSON.stringify(newVal));
  },
  { deep: true }
);

const handleUpdate = () => {
  emit("update:node", JSON.parse(JSON.stringify(localNode.value)));
};

const updateOperator = (operator: "AND" | "OR") => {
  localNode.value.operator = operator;
  handleUpdate();
};

const handleChildUpdate = (childNode: RuleNode) => {
  if (localNode.value.children) {
    const index = localNode.value.children.findIndex(c => c.id === childNode.id);
    if (index !== -1) {
      localNode.value.children[index] = childNode;
      handleUpdate();
    }
  }
};

const handleAddCondition = (parentId: string) => {
  emit("add-condition", parentId);
};

const handleAddGroup = (parentId: string) => {
  emit("add-group", parentId);
};

const handleAddTag = (parentId: string) => {
  emit("add-tag", parentId);
};

const handleRemove = () => {
  emit("remove-node", localNode.value.id);
};

const handleRemoveNode = (nodeId: string) => {
  emit("remove-node", nodeId);
};
</script>

<style lang="scss" scoped>
.rule-tree-node {
  margin-bottom: 12px;

  .node-group {
    .node-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .node-label {
        padding: 4px 12px;
        background-color: var(--el-color-primary);
        color: white;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        min-width: 60px;
        text-align: center;

        &.root-label {
          background-color: var(--el-color-primary);
        }
      }

      .operator-buttons {
        display: flex;
        gap: 8px;
      }
    }

    .node-children {
      margin-left: 24px;
      padding-left: 16px;
      border-left: 2px dashed var(--el-border-color);
    }

    .add-buttons {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      margin-left: 24px;
    }
  }

  .node-tag {
    position: relative;
    z-index: 1;

    .tag-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background-color: var(--el-bg-color-page);
      border-radius: 4px;
      position: relative;
    }
  }

  .node-predicate {
    position: relative;
    z-index: 1;

    .predicate-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background-color: var(--el-bg-color-page);
      border-radius: 4px;
      position: relative;
    }
  }
}
</style>
