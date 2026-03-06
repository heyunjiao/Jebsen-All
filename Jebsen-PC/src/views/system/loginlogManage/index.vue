<template>
  <div class="table-box loginlog-manage">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :data-callback="dataCallback"
      row-key="infoId"
      @search="handleSearch"
      @reset="handleReset"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button type="danger" plain :icon="Delete" :disabled="!scope.isSelected" @click="handleDelete()">删除</el-button>
        <el-button type="danger" plain :icon="Delete" @click="handleClean">清空</el-button>
        <el-button
          type="primary"
          plain
          :icon="Unlock"
          :disabled="!scope.isSelected || scope.selectedListIds.length !== 1"
          @click="handleUnlock()"
        >
          解锁
        </el-button>
        <el-button type="warning" plain :icon="Download" @click="handleExport">导出</el-button>
      </template>
      <!-- 登录状态列 -->
      <template #status="scope">
        <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">
          {{ scope.row.status === "0" ? "成功" : "失败" }}
        </el-tag>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="tsx">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Download, Unlock } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { listLogininfor, delLogininfor, cleanLogininfor, unlockLogininfor } from "@/api/monitor/logininfor";

const statusOptions = [
  { label: "成功", value: "0" },
  { label: "失败", value: "1" }
];

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 响应式数据
const formRef = ref();

// 表格配置项
const columns = reactive<ColumnProps[]>([
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "#", width: 80 },
  {
    prop: "infoId",
    label: "访问编号",
    width: 100,
    align: "center"
  },
  {
    prop: "userName",
    label: "客户名称",
    width: 120,
    align: "center",
    search: { el: "input", props: { placeholder: "请输入客户名称" } }
  },
  {
    prop: "ipaddr",
    label: "登录地址",
    width: 130,
    align: "center",
    search: { el: "input", props: { placeholder: "请输入登录地址" } }
  },
  {
    prop: "loginLocation",
    label: "登录地点",
    minWidth: 150,
    align: "center"
  },
  {
    prop: "browser",
    label: "浏览器",
    minWidth: 150,
    align: "center"
  },
  {
    prop: "os",
    label: "操作系统",
    minWidth: 150,
    align: "center"
  },
  {
    prop: "status",
    label: "登录状态",
    width: 120,
    align: "center",
    enum: statusOptions,
    search: { el: "select", props: { placeholder: "登录状态", clearable: true } },
    fieldNames: { label: "label", value: "value" }
  },
  {
    prop: "msg",
    label: "操作信息",
    minWidth: 200,
    align: "center"
  },
  {
    prop: "loginTime",
    label: "登录日期",
    width: 180,
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
  return listLogininfor(params).then((res: any) => {
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

// 删除按钮操作
const handleDelete = (row?: any) => {
  const infoIds = row?.infoId || proTable.value?.selectedListIds;
  if (!infoIds || (Array.isArray(infoIds) && infoIds.length === 0)) {
    ElMessage.warning("请选择要删除的日志");
    return;
  }
  ElMessageBox.confirm(`是否确认删除访问编号为"${Array.isArray(infoIds) ? infoIds.join(",") : infoIds}"的数据项？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        const idsToDelete = Array.isArray(infoIds) ? infoIds : [infoIds];
        for (const id of idsToDelete) {
          await delLogininfor(id);
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

// 清空按钮操作
const handleClean = () => {
  ElMessageBox.confirm("是否确认清空所有登录日志数据项？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        await cleanLogininfor();
        ElMessage.success("清空成功");
        proTable.value?.getTableList();
      } catch (error) {
        console.error("清空失败:", error);
      }
    })
    .catch(() => {
      // 客户取消清空
    });
};

// 解锁按钮操作
const handleUnlock = async () => {
  const selectedList = proTable.value?.selectedList || [];
  if (!selectedList || selectedList.length !== 1) {
    ElMessage.warning("请选择要解锁的客户");
    return;
  }
  const userName = selectedList[0].userName;
  ElMessageBox.confirm(`是否确认解锁客户"${userName}"数据项?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        await unlockLogininfor(userName);
        ElMessage.success(`客户${userName}解锁成功`);
        proTable.value?.getTableList();
        proTable.value?.clearSelection();
      } catch (error) {
        console.error("解锁失败:", error);
      }
    })
    .catch(() => {
      // 客户取消解锁
    });
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
