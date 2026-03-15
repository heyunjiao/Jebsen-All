/**
 * VIN（车架号）工具 - 符合 GB16735-2019 / ISO 3779
 * 17 位，不含 I、O、Q；第 9 位为模 11 校验位
 */

const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2] as const;

const CHAR_VALUE: Record<string, number> = {
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
  'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
  'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9
};

const INVALID_VIN_CHARS = /[IOQ]/i;

function getCharValue(c: string): number {
  const v = CHAR_VALUE[c.toUpperCase()];
  return v === undefined ? -1 : v;
}

/**
 * 计算 VIN 第 9 位校验码（模 11）
 * @param prefix8 前 8 位（WMI + VDS 前 5 位）
 * @param suffix8 后 8 位（VIS）
 * @returns 校验位字符 '0'-'9' 或 'X'
 */
export function computeVinCheckDigit(prefix8: string, suffix8: string): string | null {
  if (prefix8.length !== 8 || suffix8.length !== 8) return null;
  const placeholder = '0'; // 第 9 位权重为 0，占位即可
  let sum = 0;
  const s = prefix8 + placeholder + suffix8;
  for (let i = 0; i < 17; i++) {
    const v = getCharValue(s[i]);
    if (v < 0) return null;
    sum += v * WEIGHTS[i];
  }
  const rem = sum % 11;
  return rem === 10 ? 'X' : String(rem);
}

/**
 * 根据前 8 位 + 后 8 位生成符合规则的 17 位 VIN
 */
export function buildValidVin(prefix8: string, suffix8: string): string | null {
  const check = computeVinCheckDigit(prefix8, suffix8);
  if (check === null) return null;
  return prefix8 + check + suffix8;
}

/**
 * 校验 VIN 格式与校验位
 */
export function isValidVin(vin: string): boolean {
  if (!vin || vin.length !== 17) return false;
  if (INVALID_VIN_CHARS.test(vin)) return false;
  const check = computeVinCheckDigit(vin.slice(0, 8), vin.slice(9, 17));
  if (check === null) return false;
  return vin[8].toUpperCase() === check;
}

/**
 * 生成一条合法 VIN（仅替换后 6 位顺序号，保持 WMI/VDS/VIS 结构）
 * 用于 mock：传入如 "LSGBF53M" + "DS" + "123456" 会得到合法 17 位（中间补校验位）
 */
export function mockVin(wmiVdsPrefix: string, visSuffix: string): string | null {
  const p = wmiVdsPrefix.replace(/\s/g, '');
  const s = visSuffix.replace(/\s/g, '');
  if (p.length !== 8 || s.length !== 8) return null;
  return buildValidVin(p, s);
}
