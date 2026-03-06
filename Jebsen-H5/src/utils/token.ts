/**
 * URL Token 解码工具
 * 支持从 URL 携带的 token 中解码出所需信息（不校验签名，仅解码 payload）
 */

/** 解码后的 token 载荷，兼容 JWT 标准字段与业务自定义字段 */
export interface DecodedTokenPayload {
  /** 用户 ID（JWT 常用 sub，或自定义 userId） */
  userId?: string
  sub?: string
  /** 用于接口认证的 token 字符串（若 payload 内嵌 token 则取此值） */
  token?: string
  /** 过期时间戳（秒） */
  exp?: number
  /** 签发时间戳（秒） */
  iat?: number
  [key: string]: unknown
}

/**
 * Base64URL 解码（JWT 使用 base64url，需补全 padding）
 */
function base64UrlDecode(str: string): string {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    const pad = base64.length % 4
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64
    return decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
  } catch {
    return ''
  }
}

/**
 * 解析 JWT  payload（仅解码，不校验签名）
 * JWT 格式: header.payload.signature
 */
function decodeJwtPayload(jwt: string): DecodedTokenPayload | null {
  const parts = jwt.trim().split('.')
  if (parts.length !== 3) return null
  try {
    const json = base64UrlDecode(parts[1])
    return json ? (JSON.parse(json) as DecodedTokenPayload) : null
  } catch {
    return null
  }
}

/**
 * 尝试将 token 当作 Base64 编码的 JSON 解码（自定义格式：{ token?, userId?, ... }）
 */
function decodeBase64Json(token: string): DecodedTokenPayload | null {
  try {
    const decoded = atob(token)
    const parsed = JSON.parse(decoded) as Record<string, unknown>
    if (parsed && typeof parsed === 'object') {
      return parsed as DecodedTokenPayload
    }
  } catch {
    // ignore
  }
  return null
}

/**
 * 从 URL 携带的 token 字符串中解码出所需信息
 * - 若为 JWT：解码 payload，取 sub/userId、exp 等
 * - 若为 Base64 JSON：解码为对象，取 token、userId 等
 * - 若均失败：仍返回原始 token 字符串，userId 由调用方决定
 */
export function decodeUrlToken(tokenString: string): {
  token: string
  userId?: string
  payload: DecodedTokenPayload | null
} {
  const token = tokenString.trim()
  if (!token) {
    return { token: '', payload: null }
  }

  // 1. 尝试 JWT 解析
  const jwtPayload = decodeJwtPayload(token)
  if (jwtPayload) {
    const userId =
      (jwtPayload.userId as string) ||
      (jwtPayload.sub as string) ||
      undefined
    return {
      token,
      userId: userId || undefined,
      payload: jwtPayload,
    }
  }

  // 2. 尝试 Base64 JSON 解析（内嵌 token + userId 等）
  const b64Payload = decodeBase64Json(token)
  if (b64Payload) {
    const userId =
      (b64Payload.userId as string) ||
      (b64Payload.sub as string) ||
      undefined
    const innerToken =
      typeof b64Payload.token === 'string' ? b64Payload.token : token
    return {
      token: innerToken,
      userId,
      payload: b64Payload,
    }
  }

  // 3. 无法解码时，原样使用 URL 上的字符串作为 token
  return {
    token,
    payload: null,
  }
}
