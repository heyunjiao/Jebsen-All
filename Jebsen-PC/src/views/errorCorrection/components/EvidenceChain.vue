<template>
  <div class="evidence-chain">
    <el-card shadow="never" class="evidence-card">
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          <span>交互证据链</span>
        </div>
      </template>
      <el-tabs v-model="activeTab" class="evidence-tabs">
        <el-tab-pane label="BDC通话记录" name="BDC外呼系统">
          <div class="evidence-list">
            <div v-for="(item, idx) in bdcRecords" :key="idx" class="evidence-item">
              <div class="evidence-time">{{ item.time }}</div>
              <div class="evidence-content">
                <div class="evidence-title">{{ item.title }}</div>
                <div class="evidence-desc">{{ item.description }}</div>
                <div class="evidence-meta">
                  <el-tag size="small" type="info">{{ item.duration }}</el-tag>
                  <span class="meta-text">通话人：{{ item.operator }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="企微聊天记录" name="wechat">
          <div class="evidence-list">
            <div v-for="(item, idx) in wechatRecords" :key="idx" class="evidence-item">
              <div class="evidence-time">{{ item.time }}</div>
              <div class="evidence-content">
                <div class="evidence-title">{{ item.title }}</div>
                <div class="evidence-desc">{{ item.description }}</div>
                <div class="evidence-meta">
                  <el-tag size="small" type="success">微信</el-tag>
                  <span class="meta-text">BDC：{{ item.operator }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="到店记录" name="visit">
          <div class="evidence-list">
            <div v-for="(item, idx) in visitRecords" :key="idx" class="evidence-item">
              <div class="evidence-time">{{ item.time }}</div>
              <div class="evidence-content">
                <div class="evidence-title">{{ item.title }}</div>
                <div class="evidence-desc">{{ item.description }}</div>
                <div class="evidence-meta">
                  <el-tag size="small" type="warning">到店</el-tag>
                  <span class="meta-text">SA：{{ item.operator }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Document } from "@element-plus/icons-vue";

export interface EvidenceRecord {
  time: string;
  title: string;
  description: string;
  operator: string;
  duration?: string;
}

interface Props {
  bdcRecords?: EvidenceRecord[];
  wechatRecords?: EvidenceRecord[];
  visitRecords?: EvidenceRecord[];
}

const props = withDefaults(defineProps<Props>(), {
  bdcRecords: () => [],
  wechatRecords: () => [],
  visitRecords: () => []
});

const activeTab = ref("BDC外呼系统");
</script>

<style scoped lang="scss">
.evidence-chain {
  .evidence-card {
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }
  }

  .evidence-tabs {
    :deep(.el-tabs__content) {
      max-height: 300px;
      overflow-y: auto;
    }
  }

  .evidence-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .evidence-item {
    padding: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
    border-left: 3px solid var(--el-color-primary);
    position: relative;
  }

  .evidence-time {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 6px;
  }

  .evidence-content {
    .evidence-title {
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--el-text-color-primary);
    }

    .evidence-desc {
      font-size: 13px;
      color: var(--el-text-color-regular);
      margin-bottom: 8px;
      line-height: 1.5;
    }

    .evidence-meta {
      display: flex;
      align-items: center;
      gap: 8px;

      .meta-text {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}
</style>
