<template>
  <div class="table-box config-manage">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :data-callback="dataCallback"
      row-key="configId"
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
      <!-- 系统内置列 -->
      <template #configType="scope">
        <el-tag :type="scope.row.configType === 'Y' ? 'success' : 'info'">
          {{ scope.row.configType === "Y" ? "是" : "否" }}
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入参数键名" />
        </el-form-item>
        <el-form-item label="参数键值" prop="configValue">
          <el-input v-model="form.configValue" type="textarea" :rows="4" placeholder="请输入参数键值" />
        </el-form-item>
        <el-form-item label="系统内置" prop="configType">
          <el-radio-group v-model="form.configType">
            <el-radio v-for="dict in configTypeOptions" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
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
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Edit, Delete, Download, Refresh } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { listConfig, getConfig, addConfig, updateConfig, delConfig, refreshCache } from "@/api/system/config";

const configTypeOptions = [
  { label: "是", value: "Y" },
  { label: "否", value: "N" }
];

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 响应式数据
const title = ref("");
const open = ref(false);
const formRef = ref();

const form = reactive({
  configId: undefined,
  configName: undefined,
  configKey: undefined,
  configValue: undefined,
  configType: "Y",
  remark: undefined
});

const rules = {
  configName: [{ required: true, message: "参数名称不能为空", trigger: "blur" }],
  configKey: [{ required: true, message: "参数键名不能为空", trigger: "blur" }],
  configValue: [{ required: true, message: "参数键值不能为空", trigger: "blur" }]
};

// 表格配置项
const columns = reactive<ColumnProps[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "#", width: 80 },
  {
    prop: "configId",
    label: "参数主键",
    width: 100,
    align: "center"
  },
  {
    prop: "configName",
    label: "参数名称",
    minWidth: 150,
    align: "center",
    search: { el: "input", props: { placeholder: "请输入参数名称" } }
  },
  {
    prop: "configKey",
    label: "参数键名",
    minWidth: 150,
    align: "center",
    search: { el: "input", props: { placeholder: "请输入参数键名" } }
  },
  {
    prop: "configValue",
    label: "参数键值",
    minWidth: 200,
    align: "center"
  },
  {
    prop: "configType",
    label: "系统内置",
    width: 120,
    align: "center",
    enum: configTypeOptions,
    search: { el: "select", props: { placeholder: "系统内置", clearable: true } },
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
  // 参考 dictManage 的写法
  return {
    list: data.list || data.rows || data,
    total: data.total || data.length
  };
};

// 请求表格数据
const getTableList = (params: any) => {
  return listConfig(params).then((res: any) => {
    // 参考 dictManage 的格式，返回 { data: { list, total } } 格式
    // 因为 useTable 期望解构 { data }
    return {
      data: {
        list: res.rows || res.list || [],
        total: res.total || 0
      }
    };
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
    configId: undefined,
    configName: undefined,
    configKey: undefined,
    configValue: undefined,
    configType: "Y",
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
  title.value = "添加参数";
};

// 修改按钮操作
const handleUpdate = async (row?: any) => {
  reset();
  const configId = row?.configId || (proTable.value?.selectedListIds && proTable.value.selectedListIds[0]);
  if (!configId) {
    ElMessage.warning("请选择要修改的参数");
    return;
  }
  try {
    const res = await getConfig(configId);
    if (res.data) {
      Object.assign(form, res.data);
    }
    open.value = true;
    title.value = "修改参数";
  } catch (error) {
    console.error("获取参数详情失败:", error);
  }
};

// 提交按钮
const submitForm = () => {
  if (formRef.value) {
    formRef.value.validate(async (valid: boolean) => {
      if (valid) {
        try {
          if (form.configId != undefined) {
            await updateConfig(form);
            ElMessage.success("修改成功");
          } else {
            await addConfig(form);
            ElMessage.success("新增成功");
          }
          open.value = false;
          proTable.value?.getTableList();
        } catch (error) {
          console.error("提交失败:", error);
        }
      }
    });
  }
};

// 删除按钮操作
const handleDelete = (row?: any) => {
  const configIds = row?.configId || proTable.value?.selectedListIds;
  if (!configIds || (Array.isArray(configIds) && configIds.length === 0)) {
    ElMessage.warning("请选择要删除的参数");
    return;
  }
  ElMessageBox.confirm(
    `是否确认删除参数编号为"${Array.isArray(configIds) ? configIds.join(",") : configIds}"的数据项？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(async () => {
      try {
        const idsToDelete = Array.isArray(configIds) ? configIds : [configIds];
        for (const id of idsToDelete) {
          await delConfig(id);
        }
        ElMessage.success("删除成功");
        proTable.value?.getTableList();
        proTable.value?.clearSelection();
      } catch (error) {
        console.error("删除失败:", error);
      }
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
const handleRefreshCache = async () => {
  try {
    await refreshCache();
    ElMessage.success("刷新成功");
  } catch (error) {
    console.error("刷新缓存失败:", error);
  }
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
