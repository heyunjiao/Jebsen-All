# 多语言文件模块化说明

## 📁 目录结构

```
src/languages/
├── index.ts                    # 主入口，合并所有模块
├── README.md                   # 本说明文档
└── modules/                    # 模块目录
    ├── common/                 # 通用模块（基础组件）
    │   ├── zh.ts              # 简体中文
    │   ├── zh-TW.ts           # 繁体中文
    │   └── en.ts              # 英文
    ├── layout/                 # 布局模块（tabs, header, home, pagination）
    │   ├── zh.ts
    │   ├── zh-TW.ts
    │   └── en.ts
    ├── login/                  # 登录模块
    │   ├── zh.ts
    │   ├── zh-TW.ts
    │   └── en.ts
    └── [moduleName]/           # 其他业务模块
        ├── zh.ts
        ├── zh-TW.ts
        └── en.ts
```

## 🚀 新模块创建流程

### 步骤 1: 创建模块文件夹

在 `src/languages/modules/` 下创建以模块名命名的文件夹（camelCase，与 `src/views/` 目录名保持一致）。

**示例**: 开发 `customerList` 模块
```bash
mkdir -p src/languages/modules/customerList
```

### 步骤 2: 创建三种语言文件

在模块文件夹内创建 `zh.ts`, `zh-TW.ts`, `en.ts`。

**示例**: `src/languages/modules/customerList/zh.ts`
```typescript
export default {
  customerList: {
    title: "客户列表",
    name: "姓名",
    phone: "手机号",
    // ... 其他翻译
  }
};
```

**注意**: 
- 必须使用 `export default` 导出
- 对象结构必须包含模块的顶级 key（与文件夹名对应）
- 顶级 key 使用 camelCase（如 `customerList`，不是 `customer-list`）

### 步骤 3: 在 index.ts 中引入

在 `src/languages/index.ts` 中导入并合并到 messages。

```typescript
// 1. 导入模块
import customerListZh from "./modules/customerList/zh";
import customerListZhTW from "./modules/customerList/zh-TW";
import customerListEn from "./modules/customerList/en";

// 2. 合并到 messages
const messages = {
  zh: mergeMessages(
    commonZh,
    layoutZh,
    loginZh,
    customerListZh  // 添加新模块
  ),
  "zh-TW": mergeMessages(
    commonZhTW,
    layoutZhTW,
    loginZhTW,
    customerListZhTW  // 添加新模块
  ),
  en: mergeMessages(
    commonEn,
    layoutEn,
    loginEn,
    customerListEn  // 添加新模块
  )
};
```

## 📝 使用方式

### 在组件中使用

```vue
<template>
  <div>
    <h1>{{ $t('customerList.title') }}</h1>
    <el-table :columns="columns" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const columns = [
  { prop: 'name', label: t('customerList.name') },
  { prop: 'phone', label: t('customerList.phone') }
];
</script>
```

## 🔄 迁移现有模块

### 从旧结构迁移

如果现有模块的翻译还在 `src/languages/modules/zh.ts` 等文件中，需要：

1. **提取模块翻译**: 从旧文件中找到对应模块的翻译对象
2. **创建新文件**: 按照上述步骤创建模块文件夹和文件
3. **更新 index.ts**: 在 `index.ts` 中导入新模块
4. **删除旧引用**: 从旧的 `zh.ts`, `zh-TW.ts`, `en.ts` 中删除已迁移的模块

### 迁移检查清单

- [ ] 创建了模块文件夹
- [ ] 创建了三种语言文件（zh.ts, zh-TW.ts, en.ts）
- [ ] 文件导出格式正确（包含顶级 key）
- [ ] 在 index.ts 中导入并合并
- [ ] 代码中的引用路径已更新（如 `t('module.key')`）
- [ ] 测试三种语言切换正常

## ⚠️ 注意事项

1. **模块命名**: 必须与 `src/views/` 下的目录名保持一致（camelCase）
2. **顶级 Key**: 每个模块文件必须包含与文件夹名相同的顶级 key
3. **导出格式**: 必须使用 `export default`，不能使用命名导出
4. **合并顺序**: 在 `index.ts` 中合并时，后导入的模块会覆盖先导入的同名 key（注意避免冲突）

## 📚 已迁移模块

- ✅ `common` - 通用模块
- ✅ `layout` - 布局模块（tabs, header, home, pagination）
- ✅ `login` - 登录模块

## 🔜 待迁移模块

以下模块需要逐步迁移到新的模块化结构：

- `customer` - 客户相关
- `errorCorrection` - 异常纠错
- `leadManagement` - 商机管理
- `dashboard` - 数据看板
- `welcome` - 欢迎页
- `approval` - 审批
- `audit` - 审计
- `ruleConfig` - 规则配置
- `tagManage` - 标签管理
- `segmentManage` - 分群管理
- `collection` - 数据催收
- `dataQualityWorkbench` - 数据质量工作台
- `customerSegmentation` - 客户分群
- `system` - 系统管理
- `menuManage` - 菜单管理

