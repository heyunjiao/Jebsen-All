<template>
  <div class="functional-permission-wrapper">
    <el-row :gutter="24">
      <!-- 左侧：菜单树 -->
      <el-col :span="12">
        <el-card shadow="hover" class="permission-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t("system.roleManagement.functional.menuTree") }}</span>
            </div>
          </template>
          <div class="tree-actions">
            <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">
              {{ $t("system.expandCollapse") }}
            </el-checkbox>
            <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">
              {{ $t("system.selectAll") }}
            </el-checkbox>
            <el-checkbox :model-value="menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">
              {{ $t("system.parentChildLink") }}
            </el-checkbox>
          </div>
          <div class="tree-container">
            <el-tree
              class="menu-tree"
              :data="menuOptions"
              show-checkbox
              ref="menuTreeRef"
              node-key="id"
              :check-strictly="!menuCheckStrictly"
              empty-text="加载中，请稍候"
              :props="defaultProps"
              @check="handleMenuTreeCheck"
            />
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：操作按钮配置 -->
      <el-col :span="12">
        <el-card shadow="hover" class="permission-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t("system.roleManagement.functional.operationButtons") }}</span>
            </div>
          </template>
          <div class="operation-buttons-config">
            <div class="page-section" v-for="page in selectedPages" :key="page.id">
              <div class="page-title">
                <el-checkbox
                  :model-value="functionalPermissions.pageAccess[page.key]"
                  @change="handlePageAccessChange(page.key, $event)"
                >
                  {{ page.label }}
                </el-checkbox>
              </div>
              <div class="buttons-list" v-if="functionalPermissions.pageAccess[page.key]">
                <el-checkbox-group
                  :model-value="functionalPermissions.operationButtons[page.key]"
                  @change="handleOperationButtonsChange(page.key, $event)"
                >
                  <el-checkbox v-for="button in page.buttons" :key="button.key" :label="button.key" :value="button.key">
                    {{ button.label }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
            <el-empty v-if="selectedPages.length === 0" :description="$t('common.noData')" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Props {
  menuOptions: any[];
  functionalPermissions: {
    menuIds: number[];
    pageAccess: Record<string, boolean>;
    operationButtons: Record<string, string[]>;
  };
  menuCheckStrictly: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:functionalPermissions": [value: Props["functionalPermissions"]];
  "update:menuCheckStrictly": [value: boolean];
  "update:menuIds": [value: number[]];
}>();

const menuTreeRef = ref();
const menuExpand = ref(false);
const menuNodeAll = ref(false);

const defaultProps = {
  children: "children",
  label: "label"
};

// 页面操作按钮配置
const pageButtonConfig = {
  customerList: {
    id: "customerList",
    key: "customerList",
    label: t("customer.customerList"),
    buttons: [
      { key: "add", label: t("system.roleManagement.functional.add") },
      { key: "export", label: t("system.roleManagement.functional.export") },
      { key: "import", label: t("system.roleManagement.functional.import") },
      { key: "viewDetail", label: t("system.roleManagement.functional.viewDetail") },
      { key: "mergeOneId", label: t("system.roleManagement.functional.mergeOneId") },
      { key: "modifyTagRule", label: t("system.roleManagement.functional.modifyTagRule") },
      { key: "batchOperation", label: t("system.roleManagement.functional.batchOperation") }
    ]
  },
  leadManagement: {
    id: "leadManagement",
    key: "leadManagement",
    label: t("leadManagement.title"),
    buttons: [
      { key: "add", label: t("system.roleManagement.functional.add") },
      { key: "export", label: t("system.roleManagement.functional.export") },
      { key: "viewDetail", label: t("system.roleManagement.functional.viewDetail") }
    ]
  },
  dataQuality: {
    id: "dataQuality",
    key: "dataQuality",
    label: "数据质量",
    buttons: [
      { key: "viewDetail", label: t("system.roleManagement.functional.viewDetail") },
      { key: "export", label: t("system.roleManagement.functional.export") }
    ]
  }
};

// 计算选中的页面（根据菜单树选中的菜单项）
const selectedPages = computed(() => {
  const pages = [];
  // 根据选中的菜单ID判断哪些页面被选中
  const checkedMenuIds = menuTreeRef.value?.getCheckedKeys() || [];

  // 这里可以根据菜单ID映射到页面
  // 简化处理：如果菜单树中有相关菜单被选中，则显示对应页面配置
  for (const [key, config] of Object.entries(pageButtonConfig)) {
    if (props.functionalPermissions.pageAccess[key]) {
      pages.push(config);
    }
  }
  return pages;
});

// 菜单树选中变化
const handleMenuTreeCheck = () => {
  const checkedKeys = menuTreeRef.value?.getCheckedKeys() || [];
  emit("update:menuIds", checkedKeys);
};

// 页面访问权限变化
const handlePageAccessChange = (pageKey: string, value: boolean) => {
  const newPageAccess = { ...props.functionalPermissions.pageAccess };
  newPageAccess[pageKey] = value;

  if (!value) {
    // 取消页面访问时，清空该页面的操作按钮
    const newOperationButtons = { ...props.functionalPermissions.operationButtons };
    newOperationButtons[pageKey] = [];
    emit("update:functionalPermissions", {
      ...props.functionalPermissions,
      pageAccess: newPageAccess,
      operationButtons: newOperationButtons
    });
  } else {
    emit("update:functionalPermissions", {
      ...props.functionalPermissions,
      pageAccess: newPageAccess
    });
  }
};

// 操作按钮变化
const handleOperationButtonsChange = (pageKey: string, value: string[]) => {
  const newOperationButtons = { ...props.functionalPermissions.operationButtons };
  newOperationButtons[pageKey] = value;
  emit("update:functionalPermissions", {
    ...props.functionalPermissions,
    operationButtons: newOperationButtons
  });
};

// 树权限（展开/折叠）
const handleCheckedTreeExpand = (value: boolean) => {
  const nodes = menuTreeRef.value?.store.nodesMap;
  if (nodes) {
    for (const i in nodes) {
      nodes[i].expanded = value;
    }
  }
};

// 树权限（全选/全不选）
const handleCheckedTreeNodeAll = (value: boolean) => {
  if (menuTreeRef.value) {
    if (value) {
      const allKeys = getAllKeys(props.menuOptions);
      menuTreeRef.value.setCheckedKeys(allKeys);
    } else {
      menuTreeRef.value.setCheckedKeys([]);
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

// 树权限（父子联动）
const handleCheckedTreeConnect = (value: boolean) => {
  emit("update:menuCheckStrictly", value);
};

// 暴露方法供父组件调用
defineExpose({
  menuTreeRef,
  getCheckedKeys: () => menuTreeRef.value?.getCheckedKeys() || [],
  setCheckedKeys: (keys: number[]) => menuTreeRef.value?.setCheckedKeys(keys)
});
</script>

<style scoped lang="scss">
.functional-permission-wrapper {
  .permission-card {
    height: 100%;
    :deep(.el-card__body) {
      padding: 16px;
    }
  }
  .card-header {
    display: flex;
    align-items: center;
    font-weight: 600;
    font-size: 14px;
    color: #303133;
  }
  .tree-actions {
    margin-bottom: 12px;
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    .el-checkbox {
      margin-right: 0;
    }
  }
  .tree-container {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background: #fff;
    padding: 8px;
    height: 500px;
    overflow-y: auto;
  }
  .operation-buttons-config {
    max-height: 500px;
    overflow-y: auto;
    .page-section {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #ebeef5;
      &:last-child {
        border-bottom: none;
      }
      .page-title {
        margin-bottom: 12px;
        font-weight: 600;
        font-size: 14px;
        color: #303133;
      }
      .buttons-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-left: 24px;
        .el-checkbox {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
