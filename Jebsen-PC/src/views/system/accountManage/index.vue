<template>
  <div class="main-box">
    <!-- 部门树筛选 -->
    <TreeFilter
      label="label"
      title="部门列表"
      :data="deptOptions"
      :default-value="initParam?.deptId"
      @change="changeTreeFilter"
    />
    <!-- 客户表格 -->
    <div class="table-box">
      <ProTable
        ref="proTable"
        :columns="columns"
        :request-api="getTableList"
        :init-param="initParam"
        :data-callback="dataCallback"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
          <el-button
            type="success"
            plain
            :icon="Edit"
            :disabled="!scope.isSelected || scope.selectedListIds.length !== 1"
            @click="handleUpdate()"
          >
            修改
          </el-button>
          <el-button type="danger" plain :icon="Delete" :disabled="!scope.isSelected" @click="handleDelete()">删除</el-button>
          <el-button type="info" plain :icon="Upload" @click="handleImport">导入</el-button>
          <el-button type="warning" plain :icon="Download" @click="handleExport">导出</el-button>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <template v-if="scope.row.userId !== 1">
            <!-- 需要居中对齐 -->
            <div class="operation-center">
              <el-button type="primary" link :icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button type="primary" link :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
              <el-dropdown @command="command => handleCommand(command, scope.row)">
                <el-button type="primary" link :icon="More">更多</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="handleResetPwd" :icon="Key">重置密码</el-dropdown-item>
                    <el-dropdown-item command="handleAuthRole" :icon="User">分配角色</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </template>
      </ProTable>
    </div>

    <!-- 添加或修改客户配置对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="客户昵称" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入客户昵称" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属部门" prop="deptId">
              <el-tree-select
                v-model="form.deptId"
                :data="enabledDeptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                placeholder="请选择归属部门"
                check-strictly
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="客户名称" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入客户名称" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="客户密码" prop="password">
              <el-input v-model="form.password" placeholder="请输入客户密码" type="password" maxlength="20" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="客户性别">
              <el-select v-model="form.sex" placeholder="请选择性别" style="width: 100%">
                <el-option v-for="dict in sexOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in statusOptions" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="岗位">
              <el-select v-model="form.postIds" multiple placeholder="请选择岗位" style="width: 100%">
                <el-option
                  v-for="item in postOptions"
                  :key="item.postId"
                  :label="item.postName"
                  :value="item.postId"
                  :disabled="item.status === '1'"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select v-model="form.roleIds" multiple placeholder="请选择角色" style="width: 100%">
                <el-option
                  v-for="item in roleOptions"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId"
                  :disabled="item.status === '1'"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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

    <!-- 客户导入对话框 -->
    <el-dialog title="客户导入" v-model="upload.open" width="400px" append-to-body>
      <el-upload ref="uploadRef" :limit="1" accept=".xlsx, .xls" :auto-upload="false" drag>
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的客户数据
            <br />
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size: 12px" @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="tsx" name="accountManage">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { UploadFilled, Plus, Edit, Delete, Upload, Download, More, Key, User } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import TreeFilter from "@/components/TreeFilter/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";

// 假数据
const mockUserList = [
  {
    userId: 1,
    userName: "admin",
    nickName: "管理员",
    deptName: "总公司",
    phonenumber: "15888888888",
    email: "admin@163.com",
    sex: "1",
    status: "0",
    createTime: "2023-01-01 12:00:00",
    postIds: [1],
    roleIds: [1]
  },
  {
    userId: 2,
    userName: "test",
    nickName: "测试客户",
    deptName: "研发部门",
    phonenumber: "15999999999",
    email: "test@163.com",
    sex: "0",
    status: "0",
    createTime: "2023-01-02 12:00:00",
    postIds: [2],
    roleIds: [2]
  },
  {
    userId: 3,
    userName: "demo",
    nickName: "演示客户",
    deptName: "市场部门",
    phonenumber: "15777777777",
    email: "demo@163.com",
    sex: "1",
    status: "1",
    createTime: "2023-01-03 12:00:00",
    postIds: [3],
    roleIds: [3]
  }
];

const mockDeptTree = [
  {
    id: 100,
    label: "总公司",
    children: [
      {
        id: 101,
        label: "研发部门",
        children: [
          { id: 103, label: "研发一部" },
          { id: 104, label: "研发二部" }
        ]
      },
      {
        id: 102,
        label: "市场部门",
        children: [
          { id: 105, label: "市场一部" },
          { id: 106, label: "市场二部" }
        ]
      }
    ]
  }
];

const statusOptions = [
  { label: "正常", value: "0" },
  { label: "停用", value: "1" }
];

const sexOptions = [
  { label: "男", value: "0" },
  { label: "女", value: "1" },
  { label: "未知", value: "2" }
];

const postOptions = [
  { postId: 1, postName: "董事长", status: "0" },
  { postId: 2, postName: "总经理", status: "0" },
  { postId: 3, postName: "部门经理", status: "0" },
  { postId: 4, postName: "普通员工", status: "0" }
];

const roleOptions = [
  { roleId: 1, roleName: "超级管理员", status: "0" },
  { roleId: 2, roleName: "普通角色", status: "0" },
  { roleId: 3, roleName: "测试角色", status: "0" }
];

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 初始化请求参数
const initParam = reactive<{ deptId?: string | number }>({
  deptId: ""
});

// 响应式数据
const title = ref("");
const open = ref(false);
const formRef = ref();
const uploadRef = ref();

const form = reactive({
  userId: undefined,
  deptId: undefined,
  userName: undefined,
  nickName: undefined,
  password: undefined,
  phonenumber: undefined,
  email: undefined,
  sex: undefined,
  status: "0",
  remark: undefined,
  postIds: [],
  roleIds: []
});

const upload = reactive({
  open: false,
  updateSupport: false
});

const deptOptions = ref(mockDeptTree);
const enabledDeptOptions = ref(mockDeptTree);

// dataCallback 是对于返回的表格数据做处理
const dataCallback = (data: any) => {
  return {
    list: data.list || data,
    total: data.total || data.length
  };
};

// 树形筛选切换
const changeTreeFilter = (val: string) => {
  initParam.deptId = val ?? "";
  if (!proTable.value) return;
  proTable.value.pageable.pageNum = 1;
  proTable.value.getTableList();
};

// 表格配置项
const columns = reactive<ColumnProps[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "#", width: 80 },
  {
    prop: "userId",
    label: "客户编号",
    width: 120
  },
  {
    prop: "userName",
    label: "客户名称",
    width: 150,
    search: { el: "input", props: { placeholder: "请输入客户名称" } }
  },
  {
    prop: "nickName",
    label: "客户昵称",
    width: 150
  },
  {
    prop: "deptName",
    label: "部门",
    width: 150
  },
  {
    prop: "phonenumber",
    label: "手机号码",
    width: 120,
    search: { el: "input", props: { placeholder: "请输入手机号码" } }
  },
  {
    prop: "status",
    label: "状态",
    width: 100,
    enum: statusOptions,
    search: { el: "select", props: { placeholder: "客户状态", clearable: true } },
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
    label: "创建时间",
    minWidth: 160,
    search: {
      el: "date-picker",
      span: 2,
      props: {
        type: "daterange",
        valueFormat: "YYYY-MM-DD",
        rangeSeparator: "-",
        startPlaceholder: "开始日期",
        endPlaceholder: "结束日期"
      }
    }
  },
  { prop: "operation", label: "操作", fixed: "right", minWidth: 200 }
]);

// 请求表格数据
const getTableList = (params: any) => {
  // 模拟API请求
  return new Promise(resolve => {
    setTimeout(() => {
      let filteredList = [...mockUserList];

      // 根据查询条件过滤
      if (params.userName) {
        filteredList = filteredList.filter(item => item.userName.includes(params.userName));
      }
      if (params.phonenumber) {
        filteredList = filteredList.filter(item => item.phonenumber.includes(params.phonenumber));
      }
      if (params.status !== undefined && params.status !== null && params.status !== "") {
        filteredList = filteredList.filter(item => item.status === params.status);
      }
      if (params.deptId) {
        // 这里简化处理，实际应该根据部门ID过滤
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

const rules = {
  userName: [
    { required: true, message: "客户名称不能为空", trigger: "blur" },
    { min: 2, max: 20, message: "客户名称长度必须介于 2 和 20 之间", trigger: "blur" }
  ],
  nickName: [{ required: true, message: "客户昵称不能为空", trigger: "blur" }],
  password: [
    { required: true, message: "客户密码不能为空", trigger: "blur" },
    { min: 5, max: 20, message: "客户密码长度必须介于 5 和 20 之间", trigger: "blur" }
  ],
  email: [{ type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
  phonenumber: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }]
};

// 查询部门下拉树结构
const getDeptTree = () => {
  // 使用假数据
  deptOptions.value = mockDeptTree;
  enabledDeptOptions.value = mockDeptTree;
};

// 客户状态修改
const handleStatusChange = (row: any) => {
  const text = row.status === "0" ? "启用" : "停用";
  ElMessageBox.confirm(`确认要"${text}""${row.userName}"客户吗？`, "提示", {
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
  Object.assign(form, {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: undefined,
    status: "0",
    remark: undefined,
    postIds: [],
    roleIds: []
  });
  if (formRef.value) formRef.value.resetFields();
};

// 更多操作触发
const handleCommand = (command, row) => {
  switch (command) {
    case "handleResetPwd":
      handleResetPwd(row);
      break;
    case "handleAuthRole":
      handleAuthRole(row);
      break;
    default:
      break;
  }
};

// 新增按钮操作
const handleAdd = () => {
  reset();
  getDeptTree();
  open.value = true;
  title.value = "添加客户";
  form.password = "123456"; // 默认密码
};

// 修改按钮操作
const handleUpdate = (row?: any) => {
  reset();
  getDeptTree();
  const userId = row?.userId || (proTable.value?.selectedListIds && proTable.value.selectedListIds[0]);
  if (!userId) {
    ElMessage.warning("请选择要修改的客户");
    return;
  }
  const user = mockUserList.find(item => item.userId === userId);
  if (user) {
    Object.assign(form, { ...user, password: "" });
  }
  open.value = true;
  title.value = "修改客户";
};

// 重置密码按钮操作
const handleResetPwd = row => {
  ElMessageBox.prompt(`请输入"${row.userName}"的新密码`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: "客户密码长度必须介于 5 和 20 之间"
  })
    .then(({ value }) => {
      ElMessage.success("修改成功，新密码是：" + value);
    })
    .catch(() => {
      // 客户取消操作
    });
};

// 分配角色操作
const handleAuthRole = () => {
  ElMessage.info("分配角色功能待实现");
};

// 提交按钮
const submitForm = () => {
  if (formRef.value) {
    formRef.value.validate((valid: boolean) => {
      if (valid) {
        if (form.userId != undefined) {
          ElMessage.success("修改成功");
          open.value = false;
          proTable.value?.getTableList();
        } else {
          ElMessage.success("新增成功");
          open.value = false;
          proTable.value?.getTableList();
        }
      }
    });
  }
};

// 删除按钮操作
const handleDelete = (row?: any) => {
  const userIds = row?.userId || proTable.value?.selectedListIds;
  if (!userIds || (Array.isArray(userIds) && userIds.length === 0)) {
    ElMessage.warning("请选择要删除的客户");
    return;
  }
  ElMessageBox.confirm(`是否确认删除客户编号为"${Array.isArray(userIds) ? userIds.join(",") : userIds}"的数据项？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      ElMessage.success("删除成功");
      proTable.value?.getTableList();
      proTable.value?.clearSelection();
    })
    .catch(() => {
      // 客户取消删除
    });
};

// 导出按钮操作
const handleExport = () => {
  ElMessage.info("导出功能待实现");
};

// 导入按钮操作
const handleImport = () => {
  upload.open = true;
};

// 下载模板操作
const importTemplate = () => {
  ElMessage.info("下载模板功能待实现");
};

// 提交上传文件
const submitFileForm = () => {
  const file = uploadRef.value && uploadRef.value.uploadFiles;
  if (!file || file.length === 0) {
    ElMessage.error("请选择文件");
    return;
  }
  ElMessage.success("导入成功");
  upload.open = false;
  proTable.value?.getTableList();
};

// 初始化
onMounted(() => {
  getDeptTree();
});
</script>

<style scoped lang="scss">
// 使用全局样式 main-box，已在 element.scss 中定义
</style>
