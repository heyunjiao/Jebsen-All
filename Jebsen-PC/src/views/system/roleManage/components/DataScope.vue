<template>
  <el-card shadow="hover" class="data-scope-card">
    <el-form :model="dataScopeConfig" label-width="160px">
      <el-form-item :label="$t('system.roleManagement.dataScope.title')" class="scope-form-item">
        <el-radio-group :model-value="dataScopeConfig.scopeType" @change="handleDataScopeChange" class="scope-radio-group">
          <div
            v-for="option in scopeOptions"
            :key="option.value"
            :class="['scope-radio-item', { 'is-checked': dataScopeConfig.scopeType === option.value }]"
            @click="handleDataScopeChange(option.value)"
          >
            <el-radio :label="option.value" :model-value="dataScopeConfig.scopeType === option.value" class="scope-radio">
              <div class="scope-option">
                <div class="scope-title">{{ option.title }}</div>
                <div class="scope-desc">{{ option.desc }}</div>
              </div>
            </el-radio>
          </div>
        </el-radio-group>
      </el-form-item>

      <!-- 自定义设置：部门树 -->
      <el-form-item v-if="dataScopeConfig.scopeType === '2'" :label="$t('system.roleManagement.dataScope.selectDealer')">
        <div class="dept-tree-wrapper">
          <div class="tree-actions">
            <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand">
              {{ $t("system.expandCollapse") }}
            </el-checkbox>
            <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll">
              {{ $t("system.selectAll") }}
            </el-checkbox>
            <el-checkbox :model-value="deptCheckStrictly" @change="handleCheckedTreeConnect">
              {{ $t("system.parentChildLink") }}
            </el-checkbox>
          </div>
          <el-tree
            class="tree-border"
            :data="deptOptions"
            show-checkbox
            ref="deptTreeRef"
            node-key="id"
            :check-strictly="!deptCheckStrictly"
            empty-text="加载中，请稍候"
            :props="defaultProps"
            style="margin-top: 12px; max-height: 400px; overflow-y: auto"
            @check="handleDeptTreeCheck"
          />
        </div>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Props {
  dataScopeConfig: {
    scopeType: string;
    customDeptIds: number[];
  };
  deptOptions: any[];
  deptCheckStrictly: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:dataScopeConfig": [value: Props["dataScopeConfig"]];
  "update:deptCheckStrictly": [value: boolean];
}>();

const deptTreeRef = ref();
const deptExpand = ref(true);
const deptNodeAll = ref(false);

const defaultProps = {
  children: "children",
  label: "label"
};

// 数据范围选项
const scopeOptions = computed(() => [
  {
    value: "1",
    title: t("system.roleManagement.dataScope.allData"),
    desc: t("system.roleManagement.dataScope.allDataDesc")
  },
  {
    value: "4",
    title: t("system.roleManagement.dataScope.deptAndBelow"),
    desc: t("system.roleManagement.dataScope.deptAndBelowDesc")
  },
  {
    value: "3",
    title: t("system.roleManagement.dataScope.deptOnly"),
    desc: t("system.roleManagement.dataScope.deptOnlyDesc")
  },
  {
    value: "5",
    title: t("system.roleManagement.dataScope.selfOnly"),
    desc: t("system.roleManagement.dataScope.selfOnlyDesc")
  },
  {
    value: "2",
    title: t("system.roleManagement.dataScope.custom"),
    desc: t("system.roleManagement.dataScope.customDesc")
  }
]);

// 数据范围变化
const handleDataScopeChange = (value: string) => {
  if (value !== "2" && deptTreeRef.value) {
    deptTreeRef.value.setCheckedKeys([]);
    emit("update:dataScopeConfig", {
      ...props.dataScopeConfig,
      scopeType: value,
      customDeptIds: []
    });
  } else {
    emit("update:dataScopeConfig", {
      ...props.dataScopeConfig,
      scopeType: value
    });
  }
};

// 父子联动变化
const handleCheckedTreeConnect = (value: boolean) => {
  emit("update:deptCheckStrictly", value);
};

// 部门树选中变化
const handleDeptTreeCheck = () => {
  const checkedKeys = deptTreeRef.value?.getCheckedKeys() || [];
  emit("update:dataScopeConfig", {
    ...props.dataScopeConfig,
    customDeptIds: checkedKeys
  });
};

// 树权限（展开/折叠）
const handleCheckedTreeExpand = (value: boolean) => {
  const nodes = deptTreeRef.value?.store.nodesMap;
  if (nodes) {
    for (const i in nodes) {
      nodes[i].expanded = value;
    }
  }
};

// 树权限（全选/全不选）
const handleCheckedTreeNodeAll = (value: boolean) => {
  if (deptTreeRef.value) {
    if (value) {
      const allKeys = getAllKeys(props.deptOptions);
      deptTreeRef.value.setCheckedKeys(allKeys);
    } else {
      deptTreeRef.value.setCheckedKeys([]);
    }
  }
};

// 获取所有节点key
const getAllKeys = (tree: any[]): number[] => {
  const keys: number[] = [];
  const traverse = (nodes: any[]) => {
    nodes.forEach(node => {
      keys.push(node.id);
      if (node.children) {
        traverse(node.children);
      }
    });
  };
  traverse(tree);
  return keys;
};

// 暴露方法供父组件调用
defineExpose({
  deptTreeRef,
  getCheckedKeys: () => deptTreeRef.value?.getCheckedKeys() || [],
  setCheckedKeys: (keys: number[]) => deptTreeRef.value?.setCheckedKeys(keys)
});
</script>

<style scoped lang="scss">
.data-scope-card {
  :deep(.el-card__body) {
    padding: 24px;
  }

  .scope-form-item {
    :deep(.el-form-item__label) {
      font-weight: 600;
      color: #303133;
    }
  }

  .scope-radio-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .scope-radio-item {
    position: relative;
    width: 100%;
    padding: 16px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background-color: #fff;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: #c0c4cc;
    }

    &.is-checked {
      border-color: #409eff;
      background-color: #ecf5ff;
    }

    .scope-radio {
      width: 100%;
      margin: 0;
      :deep(.el-radio__input) {
        margin-right: 12px;
        .el-radio__inner {
          width: 16px;
          height: 16px;
        }
      }
      :deep(.el-radio__label) {
        width: 100%;
        padding-left: 0;
        display: flex;
        flex-direction: column;
      }
    }

    .scope-option {
      width: 100%;
      .scope-title {
        font-weight: 600;
        font-size: 14px;
        color: #303133;
        margin-bottom: 4px;
        line-height: 1.5;
      }
      .scope-desc {
        font-size: 12px;
        color: #909399;
        line-height: 1.5;
      }
    }
  }

  .dept-tree-wrapper {
    margin-top: 16px;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 4px;

    .tree-actions {
      margin-bottom: 12px;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;

      .el-checkbox {
        margin-right: 0;
      }
    }
  }

  .tree-border {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 10px;
  }
}
</style>
