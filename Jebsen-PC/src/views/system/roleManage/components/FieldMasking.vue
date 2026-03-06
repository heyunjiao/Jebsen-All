<template>
  <el-card shadow="hover" class="field-masking-card">
    <template #header>
      <div class="card-header">
        <span>{{ $t("system.roleManagement.fieldMasking.title") }}</span>
        <div class="header-actions">
          <el-select
            v-model="batchSettingStatus"
            :placeholder="$t('system.roleManagement.fieldMasking.selectStatus')"
            style="width: 150px; margin-right: 8px"
            clearable
          >
            <el-option :label="$t('system.roleManagement.fieldMasking.display')" value="display" />
            <el-option :label="$t('system.roleManagement.fieldMasking.hide')" value="hide" />
            <el-option :label="$t('system.roleManagement.fieldMasking.plaintext')" value="plaintext" />
            <el-option :label="$t('system.roleManagement.fieldMasking.mask')" value="mask" />
            <el-option :label="$t('system.roleManagement.fieldMasking.enable')" value="enable" />
            <el-option :label="$t('system.roleManagement.fieldMasking.disable')" value="disable" />
          </el-select>
          <el-button type="primary" size="small" @click="handleBatchApply" :disabled="!batchSettingStatus">
            {{ $t("system.roleManagement.fieldMasking.apply") }}
          </el-button>
        </div>
      </div>
    </template>
    <el-row :gutter="24">
      <!-- 左侧：业务对象列表 -->
      <el-col :span="6">
        <div class="business-object-list">
          <div
            v-for="obj in businessObjects"
            :key="obj.id"
            :class="['business-object-item', { active: selectedBusinessObject?.id === obj.id }]"
            @click="selectedBusinessObject = obj"
          >
            {{ $t(`system.roleManagement.fieldMasking.businessObjects.${obj.id}`) }}
          </div>
        </div>
      </el-col>

      <!-- 右侧：字段权限配置表格 -->
      <el-col :span="18">
        <div v-if="selectedBusinessObject" class="field-config-table">
          <el-table :data="selectedBusinessObject.fields" border stripe style="width: 100%" v-loading="loading">
            <el-table-column :label="$t('system.roleManagement.fieldMasking.fieldName')" prop="name" width="150" fixed="left" />
            <el-table-column label="数据类型" prop="dataType" width="100" />
            <el-table-column label="标签" width="100">
              <template #default="scope">
                <el-tag v-if="scope.row.tag === '主键'" type="warning" size="small">主键</el-tag>
                <el-tag v-else-if="scope.row.tag === '敏感'" type="danger" size="small">敏感</el-tag>
                <span v-else>--</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('system.roleManagement.fieldMasking.visibility')" width="150">
              <template #default="scope">
                <div class="switch-cell">
                  <el-switch
                    v-model="getFieldConfig(scope.row.id).visibility"
                    active-value="display"
                    inactive-value="hide"
                    @change="handleFieldConfigChange(scope.row.id, 'visibility', $event)"
                  />
                  <span class="switch-label">
                    {{
                      getFieldConfig(scope.row.id).visibility === "display"
                        ? $t("system.roleManagement.fieldMasking.display")
                        : $t("system.roleManagement.fieldMasking.hide")
                    }}
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="$t('system.roleManagement.fieldMasking.maskingRule')" width="150">
              <template #default="scope">
                <el-select
                  v-model="getFieldConfig(scope.row.id).maskingRule"
                  size="small"
                  style="width: 100%"
                  @change="handleFieldConfigChange(scope.row.id, 'maskingRule', $event)"
                  :disabled="getFieldConfig(scope.row.id).visibility === 'hide'"
                >
                  <el-option :label="$t('system.roleManagement.fieldMasking.plaintext')" value="plaintext" />
                  <el-option :label="$t('system.roleManagement.fieldMasking.mask')" value="mask" />
                  <el-option :label="$t('system.roleManagement.fieldMasking.encrypt')" value="encrypt" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column :label="$t('system.roleManagement.fieldMasking.decryptPermission')" width="180">
              <template #default="scope">
                <div class="switch-cell">
                  <el-switch
                    v-model="getFieldConfig(scope.row.id).decryptPermission"
                    active-value="enable"
                    inactive-value="disable"
                    @change="handleFieldConfigChange(scope.row.id, 'decryptPermission', $event)"
                    :disabled="
                      getFieldConfig(scope.row.id).visibility === 'hide' ||
                      getFieldConfig(scope.row.id).maskingRule === 'plaintext'
                    "
                  />
                  <span class="switch-label">
                    {{
                      getFieldConfig(scope.row.id).decryptPermission === "enable"
                        ? $t("system.roleManagement.fieldMasking.enable")
                        : $t("system.roleManagement.fieldMasking.disable")
                    }}
                  </span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-empty v-else :description="$t('common.noData')" />
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface FieldConfig {
  visibility: "display" | "hide";
  maskingRule: "plaintext" | "mask" | "encrypt";
  decryptPermission: "enable" | "disable";
}

interface Props {
  businessObjects: Array<{
    id: string;
    name: string;
    fields: Array<{
      id: string;
      name: string;
      dataType: string;
      tag: string;
      sensitive: boolean;
    }>;
  }>;
  fieldMasking: Record<string, Record<string, FieldConfig>>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:fieldMasking": [value: Props["fieldMasking"]];
}>();

const selectedBusinessObject = ref<Props["businessObjects"][0] | null>(null);
const batchSettingStatus = ref("");
const loading = ref(false);

// 默认选中客户客户
watch(
  () => props.businessObjects,
  newObjects => {
    if (newObjects && newObjects.length > 0 && !selectedBusinessObject.value) {
      const customerProfile = newObjects.find(obj => obj.id === "customerProfile");
      selectedBusinessObject.value = customerProfile || newObjects[0];
    }
  },
  { immediate: true }
);

// 组件挂载时默认选中客户客户
onMounted(() => {
  if (props.businessObjects && props.businessObjects.length > 0 && !selectedBusinessObject.value) {
    const customerProfile = props.businessObjects.find(obj => obj.id === "customerProfile");
    selectedBusinessObject.value = customerProfile || props.businessObjects[0];
  }
});

// 获取字段配置
const getFieldConfig = (fieldId: string): FieldConfig => {
  if (!selectedBusinessObject.value) {
    return { visibility: "display", maskingRule: "plaintext", decryptPermission: "disable" };
  }
  const objId = selectedBusinessObject.value.id;
  if (!props.fieldMasking[objId] || !props.fieldMasking[objId][fieldId]) {
    return { visibility: "display", maskingRule: "plaintext", decryptPermission: "disable" };
  }
  return props.fieldMasking[objId][fieldId];
};

// 字段配置变化
const handleFieldConfigChange = (fieldId: string, key: keyof FieldConfig, value: any) => {
  if (!selectedBusinessObject.value) return;
  const objId = selectedBusinessObject.value.id;
  const newFieldMasking = { ...props.fieldMasking };

  if (!newFieldMasking[objId]) {
    newFieldMasking[objId] = {};
  }
  if (!newFieldMasking[objId][fieldId]) {
    newFieldMasking[objId][fieldId] = { visibility: "display", maskingRule: "plaintext", decryptPermission: "disable" };
  }

  newFieldMasking[objId][fieldId] = {
    ...newFieldMasking[objId][fieldId],
    [key]: value
  };

  // 如果设置为隐藏，则禁用脱敏规则和解密权限
  if (key === "visibility" && value === "hide") {
    newFieldMasking[objId][fieldId].maskingRule = "plaintext";
    newFieldMasking[objId][fieldId].decryptPermission = "disable";
  }

  // 如果设置为明文，则禁用解密权限
  if (key === "maskingRule" && value === "plaintext") {
    newFieldMasking[objId][fieldId].decryptPermission = "disable";
  }

  emit("update:fieldMasking", newFieldMasking);
};

// 批量应用设置
const handleBatchApply = () => {
  if (!batchSettingStatus.value || !selectedBusinessObject.value) {
    ElMessage.warning("请选择要应用的状态");
    return;
  }

  loading.value = true;
  const objId = selectedBusinessObject.value.id;
  const newFieldMasking = { ...props.fieldMasking };

  if (!newFieldMasking[objId]) {
    newFieldMasking[objId] = {};
  }

  selectedBusinessObject.value.fields.forEach(field => {
    if (!newFieldMasking[objId][field.id]) {
      newFieldMasking[objId][field.id] = { visibility: "display", maskingRule: "plaintext", decryptPermission: "disable" };
    }

    switch (batchSettingStatus.value) {
      case "display":
        newFieldMasking[objId][field.id].visibility = "display";
        break;
      case "hide":
        newFieldMasking[objId][field.id].visibility = "hide";
        newFieldMasking[objId][field.id].maskingRule = "plaintext";
        newFieldMasking[objId][field.id].decryptPermission = "disable";
        break;
      case "plaintext":
        newFieldMasking[objId][field.id].maskingRule = "plaintext";
        newFieldMasking[objId][field.id].decryptPermission = "disable";
        break;
      case "mask":
        newFieldMasking[objId][field.id].maskingRule = "mask";
        break;
      case "enable":
        if (newFieldMasking[objId][field.id].maskingRule !== "plaintext") {
          newFieldMasking[objId][field.id].decryptPermission = "enable";
        }
        break;
      case "disable":
        newFieldMasking[objId][field.id].decryptPermission = "disable";
        break;
    }
  });

  setTimeout(() => {
    emit("update:fieldMasking", newFieldMasking);
    loading.value = false;
    batchSettingStatus.value = "";
    ElMessage.success("批量设置应用成功");
  }, 300);
};

// 暴露方法供父组件调用
defineExpose({
  selectedBusinessObject,
  initFieldMasking: () => {
    // 初始化字段脱敏配置
    const defaultConfig: Props["fieldMasking"] = {};
    props.businessObjects.forEach(obj => {
      defaultConfig[obj.id] = {};
      obj.fields.forEach(field => {
        defaultConfig[obj.id][field.id] = {
          visibility: "display",
          maskingRule: field.sensitive ? "mask" : "plaintext",
          decryptPermission: "disable"
        };
      });
    });
    emit("update:fieldMasking", defaultConfig);
  }
});
</script>

<style scoped lang="scss">
.field-masking-card {
  :deep(.el-card__body) {
    padding: 24px;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .header-actions {
      display: flex;
      align-items: center;
    }
  }
  .business-object-list {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
    .business-object-item {
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid #ebeef5;
      font-size: 14px;
      color: #606266;
      transition: all 0.3s;
      &:hover {
        background-color: #f5f7fa;
      }
      &:last-child {
        border-bottom: none;
      }
      &.active {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        font-weight: 600;
      }
    }
  }
  .field-config-table {
    .switch-cell {
      display: flex;
      align-items: center;
      gap: 8px;
      .switch-label {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
