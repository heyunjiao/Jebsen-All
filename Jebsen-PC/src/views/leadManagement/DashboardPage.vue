<template>
  <div class="lead-dashboard-container">
    <section class="section-card">
      <div class="dashboard-content">
        <div class="dashboard-section">
          <header class="section-title">
            <span>价值分层</span>
          </header>
          <DashboardValue :date-range="dateRange" @refresh="handleRefresh" @navigate="handleNavigate" />
        </div>

        <div class="dashboard-section">
          <header class="section-title">
            <span>生命周期监控</span>
          </header>
          <DashboardLifecycle :date-range="dateRange" @refresh="handleRefresh" @navigate="handleNavigate" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts" name="LeadManagementDashboard">
import { ref } from "vue";
import { useRouter } from "vue-router";
import DashboardLifecycle from "./components/DashboardLifecycle.vue";
import DashboardValue from "./components/DashboardValue.vue";

const router = useRouter();
const dateRange = ref<string[] | undefined>(undefined);

const handleRefresh = () => {
  // 触发子组件刷新
};

/**
 * 处理导航跳转
 * @param tab - 目标页面标识
 * @param filters - 过滤条件对象，可包含：
 *   - category: 分类（如 diamond, gold, silver 等）
 *   - startDate: 开始日期（YYYY-MM-DD）
 *   - endDate: 结束日期（YYYY-MM-DD）
 *   - status: 状态
 *   - pushTarget: 推送目标
 *   - oneId: OneID
 */
const handleNavigate = (tab: string, filters?: Record<string, any>) => {
  const routeMap: Record<string, string> = {
    list: "leadManagementList",
    rule: "leadManagementRule",
    audit: "leadManagementAudit",
    overview: "leadManagementOverview"
  };

  const name = routeMap[tab];
  if (!name) return;

  router.push({
    name,
    query: filters ? { ...filters } : undefined
  });
};
</script>

<style scoped lang="scss">
.lead-dashboard-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.dashboard-section {
  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &:last-child {
    .section-title {
      border-bottom: none;
    }
  }
}
</style>
