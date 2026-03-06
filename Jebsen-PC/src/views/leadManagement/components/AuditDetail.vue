<template>
  <div class="audit-detail-container">
    <!-- 基础信息区 -->
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">基础信息</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="审计实例ID">
          <el-text type="info" size="small">{{ auditLog.id }}</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="关联客户 (OneID)">
          <el-link v-if="auditLog.oneId" type="primary" :underline="false" @click="handleJumpToCustomer">
            {{ auditLog.oneId }}
            <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="商机ID">{{ auditLog.leadId || "-" }}</el-descriptions-item>
        <el-descriptions-item label="客户姓名">{{ auditLog.customerName || "-" }}</el-descriptions-item>
        <el-descriptions-item label="商机类型">{{ auditLog.leadType || "-" }}</el-descriptions-item>
        <el-descriptions-item label="推送目标系统">
          <el-tag v-if="auditLog.targetSystem" :type="getTargetSystemTagType(auditLog.targetSystem)">
            {{ getTargetSystemLabel(auditLog.targetSystem) }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="提供时间" :span="2">
          <el-text>{{ auditLog.operateTime || "-" }}</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="操作人/触发规则">
          <div v-if="auditLog.ruleName" class="trigger-info">
            <el-tag type="info" size="small">规则触发</el-tag>
            <span class="rule-name">{{ auditLog.ruleName }}</span>
            <el-text v-if="auditLog.ruleId" type="info" size="small">(ID: {{ auditLog.ruleId }})</el-text>
          </div>
          <div v-else class="operator-info">
            <el-tag type="warning" size="small">手动操作</el-tag>
            <span>{{ auditLog.operator }}</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="操作类型">
          <el-tag :type="getOperationTagType(auditLog.operation)" size="small">
            {{ getOperationLabel(auditLog.operation) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="auditLog.masked" label="脱敏状态">
          <el-tag type="warning" size="small">
            <el-icon><Lock /></el-icon>
            已脱敏
            <span v-if="auditLog.maskLevel"> ({{ auditLog.maskLevel }})</span>
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="auditLog.batchCount" label="批量数量">
          <el-tag type="warning" size="small">{{ auditLog.batchCount }} 条</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 核心数据负载区 -->
    <el-card class="payload-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">核心数据负载 (Payload)</span>
          <el-text type="info" size="small">详细记录推送到下游系统的完整JSON报文</el-text>
        </div>
      </template>

      <!-- 联系人数组 -->
      <div v-if="contacts && contacts.length > 0" class="payload-section">
        <div class="section-title">
          <el-icon><User /></el-icon>
          联系人信息
        </div>
        <el-table :data="contacts" border size="small" style="width: 100%">
          <el-table-column prop="name" label="姓名" width="150" show-overflow-tooltip>
            <template #default="scope">
              <span>{{ scope.row.name || "-" }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="主号码" width="150" show-overflow-tooltip>
            <template #default="scope">
              <span>{{ scope.row.phone || "-" }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="phonesDisplay" label="全部号码" min-width="220" show-overflow-tooltip>
            <template #default="scope">
              <span>{{ scope.row.phonesDisplay || "-" }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="relation" label="关系标签" width="120">
            <template #default="scope">
              <el-tag v-if="scope.row.relation" type="info" size="small">
                {{ scope.row.relation }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="isPrimary" label="主联系人" width="100" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.isPrimary" type="success" size="small">
                <el-icon><StarFilled /></el-icon>
                是
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 地址数组 -->
      <div v-if="addresses && addresses.length > 0" class="payload-section">
        <div class="section-title">
          <el-icon><Location /></el-icon>
          地址信息
        </div>
        <el-table :data="addresses" border size="small" style="width: 100%">
          <el-table-column prop="province" label="省份" width="100" />
          <el-table-column prop="city" label="城市" width="100" />
          <el-table-column prop="district" label="区县" width="100" />
          <el-table-column prop="detail" label="详细地址" min-width="200" />
          <el-table-column prop="fullAddress" label="完整地址" min-width="250" />
        </el-table>
      </div>

      <!-- 车辆信息 -->
      <div v-if="vehicleInfo" class="payload-section">
        <div class="section-title">
          <el-icon><Van /></el-icon>
          车辆信息
        </div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="品牌">{{ vehicleInfo.brand || "-" }}</el-descriptions-item>
          <el-descriptions-item label="车型">{{ vehicleInfo.model || "-" }}</el-descriptions-item>
          <el-descriptions-item label="车牌号">{{ vehicleInfo.plateNumber || "-" }}</el-descriptions-item>
          <el-descriptions-item label="车架号">{{ vehicleInfo.vin || "-" }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 业务属性 -->
      <div v-if="businessInfo" class="payload-section">
        <div class="section-title">
          <el-icon><Document /></el-icon>
          业务属性
        </div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item v-if="businessInfo.maintenanceExpiryDate" label="维保到期日">
            {{ businessInfo.maintenanceExpiryDate }}
          </el-descriptions-item>
          <el-descriptions-item v-if="businessInfo.couponBalance !== undefined" label="优惠券余量">
            <el-text type="warning">{{ businessInfo.couponBalance }}</el-text>
          </el-descriptions-item>
          <el-descriptions-item v-if="businessInfo.lastServiceDate" label="上次服务日期">
            {{ businessInfo.lastServiceDate }}
          </el-descriptions-item>
          <el-descriptions-item v-if="businessInfo.nextServiceDate" label="下次服务日期">
            {{ businessInfo.nextServiceDate }}
          </el-descriptions-item>
          <el-descriptions-item v-for="(value, key) in otherBusinessInfo" :key="key" :label="key">
            {{ formatValue(value) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 完整JSON展示（可折叠） -->
      <el-divider />
      <el-collapse>
        <el-collapse-item name="raw-json">
          <template #title>
            <span class="collapse-title">
              <el-icon><DocumentCopy /></el-icon>
              查看完整JSON数据
            </span>
          </template>
          <pre class="json-content">{{ JSON.stringify(auditLog.payload, null, 2) }}</pre>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 推送状态与响应日志 -->
    <el-card class="status-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">推送状态与响应日志</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="推送状态">
          <el-tag :type="getResultTagType(auditLog.result)" size="small">
            {{ getResultLabel(auditLog.result) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="auditLog.reloadCount" label="重载记录">
          <el-text type="warning">
            已重载 {{ auditLog.reloadCount }} 次
            <span v-if="auditLog.lastReloadTime">（最后重载：{{ auditLog.lastReloadTime }}）</span>
          </el-text>
        </el-descriptions-item>
        <el-descriptions-item v-if="responseData" label="系统响应状态码" :span="2">
          <el-text
            :type="
              responseData.statusCode && responseData.statusCode >= 200 && responseData.statusCode < 300 ? 'success' : 'danger'
            "
          >
            {{ responseData.statusCode || "-" }}
          </el-text>
        </el-descriptions-item>
        <el-descriptions-item v-if="responseData?.message" label="响应消息" :span="2">
          <el-text>{{ responseData.message }}</el-text>
        </el-descriptions-item>
        <el-descriptions-item v-if="auditLog.errorMessage" label="错误信息" :span="2">
          <el-alert :title="auditLog.errorMessage" type="error" :closable="false" />
        </el-descriptions-item>
      </el-descriptions>

      <!-- 响应数据详情 -->
      <div v-if="responseData && Object.keys(responseData).length > 0" class="response-section">
        <el-divider />
        <div class="section-title">下游系统响应详情</div>
        <pre class="json-content">{{ JSON.stringify(responseData, null, 2) }}</pre>
      </div>
    </el-card>

    <!-- 操作按钮区 -->
    <div class="action-buttons">
      <el-button
        v-if="auditLog.result === 'failed' || auditLog.operation === 'push'"
        type="primary"
        :icon="Refresh"
        @click="handleReload"
        :loading="reloading"
      >
        数据重载
      </el-button>
      <el-button type="success" :icon="Download" @click="handleExport('pdf')"> 导出PDF </el-button>
      <el-button type="success" :icon="Download" @click="handleExport('excel')"> 导出Excel </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  ArrowRight,
  Lock,
  User,
  Location,
  Van,
  Document,
  DocumentCopy,
  Refresh,
  Download,
  StarFilled
} from "@element-plus/icons-vue";
import type { Lead } from "@/api/modules/lead";
import { reloadAuditLog, exportAuditLog } from "@/api/modules/lead";

interface Props {
  auditLog: Lead.AuditLog;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  reload: [];
  jumpToCustomer: [oneId: string];
}>();

const reloading = ref(false);

// 提取联系人数组并规范化，兼容多种字段命名
const contacts = computed(() => {
  const payload: any = props.auditLog.payload || {};

  // 可能的联系人数组字段
  const candidateArrays = [
    payload.contacts,
    payload.contactList,
    payload.contactInfos,
    payload.customerContacts,
    payload.contactArray,
    payload.phoneList
  ].find((item: any) => Array.isArray(item) && item.length);

  // 如果只提供了电话号码列表，也转为联系人
  const phoneOnlyList =
    Array.isArray(payload.phones) && payload.phones.length ? payload.phones.map((phone: string) => ({ phone })) : null;

  // 如果是单个联系人对象，转为数组
  const singleContact =
    payload.contact && typeof payload.contact === "object" && !Array.isArray(payload.contact) ? [payload.contact] : null;

  // 从 payload 根级别提取客户信息作为联系人
  const rootLevelContact = (() => {
    const hasName = payload.customerName || payload.name || payload.contactName || payload.realName || payload.fullName;
    const hasPhone =
      payload.phone ||
      payload.mobile ||
      payload.tel ||
      (Array.isArray(payload.phones) && payload.phones.length) ||
      (Array.isArray(payload.phoneList) && payload.phoneList.length);

    if (hasName || hasPhone) {
      return [
        {
          name:
            payload.customerName ||
            payload.name ||
            payload.contactName ||
            payload.realName ||
            payload.fullName ||
            payload.userName,
          phone: payload.phone || payload.mobile || payload.tel,
          phones: payload.phones || payload.phoneList || [],
          relation: payload.relation || payload.relationTag,
          isPrimary: payload.isPrimary ?? payload.primary ?? payload.main ?? true // 根级别的通常是主联系人
        }
      ];
    }
    return null;
  })();

  const rawContacts: any[] = candidateArrays || singleContact || rootLevelContact || phoneOnlyList || [];

  if (!rawContacts.length) return null;

  // 规范化电话号码
  const normalizePhones = (item: any) => {
    const phones = [
      item.phone,
      item.mobile,
      item.tel,
      item.phoneNumber,
      item.mobilePhone,
      ...(Array.isArray(item.phones) ? item.phones : []),
      ...(Array.isArray(item.phoneList) ? item.phoneList : []),
      ...(Array.isArray(item.mobiles) ? item.mobiles : []),
      ...(Array.isArray(item.numbers) ? item.numbers : [])
    ].filter(Boolean);
    // 去重
    return Array.from(new Set(phones));
  };

  // 规范化姓名字段
  const normalizeName = (item: any) => {
    return (
      item.name ||
      item.customerName ||
      item.contactName ||
      item.userName ||
      item.realName ||
      item.fullName ||
      item.customer ||
      item.contact ||
      "-"
    );
  };

  // 规范化主联系人标识
  const normalizeIsPrimary = (item: any, index: number) => {
    // 优先使用明确的标识字段
    if (item.isPrimary !== undefined) return Boolean(item.isPrimary);
    if (item.primary !== undefined) return Boolean(item.primary);
    if (item.main !== undefined) return Boolean(item.main);
    if (item.mainContact !== undefined) return Boolean(item.mainContact);
    if (item.isMain !== undefined) return Boolean(item.isMain);

    // 如果没有明确标识，第一个联系人默认为主联系人
    return index === 0;
  };

  return rawContacts.map((item: any, index: number) => {
    const phones = normalizePhones(item);
    const name = normalizeName(item);
    const isPrimary = normalizeIsPrimary(item, index);

    return {
      name: name || "-",
      phone: phones[0] || "",
      phonesDisplay: phones.length > 0 ? phones.join(" / ") : "-",
      relation:
        item.relation ||
        item.relationTag ||
        item.role ||
        item.tag ||
        item.label ||
        item.relationship ||
        (isPrimary ? "本人" : null) ||
        null,
      isPrimary: isPrimary
    };
  });
});

// 提取地址数组
const addresses = computed(() => {
  const payload = props.auditLog.payload;
  if (Array.isArray(payload.addresses)) {
    return payload.addresses;
  }
  return null;
});

// 提取车辆信息
const vehicleInfo = computed(() => {
  const payload = props.auditLog.payload;
  return payload.vehicleInfo || null;
});

// 提取业务信息
const businessInfo = computed(() => {
  const payload = props.auditLog.payload;
  return payload.businessInfo || null;
});

// 其他业务信息（排除已展示的字段）
const otherBusinessInfo = computed(() => {
  const payload = props.auditLog.payload;
  const businessInfo = payload.businessInfo || {};
  const excludeKeys = ["maintenanceExpiryDate", "couponBalance", "lastServiceDate", "nextServiceDate"];
  const result: Record<string, any> = {};
  Object.keys(businessInfo).forEach(key => {
    if (!excludeKeys.includes(key)) {
      result[key] = businessInfo[key];
    }
  });
  return result;
});

// 响应数据
const responseData = computed(() => {
  return props.auditLog.responseData || null;
});

// 格式化值
const formatValue = (value: any) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

// 获取操作类型标签
const getOperationLabel = (operation: string) => {
  const labelMap: Record<string, string> = {
    create: "创建",
    push: "推送",
    update: "更新",
    reload: "重载",
    delete: "删除"
  };
  return labelMap[operation] || operation;
};

// 获取操作类型标签颜色
const getOperationTagType = (operation: string) => {
  const typeMap: Record<string, string> = {
    create: "success",
    push: "primary",
    update: "warning",
    reload: "info",
    delete: "danger"
  };
  return typeMap[operation] || "info";
};

// 获取目标系统标签
const getTargetSystemLabel = (target: string) => {
  const labelMap: Record<string, string> = {
    bdc: "BDC系统",
    BDC外呼系统: "BDC系统",
    wechat: "企业微信",
    crm: "CRM系统"
  };
  return labelMap[target] || target;
};

// 获取目标系统标签颜色
const getTargetSystemTagType = (target: string) => {
  const typeMap: Record<string, string> = {
    BDC外呼系统: "primary",
    wechat: "success",
    crm: "warning"
  };
  return typeMap[target] || "info";
};

// 获取结果标签
const getResultLabel = (result: string) => {
  const labelMap: Record<string, string> = {
    success: "成功",
    failed: "失败",
    pending: "待重试"
  };
  return labelMap[result] || result;
};

// 获取结果标签颜色
const getResultTagType = (result: string) => {
  const typeMap: Record<string, string> = {
    success: "success",
    failed: "danger",
    pending: "warning"
  };
  return typeMap[result] || "info";
};

// 跳转到客户360视图
const handleJumpToCustomer = () => {
  if (props.auditLog.oneId) {
    emit("jumpToCustomer", props.auditLog.oneId);
  }
};

// 数据重载
const handleReload = async () => {
  try {
    await ElMessageBox.confirm("确定要重新推送该商机数据吗？重载操作将重新执行推送过程并下发最新数据。", "数据重载确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    reloading.value = true;
    await reloadAuditLog(props.auditLog.id);
    ElMessage.success("重载操作已提交，请稍后刷新查看最新状态");
    emit("reload");
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error?.message || "重载失败，请稍后重试");
    }
  } finally {
    reloading.value = false;
  }
};

// 导出
const handleExport = async (format: "pdf" | "excel") => {
  try {
    await ElMessageBox.confirm(
      `确定要导出该审计记录为${format === "pdf" ? "PDF" : "Excel"}格式吗？导出操作将触发安全审计记录。`,
      "导出确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info"
      }
    );

    await exportAuditLog(props.auditLog.id, format);
    ElMessage.success("导出成功");
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error?.message || "导出失败，请稍后重试");
    }
  }
};
</script>

<style scoped lang="scss">
.audit-detail-container {
  .info-card,
  .payload-card,
  .status-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-weight: 600;
        font-size: 16px;
      }
    }
  }

  .payload-section {
    margin-bottom: 24px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 12px;
      color: #409eff;
    }
  }

  .trigger-info,
  .operator-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .rule-name {
      font-weight: 500;
    }
  }

  .json-content {
    background: #f5f7fa;
    padding: 16px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
    line-height: 1.6;
    max-height: 400px;
    overflow-y: auto;
    margin: 0;
  }

  .collapse-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }

  .response-section {
    margin-top: 16px;

    .section-title {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 12px;
    }
  }

  .action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 0;
    border-top: 1px solid #ebeef5;
  }
}
</style>
