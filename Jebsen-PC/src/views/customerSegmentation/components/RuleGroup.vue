<template>
  <div class="rule-group" :class="`level-${level}`">
    <div class="group-header">
      <div class="group-operator">
        <el-radio-group v-model="localOperator" size="small" @change="handleOperatorChange" v-if="level > 0">
          <el-radio-button value="AND">{{ $t("customerSegmentation.ruleBuilder.and") }}</el-radio-button>
          <el-radio-button value="OR">{{ $t("customerSegmentation.ruleBuilder.or") }}</el-radio-button>
        </el-radio-group>
      </div>
      <div class="group-actions" v-if="level > 0">
        <el-button type="danger" link size="small" @click="handleRemove">
          {{ $t("customerSegmentation.ruleBuilder.remove") }}
        </el-button>
      </div>
    </div>

    <div class="group-content">
      <div v-for="(child, index) in node.children" :key="child.id" class="child-item">
        <!-- 条件项 -->
        <div v-if="child.type === 'predicate'" class="condition-item">
          <RuleCondition
            :node="child"
            :field-options="fieldOptions"
            @update:node="handleConditionUpdate"
            @remove="handleRemoveCondition"
          />
        </div>

        <!-- 条件组 -->
        <div v-else-if="child.type === 'group'" class="group-item">
          <RuleGroup
            :node="child"
            :level="level + 1"
            :field-options="fieldOptions"
            @update:node="handleGroupUpdate"
            @add-condition="handleAddCondition"
            @add-group="handleAddGroup"
            @remove="handleRemoveGroup"
          />
        </div>

        <!-- 连接符 -->
        <div v-if="index < node.children.length - 1" class="connector">
          <span class="connector-text">{{
            localOperator === "AND" ? $t("customerSegmentation.ruleBuilder.and") : $t("customerSegmentation.ruleBuilder.or")
          }}</span>
        </div>
      </div>

      <!-- 添加按钮 -->
      <div class="add-actions">
        <el-button type="primary" link size="small" @click="handleAddCondition">
          <el-icon><Plus /></el-icon>
          {{ $t("customerSegmentation.ruleBuilder.addCondition") }}
        </el-button>
        <el-button type="info" link size="small" @click="handleAddGroup">
          <el-icon><Plus /></el-icon>
          {{ $t("customerSegmentation.ruleBuilder.addConditionGroup") }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Plus } from "@element-plus/icons-vue";
import RuleCondition from "./RuleCondition.vue";
import type { TagManage } from "@/api/modules/tagManage";
import type { CustomerSegmentation } from "@/api/modules/customerSegmentation";
import type { RuleNode } from "@/views/tagManage/components/RuleEditor.vue";

const { t } = useI18n();

const props = defineProps<{
  node: RuleNode;
  level: number;
  fieldOptions: CustomerSegmentation.FieldOption[];
}>();

const emit = defineEmits<{
  "update:node": [node: RuleNode];
  "add-condition": [parentId: string];
  "add-group": [parentId: string];
  remove: [nodeId: string];
}>();

const localOperator = ref<"AND" | "OR">((props.node.operator as "AND" | "OR") || "AND");

watch(
  () => props.node.operator,
  newVal => {
    localOperator.value = (newVal as "AND" | "OR") || "AND";
  }
);

const handleOperatorChange = (value: "AND" | "OR") => {
  props.node.operator = value;
  emit("update:node", props.node);
};

const handleConditionUpdate = (updatedNode: RuleNode) => {
  const index = props.node.children?.findIndex(child => child.id === updatedNode.id);
  if (index !== undefined && index !== -1 && props.node.children) {
    props.node.children[index] = updatedNode;
    emit("update:node", props.node);
  }
};

const handleGroupUpdate = (updatedNode: RuleNode) => {
  const index = props.node.children?.findIndex(child => child.id === updatedNode.id);
  if (index !== undefined && index !== -1 && props.node.children) {
    props.node.children[index] = updatedNode;
    emit("update:node", props.node);
  }
};

const handleAddCondition = () => {
  emit("add-condition", props.node.id);
};

const handleAddGroup = () => {
  emit("add-group", props.node.id);
};

const handleRemove = () => {
  emit("remove", props.node.id);
};

const handleRemoveCondition = (nodeId: string) => {
  if (props.node.children) {
    const index = props.node.children.findIndex(child => child.id === nodeId);
    if (index !== -1) {
      props.node.children.splice(index, 1);
      emit("update:node", props.node);
    }
  }
};

const handleRemoveGroup = (nodeId: string) => {
  if (props.node.children) {
    const index = props.node.children.findIndex(child => child.id === nodeId);
    if (index !== -1) {
      props.node.children.splice(index, 1);
      emit("update:node", props.node);
    }
  }
};
</script>

<style scoped lang="scss">
.rule-group {
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #ffffff;

  &.level-0 {
    border: none;
    background-color: transparent;
    padding: 0;
  }

  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px dashed #dcdfe6;

    .group-operator {
      flex: 1;
    }

    .group-actions {
      margin-left: 12px;
    }
  }

  .group-content {
    .child-item {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .condition-item,
    .group-item {
      padding: 8px;
      background-color: #f5f7fa;
      border-radius: 4px;
    }

    .connector {
      text-align: center;
      margin: 8px 0;
      padding: 4px 0;

      .connector-text {
        display: inline-block;
        padding: 2px 12px;
        background-color: #e4e7ed;
        border-radius: 12px;
        font-size: 12px;
        color: #606266;
      }
    }

    .add-actions {
      display: flex;
      gap: 12px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed #dcdfe6;
    }
  }
}
</style>
