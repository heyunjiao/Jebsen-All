<template>
  <div class="table-box notice-manage">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getTableList"
      :data-callback="dataCallback"
      row-key="noticeId"
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
      </template>
      <!-- 公告类型列 -->
      <template #noticeType="scope">
        <el-tag :type="scope.row.noticeType === '1' ? 'success' : scope.row.noticeType === '2' ? 'warning' : 'info'">
          {{ scope.row.noticeType === "1" ? "通知" : scope.row.noticeType === "2" ? "公告" : "其他" }}
        </el-tag>
      </template>
      <!-- 状态列 -->
      <template #status="scope">
        <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">
          {{ scope.row.status === "0" ? "正常" : "关闭" }}
        </el-tag>
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-button type="primary" link :icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
        <el-button type="primary" link :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
      </template>
    </ProTable>

    <!-- 添加或修改公告对话框 -->
    <el-dialog :title="title" v-model="open" width="780px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="公告标题" prop="noticeTitle">
              <el-input v-model="form.noticeTitle" placeholder="请输入公告标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公告类型" prop="noticeType">
              <el-select v-model="form.noticeType" placeholder="请选择公告类型" style="width: 100%">
                <el-option label="通知" value="1" />
                <el-option label="公告" value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio value="0">正常</el-radio>
                <el-radio value="1">关闭</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="内容">
              <WangEditor v-model="form.noticeContent" height="300px" />
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
  </div>
</template>

<script setup lang="tsx" name="noticeManage">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Edit, Delete } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import WangEditor from "@/components/WangEditor/index.vue";
import { listNotice, getNotice, addNotice, updateNotice, delNotice } from "@/api/system/notice";

const noticeTypeOptions = [
  { label: "通知", value: "1" },
  { label: "公告", value: "2" }
];

const statusOptions = [
  { label: "正常", value: "0" },
  { label: "关闭", value: "1" }
];

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 响应式数据
const title = ref("");
const open = ref(false);
const formRef = ref();

const form = reactive({
  noticeId: undefined,
  noticeTitle: undefined,
  noticeType: undefined,
  noticeContent: undefined,
  status: "0"
});

const rules = {
  noticeTitle: [{ required: true, message: "公告标题不能为空", trigger: "blur" }],
  noticeType: [{ required: true, message: "公告类型不能为空", trigger: "change" }]
};

// 表格配置项
const columns = reactive<ColumnProps[]>([
  { type: "selection", fixed: "left", width: 50 },
  {
    prop: "noticeId",
    label: "序号",
    width: 100,
    align: "center"
  },
  {
    prop: "noticeTitle",
    label: "公告标题",
    minWidth: 200,
    align: "center",
    search: { el: "input", props: { placeholder: "请输入公告标题" } }
  },
  {
    prop: "noticeType",
    label: "公告类型",
    width: 120,
    align: "center",
    enum: noticeTypeOptions,
    search: { el: "select", props: { placeholder: "公告类型", clearable: true } },
    fieldNames: { label: "label", value: "value" }
  },
  {
    prop: "status",
    label: "状态",
    width: 100,
    align: "center",
    enum: statusOptions,
    search: { el: "select", props: { placeholder: "状态", clearable: true } },
    fieldNames: { label: "label", value: "value" }
  },
  {
    prop: "createBy",
    label: "创建者",
    width: 120,
    align: "center",
    search: { el: "input", props: { placeholder: "请输入操作人员" } }
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
  // 参考 dictManage 的写法
  return {
    list: data.list || data.rows || data,
    total: data.total || data.length
  };
};

// 请求表格数据
const getTableList = (params: any) => {
  return listNotice(params).then((res: any) => {
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
    noticeId: undefined,
    noticeTitle: undefined,
    noticeType: undefined,
    noticeContent: undefined,
    status: "0"
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
  title.value = "添加公告";
};

// 修改按钮操作
const handleUpdate = async (row?: any) => {
  reset();
  const noticeId = row?.noticeId || (proTable.value?.selectedListIds && proTable.value.selectedListIds[0]);
  if (!noticeId) {
    ElMessage.warning("请选择要修改的公告");
    return;
  }
  try {
    const res = await getNotice(noticeId);
    if (res.data) {
      Object.assign(form, res.data);
    }
    open.value = true;
    title.value = "修改公告";
  } catch (error) {
    console.error("获取公告详情失败:", error);
  }
};

// 提交按钮
const submitForm = () => {
  if (formRef.value) {
    formRef.value.validate(async (valid: boolean) => {
      if (valid) {
        try {
          if (form.noticeId != undefined) {
            await updateNotice(form);
            ElMessage.success("修改成功");
          } else {
            await addNotice(form);
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
  const noticeIds = row?.noticeId || proTable.value?.selectedListIds;
  if (!noticeIds || (Array.isArray(noticeIds) && noticeIds.length === 0)) {
    ElMessage.warning("请选择要删除的公告");
    return;
  }
  ElMessageBox.confirm(
    `是否确认删除公告编号为"${Array.isArray(noticeIds) ? noticeIds.join(",") : noticeIds}"的数据项？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(async () => {
      try {
        const idsToDelete = Array.isArray(noticeIds) ? noticeIds : [noticeIds];
        for (const id of idsToDelete) {
          await delNotice(id);
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
