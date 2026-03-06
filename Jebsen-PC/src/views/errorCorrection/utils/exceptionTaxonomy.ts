/**
 * 异常类型全景定义 (Exception Taxonomy)
 * 定义数据清洗过程中需要捕获的 5 大类异常类型
 */

export type ExceptionCategory = "validity" | "uniqueness" | "completeness" | "consistency" | "compliance";

export type ExceptionSubType =
  // A. 有效性异常
  | "format_error"
  | "value_range_error"
  | "enum_mismatch"
  // B. 唯一性异常
  | "suspected_duplicate"
  | "primary_key_conflict"
  // C. 完整性异常
  | "critical_missing"
  | "orphan_data"
  // D. 关联性异常
  | "logical_conflict"
  | "status_conflict"
  // E. 合规性异常
  | "authorization_missing";

export type ActionType =
  | "clean"
  | "edit"
  | "correct"
  | "empty"
  | "map"
  | "merge"
  | "override"
  | "discard"
  | "supplement"
  | "archive"
  | "associate"
  | "trust_choice"
  | "trust_source"
  | "freeze";

export interface ExceptionSubTypeConfig {
  code: ExceptionSubType;
  nameKey: string; // i18n key
  descriptionKey: string; // i18n key
  exampleKey: string; // i18n key
  actions: ActionType[];
  icon?: string;
  color: string;
}

export interface ExceptionCategoryConfig {
  code: ExceptionCategory;
  nameKey: string; // i18n key
  descriptionKey: string; // i18n key
  icon: string;
  color: string;
  subTypes: ExceptionSubTypeConfig[];
}

/**
 * 异常类型全景配置
 */
export const EXCEPTION_TAXONOMY: Record<ExceptionCategory, ExceptionCategoryConfig> = {
  // A. 有效性异常 (Validity)
  validity: {
    code: "validity",
    nameKey: "errorCorrection.taxonomy.validity.name",
    descriptionKey: "errorCorrection.taxonomy.validity.description",
    icon: "Warning",
    color: "#E6A23C", // 橙色
    subTypes: [
      {
        code: "format_error",
        nameKey: "errorCorrection.taxonomy.validity.subTypes.formatError.name",
        descriptionKey: "errorCorrection.taxonomy.validity.subTypes.formatError.description",
        exampleKey: "errorCorrection.taxonomy.validity.subTypes.formatError.example",
        actions: ["clean", "edit"],
        icon: "Document",
        color: "#E6A23C"
      },
      {
        code: "value_range_error",
        nameKey: "errorCorrection.taxonomy.validity.subTypes.valueRangeError.name",
        descriptionKey: "errorCorrection.taxonomy.validity.subTypes.valueRangeError.description",
        exampleKey: "errorCorrection.taxonomy.validity.subTypes.valueRangeError.example",
        actions: ["correct", "empty"],
        icon: "Warning",
        color: "#E6A23C"
      },
      {
        code: "enum_mismatch",
        nameKey: "errorCorrection.taxonomy.validity.subTypes.enumMismatch.name",
        descriptionKey: "errorCorrection.taxonomy.validity.subTypes.enumMismatch.description",
        exampleKey: "errorCorrection.taxonomy.validity.subTypes.enumMismatch.example",
        actions: ["map"],
        icon: "Switch",
        color: "#E6A23C"
      }
    ]
  },
  // B. 唯一性异常 (Uniqueness)
  uniqueness: {
    code: "uniqueness",
    nameKey: "errorCorrection.taxonomy.uniqueness.name",
    descriptionKey: "errorCorrection.taxonomy.uniqueness.description",
    icon: "CopyDocument",
    color: "#F56C6C", // 红色
    subTypes: [
      {
        code: "suspected_duplicate",
        nameKey: "errorCorrection.taxonomy.uniqueness.subTypes.suspectedDuplicate.name",
        descriptionKey: "errorCorrection.taxonomy.uniqueness.subTypes.suspectedDuplicate.description",
        exampleKey: "errorCorrection.taxonomy.uniqueness.subTypes.suspectedDuplicate.example",
        actions: ["merge"],
        icon: "Connection",
        color: "#F56C6C"
      },
      {
        code: "primary_key_conflict",
        nameKey: "errorCorrection.taxonomy.uniqueness.subTypes.primaryKeyConflict.name",
        descriptionKey: "errorCorrection.taxonomy.uniqueness.subTypes.primaryKeyConflict.description",
        exampleKey: "errorCorrection.taxonomy.uniqueness.subTypes.primaryKeyConflict.example",
        actions: ["override", "discard"],
        icon: "CloseBold",
        color: "#F56C6C"
      }
    ]
  },
  // C. 完整性异常 (Completeness)
  completeness: {
    code: "completeness",
    nameKey: "errorCorrection.taxonomy.completeness.name",
    descriptionKey: "errorCorrection.taxonomy.completeness.description",
    icon: "DocumentDelete",
    color: "#909399", // 灰色
    subTypes: [
      {
        code: "critical_missing",
        nameKey: "errorCorrection.taxonomy.completeness.subTypes.criticalMissing.name",
        descriptionKey: "errorCorrection.taxonomy.completeness.subTypes.criticalMissing.description",
        exampleKey: "errorCorrection.taxonomy.completeness.subTypes.criticalMissing.example",
        actions: ["supplement", "archive"],
        icon: "Warning",
        color: "#909399"
      },
      {
        code: "orphan_data",
        nameKey: "errorCorrection.taxonomy.completeness.subTypes.orphanData.name",
        descriptionKey: "errorCorrection.taxonomy.completeness.subTypes.orphanData.description",
        exampleKey: "errorCorrection.taxonomy.completeness.subTypes.orphanData.example",
        actions: ["associate"],
        icon: "Link",
        color: "#909399"
      }
    ]
  },
  // D. 关联性异常 (Consistency)
  consistency: {
    code: "consistency",
    nameKey: "errorCorrection.taxonomy.consistency.name",
    descriptionKey: "errorCorrection.taxonomy.consistency.description",
    icon: "CircleCheck",
    color: "#409EFF", // 蓝色
    subTypes: [
      {
        code: "logical_conflict",
        nameKey: "errorCorrection.taxonomy.consistency.subTypes.logicalConflict.name",
        descriptionKey: "errorCorrection.taxonomy.consistency.subTypes.logicalConflict.description",
        exampleKey: "errorCorrection.taxonomy.consistency.subTypes.logicalConflict.example",
        actions: ["trust_choice"],
        icon: "QuestionFilled",
        color: "#409EFF"
      },
      {
        code: "status_conflict",
        nameKey: "errorCorrection.taxonomy.consistency.subTypes.statusConflict.name",
        descriptionKey: "errorCorrection.taxonomy.consistency.subTypes.statusConflict.description",
        exampleKey: "errorCorrection.taxonomy.consistency.subTypes.statusConflict.example",
        actions: ["trust_source"],
        icon: "Refresh",
        color: "#409EFF"
      }
    ]
  },
  // E. 合规性异常 (Compliance)
  compliance: {
    code: "compliance",
    nameKey: "errorCorrection.taxonomy.compliance.name",
    descriptionKey: "errorCorrection.taxonomy.compliance.description",
    icon: "Lock",
    color: "#67C23A", // 绿色（但用于警告场景）
    subTypes: [
      {
        code: "authorization_missing",
        nameKey: "errorCorrection.taxonomy.compliance.subTypes.authorizationMissing.name",
        descriptionKey: "errorCorrection.taxonomy.compliance.subTypes.authorizationMissing.description",
        exampleKey: "errorCorrection.taxonomy.compliance.subTypes.authorizationMissing.example",
        actions: ["freeze"],
        icon: "Lock",
        color: "#67C23A"
      }
    ]
  }
};

/**
 * 处理策略映射
 */
export const ACTION_LABELS: Record<ActionType, string> = {
  clean: "errorCorrection.taxonomy.actions.clean",
  edit: "errorCorrection.taxonomy.actions.edit",
  correct: "errorCorrection.taxonomy.actions.correct",
  empty: "errorCorrection.taxonomy.actions.empty",
  map: "errorCorrection.taxonomy.actions.map",
  merge: "errorCorrection.taxonomy.actions.merge",
  override: "errorCorrection.taxonomy.actions.override",
  discard: "errorCorrection.taxonomy.actions.discard",
  supplement: "errorCorrection.taxonomy.actions.supplement",
  archive: "errorCorrection.taxonomy.actions.archive",
  associate: "errorCorrection.taxonomy.actions.associate",
  trust_choice: "errorCorrection.taxonomy.actions.trustChoice",
  trust_source: "errorCorrection.taxonomy.actions.trustSource",
  freeze: "errorCorrection.taxonomy.actions.freeze"
};

/**
 * 根据异常子类型代码获取配置
 */
export function getSubTypeConfig(subType: ExceptionSubType): ExceptionSubTypeConfig | undefined {
  for (const category of Object.values(EXCEPTION_TAXONOMY)) {
    const subTypeConfig = category.subTypes.find(st => st.code === subType);
    if (subTypeConfig) return subTypeConfig;
  }
  return undefined;
}

/**
 * 根据异常大类代码获取配置
 */
export function getCategoryConfig(category: ExceptionCategory): ExceptionCategoryConfig {
  return EXCEPTION_TAXONOMY[category];
}

/**
 * 获取所有异常大类
 */
export function getAllCategories(): ExceptionCategoryConfig[] {
  return Object.values(EXCEPTION_TAXONOMY);
}
