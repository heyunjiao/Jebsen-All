<template>
  <div class="rule-tree-node" :style="{ marginLeft: `${level * 24}px` }">
    <!-- 组节点 -->
    <div v-if="node.type === 'group'" class="node-group">
      <div class="node-header">
        <span class="node-label" :class="{ 'root-label': level === 0 }">
          {{ level === 0 ? "ROOT" : "组" }}
        </span>
        <div class="operator-buttons">
          <el-button
            :type="node.operator === 'AND' ? 'primary' : 'default'"
            size="small"
            :disabled="disabled"
            @click="updateOperator('AND')"
          >
            且
          </el-button>
          <el-button
            :type="node.operator === 'OR' ? 'primary' : 'default'"
            size="small"
            :disabled="disabled"
            @click="updateOperator('OR')"
          >
            或
          </el-button>
        </div>
        <el-button v-if="level > 0 && !disabled" type="danger" :icon="Delete" circle size="small" @click="handleRemove" />
      </div>

      <div class="node-children">
        <RuleTreeNode
          v-for="(child, index) in node.children"
          :key="child.id"
          :node="child"
          :level="level + 1"
          :available-tags="availableTags"
          :disabled="disabled"
          @update:node="handleChildUpdate"
          @add-condition="handleAddCondition"
          @add-group="handleAddGroup"
          @add-tag="handleAddTag"
          @remove-node="handleRemoveNode"
        />

        <!-- 添加按钮（禁用模式下不显示） -->
        <div v-if="!disabled" class="add-buttons">
          <el-button type="primary" :icon="Plus" plain size="small" @click="handleAddCondition(node.id)"> 添加条件 </el-button>
          <el-tooltip
            effect="dark"
            :content="availableTags && availableTags.length > 0 ? '基于已有标签分群' : '暂无可用标签，请先发布标签'"
            placement="top"
          >
            <el-button
              type="warning"
              :icon="Plus"
              plain
              size="small"
              :disabled="!availableTags || availableTags.length === 0"
              @click="handleAddTag(node.id)"
            >
              添加标签
            </el-button>
          </el-tooltip>
          <el-button type="success" :icon="Plus" plain size="small" @click="handleAddGroup(node.id)"> 添加组 </el-button>
        </div>
      </div>
    </div>

    <!-- 标签节点：选择默认标签 + 是/否 -->
    <div v-else-if="node.type === 'tag'" class="node-tag">
      <div class="tag-row">
        <el-radio-group
          v-model="localNode.tagMatch"
          size="small"
          :disabled="disabled"
          @change="handleUpdate"
        >
          <el-radio-button value="yes">是</el-radio-button>
          <el-radio-button value="no">否</el-radio-button>
        </el-radio-group>
        <el-select
          v-model="localNode.tagIds"
          placeholder="选择标签（含会员分层、售后行为、活跃度、本年内购买过粘性产品、6个月内有投诉等）"
          multiple
          style="flex: 1; min-width: 200px"
          popper-class="rule-select-dropdown"
          :teleported="false"
          :disabled="disabled"
          @change="handleTagChange"
        >
          <el-option v-for="tag in availableTags" :key="tag.tagId" :label="tag.tagName" :value="tag.tagId">
            <span>{{ tag.tagName }}</span>
            <el-tag :type="getCategoryType(tag.category)" size="small" style="margin-left: 8px">
              {{ getCategoryFullPath(TAG_CATEGORY_OPTIONS, tag.category) || tag.category }}
            </el-tag>
          </el-option>
        </el-select>

        <el-button v-if="!disabled" type="danger" :icon="Delete" circle size="small" @click="handleRemove" />
      </div>
      <div v-if="(localNode.tagMatch === 'no') && localNode.tagIds?.length" class="tag-match-tip">
        满足：客户<strong>不</strong>拥有所选标签
      </div>
    </div>

    <!-- 条件节点（含默认标签：下拉选中后固定 等于 + 是/否） -->
    <div v-else class="node-predicate">
      <div class="predicate-row">
        <el-select
          v-model="localNode.field"
          placeholder="选择字段"
          style="width: 180px"
          popper-class="rule-select-dropdown"
          :teleported="false"
          :disabled="disabled"
          @change="onPredicateFieldChange"
        >
          <el-option-group label="默认标签">
            <el-option
              v-for="f in DEFAULT_TAG_FIELDS"
              :key="f.value"
              :label="f.label"
              :value="f.value"
            />
          </el-option-group>
          <el-option-group label="金额档位">
            <el-option label="购车金额" value="totalCarPrice" />
            <el-option label="选配金额" value="totalOptionPrice" />
            <el-option label="售后自费金额" value="afterSalesSelfPayAmount" />
          </el-option-group>
          <el-option-group label="分析场景">
            <el-option label="过去周期参加活动次数" value="activityCountInPeriod" />
            <el-option label="过去周期BDC触达" value="bdcReachInPeriod" />
            <el-option label="过去周期WeCom触达" value="wecomReachInPeriod" />
            <el-option label="券到期" value="couponExpiry" />
            <el-option label="过去周期进场次数" value="visitCountInPeriod" />
          </el-option-group>
          <el-option-group label="其他条件">
            <el-option label="年龄" value="age" />
            <el-option label="年消费金额" value="annualConsumption" />
            <el-option label="性别" value="gender" />
            <el-option label="90天到店次数" value="visitCount90Days" />
            <el-option label="车辆类型" value="vehicleType" />
            <el-option label="最后到店天数" value="lastVisitDays" />
            <el-option label="累计消费" value="totalConsumption" />
          </el-option-group>
        </el-select>

        <template v-if="isDefaultTagField">
          <span class="operator-fixed">等于</span>
          <el-select
            v-model="localNode.value"
            placeholder="是/否"
            style="width: 100px"
            popper-class="rule-select-dropdown"
            :teleported="false"
            :disabled="disabled"
            @change="handleUpdate"
          >
            <el-option label="是" value="是" />
            <el-option label="否" value="否" />
          </el-select>
        </template>
        <template v-else-if="isAmountRangeField">
          <span class="operator-fixed">属于</span>
          <el-select
            v-model="localNode.value"
            :placeholder="amountRangePlaceholder"
            style="width: 140px"
            popper-class="rule-select-dropdown"
            :teleported="false"
            :disabled="disabled"
            @change="handleUpdate"
          >
            <el-option
              v-for="opt in amountRangeOptions"
              :key="opt.value || 'empty'"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
          <span v-if="amountRangeUnit" class="range-unit-fixed">{{ amountRangeUnit }}</span>
        </template>
        <template v-else-if="isScenarioField">
          <span class="operator-fixed">等于</span>
          <template v-if="scenarioFieldNeedsPeriod">
            <el-select
              :model-value="scenarioValueParts[0]"
              placeholder="周期"
              style="width: 100px"
              popper-class="rule-select-dropdown"
              :teleported="false"
              :disabled="disabled"
              @change="v => onScenarioPeriodChange(v)"
            >
              <el-option v-for="p in TIME_PERIOD_OPTIONS" :key="p.value" :label="p.label" :value="p.value" />
            </el-select>
            <el-select
              :model-value="scenarioValueParts[1]"
              :placeholder="scenarioSecondPlaceholder"
              style="width: 120px"
              popper-class="rule-select-dropdown"
              :teleported="false"
              :disabled="disabled"
              @change="v => onScenarioSecondChange(v)"
            >
              <el-option
                v-for="opt in scenarioSecondOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </template>
          <el-select
            v-else
            v-model="localNode.value"
            placeholder="选择"
            style="width: 140px"
            popper-class="rule-select-dropdown"
            :teleported="false"
            :disabled="disabled"
            @change="handleUpdate"
          >
            <el-option
              v-for="opt in COUPON_EXPIRY_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </template>
        <template v-else>
          <el-select
            v-model="localNode.operatorType"
            placeholder="操作符"
            style="width: 120px"
            popper-class="rule-select-dropdown"
            :teleported="false"
            :disabled="disabled"
            @change="handleUpdate"
          >
            <el-option label="等于" value="eq" />
            <el-option label="不等于" value="ne" />
            <el-option label="大于" value="gt" />
            <el-option label="大于等于" value="gte" />
            <el-option label="小于" value="lt" />
            <el-option label="小于等于" value="lte" />
            <el-option label="包含" value="contains" />
            <el-option label="不包含" value="notContains" />
          </el-select>
          <el-input
            v-model="localNode.value"
            placeholder="输入值"
            style="width: 150px"
            :disabled="disabled"
            @input="handleUpdate"
          />
        </template>

        <el-button v-if="!disabled" type="danger" :icon="Delete" circle size="small" @click="handleRemove" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Plus, Delete } from "@element-plus/icons-vue";
import type { RuleNode } from "./RuleEditor.vue";
import {
  TAG_CATEGORY_OPTIONS,
  getCategoryFullPath,
  getCategoryType as getCategoryTypeFromConst,
  DEFAULT_TAG_FIELDS
} from "@/constants/tagCategory";
import {
  PURCHASE_AMOUNT_RANGES,
  OPTION_AMOUNT_RANGES,
  AFTER_SALES_SELF_PAY_RANGES
} from "@/constants/amountRangeOptions";
import {
  TIME_PERIOD_OPTIONS,
  ACTIVITY_COUNT_OPTIONS,
  REACH_STATUS_OPTIONS,
  COUPON_EXPIRY_OPTIONS,
  VISIT_COUNT_IN_PERIOD_OPTIONS
} from "@/constants/analysisScenarioOptions";

const props = withDefaults(
  defineProps<{
    node: RuleNode;
    level: number;
    availableTags?: Array<{ tagId: string; tagName: string; category: string }>;
    disabled?: boolean;
  }>(),
  { disabled: false }
);

const emit = defineEmits<{
  "update:node": [node: RuleNode];
  "add-condition": [parentId: string];
  "add-group": [parentId: string];
  "add-tag": [parentId: string];
  "remove-node": [nodeId: string];
}>();

function normalizeTagMatch(node: RuleNode): RuleNode {
  const copy = JSON.parse(JSON.stringify(node));
  if (copy.type === "tag" && copy.tagMatch === undefined) copy.tagMatch = "yes";
  return copy;
}
const localNode = ref<RuleNode>(normalizeTagMatch(props.node));

// 默认标签列表（如果没有传入）
const availableTags = computed(() => props.availableTags || []);

// 当前条件字段是否为默认标签（默认标签固定为 等于 + 是/否）
const isDefaultTagField = computed(
  () => !!localNode.value.field && String(localNode.value.field).startsWith("tag_")
);

const AMOUNT_FIELDS = ["totalCarPrice", "totalOptionPrice", "afterSalesSelfPayAmount"] as const;
const isAmountRangeField = computed(() => AMOUNT_FIELDS.includes(localNode.value.field as any));

const SCENARIO_FIELDS = ["activityCountInPeriod", "bdcReachInPeriod", "wecomReachInPeriod", "couponExpiry", "visitCountInPeriod"] as const;
const isScenarioField = computed(() => SCENARIO_FIELDS.includes(localNode.value.field as any));
const scenarioFieldNeedsPeriod = computed(() => {
  const f = localNode.value.field;
  return f === "activityCountInPeriod" || f === "bdcReachInPeriod" || f === "wecomReachInPeriod" || f === "visitCountInPeriod";
});
const scenarioValueParts = computed(() => {
  const v = localNode.value.value;
  if (!v || typeof v !== "string") return [null, null];
  const idx = v.indexOf("_");
  if (idx === -1) return [null, v];
  return [v.slice(0, idx), v.slice(idx + 1)];
});
const scenarioSecondOptions = computed(() => {
  const f = localNode.value.field;
  if (f === "activityCountInPeriod") return ACTIVITY_COUNT_OPTIONS;
  if (f === "bdcReachInPeriod" || f === "wecomReachInPeriod") return REACH_STATUS_OPTIONS;
  if (f === "visitCountInPeriod") return VISIT_COUNT_IN_PERIOD_OPTIONS;
  return [];
});
const scenarioSecondPlaceholder = computed(() => {
  const f = localNode.value.field;
  if (f === "activityCountInPeriod") return "活动次数";
  if (f === "bdcReachInPeriod" || f === "wecomReachInPeriod") return "触达状态";
  if (f === "visitCountInPeriod") return "进场次数";
  return "选择";
});
function onScenarioPeriodChange(period: string) {
  const [, second] = scenarioValueParts.value;
  localNode.value.value = second ? `${period}_${second}` : period;
  localNode.value.operatorType = "eq";
  handleUpdate();
}
function onScenarioSecondChange(second: string) {
  const [period] = scenarioValueParts.value;
  localNode.value.value = period ? `${period}_${second}` : second;
  localNode.value.operatorType = "eq";
  handleUpdate();
}

// 金额档位选项（去掉「请选择」用于规则值）
const amountRangeOptions = computed(() => {
  const field = localNode.value.field;
  let list: { label: string; value: string }[] = [];
  if (field === "totalCarPrice") list = PURCHASE_AMOUNT_RANGES.filter(r => r.value).map(r => ({ label: r.label, value: r.value }));
  else if (field === "totalOptionPrice") list = OPTION_AMOUNT_RANGES.filter(r => r.value).map(r => ({ label: r.label, value: r.value }));
  else if (field === "afterSalesSelfPayAmount") list = AFTER_SALES_SELF_PAY_RANGES.filter(r => r.value).map(r => ({ label: r.label, value: r.value }));
  return list;
});
const amountRangePlaceholder = computed(() => (isAmountRangeField.value ? "选择档位" : "输入值"));
const amountRangeUnit = computed(() => {
  const field = localNode.value.field;
  if (field === "totalCarPrice" || field === "totalOptionPrice") return "万元";
  if (field === "afterSalesSelfPayAmount") return "元";
  return "";
});

// 条件字段变更：若选默认标签则固定 等于+是/否；若选金额档位则固定 属于+档位
function onPredicateFieldChange() {
  if (isDefaultTagField.value) {
    localNode.value.operatorType = "eq";
    const v = localNode.value.value;
    if (v !== "是" && v !== "否") localNode.value.value = "是";
  } else if (isAmountRangeField.value) {
    localNode.value.operatorType = "eq";
    const opts = amountRangeOptions.value;
    if (opts.length && (localNode.value.value === undefined || localNode.value.value === "")) {
      localNode.value.value = opts[0]?.value ?? "";
    }
  } else if (isScenarioField.value) {
    localNode.value.operatorType = "eq";
    if (scenarioFieldNeedsPeriod.value) {
      const p = TIME_PERIOD_OPTIONS[0]?.value ?? "1y";
      const opts = scenarioSecondOptions.value;
      const s = opts[0]?.value ?? "";
      if (!localNode.value.value || !String(localNode.value.value).includes("_")) {
        localNode.value.value = s ? `${p}_${s}` : p;
      }
    } else if (localNode.value.field === "couponExpiry" && (localNode.value.value === undefined || localNode.value.value === "")) {
      localNode.value.value = COUPON_EXPIRY_OPTIONS[0]?.value ?? "";
    }
  }
  handleUpdate();
}

// 获取分类类型（使用共享常量，支持多级分类）
const getCategoryType = (category: string) => getCategoryTypeFromConst(category);

// 标签选择变化
const handleTagChange = () => {
  // 更新标签名称
  if (localNode.value.tagIds && availableTags.value.length > 0) {
    localNode.value.tagNames = localNode.value.tagIds
      .map(id => {
        const tag = availableTags.value.find(t => t.tagId === id);
        return tag?.tagName || "";
      })
      .filter(Boolean);
  }
  handleUpdate();
};

watch(
  () => props.node,
  newVal => {
    const copy = normalizeTagMatch(newVal);
    if (copy.type === "predicate" && copy.field) {
      if (String(copy.field).startsWith("tag_") && !copy.operatorType) {
        copy.operatorType = "eq";
        if (copy.value !== "是" && copy.value !== "否") copy.value = "是";
      }
      if (SCENARIO_FIELDS.includes(copy.field as any) && !copy.operatorType) copy.operatorType = "eq";
    }
    localNode.value = copy;
  },
  { deep: true }
);

const handleUpdate = () => {
  emit("update:node", JSON.parse(JSON.stringify(localNode.value)));
};

const updateOperator = (operator: "AND" | "OR") => {
  localNode.value.operator = operator;
  handleUpdate();
};

const handleChildUpdate = (childNode: RuleNode) => {
  if (localNode.value.children) {
    const index = localNode.value.children.findIndex(c => c.id === childNode.id);
    if (index !== -1) {
      localNode.value.children[index] = childNode;
      handleUpdate();
    }
  }
};

const handleAddCondition = (parentId: string) => {
  emit("add-condition", parentId);
};

const handleAddGroup = (parentId: string) => {
  emit("add-group", parentId);
};

const handleAddTag = (parentId: string) => {
  emit("add-tag", parentId);
};

const handleRemove = () => {
  emit("remove-node", localNode.value.id);
};

const handleRemoveNode = (nodeId: string) => {
  emit("remove-node", nodeId);
};
</script>

<style lang="scss" scoped>
.rule-tree-node {
  margin-bottom: 12px;

  .node-group {
    .node-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .node-label {
        padding: 4px 12px;
        background-color: var(--el-color-primary);
        color: white;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        min-width: 60px;
        text-align: center;

        &.root-label {
          background-color: var(--el-color-primary);
        }
      }

      .operator-buttons {
        display: flex;
        gap: 8px;
      }
    }

    .node-children {
      margin-left: 24px;
      padding-left: 16px;
      border-left: 2px dashed var(--el-border-color);
    }

    .add-buttons {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      margin-left: 24px;
    }
  }

  .node-tag {
    position: relative;
    z-index: 1;

    .tag-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background-color: var(--el-bg-color-page);
      border-radius: 4px;
      position: relative;
      flex-wrap: wrap;
    }

    .tag-match-tip {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-top: 4px;
      margin-left: 8px;
    }
  }

  .node-predicate {
    position: relative;
    z-index: 1;

    .predicate-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background-color: var(--el-bg-color-page);
      border-radius: 4px;
      position: relative;
    }

    .operator-fixed {
      font-size: 13px;
      color: var(--el-text-color-regular);
      min-width: 36px;
    }
    .range-unit-fixed {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
