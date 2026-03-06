# 统一登录门户 - 专业 ToB 设计规范

## 🎨 设计理念

遵循现代企业级 SaaS 产品的 UI/UX 设计标准，打造简洁、专业、高效的统一登录体验。

### 核心设计原则

1. **极简主义** - 去除不必要的视觉干扰，突出核心功能
2. **专业可信** - 采用企业级配色和布局，传递可靠感
3. **清晰易用** - 明确的视觉层次和操作引导
4. **数据驱动** - 通过抽象的数据可视化元素体现技术感

---

## 🎨 配色系统

### 主色调 (Primary Colors)
```scss
// 企业蓝 - 主要交互元素
$primary-blue: #3b82f6;      // Blue 500
$primary-blue-dark: #2563eb; // Blue 600
$primary-blue-light: #60a5fa; // Blue 400

// 中性色 - 文字和背景
$neutral-900: #0f172a;  // 深色文字
$neutral-700: #334155;  // 次级文字
$neutral-600: #475569;  // 辅助文字
$neutral-500: #64748b;  // 占位文字
$neutral-400: #94a3b8;  // 提示文字
$neutral-300: #cbd5e1;  // 分割线
$neutral-200: #e2e8f0;  // 边框
$neutral-100: #f1f5f9;  // 浅色背景
$neutral-50: #f8fafc;   // 白色背景
```

### 辅助色 (Accent Colors)
```scss
// 成功
$success: #10b981;  // Green 500

// 警告
$warning: #f59e0b;  // Amber 500

// 错误
$error: #ef4444;    // Red 500

// 信息
$info: #3b82f6;     // Blue 500
```

### 渐变色 (Gradients)
```scss
// 背景渐变
background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f1f5f9 100%);

// 按钮渐变
background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);

// Logo 容器渐变
background: linear-gradient(135deg, #eff6ff, #dbeafe);
```

---

## 📐 布局规范

### 整体布局
- **左右分栏**: 55% (视觉区) + 45% (操作区)
- **最小宽度**: 操作区 480px
- **响应式断点**:
  - Desktop Large: > 1280px (左右分屏)
  - Desktop: 1024px - 1280px (左右分屏)
  - Tablet: 640px - 1024px (仅操作区)
  - Mobile: < 640px (全屏优化)

### 间距系统
```scss
// 基础间距 (8px 倍数)
$spacing-1: 4px;
$spacing-2: 8px;
$spacing-3: 12px;
$spacing-4: 16px;
$spacing-5: 20px;
$spacing-6: 24px;
$spacing-8: 32px;
$spacing-10: 40px;
$spacing-12: 48px;
```

### 圆角系统
```scss
$radius-sm: 6px;   // 小元素
$radius-md: 8px;   // 按钮、输入框
$radius-lg: 12px;  // 卡片、Logo容器
$radius-xl: 16px;  // 主面板
```

---

## 🔤 字体规范

### 字体家族
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", 
             "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", 
             Helvetica, Arial, sans-serif;
```

### 字体大小
| 用途 | 大小 | 行高 | 字重 |
|------|------|------|------|
| 大标题 | 52px | 1.2 | 700 |
| 品牌名称 | 24px | 1.3 | 700 |
| 正文 | 15px | 1.5 | 500 |
| 副标题 | 13px | 1.6 | 400 |
| 辅助文字 | 12px | 1.5 | 400 |

### 字重
- **Bold (700)**: 标题、品牌名称
- **SemiBold (600)**: 按钮、重点文字
- **Medium (500)**: 正文、表单标签
- **Regular (400)**: 辅助说明

---

## 🎯 组件规范

### 登录面板
```scss
.login-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 40px 36px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.06),
    0 2px 8px rgba(0, 0, 0, 0.04);
}
```

### 主要按钮 (SSO)
```scss
.sso-login-btn {
  padding: 16px 24px;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
  }
}
```

### 次要按钮 (重置)
```scss
.reset-btn {
  color: #64748b;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  
  &:hover {
    color: #475569;
    background: #e2e8f0;
    border-color: #cbd5e1;
  }
}
```

### 输入框
```scss
.modern-input {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  
  &:hover {
    background: #ffffff;
    border-color: #cbd5e1;
  }
  
  &:focus {
    background: #ffffff;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}
```

### 标签页切换
```scss
.login-tabs {
  background: #f1f5f9;
  border-radius: 10px;
  padding: 4px;
  
  .tab-btn.active {
    color: #3b82f6;
    background: #ffffff;
    box-shadow: 
      0 2px 8px rgba(0, 0, 0, 0.06),
      0 1px 2px rgba(0, 0, 0, 0.04);
  }
}
```

---

## 🎨 视觉效果

### 阴影系统
```scss
// 微阴影 - 输入框、小卡片
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

// 中等阴影 - 按钮、标签页
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 
            0 1px 2px rgba(0, 0, 0, 0.04);

// 深阴影 - 主面板
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06),
            0 2px 8px rgba(0, 0, 0, 0.04);

// 侧边阴影 - 操作区
box-shadow: -4px 0 24px rgba(0, 0, 0, 0.04);
```

### 动画效果
```scss
// 基础过渡
transition: all 0.2s ease;

// 悬停上浮
&:hover {
  transform: translateY(-1px);
}

// 点击下沉
&:active {
  transform: translateY(0);
}
```

---

## 🖼️ 左侧视觉区

### 设计特点
1. **抽象数据可视化**: 使用网格、节点、连接线表现数据互通
2. **柔和动画**: 微动效果，避免过于激进的动画
3. **浅色调**: 与整体浅色系统保持一致
4. **功能卡片**: 底部展示3个核心功能点

### 动画元素
- **网格线**: 极淡灰色 (opacity: 0.08)
- **数据节点**: 蓝色小点，微动效果
- **数据流**: 7条从边缘向中心流动的线条
- **中心节点**: 脉动效果，代表 OneID

### Canvas 配色
```javascript
// 背景
ctx.fillStyle = "#f8fafc";

// 网格线
ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";

// 节点
ctx.fillStyle = "rgba(59, 130, 246, 0.2)";

// 连接线
ctx.strokeStyle = "rgba(59, 130, 246, 0.15)";
```

---

## ♿ 可访问性

### 对比度要求
- **正文文字**: 至少 4.5:1 (WCAG AA)
- **大文字**: 至少 3:1 (WCAG AA)
- **交互元素**: 至少 3:1

### 颜色使用
- ✅ 不依赖颜色作为唯一信息载体
- ✅ 提供足够的文字标签
- ✅ 状态变化有明确的视觉反馈

### 键盘导航
- ✅ Tab 键可遍历所有交互元素
- ✅ Enter 键可提交表单
- ✅ 焦点状态有明显的视觉提示

---

## 🌓 深色模式支持

### 自动适配
系统会检测客户的深色模式偏好，自动切换配色:

```scss
html.dark {
  .unified-login-portal {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
    
    .operation-area {
      background: #1e293b;
      
      .login-panel {
        background: rgba(30, 41, 59, 0.8);
        border-color: rgba(100, 116, 139, 0.2);
        backdrop-filter: blur(20px);
      }
    }
  }
}
```

---

## 📱 响应式设计

### 桌面端 (> 1024px)
- 左右分屏布局
- 完整视觉区展示
- 标准尺寸的表单元素

### 平板端 (640px - 1024px)
- 隐藏左侧视觉区
- 居中显示登录面板
- 保持完整功能

### 移动端 (< 640px)
- 全屏布局
- 紧凑的表单间距
- 更大的触摸目标 (最小 44x44px)
- Logo 和标题适当缩小

---

## 🔒 品牌一致性

### 可定制元素
1. **Logo**: 替换 `@/assets/images/logo.svg`
2. **品牌名称**: 修改 `CompanyX Motors`
3. **标语**: 修改 `Customer 360 Platform`
4. **主色调**: 调整 `$primary-blue` 变量

### 保持不变的元素
- 整体布局结构
- 间距和圆角系统
- 字体大小层级
- 交互动画时长

---

## 📊 与竞品对比

| 特性 | 本设计 | 传统登录页 | 优势 |
|------|--------|-----------|------|
| 视觉冲击力 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 数据可视化动画更具科技感 |
| 专业度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ToB 配色系统更可信 |
| 功能完整性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | SSO + 本地登录双模式 |
| 合规性 | ⭐⭐⭐⭐⭐ | ⭐⭐ | 多地区协议支持 |
| 响应式 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 全设备完美适配 |

---

## 🎯 设计参考

### 参考产品
- Salesforce - 企业级配色
- Stripe - 简洁的布局
- Notion - 柔和的动画
- Linear - 数据可视化元素

### 设计资源
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [Material Design Guidelines](https://m3.material.io/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

---

## ✅ 质量检查清单

### 视觉质量
- [ ] 所有文字清晰可读
- [ ] 颜色对比度符合 WCAG AA 标准
- [ ] 阴影柔和自然，不突兀
- [ ] 动画流畅，无卡顿

### 功能完整性
- [ ] SSO 登录流程清晰
- [ ] 本地登录保留作为备用
- [ ] 多地区协议正确切换
- [ ] 错误提示友好明确

### 响应式
- [ ] 桌面端 (> 1280px) 显示正常
- [ ] 笔记本 (1024-1280px) 显示正常
- [ ] 平板 (768-1024px) 显示正常
- [ ] 手机 (< 768px) 显示正常

### 浏览器兼容
- [ ] Chrome/Edge 最新版
- [ ] Firefox 最新版
- [ ] Safari 14+
- [ ] 移动浏览器

---

## 📝 更新日志

### v2.0 - 专业 ToB 版本 (2026-01-14)
- ✨ 全新浅色系设计
- 🎨 专业企业级配色系统
- 📊 数据可视化背景动画
- 🌓 完整的深色模式支持
- 📱 全面优化的响应式布局
- ♿ 提升可访问性标准

### v1.0 - 科幻版本
- 🌌 深色主题
- 🎆 光束粒子动画
- 💫 发光特效

---

**设计团队**: Jebsen CompanyX Motors - Customer 360 Platform
**最后更新**: 2026年1月14日
