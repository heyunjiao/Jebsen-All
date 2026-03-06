<template>
  <div class="app-container">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :init-param="initParam"
      :data-callback="dataCallback"
      row-key="jobLogId"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button
          type="danger"
          plain
          size="small"
          :disabled="!scope.isSelected"
          @click="handleDelete"
          v-hasPermi="['monitor:job:remove']"
        >
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
        <el-button type="danger" plain size="small" @click="handleClean" v-hasPermi="['monitor:job:remove']">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
        <el-button type="warning" plain size="small" @click="handleExport" v-hasPermi="['monitor:job:export']">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <el-button type="warning" plain size="small" @click="handleClose">
          <el-icon><Close /></el-icon>
          关闭
        </el-button>
      </template>
      <!-- 任务组名 -->
      <template #jobGroup="scope">
        <dict-tag :options="dict?.type?.sys_job_group || []" :value="scope.row.jobGroup" />
      </template>
      <!-- 执行状态 -->
      <template #status="scope">
        <dict-tag :options="dict?.type?.sys_common_status || []" :value="scope.row.status" />
      </template>
      <!-- 执行时间 -->
      <template #createTime="scope">
        <span>{{ parseTime(scope.row && scope.row.createTime ? scope.row.createTime : "") }}</span>
      </template>
      <!-- 操作 -->
      <template #operation="scope">
        <el-button size="small" type="primary" link @click="handleView(scope.row)" v-hasPermi="['monitor:job:query']">
          <el-icon><View /></el-icon>
          详细
        </el-button>
      </template>
    </ProTable>

    <!-- 调度日志详细 -->
    <el-dialog title="调度日志详细" v-model:visible="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" label-width="100px" size="mini">
        <el-row>
          <el-col :span="12">
            <el-form-item label="日志序号：">{{ form.jobLogId }}</el-form-item>
            <el-form-item label="任务名称：">{{ form.jobName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组：">{{ form.jobGroup }}</el-form-item>
            <el-form-item label="执行时间：">{{ form.createTime }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="调用方法：">{{ form.invokeTarget }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="日志信息：">{{ form.jobMessage }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="执行状态：">
              <div v-if="form.status == 0">正常</div>
              <div v-else-if="form.status == 1">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="异常信息：" v-if="form.status == 1">{{ form.exceptionInfo }}</el-form-item>
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
import { getJob } from "@/api/modules/monitor/job";
import { listJobLog, delJobLog, cleanJobLog } from "@/api/modules/monitor/jobLog";
import ProTable from "@/components/ProTable/index.vue";
import { parseTime } from "@/utils";
import { reactive, ref } from "vue";
import { Delete, Download, Close, View } from "@element-plus/icons-vue";

export default {
  name: "JobLog",
  components: {
    ProTable,
    Delete,
    Download,
    Close,
    View
  },
  dicts: ["sys_common_status", "sys_job_group"],
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
      return listJobLog(params);
    };

    // 表格列配置
    const columns = reactive([
      { type: "selection", fixed: "left", width: 55 },
      { prop: "jobLogId", label: "日志编号", width: 80 },
      {
        prop: "jobName",
        label: "任务名称",
        search: { el: "input", props: { placeholder: "请输入任务名称" } }
      },
      {
        prop: "jobGroup",
        label: "任务组名",
        search: {
          el: "select",
          props: { placeholder: "请选择任务组名" },
          enum: () => Promise.resolve({ data: [] })
        }
      },
      { prop: "invokeTarget", label: "调用目标字符串", showOverflowTooltip: true },
      { prop: "jobMessage", label: "日志信息", showOverflowTooltip: true },
      {
        prop: "status",
        label: "执行状态",
        search: {
          el: "select",
          props: { placeholder: "请选择执行状态" },
          enum: () => Promise.resolve({ data: [] })
        }
      },
      {
        prop: "createTime",
        label: "执行时间",
        width: 180,
        search: {
          el: "date-picker",
          props: {
            type: "daterange",
            valueFormat: "yyyy-MM-dd",
            startPlaceholder: "开始日期",
            endPlaceholder: "结束日期"
          }
        }
      },
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
      // 选中数组
      ids: [],
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {}
    };
  },
  created() {
    const jobId = this.$route.params && this.$route.params.jobId;
    if (jobId !== undefined && jobId != 0) {
      getJob(jobId).then(response => {
        if (this.$refs.proTable) {
          this.$refs.proTable.searchParam.jobName = response.data.jobName;
          this.$refs.proTable.searchParam.jobGroup = response.data.jobGroup;
          this.$refs.proTable.getTableList();
        }
      });
    }
  },
  methods: {
    parseTime,
    // 返回按钮
    handleClose() {
      const obj = { path: "/monitor/job" };
      this.$tab.closeOpenPage(obj);
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
      const jobLogIds = this.$refs.proTable?.selectedListIds || [];
      if (!jobLogIds.length) {
        this.$modal.msgWarning("请选择要删除的数据");
        return;
      }
      this.$modal
        .confirm('是否确认删除调度日志编号为"' + jobLogIds + '"的数据项？')
        .then(() => {
          return delJobLog(jobLogIds);
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
        .confirm("是否确认清空所有调度日志数据项？")
        .then(() => {
          return cleanJobLog();
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
      this.download("/monitor/jobLog/export", searchParam, `log_${new Date().getTime()}.xlsx`);
    },
    download(url, params, filename) {
      const { useDownload } = require("@/hooks/useDownload");
      const http = require("@/api").default;
      useDownload(params => http.download(url, params), filename, params);
    }
  }
};
</script>
