<template>
  <div class="app-container">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :init-param="initParam"
      :data-callback="dataCallback"
      row-key="operId"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button
          type="danger"
          plain
          size="small"
          :disabled="!scope.isSelected"
          @click="handleDelete"
          v-hasPermi="['monitor:operlog:remove']"
        >
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
        <el-button type="danger" plain size="small" @click="handleClean" v-hasPermi="['monitor:operlog:remove']">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
        <el-button type="warning" plain size="small" @click="handleExport" v-hasPermi="['monitor:operlog:export']">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </template>
      <!-- 操作类型 -->
      <template #businessType="scope">
        <dict-tag :options="dict?.type?.sys_oper_type || []" :value="scope.row.businessType" />
      </template>
      <!-- 操作状态 -->
      <template #status="scope">
        <dict-tag :options="dict?.type?.sys_common_status || []" :value="scope.row.status" />
      </template>
      <!-- 操作日期 -->
      <template #operTime="scope">
        <span>{{ parseTime(scope.row && scope.row.operTime ? scope.row.operTime : "") }}</span>
      </template>
      <!-- 消耗时间 -->
      <template #costTime="scope">
        <span>{{ scope.row && scope.row.costTime ? scope.row.costTime : 0 }}毫秒</span>
      </template>
      <!-- 操作 -->
      <template #operation="scope">
        <el-button size="small" type="primary" link @click="handleView(scope.row)" v-hasPermi="['monitor:operlog:query']">
          <el-icon><View /></el-icon>
          详细
        </el-button>
      </template>
    </ProTable>

    <!-- 操作日志详细 -->
    <el-dialog title="操作日志详细" v-model:visible="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" label-width="100px" size="mini">
        <el-row>
          <el-col :span="12">
            <el-form-item label="操作模块：">{{ form.title }} / {{ typeFormat(form) }}</el-form-item>
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
              <div v-if="form.status === 0">正常</div>
              <div v-else-if="form.status === 1">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="消耗时间：">{{ form && form.costTime ? form.costTime : 0 }}毫秒</el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="操作时间：">{{ parseTime(form && form.operTime ? form.operTime : "") }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="异常信息：" v-if="form.status === 1">{{ form.errorMsg }}</el-form-item>
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

<script>
import { list, delOperlog, cleanOperlog } from "@/api/modules/monitor/operlog";
import ProTable from "@/components/ProTable/index.vue";
import { parseTime, selectDictLabel } from "@/utils";
import { reactive, ref } from "vue";
import { Delete, Download, View } from "@element-plus/icons-vue";

export default {
  name: "Operlog",
  components: {
    ProTable,
    Delete,
    Download,
    View
  },
  dicts: ["sys_oper_type", "sys_common_status"],
  setup() {
    const proTable = ref();
    const initParam = reactive({});

    // dataCallback 处理返回数据
    const dataCallback = data => {
      if (data && data.rows) {
        return {
          list: data.rows || [],
          total: data.total || 0
        };
      }
      return {
        list: [],
        total: 0
      };
    };

    // 请求函数
    const getTableList = params => {
      return list(params);
    };

    // 表格列配置
    const columns = reactive([
      { type: "selection", fixed: "left", width: 50 },
      { prop: "operId", label: "日志编号" },
      { prop: "title", label: "系统模块", showOverflowTooltip: true },
      {
        prop: "businessType",
        label: "操作类型",
        search: {
          el: "select",
          props: { placeholder: "操作类型" },
          enum: () => Promise.resolve({ data: [] })
        }
      },
      {
        prop: "operName",
        label: "操作人员",
        width: 110,
        search: { el: "input", props: { placeholder: "请输入操作人员" } },
        sortable: "custom"
      },
      {
        prop: "operIp",
        label: "操作地址",
        width: 130,
        search: { el: "input", props: { placeholder: "请输入操作地址" } }
      },
      { prop: "operLocation", label: "操作地点", showOverflowTooltip: true },
      {
        prop: "status",
        label: "操作状态",
        search: {
          el: "select",
          props: { placeholder: "操作状态" },
          enum: () => Promise.resolve({ data: [] })
        }
      },
      {
        prop: "operTime",
        label: "操作日期",
        width: 160,
        sortable: "custom",
        search: {
          el: "date-picker",
          props: {
            type: "daterange",
            valueFormat: "yyyy-MM-dd HH:mm:ss",
            defaultTime: ["00:00:00", "23:59:59"],
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期"
          }
        }
      },
      { prop: "costTime", label: "消耗时间", width: 110, sortable: "custom" },
      { prop: "operation", label: "操作", fixed: "right", width: 100 }
    ]);

    return {
      proTable,
      initParam,
      dataCallback,
      getTableList,
      columns
    };
  },
  data() {
    return {
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {}
    };
  },
  methods: {
    parseTime,
    selectDictLabel,
    // 操作日志类型字典翻译
    typeFormat(row) {
      return this.selectDictLabel(this.dict?.type?.sys_oper_type || [], row.businessType);
    },
    /** 详细按钮操作 */
    handleView(row) {
      if (!row) {
        return;
      }
      this.open = true;
      this.form = row;
    },
    /** 删除按钮操作 */
    handleDelete() {
      const operIds = this.$refs.proTable?.selectedListIds || [];
      if (!operIds.length) {
        this.$modal.msgWarning("请选择要删除的数据");
        return;
      }
      this.$modal
        .confirm('是否确认删除日志编号为"' + operIds + '"的数据项？')
        .then(() => {
          return delOperlog(operIds);
        })
        .then(() => {
          this.$refs.proTable?.getTableList();
          this.$refs.proTable?.clearSelection();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 清空按钮操作 */
    handleClean() {
      this.$modal
        .confirm("是否确认清空所有操作日志数据项？")
        .then(() => {
          return cleanOperlog();
        })
        .then(() => {
          this.$refs.proTable?.getTableList();
          this.$modal.msgSuccess("清空成功");
        })
        .catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const searchParam = this.$refs.proTable?.searchParam || {};
      this.download("monitor/operlog/export", searchParam, `operlog_${new Date().getTime()}.xlsx`);
    },
    download(url, params, filename) {
      const { useDownload } = require("@/hooks/useDownload");
      const http = require("@/api").default;
      useDownload(params => http.download(url, params), filename, params);
    }
  }
};
</script>
