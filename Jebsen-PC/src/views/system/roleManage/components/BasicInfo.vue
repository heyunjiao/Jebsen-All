<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="role-form">
    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item :label="$t('system.roleManagement.roleName')" prop="roleName">
          <el-input v-model="form.roleName" :placeholder="$t('system.roleManagement.enterRoleName')" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="roleKey">
          <template #label>
            <div class="label-with-tooltip">
              <span>{{ $t("system.permissionChar") }}</span>
              <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
                <el-icon class="label-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-input v-model="form.roleKey" :placeholder="$t('system.enterPermissionChar')" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item :label="$t('system.roleManagement.roleLevel')" prop="roleLevel">
          <el-select
            v-model="form.roleLevel"
            :placeholder="$t('system.roleManagement.selectRoleLevel')"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="(label, key) in roleLevelOptions"
              :key="key"
              :label="$t(`system.roleManagement.roleLevelOptions.${key}`)"
              :value="key"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item :label="$t('system.roleSort')" prop="roleSort">
          <el-input-number v-model="form.roleSort" controls-position="right" :min="0" style="width: 100%" />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item :label="$t('system.roleManagement.roleDescription')">
          <el-input
            v-model="form.roleDescription"
            type="textarea"
            :rows="3"
            :placeholder="$t('system.roleManagement.enterRoleDescription')"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item :label="$t('system.status')">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in statusOptions" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item :label="$t('system.remark')">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" maxlength="500" show-word-limit />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { QuestionFilled } from "@element-plus/icons-vue";

interface Props {
  form: any;
  rules: any;
  roleLevelOptions: Record<string, string>;
  statusOptions: Array<{ label: string; value: string }>;
}

const props = defineProps<Props>();

const formRef = ref();

defineExpose({
  formRef,
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields()
});
</script>

<style scoped lang="scss">
.label-with-tooltip {
  display: flex;
  align-items: center;
  .label-icon {
    margin-left: 4px;
    cursor: help;
    color: #909399;
  }
}
</style>
