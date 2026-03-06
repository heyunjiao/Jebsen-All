<template>
  <div class="table-box menu-manage">
    <ProTable
      ref="proTable"
      :key="refreshKey"
      :columns="columns"
      :data="menuList"
      :pagination="false"
      row-key="menuId"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      :default-expand-all="isExpandAll"
      :request-auto="false"
      @search="handleSearch"
      @reset="handleReset"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader>
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
        <el-button type="info" plain :icon="isExpandAll ? Fold : Expand" @click="toggleExpandAll">
          {{ isExpandAll ? "折叠" : "展开" }}
        </el-button>
      </template>
      <!-- 图标列 -->
      <template #icon="scope">
        <el-icon v-if="scope.row.icon">
          <component :is="scope.row.icon" />
        </el-icon>
        <span v-else>--</span>
      </template>
      <!-- 状态列 -->
      <template #status="scope">
        <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">
          {{ scope.row.status === "0" ? "正常" : "停用" }}
        </el-tag>
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-button type="primary" link :icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
        <el-button type="primary" link :icon="Plus" @click="handleAdd(scope.row)">新增</el-button>
        <el-button type="primary" link :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
      </template>
    </ProTable>

    <!-- 添加或修改菜单对话框 -->
    <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="title" v-model="open" width="750px" append-to-body class="menu-dialog">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" label-suffix=" :">
        <el-row :gutter="25">
          <el-col :span="24">
            <el-form-item label="上级菜单" prop="parentId">
              <el-tree-select
                v-model="form.parentId"
                :data="menuOptions"
                :props="{ value: 'menuId', label: 'menuName', children: 'children' }"
                placeholder="选择上级菜单"
                check-strictly
                node-key="menuId"
                filterable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio-button label="目录" value="M" />
                <el-radio-button label="菜单" value="C" />
                <el-radio-button label="按钮" value="F" />
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item label="菜单图标" prop="icon">
              <el-input v-model="form.icon" placeholder="请输入图标名称 (Element Plus Icon)">
                <template #prefix>
                  <el-icon v-if="form.icon" class="el-input__icon"><component :is="form.icon" /></el-icon>
                  <el-icon v-else class="el-input__icon"><Search /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model="form.menuName" placeholder="请输入菜单名称" clearable />
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="routeName">
              <template #label>
                <div class="flex-center">
                  <span>路由名称</span>
                  <el-tooltip content="默认不填则和路由地址相同" placement="top">
                    <el-icon class="ml-1"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-input v-model="form.routeName" placeholder="请输入路由名称" clearable />
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item prop="isFrame">
              <template #label>
                <div class="flex-center">
                  <span>是否外链</span>
                  <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                    <el-icon class="ml-1"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-radio-group v-model="form.isFrame">
                <el-radio-button label="是" value="0" />
                <el-radio-button label="否" value="1" />
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item prop="path">
              <template #label>
                <div class="flex-center">
                  <span>路由地址</span>
                  <el-tooltip content="访问的路由地址，如：`user`" placement="top">
                    <el-icon class="ml-1"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-input v-model="form.path" placeholder="请输入路由地址" clearable />
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="component">
              <template #label>
                <div class="flex-center">
                  <span>组件路径</span>
                  <el-tooltip content="访问的组件路径，如：`system/user/index`" placement="top">
                    <el-icon class="ml-1"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-input v-model="form.component" placeholder="请输入组件路径" clearable />
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="form.menuType != 'M'">
            <el-form-item prop="perms">
              <template #label>
                <div class="flex-center">
                  <span>权限字符</span>
                  <el-tooltip content="控制器中定义的权限字符" placement="top">
                    <el-icon class="ml-1"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-input v-model="form.perms" placeholder="请输入权限标识" maxlength="100" clearable />
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="query">
              <template #label>
                <div class="flex-center">
                  <span>路由参数</span>
                  <el-tooltip content='访问路由的默认传递参数，如：`{"id": 1}`' placement="top">
                    <el-icon class="ml-1"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-input v-model="form.query" placeholder="请输入路由参数" maxlength="255" clearable />
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="isCache">
              <template #label>
                <div class="flex-center">
                  <span>是否缓存</span>
                  <el-tooltip content="选择是则会被`keep-alive`缓存" placement="top">
                    <el-icon class="ml-1"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-radio-group v-model="form.isCache">
                <el-radio-button label="缓存" value="0" />
                <el-radio-button label="不缓存" value="1" />
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item prop="status">
              <template #label>
                <div class="flex-center">
                  <span>菜单状态</span>
                  <el-tooltip content="选择停用则路由将不会出现在侧边栏" placement="top">
                    <el-icon class="ml-1"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
              <el-radio-group v-model="form.status">
                <el-radio-button v-for="dict in statusOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="tsx" name="menuMange">
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { QuestionFilled, Plus, Edit, Delete, Fold, Expand, Search } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";

import authMenuList from "@/assets/json/authMenuList.json";

// 递归转换菜单数据
let globalId = 1;
const transformMenuData = (list: any[], parentId = 0) => {
  return list.map((item, index) => {
    const currentId = globalId++;
    const menuType = item.children && item.children.length > 0 ? "M" : "C";
    return {
      menuId: currentId,
      menuName: item.meta?.title || item.name,
      parentId: parentId,
      orderNum: index + 1,
      path: item.path,
      component: item.component || "Layout",
      isFrame: item.meta?.isLink ? "0" : "1",
      isCache: item.meta?.isKeepAlive ? "0" : "1",
      menuType: menuType,
      status: "0",
      perms: item.name ? `${item.name}:list` : "",
      icon: item.meta?.icon || "",
      createTime: "2023-01-01 12:00:00",
      children: item.children ? transformMenuData(item.children, currentId) : []
    };
  });
};

// 初始化本地 "DB" 数据
const rawMenuList = transformMenuData(JSON.parse(JSON.stringify(authMenuList.data)));

const statusOptions = [
  { label: "正常", value: "0" },
  { label: "停用", value: "1" }
];

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 响应式数据
const menuList = ref([]);
const title = ref("");
const open = ref(false);
const isExpandAll = ref(false);
const formRef = ref();
const refreshKey = ref(0);

const form = reactive({
  menuId: undefined,
  parentId: 0,
  menuName: undefined,
  icon: undefined,
  menuType: "M",
  orderNum: undefined,
  isFrame: "1",
  isCache: "0",
  status: "0",
  path: undefined,
  component: undefined,
  perms: undefined,
  query: undefined,
  routeName: undefined
});

const menuOptions = ref<any[]>([]);

const rules = {
  menuName: [{ required: true, message: "菜单名称不能为空", trigger: "blur" }],
  orderNum: [{ required: true, message: "菜单顺序不能为空", trigger: "blur" }],
  path: [{ required: true, message: "路由地址不能为空", trigger: "blur" }]
};

// 表格配置项
const columns = reactive<ColumnProps[]>([
  {
    prop: "menuName",
    label: "菜单名称",
    width: 160,
    search: { el: "input", props: { placeholder: "请输入菜单名称" } }
  },
  {
    prop: "icon",
    label: "图标",
    align: "center",
    width: 100
  },
  {
    prop: "orderNum",
    label: "排序",
    width: 60
  },
  {
    prop: "perms",
    label: "权限标识",
    minWidth: 150
  },
  {
    prop: "component",
    label: "组件路径",
    minWidth: 150
  },
  {
    prop: "status",
    label: "状态",
    width: 80,
    enum: statusOptions,
    search: { el: "select", props: { placeholder: "菜单状态", clearable: true } },
    fieldNames: { label: "label", value: "value" }
  },
  {
    prop: "createTime",
    label: "创建时间",
    width: 180,
    align: "center"
  },
  { prop: "operation", label: "操作", fixed: "right", minWidth: 200 }
]);

// 查询菜单列表
const getList = () => {
  setTimeout(() => {
    let filteredList = JSON.parse(JSON.stringify(rawMenuList));

    const searchParam = proTable.value?.searchParam || {};
    if (searchParam.menuName) {
      filteredList = filterMenuByName(filteredList, searchParam.menuName);
    }
    if (searchParam.status !== undefined && searchParam.status !== null && searchParam.status !== "") {
      filteredList = filterMenuByStatus(filteredList, searchParam.status);
    }
    menuList.value = filteredList;
  }, 300);
};

// 递归过滤菜单（按名称）
const filterMenuByName = (list, name) => {
  return list.filter(item => {
    const match = item.menuName.includes(name);
    if (item.children) {
      item.children = filterMenuByName(item.children, name);
      return match || item.children.length > 0;
    }
    return match;
  });
};

// 递归过滤菜单（按状态）
const filterMenuByStatus = (list, status) => {
  return list.filter(item => {
    const match = item.status === status;
    if (item.children) {
      item.children = filterMenuByStatus(item.children, status);
      return match || item.children.length > 0;
    }
    return match;
  });
};

// 查询菜单下拉树结构
const getTreeselect = () => {
  const menu = { menuId: 0, menuName: "主类目", children: [] };
  menu.children = JSON.parse(JSON.stringify(rawMenuList));
  menuOptions.value = [menu];
};

// 取消按钮
const cancel = () => {
  open.value = false;
  reset();
};

// 表单重置
const reset = () => {
  Object.assign(form, {
    menuId: undefined,
    parentId: 0,
    menuName: undefined,
    icon: undefined,
    menuType: "M",
    orderNum: undefined,
    isFrame: "1",
    isCache: "0",
    status: "0",
    path: undefined,
    component: undefined,
    perms: undefined,
    query: undefined,
    routeName: undefined
  });
  if (formRef.value) formRef.value.resetFields();
};

// 新增按钮操作
const handleAdd = row => {
  reset();
  getTreeselect();
  if (row != null && row.menuId) {
    form.parentId = row.menuId;
  } else {
    form.parentId = 0;
  }
  open.value = true;
  title.value = "添加菜单";
};

// 展开/折叠操作
const toggleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value;
  // 强制刷新表格以应用展开/折叠状态
  refreshKey.value++;
  nextTick(() => {
    getList();
  });
};

// 修改按钮操作
const handleUpdate = row => {
  reset();
  getTreeselect();
  const menu = findMenuById(rawMenuList, row.menuId);
  if (menu) {
    Object.assign(form, menu);
  }
  open.value = true;
  title.value = "修改菜单";
};

// 递归查找菜单
const findMenuById = (list, id) => {
  for (const item of list) {
    if (item.menuId === id) {
      return item;
    }
    if (item.children) {
      const found = findMenuById(item.children, id);
      if (found) return found;
    }
  }
  return null;
};

// 提交按钮
const submitForm = () => {
  if (formRef.value) {
    formRef.value.validate(valid => {
      if (valid) {
        if (form.menuId != undefined) {
          ElMessage.success("修改成功");
        } else {
          ElMessage.success("新增成功");
        }
        open.value = false;
        getList();
      }
    });
  }
};

// 监听搜索和重置事件
const handleSearch = () => {
  getList();
};

const handleReset = () => {
  getList();
};

// 删除按钮操作
const handleDelete = row => {
  ElMessageBox.confirm(`是否确认删除名称为"${row.menuName}"的数据项？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      ElMessage.success("删除成功");
      getList();
    })
    .catch(() => {
      // 客户取消删除
    });
};

// 初始化
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.content-box {
  padding: 20px;
}

.mb8 {
  margin-bottom: 8px;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
