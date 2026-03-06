<template>
  <div class="lineage-trace">
    <el-card shadow="hover" class="trace-card">
      <template #header>
        <div class="card-header">
          <el-icon><Connection /></el-icon>
          <span>身份血缘溯源</span>
          <span class="header-count">共 {{ lineageData.length }} 个源系统</span>
        </div>
      </template>
      <div class="trace-content">
        <div class="trace-item" v-for="(item, idx) in lineageData" :key="idx">
          <!-- 系统头部信息 -->
          <div class="trace-header">
            <el-tag :type="getSystemTagType(item.system) as any" size="small">{{ item.system }}</el-tag>
            <span class="trace-id">{{ item.systemId }}</span>
            <el-tag v-if="item.isPrimary" type="success" size="small">主记录</el-tag>
          </div>

          <!-- 字段信息 -->
          <div class="fields-info">
            <template v-if="item.fields && item.fields.length > 0">
              <div v-for="(field, fIdx) in getMainFields(item.fields)" :key="fIdx" class="field-item">
                <span class="field-label">{{ field.label }}：</span>
                <span class="field-value">{{ field.value || "-" }}</span>
                <el-tag v-if="field.isPrimary" type="warning" size="small" class="ml-4">主值</el-tag>
                <el-tag v-if="field.isConflict" type="danger" size="small" class="ml-4">冲突</el-tag>
              </div>
            </template>
            <template v-else-if="item.contactInfo && item.contactInfo.length > 0">
              <div v-for="(contact, cIdx) in item.contactInfo" :key="cIdx" class="field-item">
                <span class="field-label">{{ contact.label }}：</span>
                <span class="field-value">{{ contact.value }}</span>
                <el-tag v-if="contact.isPrimary" type="warning" size="small" class="ml-4">主值</el-tag>
              </div>
            </template>
            <div v-else class="empty-state">暂无字段信息</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Connection } from "@element-plus/icons-vue";

export interface ContactInfo {
  label: string; // 字段标签，如"手机号"、"地址"
  value: string; // 字段值
  isPrimary?: boolean; // 是否为主值
}

export interface FieldInfo {
  label: string; // 字段标签
  value: string; // 字段值
  category?: string; // 字段分类：basic(基本信息)、contact(联系信息)、business(业务信息)、other(其他)
  isPrimary?: boolean; // 是否为主值
  isConflict?: boolean; // 是否冲突
  updateTime?: string; // 更新时间
}

export interface LineageItem {
  system: string; // 源系统名称
  systemId: string; // 源系统ID
  isPrimary?: boolean; // 是否为主记录
  mergeTime?: string; // 合并时间
  mergeHistory?: string; // 合并历史
  credibility?: number; // 可信度权重 (0-100)
  contactInfo?: ContactInfo[]; // 该系统贡献的联系信息（兼容旧数据）
  fields?: FieldInfo[]; // 该系统贡献的所有字段信息
}

interface Props {
  lineageData: LineageItem[];
}

const props = defineProps<Props>();

// 主要字段列表
const mainFields = ["姓名", "手机号", "电话", "邮箱", "地址", "身份证号", "性别", "出生日期"];

// 获取主要字段
const getMainFields = (fields: FieldInfo[]): FieldInfo[] => {
  return fields.filter(field => mainFields.includes(field.label));
};

const getSystemTagType = (system: string) => {
  const typeMap: Record<string, string> = {
    DMS: "primary",
    BDC: "success",
    CRM: "warning",
    WECHAT: "info"
  };
  return typeMap[system] || "info";
};

const getCategoryTagType = (category?: string) => {
  const typeMap: Record<string, string> = {
    basic: "primary",
    contact: "success",
    business: "warning",
    other: "info"
  };
  return typeMap[category || "other"] || "info";
};

const getCategoryLabel = (category?: string) => {
  const labelMap: Record<string, string> = {
    basic: "基本信息",
    contact: "联系信息",
    business: "业务信息",
    other: "其他"
  };
  return labelMap[category || "other"] || "其他";
};
</script>

<style scoped lang="scss">
.lineage-trace {
  .trace-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    :deep(.el-card__header) {
      padding: 20px 24px;
      border-bottom: 1px solid #e4e7ed;
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    }

    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    font-size: 16px;
    color: #303133;

    .el-icon {
      font-size: 18px;
      color: #409eff;
    }

    .header-count {
      margin-left: auto;
      font-size: 13px;
      font-weight: 400;
      color: #909399;
      background: #f5f7fa;
      padding: 4px 12px;
      border-radius: 12px;
    }
  }

  .trace-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .trace-item {
    padding: 16px;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    transition: all 0.2s ease;
    width: 100%;

    &:hover {
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
      border-left-color: #409eff;
    }

    &.highlighted {
      background: #fef0f0;
      border-left-color: #e6a23c;
    }
  }

  .trace-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e7ed;
  }

  .trace-id {
    font-family: monospace;
    font-size: 12px;
    color: #909399;
    background: #f5f7fa;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .fields-info {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 8px;
  }

  .field-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 4px;
    font-size: 13px;
    transition: all 0.2s;

    &:hover {
      background: #f0f2f5;
    }

    .field-label {
      color: #909399;
      min-width: 80px;
      font-weight: 500;
    }

    .field-value {
      color: #303133;
      flex: 1;
      word-break: break-word;
    }
  }

  .empty-state {
    padding: 20px;
    text-align: center;
    color: #909399;
    font-size: 13px;
  }

  .ml-4 {
    margin-left: 4px;
  }
}
</style>
