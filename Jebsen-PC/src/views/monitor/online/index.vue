<template>
  <div class="app-container table-box">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :init-param="initParam"
      :data-callback="dataCallback"
      row-key="tokenId"
    >
      <!-- 登录时间 -->
      <template #loginTime="scope">
        <span>{{ parseTime(scope.row && scope.row.loginTime ? scope.row.loginTime : "") }}</span>
      </template>
      <!-- 操作 -->
      <template #operation="scope">
        <el-button
          size="small"
          type="primary"
          link
          @click="handleForceLogout(scope.row)"
          v-hasPermi="['monitor:online:forceLogout']"
        >
          <el-icon><Delete /></el-icon>
          强退
        </el-button>
      </template>
    </ProTable>
  </div>
</template>

<script>
import { list, forceLogout } from "@/api/modules/monitor/online";
import ProTable from "@/components/ProTable/index.vue";
import { parseTime } from "@/utils";
import { reactive, ref } from "vue";
import { Delete } from "@element-plus/icons-vue";

export default {
  name: "Online",
  components: {
    ProTable,
    Delete
  },
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
      { type: "index", label: "序号", width: 60 },
      { prop: "tokenId", label: "会话编号", showOverflowTooltip: true },
      {
        prop: "userName",
        label: "登录名称",
        search: { el: "input", props: { placeholder: "请输入客户名称" } }
      },
      { prop: "deptName", label: "部门名称" },
      {
        prop: "ipaddr",
        label: "主机",
        search: { el: "input", props: { placeholder: "请输入登录地址" } }
      },
      { prop: "loginLocation", label: "登录地点", showOverflowTooltip: true },
      { prop: "browser", label: "浏览器" },
      { prop: "os", label: "操作系统" },
      { prop: "loginTime", label: "登录时间", width: 180 },
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
  methods: {
    parseTime,
    /** 强退按钮操作 */
    handleForceLogout(row) {
      if (!row || !row.tokenId) {
        this.$modal.msgError("客户信息不完整");
        return;
      }
      this.$modal
        .confirm('是否确认强退名称为"' + (row.userName || "") + '"的客户？')
        .then(() => {
          return forceLogout(row.tokenId);
        })
        .then(() => {
          this.$refs.proTable?.getTableList();
          this.$modal.msgSuccess("强退成功");
        })
        .catch(() => {});
    }
  }
};
</script>
