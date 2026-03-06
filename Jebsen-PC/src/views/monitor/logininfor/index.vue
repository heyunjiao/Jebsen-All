<template>
  <div class="app-container">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :init-param="initParam"
      :data-callback="dataCallback"
      row-key="infoId"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button
          type="danger"
          plain
          size="small"
          :disabled="!scope.isSelected"
          @click="handleDelete"
          v-hasPermi="['monitor:logininfor:remove']"
        >
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
        <el-button type="danger" plain size="small" @click="handleClean" v-hasPermi="['monitor:logininfor:remove']">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
        <el-button
          type="primary"
          plain
          size="small"
          :disabled="scope.selectedListIds.length !== 1"
          @click="handleUnlock"
          v-hasPermi="['monitor:logininfor:unlock']"
        >
          <el-icon><Unlock /></el-icon>
          解锁
        </el-button>
        <el-button type="warning" plain size="small" @click="handleExport" v-hasPermi="['monitor:logininfor:export']">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </template>
      <!-- 登录状态 -->
      <template #status="scope">
        <dict-tag :options="dict?.type?.sys_common_status || []" :value="scope.row.status" />
      </template>
      <!-- 登录日期 -->
      <template #loginTime="scope">
        <span>{{ parseTime(scope.row && scope.row.loginTime ? scope.row.loginTime : "") }}</span>
      </template>
    </ProTable>
  </div>
</template>

<script>
import { list, delLogininfor, cleanLogininfor, unlockLogininfor } from "@/api/modules/monitor/logininfor";
import ProTable from "@/components/ProTable/index.vue";
import { parseTime } from "@/utils";
import { reactive, ref } from "vue";
import { Delete, Unlock, Download } from "@element-plus/icons-vue";

export default {
  name: "Logininfor",
  components: {
    ProTable,
    Delete,
    Unlock,
    Download
  },
  dicts: ["sys_common_status"],
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
      { type: "selection", fixed: "left", width: 55 },
      { prop: "infoId", label: "访问编号" },
      {
        prop: "userName",
        label: "客户名称",
        search: { el: "input", props: { placeholder: "请输入客户名称" } },
        sortable: "custom"
      },
      {
        prop: "ipaddr",
        label: "登录地址",
        width: 130,
        search: { el: "input", props: { placeholder: "请输入登录地址" } }
      },
      { prop: "loginLocation", label: "登录地点", showOverflowTooltip: true },
      { prop: "browser", label: "浏览器", showOverflowTooltip: true },
      { prop: "os", label: "操作系统" },
      {
        prop: "status",
        label: "登录状态",
        search: {
          el: "select",
          props: { placeholder: "登录状态" },
          enum: () => Promise.resolve({ data: [] })
        }
      },
      { prop: "msg", label: "操作信息", showOverflowTooltip: true },
      {
        prop: "loginTime",
        label: "登录日期",
        width: 180,
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
      }
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
      // 选择客户名
      selectName: ""
    };
  },
  methods: {
    parseTime,
    /** 删除按钮操作 */
    handleDelete() {
      const infoIds = this.$refs.proTable?.selectedListIds || [];
      if (!infoIds.length) {
        this.$modal.msgWarning("请选择要删除的数据");
        return;
      }
      this.$modal
        .confirm('是否确认删除访问编号为"' + infoIds + '"的数据项？')
        .then(() => {
          return delLogininfor(infoIds);
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
        .confirm("是否确认清空所有登录日志数据项？")
        .then(() => {
          return cleanLogininfor();
        })
        .then(() => {
          this.$refs.proTable?.getTableList();
          this.$modal.msgSuccess("清空成功");
        })
        .catch(() => {});
    },
    /** 解锁按钮操作 */
    handleUnlock() {
      const selectedList = this.$refs.proTable?.selectedList || [];
      if (selectedList.length !== 1) {
        this.$modal.msgWarning("请选择一条数据");
        return;
      }
      const username = selectedList[0].userName;
      this.$modal
        .confirm('是否确认解锁客户"' + username + '"数据项?')
        .then(() => {
          return unlockLogininfor(username);
        })
        .then(() => {
          this.$modal.msgSuccess("客户" + username + "解锁成功");
        })
        .catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const searchParam = this.$refs.proTable?.searchParam || {};
      this.download("monitor/logininfor/export", searchParam, `logininfor_${new Date().getTime()}.xlsx`);
    },
    download(url, params, filename) {
      const { useDownload } = require("@/hooks/useDownload");
      const http = require("@/api").default;
      useDownload(params => http.download(url, params), filename, params);
    }
  }
};
</script>
