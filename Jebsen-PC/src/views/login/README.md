# Unified Login Portal - Customer 360 Platform

## 概述 (Overview)

全新的统一登录门户采用现代化设计，具备以下核心特性：

- **极简科技感**：光束汇聚动画效果，7条彩色数据流向中心汇聚形成 OneID
- ** SSO 集成**：OAuth 2.0 标准协议，支持身份认证
- **多地区合规**：自动检测客户地区，支持中国大陆、香港、澳门的隐私政策
- **安全防护**：WAF 集成，友好的错误处理
- **响应式设计**：完美适配桌面、平板和移动设备

## 核心功能

### 1. 视觉设计 - 光束汇聚 (Light Beam Convergence)

**左侧视觉区域**：
- 动态Canvas动画，7条不同颜色的光束代表7个源系统
- 粒子从四周向中心汇聚，形成发光的"人+车"OneID 图标
- 底部展示 Slogan："Customer 360 - 全息洞察，驱动增长"
- 使用深色渐变背景，营造科技氛围

**右侧操作区域**：
- 玻璃态态 (Glassmorphism) 登录面板
- CompanyX Motors 品牌标识
- 双模式登录切换（ SSO / 管理员本地登录）
- 底部合规条款与多地区选择

### 2. SSO 登录

**技术实现**：
- OAuth 2.0 授权流程
- CSRF 保护（State 参数）
- 安全的回调处理
- Token 存储在 LocalStorage

**配置步骤**：

1. 在 `LoginForm.vue` 中更新 SSO 配置：

```typescript
const ssoConfig = {
  authUrl: "https://your-idaas.example.com/oauth/authorize", // 您的 IDaaS 授权端点
  clientId: "your-client-id",                                 // OAuth Client ID
  redirectUri: `${window.location.origin}/auth/callback`,     // 回调地址
  responseType: "code",                                       // 授权类型
  scope: "openid profile email"                               // 权限范围
};
```

2. 创建 OAuth 回调处理路由（建议在 `@/routers` 中添加）：

```typescript
{
  path: "/auth/callback",
  name: "AuthCallback",
  component: () => import("@/views/auth/Callback.vue"),
  meta: { requiresAuth: false }
}
```

3. 实现回调页面处理逻辑：

```typescript
// Callback.vue
const handleCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const state = urlParams.get("state");
  
  // 验证 state
  const savedState = sessionStorage.getItem("oauth_state");
  if (state !== savedState) {
    throw new Error("Invalid state parameter");
  }
  
  // 用 code 换取 access_token
  const response = await fetch("/api/auth/token", {
    method: "POST",
    body: JSON.stringify({ code, redirectUri })
  });
  
  const { access_token } = await response.json();
  userStore.setToken(access_token);
  
  // 跳转到首页
  router.push(HOME_URL);
};
```

### 3. 管理员本地登录（备用）

**用途**：SSO 服务不可用时的紧急维护入口

**特性**：
- 保留原有的客户名密码登录
- MD5 密码加密
- 表单验证
- Enter 键快捷登录

### 4. 多地区合规系统

**自动检测**：
- 基于客户 IP 自动高亮对应地区协议
- 支持手动切换地区
- 选择记录保存在 LocalStorage

**支持地区**：
- 🇨🇳 中国大陆 (CN)
- 🇭🇰 中国香港 (HK)
- 🇲🇴 中国澳门 (MO)

**配置协议链接**：

在 `ComplianceFooter.vue` 中更新实际的协议 URL：

```typescript
const regions: Region[] = [
  {
    code: "CN",
    name: "中国大陆",
    icon: "🇨🇳",
    policyUrl: "https://your-domain.com/privacy/cn",  // 更新为实际链接
    termsUrl: "https://your-domain.com/terms/cn"      // 更新为实际链接
  },
  // ...其他地区
];
```

### 5. WAF 安全集成

**错误处理**：
- 检测 403 状态码（WAF 拦截）
- 显示友好的错误提示
- 引导客户联系 IT 支持

**实现位置**：
- SSO 登录：`handleSSOLogin()` 函数
- 本地登录：`login()` 函数

## 文件结构

```
src/views/login/
├── index.vue                           # 主登录页面
├── index.scss                          # 页面样式
└── components/
    ├── LoginForm.vue                   # 登录表单组件（SSO + 本地登录）
    ├── LightBeamBackground.vue         # 光束汇聚动画背景
    └── ComplianceFooter.vue            # 合规条款底部栏
```

## 技术栈

- **Vue 3** - Composition API
- **TypeScript** - 类型安全
- **Element Plus** - UI 组件库
- **Canvas API** - 粒子动画
- **Sass/SCSS** - 样式预处理
- **OAuth 2.0** - 身份认证

## 设计特性

### 颜色系统
```scss
// 主色调
$primary-gradient: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
$secondary-gradient: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%);

// 7种光束颜色（代表7个源系统）
$beam-colors: (
  #6366f1,  // Indigo
  #ec4899,  // Pink
  #a855f7,  // Purple
  #3b82f6,  // Blue
  #22c55e,  // Green
  #fb923c,  // Orange
  #f43f5e   // Red
);
```

### 动画效果
- **光束粒子**：持续从边缘向中心移动
- **发光效果**：径向渐变 + 阴影
- **悬停动画**：按钮抬起效果 (translateY)
- **脉冲动画**：自动检测地区的提示

## 响应式断点

| 屏幕宽度 | 布局变化 |
|---------|---------|
| > 1280px | 左右分屏 (60% / 40%) |
| 1024px - 1280px | 左右分屏 (50% / 50%) |
| 640px - 1024px | 隐藏左侧动画，全屏登录面板 |
| < 640px | 移动端优化，垂直布局 |

## 性能优化

1. **Canvas 动画优化**：
   - 使用 `requestAnimationFrame`
   - 粒子数量控制（7条光束 × 30粒子 = 210个）
   - 组件卸载时取消动画循环

2. **资源加载**：
   - 组件懒加载
   - CSS 渐变代替图片
   - 矢量图标使用 SVG

## 后续开发建议

### OAuth 回调处理
需要创建完整的 OAuth 回调处理流程：
1. 创建 `/views/auth/Callback.vue` 组件
2. 实现 code 换 token 的后端 API
3. 添加错误处理和重试逻辑
4. 实现自动跳转到原访问页面

### IP 地区检测
建议使用以下服务实现真实的 IP 检测：
- **ipapi.co**：https://ipapi.co/json/
- **ipinfo.io**：https://ipinfo.io/json
- **自建服务**：后端根据 IP 返回地区代码

### 品牌定制
1. 替换 Logo：更新 `@/assets/images/logo.svg`
2. 更新品牌名称：修改 `index.vue` 中的 "CompanyX Motors"
3. 调整配色方案：在 SCSS 中更新主色调

## 安全注意事项

⚠️ **重要提示**：

1. **OAuth State 参数**：确保每次请求生成唯一的 state，防止 CSRF 攻击
2. **Token 存储**：生产环境建议使用 HttpOnly Cookie 而非 LocalStorage
3. **HTTPS 必需**：OAuth 流程必须在 HTTPS 环境下进行
4. **密码加密**：当前使用 MD5，建议升级为 bcrypt/Argon2
5. **WAF 配置**：确保 WAF 规则不会误拦截正常登录请求

## 浏览器兼容性

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ⚠️ IE 不支持（使用了 Canvas、backdrop-filter 等现代特性）

## License

MIT License - © 2026 CompanyX Motors
