# 菜单与路由对照表（基于 authMenuList.json）

以下表格按 **路由 path**、**路由名称 name**、**菜单信息（标题 title、图标 icon）**、**组件路径 component** 与 **说明** 整理，便于核对与维护。

---

## 1. 接口响应结构

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| code | number | 状态码 | 200 |
| data | MenuOptions[] | 菜单树（递归含 children） | 见下表 |
| msg | string | 提示文案 | "成功" |

---

## 2. 菜单项通用字段（MenuOptions / MetaProps）

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| path | string | 路由路径 | "/customer/list" |
| name | string | 路由名称（唯一） | "customerList" |
| component | string \| undefined | 组件路径（有页面时必填） | "/customerList/index" |
| redirect | string \| undefined | 重定向（父级菜单常用） | "/customer/list" |
| meta | MetaProps | 菜单展示与行为 | 见下表 |
| children | MenuOptions[] \| undefined | 子菜单 | [] |

**meta 子字段：**

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| icon | string | 侧栏图标（Element Plus 图标名） | "UserFilled" |
| title | string | 侧栏菜单标题 | "客户管理" |
| isLink | string | 外链地址，空为非外链 | "" |
| isHide | boolean | 是否在侧栏隐藏 | false |
| isFull | boolean | 是否全屏 | false |
| isAffix | boolean | 是否固定标签页 | true |
| isKeepAlive | boolean | 是否缓存页面 | true |

---

## 3. 当前全部路由 / 菜单 / 组件一览（按 authMenuList.json）

| 路由 path | 路由名称 name | 菜单标题 title | 图标 icon | 组件路径 component | 说明 |
|-----------|---------------|----------------|-----------|--------------------|------|
| /home/index | home | 源数据采集 | HomeFilled | /welcome/index | 首页入口，固定标签 |
| /dataProcess | dataProcess | 数据处理 | Connection | — | 父级，redirect: /dataProcess/errorCorrection |
| /dataProcess/dataQualityWorkbench | dataQualityWorkbench | 数据文件上传 | DocumentChecked | /dataQualityWorkbench/index | 数据文件上传 |
| /dataProcess/errorCorrection | errorCorrection | 异常中心 | WarningFilled | /errorCorrection/index | 异常中心 |
| /dataProcess/fileUploadLog | fileUploadLog | 文件上传日志 | Notebook | /fileUploadLog/index | 文件上传日志 |
| /customer | customer | 客户管理 | UserFilled | — | 父级，redirect: /customer/list |
| /customer/list | customerList | 客户列表 | List | /customerList/index | 客户列表 |
| /customer/segmentation | customerSegmentation | 客户筛选与分群 | Filter | /customerSegmentation/index | 客户筛选与分群 |
| /tagManage | tagManage | 标签管理 | PriceTag | /tagManage/index | 标签管理 |
| /segmentManage | segmentManage | 分群管理 | User | /segmentManage/index | 分群管理 |
| /leadManagement | leadManagement | 商机管理 | Opportunity | /leadManagement/index | 父级，redirect: /leadManagement/dashboard |
| /leadManagement/dashboard | leadManagementDashboard | 商机看板 | TrendCharts | /leadManagement/DashboardPage | 商机看板 |
| /leadManagement/list | leadManagementList | 商机列表 | Tickets | /leadManagement/ListPage | 商机列表 |
| /leadManagement/rule | leadManagementRule | 分发查询 | Tools | /leadManagement/RuleConfigPage | 分发查询 |
| /leadManagement/tracking | leadManagementTracking | 商机追踪 | DataAnalysis | /leadManagement/TrackingPage | 商机追踪 |
| /auth | auth | 权限管理 | Lock | — | 父级，redirect: /auth/menu |
| /system/accountManage | accountManage | 账号管理 | Avatar | /system/accountManage/index | 账号管理 |
| /system/roleManage | roleManage | 角色管理 | Avatar | /system/roleManage/index | 角色管理 |
| /system/menuMange | menuMange | 菜单管理 | Grid | /system/menuMange/index | 菜单管理，isHide: true |
| /system | system | 系统管理 | Setting | — | 父级，redirect: /system/accountManage |
| /system/departmentManage | departmentManage | 部门管理 | OfficeBuilding | /system/departmentManage/index | 部门管理 |
| /system/noticeManage | noticeManage | 通知公告 | Bell | /system/noticeManage/index | 通知公告 |
| /collection/config | collectionConfig | 数据催收配置 | Setting | /collection/config/index | 数据催收配置 |
| /collection/globalRulesConfig | collectionGlobalRulesConfig | 全局监控规则配置 | Bell | /collection/GlobalRulesConfig | 全局监控规则，isHide: true |
| /monitor | monitor | 系统监控 | Monitor | — | 父级，redirect: /monitor/online |
| /system/operlogManage | operlogManage | 操作日志 | Notebook | /system/operlogManage/index | 操作日志（挂在 monitor 下） |

---

## 4. 组件路径与视图目录对应关系

组件路径为**相对 `src/views`** 的路径，对应文件示例：

| 组件路径 component | 实际文件路径 |
|--------------------|--------------|
| /welcome/index | src/views/welcome/index.vue |
| /dataQualityWorkbench/index | src/views/dataQualityWorkbench/index.vue |
| /errorCorrection/index | src/views/errorCorrection/index.vue |
| /fileUploadLog/index | src/views/fileUploadLog/index.vue |
| /customerList/index | src/views/customerList/index.vue |
| /customerSegmentation/index | src/views/customerSegmentation/index.vue |
| /tagManage/index | src/views/tagManage/index.vue |
| /segmentManage/index | src/views/segmentManage/index.vue |
| /leadManagement/index | src/views/leadManagement/index.vue |
| /leadManagement/DashboardPage | src/views/leadManagement/DashboardPage.vue |
| /leadManagement/ListPage | src/views/leadManagement/ListPage.vue |
| /leadManagement/RuleConfigPage | src/views/leadManagement/RuleConfigPage.vue |
| /leadManagement/TrackingPage | src/views/leadManagement/TrackingPage.vue |
| /system/accountManage/index | src/views/system/accountManage/index.vue |
| /system/roleManage/index | src/views/system/roleManage/index.vue |
| /system/menuMange/index | src/views/system/menuMange/index.vue |
| /system/departmentManage/index | src/views/system/departmentManage/index.vue |
| /system/noticeManage/index | src/views/system/noticeManage/index.vue |
| /collection/config/index | src/views/collection/config/index.vue |
| /collection/GlobalRulesConfig | src/views/collection/GlobalRulesConfig.vue |
| /system/operlogManage/index | src/views/system/operlogManage/index.vue |

---

*文档来源：`src/assets/json/authMenuList.json`，类型定义见 `src/typings/global.d.ts` 中 `Menu` 命名空间。*
