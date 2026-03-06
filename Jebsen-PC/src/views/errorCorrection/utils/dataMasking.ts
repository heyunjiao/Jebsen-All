/**
 * 数据脱敏工具函数
 */

export enum SensitiveFieldType {
  PHONE = "phone",
  EMAIL = "email",
  VIN = "vin",
  PLATE = "plate"
}

/**
 * 脱敏规则配置
 */
const maskingRules = {
  [SensitiveFieldType.PHONE]: {
    // 手机号：保留前3位和后4位，中间用*代替
    pattern: /^(\d{3})\d{4}(\d{4})$/,
    replace: (match: string, p1: string, p2: string) => `${p1}****${p2}`
  },
  [SensitiveFieldType.EMAIL]: {
    // 邮箱：保留@前第一个字符和@后内容，中间用*代替
    pattern: /^(.{1})(.*)(@.+)$/,
    replace: (match: string, p1: string, p2: string, p3: string) => {
      const masked = "*".repeat(Math.min(p2.length, 4));
      return `${p1}${masked}${p3}`;
    }
  },
  [SensitiveFieldType.VIN]: {
    // VIN码：保留前3位和后4位，中间用*代替
    pattern: /^(.{3})(.*)(.{4})$/,
    replace: (match: string, p1: string, p2: string, p3: string) => {
      const masked = "*".repeat(Math.min(p2.length, 6));
      return `${p1}${masked}${p3}`;
    }
  },
  [SensitiveFieldType.PLATE]: {
    // 车牌号：保留前2位和后2位，中间用*代替
    pattern: /^(.{2})(.*)(.{2})$/,
    replace: (match: string, p1: string, p2: string, p3: string) => {
      const masked = "*".repeat(Math.min(p2.length, 3));
      return `${p1}${masked}${p3}`;
    }
  }
};

/**
 * 判断字段是否需要脱敏
 */
export function isSensitiveField(key: string): boolean {
  const sensitiveKeys = ["mobile", "phone", "email", "vin", "plate", "plateNumber"];
  return sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()));
}

/**
 * 获取字段的脱敏类型
 */
export function getFieldMaskingType(key: string): SensitiveFieldType | null {
  const keyLower = key.toLowerCase();
  if (keyLower.includes("phone") || keyLower.includes("mobile")) {
    return SensitiveFieldType.PHONE;
  }
  if (keyLower.includes("email")) {
    return SensitiveFieldType.EMAIL;
  }
  if (keyLower.includes("vin")) {
    return SensitiveFieldType.VIN;
  }
  if (keyLower.includes("plate")) {
    return SensitiveFieldType.PLATE;
  }
  return null;
}

/**
 * 是否有查看明文权限（可对接权限系统）
 */
export function hasUnmaskPermission(_fieldKey?: string, _oneId?: string): boolean {
  return true;
}

/**
 * 脱敏数据
 */
export function maskData(value: string, type?: SensitiveFieldType | null): string {
  if (!value || value === "(空)") return value;

  // 如果没有指定类型，尝试自动识别
  if (!type) {
    // 手机号格式
    if (/^1[3-9]\d{9}$/.test(value)) {
      type = SensitiveFieldType.PHONE;
    }
    // 邮箱格式
    else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      type = SensitiveFieldType.EMAIL;
    }
    // VIN码格式（17位字母数字）
    else if (/^[A-HJ-NPR-Z0-9]{17}$/i.test(value)) {
      type = SensitiveFieldType.VIN;
    }
    // 车牌号格式（中文字符+字母+点+数字，如：京A·88888）
    else if (/^[\u4e00-\u9fa5][A-Z][·\s]?[A-Z0-9]{5,6}$/.test(value)) {
      type = SensitiveFieldType.PLATE;
    } else {
      return value; // 无法识别，返回原值
    }
  }

  const rule = maskingRules[type];
  if (!rule) return value;

  const result = value.replace(rule.pattern, rule.replace);
  return result === value ? value : result;
}
