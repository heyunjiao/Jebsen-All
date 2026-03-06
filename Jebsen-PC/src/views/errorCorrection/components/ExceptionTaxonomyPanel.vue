<template>
  <el-card shadow="hover" class="exception-taxonomy-panel">
    <template #header>
      <div class="card-header">
        <div class="card-title">
          <el-icon :size="20" :color="'#409EFF'"><Document /></el-icon>
          <span>{{ t("errorCorrection.taxonomy.title") }}</span>
        </div>
        <div class="card-description">{{ t("errorCorrection.taxonomy.description") }}</div>
      </div>
    </template>

    <div class="taxonomy-content">
      <div v-for="category in categories" :key="category.code" class="category-item" :style="{ borderLeftColor: category.color }">
        <!-- 大类标题 -->
        <div class="category-header">
          <div class="category-title">
            <el-icon :size="18" :color="category.color">
              <component :is="getIconComponent(category.icon)" />
            </el-icon>
            <span class="category-name">{{ t(category.nameKey) }}</span>
            <el-tag :color="category.color" effect="dark" size="small" class="category-tag">
              {{ category.code.toUpperCase().charAt(0) }}
            </el-tag>
          </div>
          <div class="category-description">{{ t(category.descriptionKey) }}</div>
        </div>

        <!-- 细分类型列表 -->
        <div class="sub-types-list">
          <div v-for="subType in category.subTypes" :key="subType.code" class="sub-type-item">
            <div class="sub-type-header">
              <el-icon :size="16" :color="subType.color" class="sub-type-icon">
                <component :is="getIconComponent(subType.icon)" />
              </el-icon>
              <span class="sub-type-name">{{ t(subType.nameKey) }}</span>
            </div>
            <div class="sub-type-description">{{ t(subType.descriptionKey) }}</div>
            <div class="sub-type-example">
              <el-text type="info" size="small">
                <el-icon :size="12"><InfoFilled /></el-icon>
                {{ t("errorCorrection.taxonomy.example") }}: {{ t(subType.exampleKey) }}
              </el-text>
            </div>
            <div class="sub-type-actions">
              <div class="actions-label">{{ t("errorCorrection.taxonomy.actionsLabel") }}:</div>
              <div class="actions-tags">
                <el-tag
                  v-for="action in subType.actions"
                  :key="action"
                  :type="getActionTagType(action)"
                  size="small"
                  effect="plain"
                  class="action-tag"
                >
                  {{ t(ACTION_LABELS[action]) }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  Document,
  Warning,
  CopyDocument,
  DocumentDelete,
  CircleCheck,
  Lock,
  InfoFilled,
  Connection,
  CloseBold,
  Link,
  QuestionFilled,
  Refresh,
  Switch
} from "@element-plus/icons-vue";
import { getAllCategories, ACTION_LABELS, type ExceptionCategoryConfig } from "@/views/errorCorrection/utils/exceptionTaxonomy";

const { t } = useI18n();

const categories = computed(() => getAllCategories());

// 图标组件映射
const iconMap: Record<string, any> = {
  Warning,
  Document,
  CopyDocument,
  DocumentDelete,
  CircleCheck,
  Lock,
  Connection,
  CloseBold,
  Link,
  QuestionFilled,
  Refresh,
  Switch
};

const getIconComponent = (iconName?: string) => {
  if (!iconName) return Document;
  return iconMap[iconName] || Document;
};

// 根据动作类型返回对应的 tag type
const getActionTagType = (action: string): "success" | "warning" | "danger" | "info" => {
  const typeMap: Record<string, "success" | "warning" | "danger" | "info"> = {
    clean: "info",
    edit: "info",
    correct: "warning",
    empty: "warning",
    map: "info",
    merge: "success",
    override: "warning",
    discard: "danger",
    supplement: "info",
    archive: "info",
    associate: "info",
    trust_choice: "warning",
    trust_source: "warning",
    freeze: "danger"
  };
  return typeMap[action] || "info";
};
</script>

<style scoped lang="scss">
.exception-taxonomy-panel {
  margin-bottom: 16px;
  border-radius: 8px;

  :deep(.el-card__header) {
    padding: 20px 24px;
    border-bottom: 1px solid #ebeef5;
    background: #fafafa;
  }

  :deep(.el-card__body) {
    padding: 24px;
  }

  .card-header {
    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }

    .card-description {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
    }
  }

  .taxonomy-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .category-item {
    border-left: 4px solid;
    padding-left: 20px;
    background: #fafbfc;
    border-radius: 6px;
    padding: 20px;
    transition: all 0.3s ease;

    &:hover {
      background: #f5f7fa;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
  }

  .category-header {
    margin-bottom: 16px;

    .category-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .category-name {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      .category-tag {
        margin-left: 8px;
        font-weight: 600;
        font-size: 11px;
        padding: 2px 8px;
        height: 20px;
        line-height: 16px;
      }
    }

    .category-description {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
      padding-left: 26px;
    }
  }

  .sub-types-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-left: 26px;
  }

  .sub-type-item {
    background: #ffffff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    padding: 16px;
    transition: all 0.2s ease;

    &:hover {
      border-color: #c0c4cc;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
    }
  }

  .sub-type-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .sub-type-icon {
      flex-shrink: 0;
    }

    .sub-type-name {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
    }
  }

  .sub-type-description {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
    margin-bottom: 8px;
  }

  .sub-type-example {
    margin-bottom: 12px;
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 4px;
    border-left: 3px solid #409eff;

    .el-text {
      display: flex;
      align-items: center;
      gap: 6px;
      line-height: 1.6;
    }
  }

  .sub-type-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding-top: 12px;
    border-top: 1px dashed #e4e7ed;

    .actions-label {
      font-size: 13px;
      color: #909399;
      font-weight: 500;
      white-space: nowrap;
    }

    .actions-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;

      .action-tag {
        font-size: 12px;
        height: 24px;
        line-height: 22px;
        padding: 0 10px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .exception-taxonomy-panel {
    .sub-types-list {
      padding-left: 16px;
    }

    .category-header .category-description {
      padding-left: 0;
    }
  }
}
</style>
