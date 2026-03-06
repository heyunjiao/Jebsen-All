<template>
  <el-card shadow="hover" class="value-tier-card">
    <!-- Header -->
    <div class="card-header">
      <div class="header-icon" :style="{ backgroundColor: bgColor }">
        <span class="icon-emoji">{{ emoji }}</span>
      </div>
      <div class="header-info">
        <div class="card-title">{{ title }}</div>
        <el-badge :value="todayNew" :max="99" class="header-badge">
          <span class="badge-text clickable" @click.stop="handleTodayNewClick">今日新增</span>
        </el-badge>
      </div>
    </div>

    <!-- Body -->
    <div class="card-body">
      <div class="core-number">{{ totalCount.toLocaleString() }}</div>
      <div class="sub-label">OneID 总数</div>

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
interface Props {
  title: string;
  emoji: string;
  bgColor: string;
  totalCount: number;
  todayNew: number;
  latestTime: string;
  pushedCount: number;
  completedCount: number;
  category: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  viewDetail: [category: string];
  todayNew: [category: string];
}>();

const handleViewDetail = (e?: Event) => {
  e?.stopPropagation();
  emit("viewDetail", props.category);
};

const handleTodayNewClick = (e?: Event) => {
  e?.stopPropagation();
  if (props.todayNew > 0) {
    emit("todayNew", props.category);
  }
};
</script>

<style scoped lang="scss">
.value-tier-card {
  transition: all 0.3s;
  cursor: pointer;
  height: 100%;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;

    .header-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: v-bind(bgColor);

      .icon-emoji {
        font-size: 20px;
      }
    }

    .header-info {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .header-badge {
        .badge-text {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-right: 4px;

          &.clickable {
            cursor: pointer;
            color: var(--el-color-primary);
            transition: color 0.3s;

            &:hover {
              color: var(--el-color-primary-light-3);
              text-decoration: underline;
            }
          }
        }
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
