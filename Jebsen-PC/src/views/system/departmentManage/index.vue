<template>
  <div class="table-box department-manage">
    <ProTable
      ref="proTable"
      :key="refreshKey"
      :columns="columns"
      :data="deptList"
      :pagination="false"
      row-key="deptId"
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
        <el-button v-if="scope.row.parentId != 0" type="primary" link :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
      </template>
    </ProTable>

    <!-- 添加或修改部门对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24" v-if="form.parentId !== 0">
            <el-form-item label="上级部门" prop="parentId">
              <el-tree-select
                v-model="form.parentId"
                :data="deptOptions"
                :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
                placeholder="选择上级部门"
                check-strictly
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="部门名称" prop="deptName">
              <el-input v-model="form.deptName" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input v-model="form.leader" placeholder="请输入负责人" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in statusOptions" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="tsx" name="departmentManage">
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Edit, Delete, Fold, Expand } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";

// 假数据
const mockDeptList = [
  {
    deptId: 100,
    parentId: 0,
    deptName: "总公司",
    orderNum: 0,
    leader: "若依",
    phone: "15888888888",
    email: "ry@qq.com",
    status: "0",
    createTime: "2023-01-01 12:00:00",
    children: [
      {
        deptId: 101,
        parentId: 100,
        deptName: "研发部门",
        orderNum: 1,
        leader: "若依",
        phone: "15888888888",
        email: "ry@qq.com",
        status: "0",
        createTime: "2023-01-01 12:00:00",
        children: [
          {
            deptId: 103,
            parentId: 101,
            deptName: "研发一部",
            orderNum: 1,
            leader: "若依",
            phone: "15888888888",
            email: "ry@qq.com",
            status: "0",
            createTime: "2023-01-01 12:00:00"
          },
          {
            deptId: 104,
            parentId: 101,
            deptName: "研发二部",
            orderNum: 2,
            leader: "若依",
            phone: "15888888888",
            email: "ry@qq.com",
            status: "0",
            createTime: "2023-01-01 12:00:00"
          }
        ]
      },
      {
        deptId: 102,
        parentId: 100,
        deptName: "市场部门",
        orderNum: 2,
        leader: "若依",
        phone: "15888888888",
        email: "ry@qq.com",
        status: "0",
        createTime: "2023-01-01 12:00:00",
        children: [
          {
            deptId: 105,
            parentId: 102,
            deptName: "市场一部",
            orderNum: 1,
            leader: "若依",
            phone: "15888888888",
            email: "ry@qq.com",
            status: "0",
            createTime: "2023-01-01 12:00:00"
          }
        ]
      }
    ]
  }
];

const statusOptions = [
  { label: "正常", value: "0" },
  { label: "停用", value: "1" }
];

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 响应式数据
const deptList = ref([]);
const title = ref("");
const open = ref(false);
const isExpandAll = ref(true);
const formRef = ref();
const refreshKey = ref(0);

const form = reactive({
  deptId: undefined,
  parentId: 0 as number | undefined,
  deptName: undefined,
  orderNum: undefined,
  leader: undefined,
  phone: undefined,
  email: undefined,
  status: "0"
});

const deptOptions = ref<any[]>([]);

const rules = {
  parentId: [
    {
      validator: (rule, value, callback) => {
        if (form.parentId !== 0 && (value === undefined || value === null || value === "")) {
          callback(new Error("上级部门不能为空"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  deptName: [{ required: true, message: "部门名称不能为空", trigger: "blur" }],
  orderNum: [{ required: true, message: "显示排序不能为空", trigger: "blur" }],
  email: [{ type: "email" as const, message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
  phone: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }]
};

// 表格配置项
const columns = reactive<ColumnProps[]>([
  {
    prop: "deptName",
    label: "部门名称",
    width: 260,
    search: { el: "input", props: { placeholder: "请输入部门名称" } }
  },
  {
    prop: "orderNum",
    label: "排序",
    width: 200
  },
  {
    prop: "status",
    label: "状态",
    width: 100,
    enum: statusOptions,
    search: { el: "select", props: { placeholder: "部门状态", clearable: true } },
    fieldNames: { label: "label", value: "value" }
  },
  {
    prop: "createTime",
    label: "创建时间",
    width: 200,
    align: "center"
  },
  { prop: "operation", label: "操作", fixed: "right", minWidth: 200 }
]);

// 查询部门列表
const getList = () => {
  setTimeout(() => {
    let filteredList = JSON.parse(JSON.stringify(mockDeptList));
    const searchParam = proTable.value?.searchParam || {};

    if (searchParam.deptName) {
      filteredList = filterDeptByName(filteredList, searchParam.deptName);
    }
    if (searchParam.status !== undefined && searchParam.status !== null && searchParam.status !== "") {
      filteredList = filterDeptByStatus(filteredList, searchParam.status);
    }

    deptList.value = filteredList;
  }, 300);
};

// 递归过滤部门（按名称）
const filterDeptByName = (list, name) => {
  return list.filter(item => {
    const match = item.deptName.includes(name);
    if (item.children) {
      item.children = filterDeptByName(item.children, name);
      return match || item.children.length > 0;
    }
    return match;
  });
};

// 递归过滤部门（按状态）
const filterDeptByStatus = (list, status) => {
  return list.filter(item => {
    const match = item.status === status;
    if (item.children) {
      item.children = filterDeptByStatus(item.children, status);
      return match || item.children.length > 0;
    }
    return match;
  });
};

// 取消按钮
const cancel = () => {
  open.value = false;
  reset();
};

// 表单重置
const reset = () => {
  Object.assign(form, {
    deptId: undefined,
    parentId: undefined,
    deptName: undefined,
    orderNum: undefined,
    leader: undefined,
    phone: undefined,
    email: undefined,
    status: "0"
  });
  if (formRef.value) formRef.value.resetFields();
};

// 监听搜索和重置事件
const handleSearch = () => {
  getList();
};

const handleReset = () => {
  getList();
};

// 新增按钮操作
const handleAdd = row => {
  reset();
  if (row != undefined && row.deptId) {
    form.parentId = row.deptId;
  } else {
    form.parentId = 0;
  }
  open.value = true;
  title.value = "添加部门";
  // 获取部门树
  deptOptions.value = JSON.parse(JSON.stringify(mockDeptList));
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
  const dept = findDeptById(mockDeptList, row.deptId);
  if (dept) {
    Object.assign(form, dept);
  }
  open.value = true;
  title.value = "修改部门";
  // 获取部门树（排除当前节点及其子节点）
  deptOptions.value = JSON.parse(JSON.stringify(mockDeptList));
};

// 递归查找部门
const findDeptById = (list, id) => {
  for (const item of list) {
    if (item.deptId === id) {
      return item;
    }
    if (item.children) {
      const found = findDeptById(item.children, id);
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
        if (form.deptId != undefined) {
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

// 删除按钮操作
const handleDelete = row => {
  ElMessageBox.confirm(`是否确认删除名称为"${row.deptName}"的数据项？`, "提示", {
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
</style>
