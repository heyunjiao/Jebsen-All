<template>
  <div class="functional-permission-wrapper">
    <el-row :gutter="24">
      <!-- 左侧：菜单树 -->
      <el-col :span="12">
        <el-card shadow="hover" class="permission-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t("system.roleManagement.functional.menuTree") }}</span>
              <span class="menu-sync-hint">{{ $t("system.roleManagement.functional.menuSyncHint") }}</span>
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
                  :model-value="functionalPermissions.pageAccess[page.key] ?? false"
                  @change="handlePageAccessChange(page.key, $event)"
                >
                  {{ page.label }}
                </el-checkbox>
              </div>
              <div class="buttons-list">
                <el-checkbox-group
                  :model-value="functionalPermissions.operationButtons[page.key] ?? []"
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
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import authButtonList from "@/assets/json/authButtonList.json";

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

// 页面 name 无菜单时的中文兜底（authButtonList 里可能有但不在当前菜单的项）
const pageKeyToLabelZh: Record<string, string> = {
  useProTable: "超级表格",
  authButton: "权限按钮",
  customerList: "客户列表",
  customerBatchOperation: "客户批量操作",
  customerSegmentation: "客户筛选与分群",
  tagManage: "标签管理",
  segmentManage: "分群管理",
  accountManage: "账号管理",
  roleManage: "角色管理",
  menuMange: "菜单管理",
  departmentManage: "部门管理",
  noticeManage: "通知公告",
  leadManagement: "商机管理",
  leadManagementDashboard: "商机看板",
  leadManagementList: "商机列表",
  leadManagementRule: "分发查询",
  leadManagementTracking: "商机追踪",
  errorCorrection: "异常中心",
  approval: "审批",
  dataQualityWorkbench: "数据文件上传",
  operlogManage: "操作日志",
  loginlogManage: "登录日志",
  collectionConfig: "数据催收配置",
  collectionGlobalRulesConfig: "全局监控规则配置"
};

// 按钮 key 中文兜底（i18n 未命中时用）
const buttonKeyToLabelZh: Record<string, string> = {
  add: "新增",
  batchAdd: "批量新增",
  export: "导出",
  batchDelete: "批量删除",
  status: "状态",
  edit: "编辑",
  delete: "删除",
  import: "导入",
  viewDetail: "查看详情",
  mergeOneId: "合并OneID",
  modifyTagRule: "修改标签规则",
  batchOperation: "批量操作",
  execute: "执行",
  preview: "预览",
  pushOpportunity: "推送商机",
  publish: "发布",
  disable: "停用",
  assignPermission: "分配权限",
  assignCustomer: "分配客户",
  assignRole: "分配角色",
  filter: "筛选",
  push: "推送",
  resolve: "处理",
  ignore: "忽略",
  batchIgnore: "批量忽略",
  approve: "审批",
  reject: "驳回",
  enable: "启用",
  resetPassword: "重置密码"
};

// 从菜单树扁平化：name -> label，以及左侧菜单顺序（深度优先）的 name 数组
const menuNameToLabel = computed(() => {
  const map: Record<string, string> = {};
  const traverse = (nodes: any[]) => {
    (nodes || []).forEach((node: any) => {
      if (node.name) map[node.name] = node.label || node.name;
      if (node.children?.length) traverse(node.children);
    });
  };
  traverse(props.menuOptions);
  return map;
});

// 左侧菜单的 name 顺序（深度优先，与左侧树展示一致）
const leftMenuOrderNames = computed(() => {
  const order: string[] = [];
  const traverse = (nodes: any[]) => {
    (nodes || []).forEach((node: any) => {
      if (node.name) order.push(node.name);
      if (node.children?.length) traverse(node.children);
    });
  };
  traverse(props.menuOptions);
  return order;
});

// 按钮 key 转中文（优先 i18n，否则用兜底中文）
const getButtonLabel = (key: string) => {
  const path = `system.roleManagement.functional.${key}`;
  const label = t(path);
  if (label !== path && label) return label;
  return buttonKeyToLabelZh[key] ?? key;
};

// 按页面覆盖按钮文案（如客户筛选与分群下的「新增」显示为「创建分群」）
const getButtonLabelForPage = (pageKey: string, btnKey: string) => {
  if (pageKey === "customerSegmentation" && btnKey === "add") return "创建分群";
  if (pageKey === "leadManagementDashboard" && btnKey === "add") return "新增商机";
  return getButtonLabel(btnKey);
};

// 右侧页面列表：仅展示左侧菜单中存在的页面，且顺序与左侧菜单一致
const selectedPages = computed(() => {
  const data = (authButtonList?.data ?? authButtonList) as Record<string, string[]>;
  const orderNames = leftMenuOrderNames.value;
  const orderSet = new Set(orderNames);
  const entries = Object.entries(data).filter(
    ([key, buttons]) =>
      Array.isArray(buttons) && buttons.length > 0 && orderSet.has(key)
  );
  const pages = entries.map(([key, buttons]) => ({
    id: key,
    key,
    label: menuNameToLabel.value[key] || pageKeyToLabelZh[key] || key,
    buttons: buttons.map(btnKey => ({ key: btnKey, label: getButtonLabelForPage(key, btnKey) }))
  }));
  // 按左侧菜单顺序排序
  const indexOf = (name: string) => {
    const i = orderNames.indexOf(name);
    return i === -1 ? orderNames.length : i;
  };
  pages.sort((a, b) => indexOf(a.key) - indexOf(b.key));
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
    gap: 8px;
    font-weight: 600;
    font-size: 14px;
    color: #303133;
    .menu-sync-hint {
      font-weight: 400;
      font-size: 12px;
      color: #909399;
    }
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
        padding-left: 24px;
        :deep(.el-checkbox-group) {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 20px;
        }
        :deep(.el-checkbox) {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
