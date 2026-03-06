<template>
  <div class="table-box dict-data">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :data-callback="dataCallback"
      row-key="dictCode"
      @search="handleSearch"
      @reset="handleReset"
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
        <el-button type="warning" plain :icon="Download" @click="handleExport">导出</el-button>
        <el-button type="warning" plain :icon="Close" @click="handleClose">关闭</el-button>
      </template>
      <!-- 字典标签列 -->
      <template #dictLabel="scope">
        <span
          v-if="
            (scope.row.listClass == '' || scope.row.listClass == 'default') &&
            (scope.row.cssClass == '' || scope.row.cssClass == null)
          "
        >
          {{ scope.row.dictLabel }}
        </span>
        <el-tag v-else :type="scope.row.listClass == 'primary' ? '' : scope.row.listClass" :class="scope.row.cssClass">
          {{ scope.row.dictLabel }}
        </el-tag>
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
        <el-button type="primary" link :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
      </template>
    </ProTable>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典类型">
          <el-input v-model="form.dictType" :disabled="true" />
        </el-form-item>
        <el-form-item label="数据标签" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="请输入数据标签" />
        </el-form-item>
        <el-form-item label="数据键值" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="请输入数据键值" />
        </el-form-item>
        <el-form-item label="样式属性" prop="cssClass">
          <el-input v-model="form.cssClass" placeholder="请输入样式属性" />
        </el-form-item>
        <el-form-item label="显示排序" prop="dictSort">
          <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="回显样式" prop="listClass">
          <el-select v-model="form.listClass">
            <el-option
              v-for="item in listClassOptions"
              :key="item.value"
              :label="item.label + '(' + item.value + ')'"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in statusOptions" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
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

<script setup lang="tsx">
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Edit, Delete, Download, Close } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";

// Mock 数据 - 字典类型列表
const mockTypeList = [
  { dictId: 1, dictName: "客户性别", dictType: "sys_user_sex" },
  { dictId: 2, dictName: "菜单状态", dictType: "sys_show_hide" },
  { dictId: 3, dictName: "系统开关", dictType: "sys_normal_disable" },
  { dictId: 4, dictName: "任务状态", dictType: "sys_job_status" },
  { dictId: 5, dictName: "任务分组", dictType: "sys_job_group" },
  { dictId: 6, dictName: "系统是否", dictType: "sys_yes_no" },
  { dictId: 7, dictName: "通知类型", dictType: "sys_notice_type" },
  { dictId: 8, dictName: "通知状态", dictType: "sys_notice_status" },
  { dictId: 9, dictName: "操作类型", dictType: "sys_oper_type" },
  { dictId: 10, dictName: "系统状态", dictType: "sys_common_status" }
];

// Mock 数据 - 字典数据列表（所有字典类型的数据）
const mockDataList = [
  // sys_user_sex 的数据
  {
    dictCode: 1,
    dictSort: 1,
    dictLabel: "男",
    dictValue: "0",
    dictType: "sys_user_sex",
    cssClass: "",
    listClass: "default",
    status: "0",
    remark: "性别男",
    createTime: "2025-05-26 10:09:13"
  },
  {
    dictCode: 2,
    dictSort: 2,
    dictLabel: "女",
    dictValue: "1",
    dictType: "sys_user_sex",
    cssClass: "",
    listClass: "default",
    status: "0",
    remark: "性别女",
    createTime: "2025-05-26 10:09:14"
  },
  {
    dictCode: 3,
    dictSort: 3,
    dictLabel: "未知",
    dictValue: "2",
    dictType: "sys_user_sex",
    cssClass: "",
    listClass: "default",
    status: "0",
    remark: "性别未知",
    createTime: "2025-05-26 10:09:15"
  },
  // sys_show_hide 的数据
  {
    dictCode: 4,
    dictSort: 1,
    dictLabel: "显示",
    dictValue: "0",
    dictType: "sys_show_hide",
    cssClass: "",
    listClass: "primary",
    status: "0",
    remark: "显示菜单",
    createTime: "2025-05-26 10:09:13"
  },
  {
    dictCode: 5,
    dictSort: 2,
    dictLabel: "隐藏",
    dictValue: "1",
    dictType: "sys_show_hide",
    cssClass: "",
    listClass: "danger",
    status: "0",
    remark: "隐藏菜单",
    createTime: "2025-05-26 10:09:14"
  },
  // sys_normal_disable 的数据
  {
    dictCode: 6,
    dictSort: 1,
    dictLabel: "正常",
    dictValue: "0",
    dictType: "sys_normal_disable",
    cssClass: "",
    listClass: "success",
    status: "0",
    remark: "正常状态",
    createTime: "2025-05-26 10:09:13"
  },
  {
    dictCode: 7,
    dictSort: 2,
    dictLabel: "停用",
    dictValue: "1",
    dictType: "sys_normal_disable",
    cssClass: "",
    listClass: "danger",
    status: "0",
    remark: "停用状态",
    createTime: "2025-05-26 10:09:14"
  },
  // sys_job_status 的数据
  {
    dictCode: 8,
    dictSort: 1,
    dictLabel: "正常",
    dictValue: "0",
    dictType: "sys_job_status",
    cssClass: "",
    listClass: "success",
    status: "0",
    remark: "正常状态",
    createTime: "2025-05-26 10:09:15"
  },
  {
    dictCode: 9,
    dictSort: 2,
    dictLabel: "暂停",
    dictValue: "1",
    dictType: "sys_job_status",
    cssClass: "",
    listClass: "warning",
    status: "0",
    remark: "暂停状态",
    createTime: "2025-05-26 10:09:16"
  },
  // sys_job_group 的数据
  {
    dictCode: 10,
    dictSort: 1,
    dictLabel: "默认",
    dictValue: "DEFAULT",
    dictType: "sys_job_group",
    cssClass: "",
    listClass: "default",
    status: "0",
    remark: "默认分组",
    createTime: "2025-05-26 10:09:15"
  },
  {
    dictCode: 11,
    dictSort: 2,
    dictLabel: "系统",
    dictValue: "SYSTEM",
    dictType: "sys_job_group",
    cssClass: "",
    listClass: "primary",
    status: "0",
    remark: "系统分组",
    createTime: "2025-05-26 10:09:16"
  },
  // sys_yes_no 的数据
  {
    dictCode: 12,
    dictSort: 1,
    dictLabel: "是",
    dictValue: "Y",
    dictType: "sys_yes_no",
    cssClass: "",
    listClass: "success",
    status: "0",
    remark: "系统默认是",
    createTime: "2025-05-26 10:09:16"
  },
  {
    dictCode: 13,
    dictSort: 2,
    dictLabel: "否",
    dictValue: "N",
    dictType: "sys_yes_no",
    cssClass: "",
    listClass: "danger",
    status: "0",
    remark: "系统默认否",
    createTime: "2025-05-26 10:09:17"
  },
  // sys_notice_type 的数据
  {
    dictCode: 14,
    dictSort: 1,
    dictLabel: "通知",
    dictValue: "1",
    dictType: "sys_notice_type",
    cssClass: "",
    listClass: "info",
    status: "0",
    remark: "通知类型",
    createTime: "2025-05-26 10:09:16"
  },
  {
    dictCode: 15,
    dictSort: 2,
    dictLabel: "公告",
    dictValue: "2",
    dictType: "sys_notice_type",
    cssClass: "",
    listClass: "warning",
    status: "0",
    remark: "公告类型",
    createTime: "2025-05-26 10:09:17"
  },
  // sys_notice_status 的数据
  {
    dictCode: 16,
    dictSort: 1,
    dictLabel: "正常",
    dictValue: "0",
    dictType: "sys_notice_status",
    cssClass: "",
    listClass: "success",
    status: "0",
    remark: "正常状态",
    createTime: "2025-05-26 10:09:16"
  },
  {
    dictCode: 17,
    dictSort: 2,
    dictLabel: "关闭",
    dictValue: "1",
    dictType: "sys_notice_status",
    cssClass: "",
    listClass: "danger",
    status: "0",
    remark: "关闭状态",
    createTime: "2025-05-26 10:09:17"
  },
  // sys_oper_type 的数据
  {
    dictCode: 18,
    dictSort: 1,
    dictLabel: "新增",
    dictValue: "1",
    dictType: "sys_oper_type",
    cssClass: "",
    listClass: "success",
    status: "0",
    remark: "新增操作",
    createTime: "2025-05-26 10:09:16"
  },
  {
    dictCode: 19,
    dictSort: 2,
    dictLabel: "修改",
    dictValue: "2",
    dictType: "sys_oper_type",
    cssClass: "",
    listClass: "primary",
    status: "0",
    remark: "修改操作",
    createTime: "2025-05-26 10:09:17"
  },
  {
    dictCode: 20,
    dictSort: 3,
    dictLabel: "删除",
    dictValue: "3",
    dictType: "sys_oper_type",
    cssClass: "",
    listClass: "danger",
    status: "0",
    remark: "删除操作",
    createTime: "2025-05-26 10:09:17"
  },
  // sys_common_status 的数据
  {
    dictCode: 21,
    dictSort: 1,
    dictLabel: "正常",
    dictValue: "0",
    dictType: "sys_common_status",
    cssClass: "",
    listClass: "success",
    status: "0",
    remark: "正常状态",
    createTime: "2025-05-26 10:09:17"
  },
  {
    dictCode: 22,
    dictSort: 2,
    dictLabel: "停用",
    dictValue: "1",
    dictType: "sys_common_status",
    cssClass: "",
    listClass: "danger",
    status: "0",
    remark: "停用状态",
    createTime: "2025-05-26 10:09:17"
  }
];

// Mock 数据存储（用于增删改操作）
const mockDataStore = ref([...mockDataList]);

// 路由实例
const route = useRoute();
const router = useRouter();

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 响应式数据
const title = ref("");
const open = ref(false);
const formRef = ref();
const defaultDictType = ref("");

// 状态选项
const statusOptions = [
  { label: "正常", value: "0" },
  { label: "停用", value: "1" }
];

// 数据标签回显样式
const listClassOptions = [
  { value: "default", label: "默认" },
  { value: "primary", label: "主要" },
  { value: "success", label: "成功" },
  { value: "info", label: "信息" },
  { value: "warning", label: "警告" },
  { value: "danger", label: "危险" }
];

const form = reactive({
  dictCode: undefined,
  dictLabel: undefined,
  dictValue: undefined,
  cssClass: undefined,
  listClass: "default",
  dictSort: 0,
  status: "0",
  remark: undefined,
  dictType: undefined
});

const rules = {
  dictLabel: [{ required: true, message: "数据标签不能为空", trigger: "blur" }],
  dictValue: [{ required: true, message: "数据键值不能为空", trigger: "blur" }],
  dictSort: [{ required: true, message: "数据顺序不能为空", trigger: "blur" }]
};

// 表格配置项
const columns = reactive<ColumnProps[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "#", width: 80 },
  {
    prop: "dictCode",
    label: "字典编码",
    width: 100,
    align: "center"
  },
  {
    prop: "dictLabel",
    label: "字典标签",
    minWidth: 150,
    align: "center",
    search: { el: "input", props: { placeholder: "请输入字典标签" } }
  },
  {
    prop: "dictValue",
    label: "字典键值",
    minWidth: 120,
    align: "center"
  },
  {
    prop: "dictSort",
    label: "字典排序",
    width: 100,
    align: "center"
  },
  {
    prop: "status",
    label: "状态",
    width: 100,
    align: "center",
    enum: statusOptions,
    search: { el: "select", props: { placeholder: "数据状态", clearable: true } },
    fieldNames: { label: "label", value: "value" }
  },
  {
    prop: "remark",
    label: "备注",
    minWidth: 150,
    align: "center"
  },
  {
    prop: "createTime",
    label: "创建时间",
    width: 180,
    align: "center"
  },
  { prop: "operation", label: "操作", fixed: "right", minWidth: 150 }
]);

// dataCallback 是对于返回的表格数据做处理
const dataCallback = (data: any) => {
  return {
    list: data.list || data.rows || data,
    total: data.total || data.length
  };
};

// 请求表格数据
const getTableList = (params: any) => {
  return new Promise(resolve => {
    setTimeout(() => {
      let filteredList = [...mockDataStore.value];

      // 根据字典类型过滤（从路由参数获取）
      const dictId = route.params?.dictId;
      if (dictId) {
        const typeItem = mockTypeList.find(item => item.dictId == dictId);
        if (typeItem) {
          filteredList = filteredList.filter(item => item.dictType === typeItem.dictType);
          defaultDictType.value = typeItem.dictType;
        }
      }

      // 根据字典标签过滤
      if (params.dictLabel) {
        filteredList = filteredList.filter(item => item.dictLabel.includes(params.dictLabel));
      }

      // 根据状态过滤
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

// 取消按钮
const cancel = () => {
  open.value = false;
  reset();
};

// 表单重置
const reset = () => {
  Object.assign(form, {
    dictCode: undefined,
    dictLabel: undefined,
    dictValue: undefined,
    cssClass: undefined,
    listClass: "default",
    dictSort: 0,
    status: "0",
    remark: undefined,
    dictType: defaultDictType.value
  });
  if (formRef.value) formRef.value.resetFields();
};

// 监听搜索和重置事件
const handleSearch = () => {
  // ProTable 会自动调用 getTableList
};

const handleReset = () => {
  // ProTable 会自动调用 getTableList
};

// 新增按钮操作
const handleAdd = () => {
  reset();
  form.dictType = defaultDictType.value;
  open.value = true;
  title.value = "添加字典数据";
};

// 修改按钮操作
const handleUpdate = (row?: any) => {
  reset();
  const dictCode = row?.dictCode || (proTable.value?.selectedListIds && proTable.value.selectedListIds[0]);
  if (!dictCode) {
    ElMessage.warning("请选择要修改的字典数据");
    return;
  }
  const dataItem = mockDataStore.value.find(item => item.dictCode == dictCode);
  if (dataItem) {
    Object.assign(form, dataItem);
  }
  open.value = true;
  title.value = "修改字典数据";
};

// 提交按钮
const submitForm = () => {
  if (formRef.value) {
    formRef.value.validate(valid => {
      if (valid) {
        if (form.dictCode != undefined) {
          // 更新数据
          const index = mockDataStore.value.findIndex(item => item.dictCode == form.dictCode);
          if (index !== -1) {
            mockDataStore.value[index] = {
              ...mockDataStore.value[index],
              ...form,
              createTime: mockDataStore.value[index].createTime // 保留创建时间
            };
          }
          ElMessage.success("修改成功");
        } else {
          // 新增数据
          const newDictCode = Math.max(...mockDataStore.value.map(item => item.dictCode), 0) + 1;
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const day = String(now.getDate()).padStart(2, "0");
          const hours = String(now.getHours()).padStart(2, "0");
          const minutes = String(now.getMinutes()).padStart(2, "0");
          const seconds = String(now.getSeconds()).padStart(2, "0");
          const createTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
          mockDataStore.value.push({
            ...form,
            dictCode: newDictCode,
            createTime: createTime
          });
          ElMessage.success("新增成功");
        }
        open.value = false;
        proTable.value?.getTableList();
      }
    });
  }
};

// 删除按钮操作
const handleDelete = (row?: any) => {
  const dictCodes = row?.dictCode || proTable.value?.selectedListIds;
  if (!dictCodes || (Array.isArray(dictCodes) && dictCodes.length === 0)) {
    ElMessage.warning("请选择要删除的字典数据");
    return;
  }
  ElMessageBox.confirm(
    `是否确认删除字典编码为"${Array.isArray(dictCodes) ? dictCodes.join(",") : dictCodes}"的数据项？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(() => {
      const codesToDelete = Array.isArray(dictCodes) ? dictCodes : [dictCodes];
      codesToDelete.forEach(code => {
        const index = mockDataStore.value.findIndex(item => item.dictCode == code);
        if (index !== -1) {
          mockDataStore.value.splice(index, 1);
        }
      });
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

// 关闭按钮操作
const handleClose = () => {
  router.push("/system/dictManage");
};

// 初始化
onMounted(() => {
  // ProTable 会自动请求数据
});
</script>

<style scoped lang="scss">
.table-box {
  padding: 20px;
}
</style>
