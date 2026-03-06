<template>
  <div class="table-box role-manage">
    <ProTable ref="proTable" :columns="columns" :request-api="getTableList" :data-callback="dataCallback" row-key="roleId">
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button type="primary" :icon="Plus" @click="handleAdd">{{ $t("system.add") }}</el-button>
        <el-button
          type="success"
          plain
          :icon="Edit"
          :disabled="!scope.isSelected || scope.selectedListIds.length !== 1"
          @click="handleUpdate()"
        >
          {{ $t("system.modify") }}
        </el-button>
        <el-button type="danger" plain :icon="Delete" :disabled="!scope.isSelected" @click="handleDelete()">
          {{ $t("system.delete") }}
        </el-button>
        <el-button type="warning" plain :icon="Download" @click="handleExport">{{ $t("system.export") }}</el-button>
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <template v-if="scope.row.roleId !== 1">
          <div class="operation-center">
            <el-button type="primary" link :icon="Edit" @click="handleUpdate(scope.row)">{{ $t("system.modify") }}</el-button>
            <el-button type="primary" link :icon="Delete" @click="handleDelete(scope.row)">{{ $t("system.delete") }}</el-button>
            <el-dropdown @command="command => handleCommand(command, scope.row)">
              <el-button type="primary" link :icon="More">更多</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="handleConfigPermission" :icon="Setting">
                    {{ $t("system.roleManagement.functionalPermission") }}
                  </el-dropdown-item>
                  <el-dropdown-item command="handleAuthUser" :icon="User">{{ $t("system.assignUser") }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </template>
    </ProTable>

    <!-- 添加或修改角色配置对话框 - Tab结构 -->
    <el-dialog :title="title" v-model="open" width="1200px" append-to-body top="3vh" class="role-config-dialog">
      <el-tabs v-model="activeTab" class="role-tabs">
        <!-- Tab 1: 基础信息 -->
        <el-tab-pane :label="$t('system.roleManagement.basicInfo')" name="basic">
          <BasicInfo
            ref="basicInfoRef"
            :form="form"
            :rules="rules"
            :role-level-options="roleLevelOptions"
            :status-options="statusOptions"
          />
        </el-tab-pane>

        <!-- Tab 2: 功能权限 -->
        <el-tab-pane :label="$t('system.roleManagement.functionalPermission')" name="functional">
          <FunctionalPermission
            ref="functionalPermissionRef"
            :menu-options="menuOptions"
            :functional-permissions="form.functionalPermissions"
            :menu-check-strictly="form.menuCheckStrictly"
            @update:functional-permissions="form.functionalPermissions = $event"
            @update:menu-check-strictly="form.menuCheckStrictly = $event"
            @update:menu-ids="form.menuIds = $event"
          />
        </el-tab-pane>

        <!-- Tab 3: 字段脱敏 -->
        <el-tab-pane :label="$t('system.roleManagement.fieldMaskingTab')" name="fieldMasking">
          <FieldMasking
            ref="fieldMaskingRef"
            :business-objects="businessObjects"
            :field-masking="form.fieldMasking"
            @update:field-masking="form.fieldMasking = $event"
          />
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">{{ $t("system.roleManagement.cancel") }}</el-button>
          <el-button type="primary" @click="submitForm">{{ $t("system.roleManagement.save") }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分配客户组件 (新增) -->
    <el-dialog title="分配客户" v-model="openAuthUser" width="800px" append-to-body>
      <ProTable ref="userTableRef" :columns="authUserColumns" :request-api="getAuthUserList" row-key="id" :pagination="true">
        <template #tableHeader="scope">
          <el-button type="primary" :icon="Plus" @click="handleAddAuthUser">添加客户</el-button>
          <el-button type="danger" plain :icon="Delete" :disabled="!scope.isSelected" @click="handleDeleteAuthUser"
            >批量取消授权</el-button
          >
        </template>
        <template #operation="scope">
          <el-button type="danger" link :icon="Delete" @click="handleCancelAuthUser(scope.row)">取消授权</el-button>
        </template>
      </ProTable>
    </el-dialog>
  </div>
</template>

<script setup lang="tsx" name="roleManage">
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Edit, Delete, Download, More, Setting, User } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import roleManagementMockData from "@/assets/json/roleManagementMockData.json";
import authMenuList from "@/assets/json/authMenuList.json";
import BasicInfo from "./components/BasicInfo.vue";
import FunctionalPermission from "./components/FunctionalPermission.vue";
import FieldMasking from "./components/FieldMasking.vue";

const { t } = useI18n();

// Mock数据
const mockRoleList = roleManagementMockData.roleList.data.list;
const businessObjects = ref(roleManagementMockData.businessObjects);

// 角色等级选项
const roleLevelOptions = {
  admin: "admin",
  manager: "manager",
  employee: "employee",
  dataSpecialist: "dataSpecialist"
};

// 转换菜单数据为树结构
let globalMenuId = 1;
const transformMenuToTree = (list: any[], parentId = 0): any[] => {
  return list.map(item => {
    const currentId = globalMenuId++;
    return {
      id: currentId,
      label: item.meta?.title || item.name,
      path: item.path,
      name: item.name,
      children: item.children && item.children.length > 0 ? transformMenuToTree(item.children, currentId) : []
    };
  });
};

const statusOptions = [
  { label: "正常", value: "0" },
  { label: "停用", value: "1" }
];

const dataScopeOptions = [
  { value: "1", label: "全部数据权限" },
  { value: "2", label: "自定数据权限" },
  { value: "3", label: "本部门数据权限" },
  { value: "4", label: "本部门及以下数据权限" },
  { value: "5", label: "仅本人数据权限" }
];

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 响应式数据
const title = ref("");
const open = ref(false);
const activeTab = ref("basic");
const basicInfoRef = ref();
const functionalPermissionRef = ref();
const fieldMaskingRef = ref();

const form = reactive({
  roleId: undefined,
  roleName: undefined,
  roleKey: undefined,
  roleSort: 0,
  status: "0",
  roleLevel: "employee",
  roleDescription: undefined,
  menuIds: [],
  deptIds: [],
  menuCheckStrictly: true,
  deptCheckStrictly: true,
  dataScope: "1",
  remark: undefined,
  // 功能权限
  functionalPermissions: {
    menuIds: [],
    pageAccess: {
      customerList: false,
      leadManagement: false,
      dataQuality: false
    },
    operationButtons: {
      customerList: [],
      leadManagement: [],
      dataQuality: []
    }
  },
  // 数据范围配置
  dataScopeConfig: {
    scopeType: "1",
    customDeptIds: []
  },
  // 字段脱敏配置
  fieldMasking: {}
});

const menuOptions = ref<any[]>([]);

const rules = {
  roleName: [{ required: true, message: "角色名称不能为空", trigger: "blur" }],
  roleKey: [{ required: true, message: "权限字符不能为空", trigger: "blur" }],
  roleSort: [{ required: true, message: "角色顺序不能为空", trigger: "blur" }]
};

// dataCallback 是对于返回的表格数据做处理
const dataCallback = (data: any) => {
  return {
    list: data.list || data,
    total: data.total || data.length
  };
};

// 请求表格数据
const getTableList = (params: any) => {
  // 模拟API请求
  return new Promise(resolve => {
    setTimeout(() => {
      let filteredList = [...mockRoleList];

      // 根据查询条件过滤
      if (params.roleName) {
        filteredList = filteredList.filter(item => item.roleName.includes(params.roleName));
      }
      if (params.roleKey) {
        filteredList = filteredList.filter(item => item.roleKey.includes(params.roleKey));
      }
      if (params.status !== undefined && params.status !== null && params.status !== "") {
        filteredList = filteredList.filter(item => item.status === params.status);
      }

      // 分页处理
      const pageNum = params.pageNum || 1;
      const pageSize = params.pageSize || 10;
      const start = (pageNum - 1) * pageSize;
      const end = start + pageSize;
      const pageData = filteredList.slice(start, end);

      resolve({
        data: {
          list: pageData,
          total: filteredList.length
        }
      });
    }, 300);
  });
};

// 表格配置项
const columns = reactive<ColumnProps[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "#", width: 80 },
  {
    prop: "roleId",
    label: t("system.roleId"),
    width: 120
  },
  {
    prop: "roleName",
    label: t("system.roleName"),
    width: 150,
    search: { el: "input", props: { placeholder: t("system.enterRoleName") } }
  },
  {
    prop: "roleKey",
    label: t("system.permissionChar"),
    width: 150,
    search: { el: "input", props: { placeholder: t("system.enterPermissionChar") } }
  },
  {
    prop: "roleSort",
    label: t("system.displayOrder"),
    width: 100
  },
  {
    prop: "status",
    label: t("system.status"),
    width: 100,
    enum: statusOptions,
    search: { el: "select", props: { placeholder: t("system.status"), clearable: true } },
    fieldNames: { label: "label", value: "value" },
    render: scope => {
      return (
        <el-switch
          model-value={scope.row.status}
          active-value="0"
          inactive-value="1"
          onClick={() => handleStatusChange(scope.row)}
        />
      );
    }
  },
  {
    prop: "createTime",
    label: t("system.createTime"),
    minWidth: 180,
    search: {
      el: "date-picker",
      span: 2,
      props: {
        type: "daterange",
        valueFormat: "YYYY-MM-DD",
        rangeSeparator: "-",
        startPlaceholder: t("system.startDate"),
        endPlaceholder: t("system.endDate")
      }
    }
  },
  { prop: "operation", label: t("common.operation"), fixed: "right", minWidth: 200 }
]);

// 查询菜单树结构（从真实菜单数据加载）
const getMenuTreeselect = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      globalMenuId = 1;
      const menuTree = transformMenuToTree(JSON.parse(JSON.stringify(authMenuList.data)));
      menuOptions.value = menuTree;
      resolve(menuTree);
    }, 50);
  });
};

// 根据角色ID查询菜单下拉树结构
const getRoleMenuTreeselect = async (roleId: number) => {
  // 模拟根据角色ID获取权限
  return new Promise(resolve => {
    setTimeout(() => {
      // 模拟部分选中
      let checkedKeys: number[] = [];
      if (roleId === 1) {
        // 管理员全选
        checkedKeys = [11, 12, 13, 14, 21, 22, 23, 24, 31, 32];
      } else {
        // 其他角色选一部分
        checkedKeys = [11, 12, 21];
      }
      resolve({ checkedKeys, menus: mockMenuTree });
    }, 50);
  });
};

// 删除按钮操作
const handleDelete = (row?: any) => {
  const roleIds = row ? [row.roleId] : proTable.value?.selectedListIds || [];
  if (roleIds.length === 0) {
    ElMessage.warning("请选择要删除的角色");
    return;
  }
  const roleNames = row ? [row.roleName] : (proTable.value?.selectedList || []).map((r: any) => r.roleName);
  ElMessageBox.confirm(`确认要删除角色"${roleNames.join("、")}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      ElMessage.success("删除成功");
      proTable.value?.getTableList();
    })
    .catch(() => {
      // 客户取消删除
    });
};

// 导出按钮操作
const handleExport = () => {
  ElMessage.info("导出功能开发中");
};

// 角色状态修改
const handleStatusChange = (row: any) => {
  const text = row.status === "0" ? "启用" : "停用";
  ElMessageBox.confirm(`确认要"${text}""${row.roleName}"角色吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      ElMessage.success(text + "成功");
      proTable.value?.getTableList();
    })
    .catch(() => {
      row.status = row.status === "0" ? "1" : "0";
    });
};

// 取消按钮
const cancel = () => {
  open.value = false;
  reset();
};

// 表单重置
const reset = () => {
  activeTab.value = "basic";
  Object.assign(form, {
    roleId: undefined,
    roleName: undefined,
    roleKey: undefined,
    roleSort: 0,
    status: "0",
    roleLevel: "employee",
    roleDescription: undefined,
    menuIds: [],
    deptIds: [],
    menuCheckStrictly: true,
    deptCheckStrictly: true,
    dataScope: "1",
    remark: undefined,
    functionalPermissions: {
      menuIds: [],
      pageAccess: {
        customerList: false,
        leadManagement: false,
        dataQuality: false
      },
      operationButtons: {
        customerList: [],
        leadManagement: [],
        dataQuality: []
      }
    },
    dataScopeConfig: {
      scopeType: "1",
      customDeptIds: []
    },
    fieldMasking: {}
  });
  if (basicInfoRef.value) basicInfoRef.value.resetFields();
  nextTick(() => {
    if (functionalPermissionRef.value) {
      functionalPermissionRef.value.setCheckedKeys([]);
    }
    if (fieldMaskingRef.value) {
      fieldMaskingRef.value.initFieldMasking();
    }
  });
};

// 更多操作触发
const handleCommand = (command, row) => {
  switch (command) {
    case "handleConfigPermission":
      handleUpdate(row);
      break;
    case "handleAuthUser":
      handleAuthUser(row);
      break;
    default:
      break;
  }
};

// 新增按钮操作
const handleAdd = async () => {
  reset();
  await getMenuTreeselect();
  open.value = true;
  title.value = t("system.addRole");
  nextTick(() => {
    if (fieldMaskingRef.value) {
      fieldMaskingRef.value.initFieldMasking();
    }
  });
};

// 修改按钮操作
const handleUpdate = async (row?: any) => {
  reset();
  const roleId = row?.roleId || (proTable.value?.selectedListIds && proTable.value.selectedListIds[0]);
  if (!roleId) {
    ElMessage.warning("请选择要修改的角色");
    return;
  }
  const role = mockRoleList.find(item => item.roleId === roleId);
  if (role) {
    // 合并角色数据，包括新的权限配置
    Object.assign(form, {
      ...role,
      functionalPermissions: role.functionalPermissions || form.functionalPermissions,
      dataScopeConfig: role.dataScopeConfig || form.dataScopeConfig,
      fieldMasking: role.fieldMasking || form.fieldMasking
    });
  }

  open.value = true;
  title.value = t("system.modifyRole");

  // 并行获取树数据和角色权限
  await getMenuTreeselect();
  const roleMenu = await getRoleMenuTreeselect(roleId);

  // 设置已选中的菜单和部门
  nextTick(() => {
    if (functionalPermissionRef.value) {
      functionalPermissionRef.value.setCheckedKeys(roleMenu.checkedKeys || []);
    }
    // 初始化字段脱敏配置
    if (fieldMaskingRef.value && (!form.fieldMasking || Object.keys(form.fieldMasking).length === 0)) {
      fieldMaskingRef.value.initFieldMasking();
    }
  });
};

// ------------------ 分配客户相关逻辑 ------------------
const openAuthUser = ref(false);
const userTableRef = ref();

const authUserColumns: ColumnProps[] = [
  { type: "selection", fixed: "left", width: 50 },
  { prop: "username", label: "客户名称" },
  { prop: "nickName", label: "客户昵称" },
  { prop: "email", label: "邮箱" },
  { prop: "phonenumber", label: "手机" },
  { prop: "createTime", label: "创建时间" },
  { prop: "operation", label: "操作", fixed: "right", width: 150 }
];

// 获取已分配该角色的客户列表 (Mock)
const getAuthUserList = (params: any) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        data: {
          list: [
            {
              id: 1,
              username: "admin",
              nickName: "管理员",
              email: "admin@example.com",
              phonenumber: "15888888888",
              createTime: "2023-01-01"
            },
            {
              id: 2,
              username: "test",
              nickName: "测试员",
              email: "test@example.com",
              phonenumber: "15666666666",
              createTime: "2023-01-02"
            }
          ],
          total: 2
        }
      });
    }, 300);
  });
};

// 分配客户操作
const handleAuthUser = row => {
  openAuthUser.value = true;
};

const handleAddAuthUser = () => {
  ElMessage.info("打开选择客户弹窗");
};

const handleDeleteAuthUser = () => {
  ElMessage.success("批量取消授权成功");
};

const handleCancelAuthUser = row => {
  ElMessage.success("取消授权成功");
};

// 提交表单
const submitForm = () => {
  if (basicInfoRef.value) {
    basicInfoRef.value.validate((valid: boolean) => {
      if (valid) {
        // 收集菜单权限
        if (functionalPermissionRef.value) {
          form.menuIds = functionalPermissionRef.value.getCheckedKeys();
          form.functionalPermissions.menuIds = form.menuIds;
        }

        if (form.roleId != undefined) {
          ElMessage.success("修改成功");
        } else {
          ElMessage.success("新增成功");
        }
        open.value = false;
        proTable.value?.getTableList();
      }
    });
  }
};

// 初始化
onMounted(() => {
  getMenuTreeselect();
});
</script>

<style scoped lang="scss">
.content-box {
  padding: 20px;
}

.tree-border {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}

.form-section-title {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  padding-left: 10px;
  border-left: 4px solid #409eff;
  line-height: 1;
}

.label-with-tooltip {
  display: flex;
  align-items: center;
  .label-icon {
    margin-left: 4px;
    cursor: help;
  }
}

.permission-wrapper {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.tree-actions {
  margin-bottom: 10px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  .el-checkbox {
    margin-right: 0;
  }
}

.tree-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  padding: 6px;
  height: 350px;
  overflow-y: auto;
}

// Tab对话框样式
.role-config-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.role-tabs {
  :deep(.el-tab-pane) {
    padding: 20px 0;
  }
}

.role-form {
  padding: 0;
}

// 功能权限卡片
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

// 数据范围卡片
.data-scope-card {
  :deep(.el-card__body) {
    padding: 24px;
  }
  .scope-radio {
    width: 100%;
    margin-bottom: 16px;
    padding: 16px;
    :deep(.el-radio__label) {
      width: 100%;
      padding-left: 8px;
    }
    .scope-option {
      .scope-title {
        font-weight: 600;
        font-size: 14px;
        color: #303133;
        margin-bottom: 4px;
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
  }
}

// 字段脱敏卡片
.field-masking-card {
  :deep(.el-card__body) {
    padding: 24px;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .header-actions {
      display: flex;
      align-items: center;
    }
  }
  .business-object-list {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
    .business-object-item {
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid #ebeef5;
      font-size: 14px;
      color: #606266;
      transition: all 0.3s;
      &:hover {
        background-color: #f5f7fa;
      }
      &:last-child {
        border-bottom: none;
      }
      &.active {
        background-color: #ecf5ff;
        color: #409eff;
        font-weight: 600;
      }
    }
  }
  .field-config-table {
    .switch-label {
      margin-left: 8px;
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>
