<template>
  <el-card shadow="hover" class="lifecycle-card" :class="{ active: isActive }">
    <!-- Header -->
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <el-icon :size="20" :color="iconColor">
            <component :is="icon" />
          </el-icon>
          <div class="title-wrap">
            <span class="card-title">{{ title }}</span>
            <span v-if="subtitle" class="card-subtitle">{{ subtitle }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Body -->
    <div class="card-body">
      <div class="core-number">{{ totalCount.toLocaleString() }}</div>
      <div class="sub-label">总数</div>

      <div class="time-monitor">
        <div class="monitor-item">
          <span class="monitor-label">已推送：</span>
          <span class="monitor-value pushed">{{ pushedCount }}条</span>
        </div>
        <div class="monitor-item">
          <span class="monitor-label">已成交数：</span>
          <span class="monitor-value completed">{{ completedCount }}条</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="card-footer">
      <el-button type="primary" size="small" @click.stop="handleViewDetail"> 查看详情 </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  title: string;
  subtitle?: string;
  icon: any;
  iconColor: string;
  totalCount: number;
  todayNew: number;
  latestTime: string;
  pushedCount: number;
  completedCount: number;
  category: string;
  isActive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: "",
  isActive: false
});

const emit = defineEmits<{
  viewDetail: [category: string];
}>();

const handleViewDetail = (e?: Event) => {
  e?.stopPropagation();
  emit("viewDetail", props.category);
};
</script>

<style scoped lang="scss">
.lifecycle-card {
  transition: all 0.3s;
  cursor: pointer;
  height: 100%;

  &.active {
    border-color: var(--el-color-primary);
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .el-icon {
        color: v-bind(iconColor);
        font-size: 18px;
      }

      .title-wrap {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .card-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .card-subtitle {
        font-size: 11px;
        color: var(--el-text-color-secondary);
        font-weight: normal;
        opacity: 0.85;
      }
    }

  }

  .card-body {
    padding: 16px 0;
    text-align: center;

    .core-number {
      font-size: 28px;
      font-weight: bold;
      color: var(--el-text-color-primary);
      line-height: 1.2;
      margin-bottom: 6px;
    }

    .sub-label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-bottom: 16px;
    }

    .time-monitor {
      text-align: left;
      padding-top: 12px;
      border-top: 1px solid var(--el-border-color-lighter);

      .monitor-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        font-size: 12px;

        .monitor-label {
          color: var(--el-text-color-regular);
        }

        .monitor-value {
          color: var(--el-text-color-secondary);

          &.pushed {
            color: var(--el-color-primary);
            font-weight: 600;
          }

          &.completed {
            color: var(--el-color-success);
            font-weight: 600;
          }
        }
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-lighter);

    :deep(.el-button--small) {
      padding: 5px 12px;
      font-size: 12px;
    }
  }
}
</style>
