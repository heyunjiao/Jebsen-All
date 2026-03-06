<template>
  <div class="table-box dict-manage">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :data-callback="dataCallback"
      row-key="dictId"
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
        <el-button type="danger" plain :icon="Refresh" @click="handleRefreshCache">刷新缓存</el-button>
      </template>
      <!-- 字典类型列 -->
      <template #dictType="scope">
        <el-link type="primary" :underline="false" @click="toDictData(scope.row)">
          {{ scope.row.dictType }}
        </el-link>
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
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="form.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="form.dictType" placeholder="请输入字典类型" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in statusOptions" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Edit, Delete, Download, Refresh } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";

// 假数据
const mockTypeList = [
  {
    dictId: 1,
    dictName: "客户性别",
    dictType: "sys_user_sex",
    status: "0",
    remark: "客户性别列表",
    createTime: "2025-05-26 10:09:13"
  },
  {
    dictId: 2,
    dictName: "菜单状态",
    dictType: "sys_show_hide",
    status: "0",
    remark: "菜单状态列表",
    createTime: "2025-05-26 10:09:14"
  },
  {
    dictId: 3,
    dictName: "系统开关",
    dictType: "sys_normal_disable",
    status: "0",
    remark: "系统开关列表",
    createTime: "2025-05-26 10:09:15"
  },
  {
    dictId: 4,
    dictName: "任务状态",
    dictType: "sys_job_status",
    status: "0",
    remark: "任务状态列表",
    createTime: "2025-05-26 10:09:15"
  },
  {
    dictId: 5,
    dictName: "任务分组",
    dictType: "sys_job_group",
    status: "0",
    remark: "任务分组列表",
    createTime: "2025-05-26 10:09:16"
  },
  {
    dictId: 6,
    dictName: "系统是否",
    dictType: "sys_yes_no",
    status: "0",
    remark: "系统是否列表",
    createTime: "2025-05-26 10:09:16"
  },
  {
    dictId: 7,
    dictName: "通知类型",
    dictType: "sys_notice_type",
    status: "0",
    remark: "通知类型列表",
    createTime: "2025-05-26 10:09:16"
  },
  {
    dictId: 8,
    dictName: "通知状态",
    dictType: "sys_notice_status",
    status: "0",
    remark: "通知状态列表",
    createTime: "2025-05-26 10:09:17"
  },
  {
    dictId: 9,
    dictName: "操作类型",
    dictType: "sys_oper_type",
    status: "0",
    remark: "操作类型列表",
    createTime: "2025-05-26 10:09:17"
  },
  {
    dictId: 10,
    dictName: "系统状态",
    dictType: "sys_common_status",
    status: "0",
    remark: "系统状态列表",
    createTime: "2025-05-26 10:09:17"
  }
];

// Mock 数据存储（用于增删改操作）
const mockDataStore = ref([...mockTypeList]);

const statusOptions = [
  { label: "正常", value: "0" },
  { label: "停用", value: "1" }
];

// 路由实例
const router = useRouter();

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 响应式数据
const title = ref("");
const open = ref(false);
const formRef = ref();

const form = reactive({
  dictId: undefined,
  dictName: undefined,
  dictType: undefined,
  status: "0",
  remark: undefined
});

const rules = {
  dictName: [{ required: true, message: "字典名称不能为空", trigger: "blur" }],
  dictType: [{ required: true, message: "字典类型不能为空", trigger: "blur" }]
};

// 表格配置项
const columns = reactive<ColumnProps[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "#", width: 80 },
  {
    prop: "dictId",
    label: "字典编号",
    width: 100,
    align: "center"
  },
  {
    prop: "dictName",
    label: "字典名称",
    minWidth: 150,
    align: "center",
    search: { el: "input", props: { placeholder: "请输入字典名称" } }
  },
  {
    prop: "dictType",
    label: "字典类型",
    minWidth: 150,
    align: "center",
    search: { el: "input", props: { placeholder: "请输入字典类型" } }
  },
  {
    prop: "status",
    label: "状态",
    width: 100,
    align: "center",
    enum: statusOptions,
    search: { el: "select", props: { placeholder: "字典状态", clearable: true } },
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
    align: "center",
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
  { prop: "operation", label: "操作", fixed: "right", minWidth: 150 }
]);

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
      let filteredList = [...mockDataStore.value];

      // 根据查询条件过滤
      if (params.dictName) {
        filteredList = filteredList.filter(item => item.dictName.includes(params.dictName));
      }
      if (params.dictType) {
        filteredList = filteredList.filter(item => item.dictType.includes(params.dictType));
      }
      if (params.status !== undefined && params.status !== null && params.status !== "") {
        filteredList = filteredList.filter(item => item.status === params.status);
      }

      // 日期范围过滤
      if (params.createTime && params.createTime.length === 2) {
        const [startDate, endDate] = params.createTime;
        filteredList = filteredList.filter(item => {
          const itemDate = item.createTime.split(" ")[0];
          return itemDate >= startDate && itemDate <= endDate;
        });
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
    dictId: undefined,
    dictName: undefined,
    dictType: undefined,
    status: "0",
    remark: undefined
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
  open.value = true;
  title.value = "添加字典类型";
};

// 修改按钮操作
const handleUpdate = (row?: any) => {
  reset();
  const dictId = row?.dictId || (proTable.value?.selectedListIds && proTable.value.selectedListIds[0]);
  if (!dictId) {
    ElMessage.warning("请选择要修改的字典");
    return;
  }
  const dict = mockDataStore.value.find(item => item.dictId === dictId);
  if (dict) {
    Object.assign(form, dict);
  }
  open.value = true;
  title.value = "修改字典类型";
};

// 提交按钮
const submitForm = () => {
  if (formRef.value) {
    formRef.value.validate(valid => {
      if (valid) {
        if (form.dictId != undefined) {
          // 更新数据
          const index = mockDataStore.value.findIndex(item => item.dictId === form.dictId);
          if (index !== -1) {
            mockDataStore.value[index] = {
              dictId: form.dictId,
              dictName: form.dictName || "",
              dictType: form.dictType || "",
              status: form.status || "0",
              remark: form.remark || "",
              createTime: mockDataStore.value[index].createTime // 保留创建时间
            };
          }
          ElMessage.success("修改成功");
        } else {
          // 新增数据
          const newDictId = Math.max(...mockDataStore.value.map(item => item.dictId), 0) + 1;
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const day = String(now.getDate()).padStart(2, "0");
          const hours = String(now.getHours()).padStart(2, "0");
          const minutes = String(now.getMinutes()).padStart(2, "0");
          const seconds = String(now.getSeconds()).padStart(2, "0");
          const createTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
          mockDataStore.value.push({
            dictId: newDictId,
            dictName: form.dictName || "",
            dictType: form.dictType || "",
            status: form.status || "0",
            remark: form.remark || "",
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
  const dictIds = row?.dictId || proTable.value?.selectedListIds;
  if (!dictIds || (Array.isArray(dictIds) && dictIds.length === 0)) {
    ElMessage.warning("请选择要删除的字典");
    return;
  }
  ElMessageBox.confirm(`是否确认删除字典编号为"${Array.isArray(dictIds) ? dictIds.join(",") : dictIds}"的数据项？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      const idsToDelete = Array.isArray(dictIds) ? dictIds : [dictIds];
      idsToDelete.forEach(id => {
        const index = mockDataStore.value.findIndex(item => item.dictId === id);
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

// 刷新缓存按钮操作
const handleRefreshCache = () => {
  ElMessage.success("刷新成功");
};

// 跳转到字典数据页面
const toDictData = (row: any) => {
  router.push(`/system/dict-data/index/${row.dictId}`);
};

// 初始化
onMounted(() => {
  // ProTable 会自动请求数据
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
