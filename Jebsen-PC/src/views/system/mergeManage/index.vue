<template>
  <div class="rule-config-container">
    <el-card shadow="hover" class="tip-card">
      <div class="tip-title">合并规则 & 置信度阈值</div>
      <div class="tip-desc">
        自动匹配规则若置信度 <strong>{{ autoPassThreshold }}%</strong>，系统将进入人工审核以防止误合并。
        在这里可以调整各条规则的阈值、启用状态，并查看最近操作人。
      </div>
      <div class="tip-note">
        <el-icon style="margin-right: 4px; color: #909399"><InfoFilled /></el-icon>
        <span>系统免检阈值计算规则：从所有启用的规则中获取最小阈值作为系统免检阈值；如果没有启用的规则，默认使用 95%。</span>
      </div>
      <div class="tip-actions">
        <div class="threshold-legend">
          <div class="legend-item">
            <span class="legend-label">阈值 < {{ autoPassThreshold }}%</span>
            <el-tag type="warning" size="small" class="legend-tag">需人工复核</el-tag>
          </div>
          <div class="legend-item">
            <span class="legend-label">≥ {{ autoPassThreshold }}%</span>
            <el-tag type="success" size="small" class="legend-tag">自动通过</el-tag>
          </div>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="table-header">
          <div class="title">
            <el-icon><Setting /></el-icon>
            <span>合并规则配置</span>
          </div>
          <div class="desc">调整阈值后立即生效，建议先在测试环境验证</div>
        </div>
      </template>

      <ProTable
        ref="tableRef"
        row-key="id"
        :columns="columns"
        :request-api="fetchRuleList"
        :tool-button="['refresh', 'setting', 'search']"
      />
    </el-card>
  </div>
</template>

<script setup lang="tsx" name="systemRuleConfig">
import { reactive, ref, nextTick, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Setting, Check, Close, InfoFilled } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import { getRuleList, saveRuleConfig, toggleRuleStatus, type RuleItem } from "@/api/modules/approval";

const tableRef = ref<ProTableInstance>();
const allRules = ref<RuleItem[]>([]); // 存储所有规则数据

// 计算免检阈值（取所有启用规则中的最小阈值，如果没有则使用默认值95）
const autoPassThreshold = computed(() => {
  const enabledRules = allRules.value.filter(rule => rule.enabled);
  if (enabledRules.length === 0) return 95;
  const minThreshold = Math.min(...enabledRules.map(rule => rule.savedThreshold ?? rule.threshold));
  return minThreshold;
});

const columns = reactive<ColumnProps<RuleItem>[]>([
  {
    prop: "ruleName",
    label: "规则名称",
    width: 180,
    search: {
      el: "input",
      props: { placeholder: "搜索规则名称" }
    }
  },
  {
    prop: "desc",
    label: "规则描述",
    minWidth: 240
  },
  {
    prop: "threshold",
    label: "置信度阈值",
    width: 220,
    render: scope => {
      const onChange = (val: number | null) => {
        if (val !== null) {
          scope.row.threshold = val;
        }
      };
      // 使用已保存的阈值来显示标签状态，如果没有则使用当前阈值
      const savedThreshold = scope.row.savedThreshold ?? scope.row.threshold;
      const isAutoPass = savedThreshold >= 95;
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
          <el-input-number
            modelValue={scope.row.threshold}
            onUpdate:modelValue={onChange}
            min={50}
            max={100}
            step={1}
            size="small"
          />
          <el-tag size="small" type={isAutoPass ? "success" : "warning"}>
            {isAutoPass ? `≥${savedThreshold} 自动通过` : `<${savedThreshold} 需审核`}
          </el-tag>
        </div>
      );
    }
  },
  {
    prop: "enabled",
    label: "是否启用",
    width: 120,
    enum: [
      { label: "启用", value: true, tagType: "success" },
      { label: "停用", value: false, tagType: "danger" }
    ],
    tag: true,
    search: {
      el: "select",
      props: { placeholder: "选择状态" }
    }
  },
  {
    prop: "lastUpdate",
    label: "最近更新",
    width: 170
  },
  {
    prop: "operator",
    label: "操作人",
    width: 120
  },
  {
    prop: "operation",
    label: "操作",
    width: 200,
    fixed: "right",
    render: scope => (
      <div style="display: flex; gap: 8px;">
        <el-button type="primary" size="small" icon={Check} onClick={() => saveRule(scope.row)}>
          保存
        </el-button>
        <el-button
          type={scope.row.enabled ? "danger" : "success"}
          size="small"
          icon={scope.row.enabled ? Close : Check}
          onClick={() => toggleRule(scope.row)}
        >
          {scope.row.enabled ? "停用" : "启用"}
        </el-button>
      </div>
    )
  }
]);

// 获取规则列表
const fetchRuleList = async (params: any) => {
  try {
    const { pageNum = 1, pageSize = 10, ruleName, enabled } = params;

    // 调用API（不传筛选条件，获取所有数据用于计算阈值）
    const res = await getRuleList({});

    if (res.code === 200 && res.data) {
      // 保存所有规则数据用于计算阈值
      allRules.value = res.data.list || [];

      // 应用筛选条件
      let filteredList = [...allRules.value];
      if (ruleName) {
        filteredList = filteredList.filter(item => item.ruleName.includes(ruleName));
      }
      if (enabled !== undefined && enabled !== "" && enabled !== null) {
        filteredList = filteredList.filter(item => item.enabled === (enabled === true || enabled === "true"));
      }

      // 分页处理
      const start = (pageNum - 1) * pageSize;
      const end = pageNum * pageSize;
      const pageList = filteredList.slice(start, end);

      return Promise.resolve({
        data: {
          list: pageList,
          total: filteredList.length
        }
      });
    }

    return Promise.resolve({
      data: {
        list: [],
        total: 0
      }
    });
  } catch (error) {
    console.error("加载规则列表失败:", error);
    return Promise.resolve({
      data: {
        list: [],
        total: 0
      }
    });
  }
};

// 保存阈值调整
const saveRule = async (row: RuleItem) => {
  try {
    await ElMessageBox.confirm(`确认将「${row.ruleName}」阈值调整为 ${row.threshold}% ？`, "保存配置", {
      confirmButtonText: "保存",
      cancelButtonText: "取消",
      type: "warning"
    });

    // 调用API保存
    const res = await saveRuleConfig(row.id, row.threshold);

    if (res.code === 200) {
      // 保存成功后，更新已保存的阈值，这样标签才会更新
      row.savedThreshold = row.threshold;
      // 立即更新当前行的数据，让客户看到变化
      row.lastUpdate = new Date().toISOString().slice(0, 16).replace("T", " ");
      row.operator = "当前客户";

      ElMessage.success("已保存，配置将同步到实时策略。");

      // 强制刷新表格，确保显示最新数据
      await nextTick();
      if (tableRef.value) {
        // 使用 search 方法重新触发请求，这样可以保留当前的搜索条件
        tableRef.value.search();
      }
    } else {
      ElMessage.error(res.msg || "保存失败");
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("保存规则失败:", error);
      ElMessage.error("保存失败，请重试");
    }
  }
};

// 启用/停用规则
const toggleRule = async (row: RuleItem) => {
  try {
    const action = row.enabled ? "停用" : "启用";
    await ElMessageBox.confirm(`确认${action}「${row.ruleName}」？`, "规则状态变更", {
      confirmButtonText: action,
      cancelButtonText: "取消",
      type: "warning"
    });

    // 调用API切换状态
    const res = await toggleRuleStatus(row.id, !row.enabled);

    if (res.code === 200) {
      // 立即更新当前行的数据，让客户看到变化
      row.enabled = !row.enabled;
      row.lastUpdate = new Date().toISOString().slice(0, 16).replace("T", " ");
      row.operator = "当前客户";

      ElMessage.success(`${action}成功`);

      // 强制刷新表格，确保显示最新数据
      await nextTick();
      if (tableRef.value) {
        // 使用 search 方法重新触发请求，这样可以保留当前的搜索条件
        tableRef.value.search();
      }
    } else {
      ElMessage.error(res.msg || `${action}失败`);
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("切换规则状态失败:", error);
      ElMessage.error("操作失败，请重试");
    }
  }
};
</script>

<style scoped lang="scss">
.rule-config-container {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 100px);
}

.tip-card {
  margin-bottom: 16px;
}

.tip-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.tip-desc {
  color: #606266;
  line-height: 20px;
}

.tip-note {
  margin-top: 10px;
  padding: 8px 12px;
  background: #f0f9ff;
  border-left: 3px solid #409eff;
  border-radius: 4px;
  color: #606266;
  font-size: 13px;
  line-height: 20px;
  display: flex;
  align-items: flex-start;

  .el-icon {
    margin-top: 2px;
    flex-shrink: 0;
  }

  span {
    flex: 1;
  }
}

.tip-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.threshold-legend {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-label {
  color: #606266;
  font-size: 13px;
  font-weight: 500;
  min-width: 70px;
}

.legend-tag {
  font-weight: 500;
}

.table-card {
  margin-top: 12px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header .title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.table-header .desc {
  color: #909399;
  font-size: 13px;
}
</style>
