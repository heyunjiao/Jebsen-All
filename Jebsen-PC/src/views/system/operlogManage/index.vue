<template>
  <div class="table-box operlog-manage">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :data-callback="dataCallback"
      row-key="operId"
      @search="handleSearch"
      @reset="handleReset"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader>
        <el-button type="warning" plain :icon="Download" @click="handleExport">导出</el-button>
      </template>
      <!-- 操作类型列 -->
      <template #businessType="scope">
        <el-tag>{{ getOperTypeLabel(scope.row.businessType) }}</el-tag>
      </template>
      <!-- 操作状态列 -->
      <template #status="scope">
        <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">
          {{ scope.row.status === "0" ? "正常" : "失败" }}
        </el-tag>
      </template>
    </ProTable>

    <!-- 操作日志详细对话框 -->
    <el-dialog title="操作日志详细" v-model="open" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" label-width="100px" size="small">
        <el-row>
          <el-col :span="12">
            <el-form-item label="操作模块：">{{ form.title }} / {{ getOperTypeLabel(form.businessType) }}</el-form-item>
            <el-form-item label="登录信息：">{{ form.operName }} / {{ form.operIp }} / {{ form.operLocation }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求地址：">{{ form.operUrl }}</el-form-item>
            <el-form-item label="请求方式：">{{ form.requestMethod }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作方法：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求参数：">{{ form.operParam }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="返回参数：">{{ form.jsonResult }}</el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="操作状态：">
              <el-tag :type="form.status === '0' ? 'success' : 'danger'">
                {{ form.status === "0" ? "正常" : "失败" }}
              </el-tag>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="消耗时间：">{{ form.costTime }}毫秒</el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="操作时间：">{{ form.operTime }}</el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.status === '1'">
            <el-form-item label="异常信息：">{{ form.errorMsg }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="open = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="tsx">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Download } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { listOperlog } from "@/api/monitor/operlog";

const operTypeOptions = [
  { label: "新增", value: "1" },
  { label: "修改", value: "2" },
  { label: "删除", value: "3" },
  { label: "授权", value: "4" },
  { label: "导出", value: "5" },
  { label: "导入", value: "6" },
  { label: "强退", value: "7" },
  { label: "生成代码", value: "8" },
  { label: "清空数据", value: "9" }
];

const statusOptions = [
  { label: "正常", value: "0" },
  { label: "失败", value: "1" }
];

// 获取操作类型标签
const getOperTypeLabel = (value: string | undefined) => {
  if (value == null) return "";
  const option = operTypeOptions.find(item => item.value === value);
  return option ? option.label : value;
};

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 响应式数据
const open = ref(false);
const formRef = ref();

const form = reactive({
  operId: undefined,
  title: undefined,
  businessType: undefined,
  operName: undefined,
  operIp: undefined,
  operLocation: undefined,
  operUrl: undefined,
  requestMethod: undefined,
  method: undefined,
  operParam: undefined,
  jsonResult: undefined,
  status: undefined,
  costTime: undefined,
  operTime: undefined,
  errorMsg: undefined
});

// 表格配置项
const columns = reactive<ColumnProps[]>([
  {
    prop: "title",
    label: "系统模块",
    minWidth: 120,
    align: "center",
    search: { el: "input", props: { placeholder: "请输入系统模块" } }
  },
  {
    prop: "businessType",
    label: "操作类型",
    minWidth: 100,
    align: "center",
    enum: operTypeOptions,
    search: { el: "select", props: { placeholder: "操作类型", clearable: true } },
    fieldNames: { label: "label", value: "value" }
  },
  {
    prop: "operName",
    label: "操作人员",
    minWidth: 110,
    align: "center",
    search: { el: "input", props: { placeholder: "请输入操作人员" } }
  },
  {
    prop: "operIp",
    label: "操作地址",
    minWidth: 130,
    align: "center",
    search: { el: "input", props: { placeholder: "请输入操作地址" } }
  },
  {
    prop: "status",
    label: "操作状态",
    minWidth: 100,
    align: "center",
    enum: statusOptions,
    search: { el: "select", props: { placeholder: "操作状态", clearable: true } },
    fieldNames: { label: "label", value: "value" }
  },
  {
    prop: "operTime",
    label: "操作日期",
    minWidth: 170,
    align: "center",
    search: {
      el: "date-picker",
      span: 2,
      props: {
        type: "daterange",
        valueFormat: "YYYY-MM-DD HH:mm:ss",
        rangeSeparator: "-",
        startPlaceholder: "开始日期",
        endPlaceholder: "结束日期"
      }
    }
  }
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
  return listOperlog(params).then((res: any) => {
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

// 监听搜索和重置事件
const handleSearch = () => {
  // ProTable 会自动调用 getTableList
};

const handleReset = () => {
  // ProTable 会自动调用 getTableList
};

// 详细按钮操作
const handleView = (row: any) => {
  Object.assign(form, row);
  open.value = true;
};

// 导出按钮操作
const handleExport = () => {
  ElMessage.info("导出功能待实现");
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
