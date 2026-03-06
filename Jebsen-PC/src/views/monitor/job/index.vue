<template>
  <div class="app-container">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :init-param="initParam"
      :data-callback="dataCallback"
      row-key="jobId"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button type="primary" plain size="small" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
        <el-button type="success" plain size="small" :disabled="scope.selectedListIds.length !== 1" @click="handleUpdate">
          <el-icon><EditPen /></el-icon>
          修改
        </el-button>
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
        <el-button type="warning" plain size="small" @click="handleExport" v-hasPermi="['monitor:job:export']">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <el-button type="info" plain size="small" @click="handleJobLog" v-hasPermi="['monitor:job:query']">
          <el-icon><Operation /></el-icon>
          日志
        </el-button>
      </template>
      <!-- 任务组名 -->
      <template #jobGroup="scope">
        <dict-tag v-if="scope.row" :options="dict?.type?.sys_job_group || []" :value="scope.row?.jobGroup" />
        <span v-else>--</span>
      </template>
      <!-- 状态 -->
      <template #status="scope">
        <el-switch
          v-if="scope.row"
          v-model="scope.row.status"
          active-value="0"
          inactive-value="1"
          @change="handleStatusChange(scope.row)"
        ></el-switch>
        <span v-else>--</span>
      </template>
      <!-- 操作 -->
      <template #operation="scope">
        <el-button size="small" type="primary" link @click="handleUpdate(scope.row)">
          <el-icon><Edit /></el-icon>
          修改
        </el-button>
        <el-button size="small" type="primary" link @click="handleDelete(scope.row)">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
        <el-dropdown
          size="small"
          @command="command => handleCommand(command, scope.row)"
          v-hasPermi="['monitor:job:changeStatus', 'monitor:job:query']"
        >
          <el-button size="small" type="primary" link>
            <el-icon><ArrowRight /></el-icon>
            更多
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="handleRun" v-hasPermi="['monitor:job:changeStatus']">
                <el-icon><CaretRight /></el-icon>
                执行一次
              </el-dropdown-item>
              <el-dropdown-item command="handleView" v-hasPermi="['monitor:job:query']">
                <el-icon><View /></el-icon>
                任务详细
              </el-dropdown-item>
              <el-dropdown-item command="handleJobLog" v-hasPermi="['monitor:job:query']">
                <el-icon><Operation /></el-icon>
                调度日志
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </ProTable>

    <!-- 添加或修改定时任务对话框 -->
    <el-dialog :title="title" v-model:visible="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务名称" prop="jobName">
              <el-input v-model="form.jobName" placeholder="请输入任务名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组" prop="jobGroup">
              <el-select v-model="form.jobGroup" placeholder="请选择任务分组">
                <el-option
                  v-for="dict in dict?.type?.sys_job_group || []"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="invokeTarget">
              <template #label>
                <span>
                  调用方法
                  <el-tooltip placement="top">
                    <template #content>
                      <div>
                        Bean调用示例：ryTask.ryParams('ry')
                        <br />Class类调用示例：com.ruoyi.quartz.task.RyTask.ryParams('ry')
                        <br />参数说明：支持字符串，布尔类型，长整型，浮点型，整型
                      </div>
                    </template>
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input v-model="form.invokeTarget" placeholder="请输入调用目标字符串" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="cron表达式" prop="cronExpression">
              <el-input v-model="form.cronExpression" placeholder="请输入cron执行表达式">
                <template #append>
                  <el-button type="primary" @click="handleShowCron">
                    生成表达式
                    <el-icon class="el-icon--right"><Clock /></el-icon>
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.jobId !== undefined">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in dict?.type?.sys_job_status || []" :key="dict.value" :label="dict.value">{{
                  dict.label
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行策略" prop="misfirePolicy">
              <el-radio-group v-model="form.misfirePolicy" size="small">
                <el-radio-button value="1">立即执行</el-radio-button>
                <el-radio-button value="2">执行一次</el-radio-button>
                <el-radio-button value="3">放弃执行</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否并发" prop="concurrent">
              <el-radio-group v-model="form.concurrent" size="small">
                <el-radio-button value="0">允许</el-radio-button>
                <el-radio-button value="1">禁止</el-radio-button>
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

    <el-dialog title="Cron表达式生成器" v-model:visible="openCron" append-to-body destroy-on-close class="scrollbar">
      <crontab @hide="openCron = false" @fill="crontabFill" :expression="expression"></crontab>
    </el-dialog>

    <!-- 任务日志详细 -->
    <el-dialog title="任务详细" v-model:visible="openView" width="700px" append-to-body>
      <el-form ref="form" :model="form" label-width="120px" size="mini">
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务编号：">{{ form.jobId }}</el-form-item>
            <el-form-item label="任务名称：">{{ form.jobName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组：">{{ form && form.jobGroup ? jobGroupFormat(form) : "--" }}</el-form-item>
            <el-form-item label="创建时间：">{{ form && form.createTime ? form.createTime : "--" }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="cron表达式：">{{ form.cronExpression }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下次执行时间：">{{
              parseTime(form && form.nextValidTime ? form.nextValidTime : "")
            }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="调用目标方法：">{{ form.invokeTarget }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务状态：">
              <div v-if="form.status == 0">正常</div>
              <div v-else-if="form.status == 1">暂停</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否并发：">
              <div v-if="form.concurrent == 0">允许</div>
              <div v-else-if="form.concurrent == 1">禁止</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行策略：">
              <div v-if="form.misfirePolicy == 0">默认策略</div>
              <div v-else-if="form.misfirePolicy == 1">立即执行</div>
              <div v-else-if="form.misfirePolicy == 2">执行一次</div>
              <div v-else-if="form.misfirePolicy == 3">放弃执行</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="openView = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { listJob, getJob, delJob, addJob, updateJob, runJob, changeJobStatus } from "@/api/modules/monitor/job";
import Crontab from "@/components/Crontab/index.vue";
import ProTable from "@/components/ProTable/index.vue";
import { parseTime, resetForm, selectDictLabel } from "@/utils";
import { useDownload } from "@/hooks/useDownload";
import http from "@/api";
import { reactive, ref } from "vue";
import {
  Plus,
  EditPen,
  Delete,
  Download,
  Operation,
  ArrowRight,
  CaretRight,
  View,
  QuestionFilled,
  Clock,
  Edit
} from "@element-plus/icons-vue";

export default {
  name: "Job",
  components: {
    Crontab,
    ProTable,
    Plus,
    EditPen,
    Delete,
    Download,
    Operation,
    ArrowRight,
    CaretRight,
    View,
    QuestionFilled,
    Clock,
    Edit
  },
  dicts: ["sys_job_group", "sys_job_status"],
  setup() {
    const proTable = ref();
    const initParam = reactive({});

    // dataCallback 处理返回数据
    const dataCallback = data => {
      if (data && data.data) {
        return {
          list: data.data.rows || data.data || [],
          total: data.data.total || 0
        };
      } else if (data && data.rows) {
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
      return listJob(params);
    };

    // 表格列配置
    const columns = reactive([
      { type: "selection", fixed: "left", width: 55 },
      { prop: "jobId", label: "任务编号", width: 100, search: { el: "input" } },
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
          enum: () => Promise.resolve({ data: [] }) // 字典数据会通过 dict-tag 组件处理
        }
      },
      { prop: "invokeTarget", label: "调用目标字符串", showOverflowTooltip: true },
      { prop: "cronExpression", label: "cron执行表达式", showOverflowTooltip: true },
      {
        prop: "status",
        label: "状态",
        search: {
          el: "select",
          props: { placeholder: "请选择任务状态" },
          enum: () => Promise.resolve({ data: [] }) // 字典数据会通过 dict-tag 组件处理
        }
      },
      { prop: "operation", label: "操作", fixed: "right", width: 200 }
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
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示详细弹出层
      openView: false,
      // 是否显示Cron表达式弹出层
      openCron: false,
      // 传入的表达式
      expression: "",
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        jobName: [{ required: true, message: "任务名称不能为空", trigger: "blur" }],
        invokeTarget: [{ required: true, message: "调用目标字符串不能为空", trigger: "blur" }],
        cronExpression: [{ required: true, message: "cron执行表达式不能为空", trigger: "blur" }]
      }
    };
  },
  methods: {
    parseTime,
    selectDictLabel,
    /** 导出按钮操作 */
    download(url, params, filename) {
      useDownload(params => http.download(url, params), filename, params);
    },
    // 任务组名字典翻译
    jobGroupFormat(row, column) {
      if (!row || row === null || row === undefined) {
        return "--";
      }
      if (row.jobGroup === undefined || row.jobGroup === null) {
        return "--";
      }
      return this.selectDictLabel(this.dict?.type?.sys_job_group || [], row.jobGroup) || row.jobGroup || "--";
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        jobId: undefined,
        jobName: undefined,
        jobGroup: undefined,
        invokeTarget: undefined,
        cronExpression: undefined,
        misfirePolicy: 1,
        concurrent: 1,
        status: "0"
      };
      resetForm("form", this);
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.jobId);
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case "handleRun":
          this.handleRun(row);
          break;
        case "handleView":
          this.handleView(row);
          break;
        case "handleJobLog":
          this.handleJobLog(row);
          break;
        default:
          break;
      }
    },
    // 任务状态修改
    handleStatusChange(row) {
      if (!row) {
        return;
      }
      let text = row.status === "0" ? "启用" : "停用";
      const jobName = row.jobName || "";
      this.$modal
        .confirm('确认要"' + text + '""' + jobName + '"任务吗？')
        .then(function () {
          return changeJobStatus(row.jobId, row.status);
        })
        .then(() => {
          this.$modal.msgSuccess(text + "成功");
        })
        .catch(function () {
          if (row) {
            row.status = row.status === "0" ? "1" : "0";
          }
        });
    },
    /* 立即执行一次 */
    handleRun(row) {
      if (!row || !row.jobName) {
        return;
      }
      this.$modal
        .confirm('确认要立即执行一次"' + row.jobName + '"任务吗？')
        .then(function () {
          return runJob(row.jobId, row.jobGroup);
        })
        .then(() => {
          this.$modal.msgSuccess("执行成功");
        })
        .catch(() => {});
    },
    /** 任务详细信息 */
    handleView(row) {
      if (!row || !row.jobId) {
        return;
      }
      getJob(row.jobId)
        .then(response => {
          // 处理不同的响应数据格式
          if (response && response.data) {
            this.form = response.data || {};
          } else if (response && response.rows) {
            this.form = response.rows[0] || response || {};
          } else {
            this.form = response || {};
          }
          this.openView = true;
        })
        .catch(error => {
          console.error("获取任务详情失败:", error);
          this.$modal.msgError("获取任务详情失败");
        });
    },
    /** cron表达式按钮操作 */
    handleShowCron() {
      this.expression = this.form.cronExpression;
      this.openCron = true;
    },
    /** 确定后回传值 */
    crontabFill(value) {
      this.form.cronExpression = value;
    },
    /** 任务日志列表查询 */
    handleJobLog(row) {
      const jobId = row && row.jobId ? row.jobId : 0;
      this.$router.push("/monitor/job-log/index/" + jobId);
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加任务";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      if (!row && this.$refs.proTable) {
        const selectedList = this.$refs.proTable.selectedList;
        if (selectedList.length !== 1) {
          this.$modal.msgWarning("请选择一条数据");
          return;
        }
        row = selectedList[0];
      }
      if (!row) {
        return;
      }
      this.reset();
      const jobId = row.jobId;
      if (!jobId) {
        return;
      }
      getJob(jobId)
        .then(response => {
          // 处理不同的响应数据格式
          if (response && response.data) {
            this.form = response.data || {};
          } else if (response && response.rows) {
            this.form = response.rows[0] || response || {};
          } else {
            this.form = response || {};
          }
          this.open = true;
          this.title = "修改任务";
        })
        .catch(error => {
          console.error("获取任务详情失败:", error);
          this.$modal.msgError("获取任务详情失败");
        });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.jobId != undefined) {
            updateJob(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.$refs.proTable?.getTableList();
            });
          } else {
            addJob(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.$refs.proTable?.getTableList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      let jobIds;
      if (row && row.jobId) {
        jobIds = row.jobId;
      } else if (this.$refs.proTable && this.$refs.proTable.selectedListIds.length > 0) {
        jobIds = this.$refs.proTable.selectedListIds;
      } else {
        this.$modal.msgWarning("请选择要删除的数据");
        return;
      }
      if (!jobIds) {
        return;
      }
      this.$modal
        .confirm('是否确认删除定时任务编号为"' + jobIds + '"的数据项？')
        .then(() => {
          return delJob(jobIds);
        })
        .then(() => {
          this.$refs.proTable?.getTableList();
          this.$refs.proTable?.clearSelection();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const searchParam = this.$refs.proTable?.searchParam || {};
      this.download("monitor/job/export", searchParam, `job_${new Date().getTime()}`);
    }
  }
};
</script>
