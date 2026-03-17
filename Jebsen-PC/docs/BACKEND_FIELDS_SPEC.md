# 按模块字段说明（供后端表结构设计）

> 本文档由前端业务实体与接口逆向整理，按**业务模块**列出需持久化的**字段名、类型、说明、示例、是否必填**，供后端设计数据库表与字段使用。  
> 表名、主键、索引、引擎、是否分表等以后端最终设计为准。

---

## 一、客户模块

### 1.1 客户主表（customer）

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| id | bigint | 主键，内部自增 | 12345 | 是 |
| one_id | varchar(64) | 客户 OneID，跨系统唯一 | ONE_202403010001 | 是 |
| user_id | varchar(64) | 兼容旧系统用户 ID | U10086 | 否 |
| customer_type | varchar(20) | 客户类型：individual / company | individual | 是 |
| name | varchar(128) | 客户姓名 / 公司名称 | 张三 | 是 |
| gender | varchar(20) | 性别（仅个人） | 男 | 否 |
| age_group | varchar(32) | 年龄段（仅个人） | 26-35 | 否 |
| family_status | varchar(32) | 家庭状态（仅个人） | 已婚有孩 | 否 |
| address | text / json | 地址，支持多值（见 1.4） | 见多值结构 | 否 |
| phone | text / json | 手机号，支持多值（见 1.4） | 见多值结构 | 否 |
| contact_preference | varchar(32) | 首选联系方式 | phone | 否 |
| last_visit_time | datetime | 最近到店时间 | 2026-03-10 15:30:00 | 否 |
| visit_count_90_days | int | 近 90 天到店次数 | 3 | 否 |
| annual_order_frequency | int | 年度下单频次 | 5 | 否 |
| avg_consumption | decimal(14,2) | 平均消费金额 | 12000.00 | 否 |
| project_preference | varchar(256) | 项目偏好描述 | 保养,轮胎 | 否 |
| has_complaint_last_year | tinyint(1) | 近一年是否有投诉 | 0/1 | 否 |
| annual_consumption | decimal(14,2) | 年度总消费金额 | 80000.00 | 否 |
| loyalty_level | varchar(32) | 会员/忠诚度等级 | GOLD | 否 |
| opportunity_level | varchar(32) | 商机/潜力等级 | HIGH | 否 |
| vin_info | text / json | VIN 信息（可多值） | 见多值结构 | 否 |
| license_plate | text / json | 车牌号（可多值） | 见多值结构 | 否 |
| car_series_model | varchar(128) | 车系车型描述 | Macan 2.0T | 否 |
| company_name | varchar(128) | 公司客户的公司名称 | 某某科技 | 否 |
| current_mileage | int | 当前里程数 | 35000 | 否 |
| service_habit | varchar(64) | 保养习惯描述 | 按时保养 | 否 |
| lifecycle_status | varchar(20) | 生命周期：active/inactive/pending/conflict | active | 是 |
| has_conflict | tinyint(1) | 是否存在跨源数据冲突 | 0/1 | 否 |
| conflicts | json | 冲突明细（见 1.3 DataConflict） | [] | 否 |
| lineage | json | 身份血缘与合并历史（见 1.3 LineageInfo） | {} | 否 |
| tags | json / 关联表 | 标签列表（值或 ID） | ["会员分层-销售钻石客户"] | 否 |
| segment_name | varchar(128) | 当前所属分群名称 | 高价值客户-维保 | 否 |
| primary_store_id | varchar(64) | 主服务门店 ID | STORE_001 | 否 |
| primary_store_name | varchar(128) | 主服务门店名称 | 上海保时捷中心 | 否 |
| bpid | varchar(64) | 业务主体唯一标识 BPID | BP1234567890 | 否 |
| birth_date | date | 出生日期 | 1990-01-01 | 否 |
| residence_area | varchar(128) | 居住区域 | 上海市浦东新区 | 否 |
| age | int | 客户年龄 | 32 | 否 |
| identity_type | varchar(32) | 身份类型：准车主/车主等 | 车主 | 否 |
| created_at | datetime | 创建时间 | 2025-12-01 10:00:00 | 是 |
| updated_at | datetime | 最后更新时间 | 2026-03-16 09:30:00 | 是 |
| role | varchar(20) | 公司维度角色：user/contact/repairer | user | 否 |
| company_id | varchar(64) | 所属公司 ID | COMP_001 | 否 |
| company_one_id | varchar(64) | 所属公司 OneID | ONE_COMP_001 | 否 |
| city | varchar(64) | 城市 | 上海 | 否 |
| primary_relation_tag | varchar(32) | 主号关系标签（本人/配偶等） | 本人 | 否 |
| value_info | json | 客户价值聚合（见下表 CustomerValueInfo） | {} | 否 |
| behavior_info | json | 销售/售后行为聚合（见下表 CustomerBehaviorInfo） | {} | 否 |

**CustomerValueInfo（value_info JSON 结构）**

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| composite_score | number | 客户价值综合评分 | 89 |
| post_sales_self_paid_amount | number | 售后自费金额 | 50000 |
| addon_purchase_amount | number | 附加购买金额 | 10000 |
| is_sales_diamond | boolean | 销售钻石客户 | true |
| is_aftersales_diamond | boolean | 售后钻石客户 | false |
| is_active_after_sales | boolean | 普通活跃售后客户 | true |
| is_dormant | boolean | 休眠客户 | false |
| is_lost | boolean | 流失客户 | false |

**CustomerBehaviorInfo（behavior_info JSON 结构）**

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| has_upgrade_or_replace | boolean | 是否存在增购/换购 | true |
| has_referral_behavior | boolean | 是否推荐过其他客户 | false |
| purchase_amount | number | 购车金额（主车） | 500000 |
| option_amount | number | 选配金额 | 50000 |
| addon_product_amount | number | 购买附加产品金额 | 8000 |
| service_frequency_last_year | number | 最近一年入厂频次 | 3 |
| last_maintenance_store | string | 最近一次保养门店 | 上海保时捷中心 |
| last_maintenance_date | string | 最近一次保养时间 | 2026-01-15 |
| repair_amount_last_year | number | 最近一年自费维修金额 | 12000 |
| accident_repair_count_last_year | number | 最近一年事故维修次数 | 0 |
| is_on_schedule_maintenance | boolean | 是否按时保养 | true |
| is_standard_maintenance | boolean | 是否按标准保养 | true |
| has_complaint_within_6_months | boolean | 投诉 6 个月内是否已关闭 | true |
| has_return_within_12_months | boolean | 12 个月内是否回厂 | true |
| last_return_store | string | 最后一次返厂门店 | — |
| last_service_date | string | 上次服务日期 | 2026-02-01 |
| first_maintenance_done | boolean | 是否完成首保 | true |
| in_warranty_period | boolean | 是否在保修期内 | true |
| first_maintenance_within_12_months | boolean | 12 个月内完成首保 | true |
| first_return_within_12_months | boolean | 12 个月内完成首次回厂 | true |
| return_within_13_to_24_months | boolean | 13-24 个月回厂 | false |
| new_insurance_at_sale | boolean | 新车销售时购买新保 | true |
| renewed_after_expiry | boolean | 到期客户中成功续保 | false |
| renew_count_in_store_repair_out_store_insurance | number | 在店维修不在店投保成功续保数 | 0 |
| has_sticky_product | boolean | 本年内购买过粘性产品 | true |
| campaign_participation_count | number | 活动/Campaign 参与次数 | 2 |

**客户主表建议索引**：`PK id`、`uk_one_id`（one_id 唯一）、`idx_lifecycle_status`、`idx_customer_type`、`idx_primary_store_id`、`idx_created_at`、`idx_updated_at`。列表筛选常用：one_id、name、phone、primary_store_id、lifecycle_status、customer_type、tags（若标签存关联表则建 customer_tag 中间表索引）。

### 1.2 公司表（company）

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| id | varchar(64) | 主键，公司 ID | COMP_001 | 是 |
| one_id | varchar(64) | 公司 OneID | ONE_COMP_001 | 是 |
| name | varchar(128) | 公司名称 | 某某科技有限公司 | 是 |
| address | varchar(256) | 公司地址 | 上海市浦东新区… | 否 |
| phone | text / json | 公司电话（可多值） | 见多值结构 | 否 |
| contact_person | varchar(64) | 联系人 | 李四 | 否 |
| lifecycle_status | varchar(20) | 启用/停用/审核中/冲突 | active | 否 |
| created_at | datetime | 创建时间 | — | 否 |
| updated_at | datetime | 更新时间 | — | 否 |

### 1.3 经办人/车辆关联人（公司客户子表或 JSON）

**HandlerInfo（经办人）**

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| id | varchar(64) | 经办人 ID | HANDLER_01 | 是 |
| name | varchar(64) | 姓名 | 李四 | 是 |
| role | varchar(32) | 角色：使用人/联系人/送修人等 | 送修人 | 否 |
| mobile | varchar(32) | 手机号 | 13800138000 | 否 |
| age | int / varchar(20) | 年龄 | 30 | 否 |
| gender | varchar(20) | 性别 | 男 | 否 |
| city | varchar(64) | 城市 | 上海 | 否 |
| avatar | varchar(256) | 头像 URL | — | 否 |
| is_primary_contact | tinyint(1) | 是否首选联系人 | 0/1 | 否 |
| is_preferred_repairer | tinyint(1) | 是否首选送修人 | 0/1 | 否 |
| readonly | tinyint(1) | 是否只读 | 0/1 | 否 |

**VehicleRelatedPerson（车辆关联人）**

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| id | varchar(64) | 主键 | — | 是 |
| role | varchar(20) | 购车人/送修人 | 购车人 | 是 |
| name | varchar(64) | 姓名 | 张三 | 是 |
| phone | varchar(32) | 电话 | 13800138000 | 否 |
| order_no | varchar(64) | 订单号 | — | 否 |
| readonly | tinyint(1) | 是否只读 | 0/1 | 否 |
| is_preferred | tinyint(1) | 是否优选 | 0/1 | 否 |

### 1.4 多值字段项（MultiValueItem，子表或 JSON 存储）

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| value | varchar(512) | 字段值 | 13800138000 | 是 |
| source | varchar(32) | 来源系统：DMS/BDC/CRM/黄金记录 | DMS | 是 |
| is_primary | tinyint(1) | 是否主数据（兼容） | 0/1 | 否 |
| is_preferred | tinyint(1) | 是否优选（如优选号码） | 0/1 | 否 |
| update_time | datetime | 更新时间 | — | 否 |
| contact_name | varchar(64) | 联系人姓名 | — | 否 |
| relation_tag_name | varchar(32) | 关系标签：本人/配偶等 | 本人 | 否 |
| readonly | tinyint(1) | 是否只读 | 0/1 | 否 |
| person_role | varchar(20) | 购车人/送修人 | 送修人 | 否 |
| linked_vehicle_ids | json | 关联车辆 ID 列表 | [] | 否 |
| slot_key | varchar(20) | 地址槽位 address1~4 | address1 | 否 |
| weight | int | 地址权重 | 100 | 否 |
| weight_label | varchar(32) | 地址权重文案 | — | 否 |

### 1.5 身份血缘与冲突（LineageInfo / DataConflict，可 JSON 或子表）

**SourceSystemId**

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| system_name | varchar(32) | 源系统名称 | DMS | 是 |
| system_id | varchar(64) | 该系统中客户 ID | DMS_001 | 是 |
| linked_at | datetime | 关联时间 | 2026-01-01 00:00:00 | 是 |
| is_primary | tinyint(1) | 是否主数据源 | 0/1 | 是 |

**DataConflict**

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| field | varchar(64) | 冲突字段标识 | phone | 是 |
| source_values | json | [{ system, value }] | — | 是 |
| resolved_value | text | 系统规则确定的权威值 | — | 否 |

### 1.6 客户维护/纠错（异常中心提交用）

**ProfileMaintenanceForm（客户维护）**

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| one_id | varchar(64) | 客户 OneID | ONE_001 | 是 |
| name | varchar(128) | 姓名 | 张三 | 否 |
| phone | text / json | 手机号（单值或多值） | — | 否 |
| alias_mappings | json | [{ system, alias }] | — | 否 |
| original_lifecycle_status | varchar(20) | 当前主库生命周期状态 | active | 否 |
| target_lifecycle_status | varchar(20) | 期望变更后状态（提交审核） | inactive | 否 |
| lifecycle_status | varchar(20) | 前端展示用状态 | pending | 否 |
| tags | json | 标签列表 | [] | 否 |

**FeedbackForm（纠错反馈）**

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| id | bigint | 主键（后端生成） | 1 | 是 |
| one_id | varchar(64) | 客户 OneID | ONE_001 | 是 |
| field | varchar(64) | 纠错字段 | phone | 是 |
| current_value | text | 当前值 | 13800138000 | 是 |
| reported_value | text | 用户反馈值 | 13800138001 | 是 |
| reason | varchar(512) | 反馈原因 | 号码变更 | 是 |
| reporter | varchar(64) | 反馈人 | 张三 | 是 |
| status | varchar(20) | pending/approved/rejected | pending | 否 |
| created_at | datetime | 创建时间 | — | 是 |
| updated_at | datetime | 更新时间 | — | 否 |

---

### 1.7 客户列表（列表接口、查询参数、会员分层统计、门店配置）

> 对应页面：**客户列表**（`/customer/list`，组件 `customerList/index.vue`）。双层 Tab：第一层门店、第二层视图模式（按人/按车）；按人列表展示客户主表字段与价值/行为聚合，按车列表展示以车为行的车辆+购车人信息；顶部会员分层统计与列表筛选、导出依赖下述接口与表。

#### 1.7.1 客户列表查询参数（按人/按车共用）

列表请求（按人 **POST /customer/list** 或 **GET /customer/list**；按车 **POST /customer/vehicle-list** 或 **GET /customer/vehicle-list**）除分页外，支持以下筛选（与前端 ProTable 搜索表单项一致）。

| 参数名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| pageNum | int | 页码 | 1 | 否 |
| pageSize | int | 每页条数 | 10 | 否 |
| storeId | string | 主服务门店 ID（空为全部） | GZTH、HN | 否 |
| oneId | string | OneID 模糊/精确 | ONE_001 | 否 |
| customerType | string | 客户类型：individual / company | individual | 否 |
| companyName | string | 公司名称（模糊） | 某某科技 | 否 |
| name | string | 客户姓名（模糊） | 张三 | 否 |
| phone | string | 手机号（模糊，可匹配多值中任一条） | 138 | 否 |
| birthDate | string | 出生日期（精确或范围依实现） | 1990-01-01 | 否 |
| residenceArea | string | 居住区域（模糊） | 浦东 | 否 |
| ageGroup | string | 年龄段：18-25/26-35/36-45/46-55/56-65 | 26-35 | 否 |
| primaryRelationTag | string | 主号关系标签：本人/配偶/子女/父母/朋友/法人/股东/高管等 | 本人 | 否 |
| identityType | string | 身份类型：准车主/车主/曾用车主 | 车主 | 否 |
| lifecycleStatus | string | 生命周期：active/inactive/pending/conflict | active | 否 |
| tags | string[] | 标签（叶子编码，多选；与标签管理分类一致） | ["会员分层-销售钻石客户"] | 否 |
| tagChangeTime | string | 标签变更时间（仅单选 tags 时有效）：one_month_add/one_month_remove/three_month_add/three_month_remove | one_month_add | 否 |
| segmentId | string | 分群 ID（命中该分群成员） | SEG_001 | 否 |
| vinInfo | string | VIN 模糊 | LSGB | 否 |
| sortField | string | 排序字段（如 oneId、createdAt） | oneId | 否 |
| sortOrder | string | asc / desc | asc | 否 |

**按车列表**除上述外，可额外支持：`vin`、`licensePlate`、`vehicleModel`、`status`（车辆状态：自用/维修中/已售/订车中-在途）等与车视角行字段一致的筛选。

#### 1.7.2 按人列表接口出参（单条与 1.1 对齐）

响应格式：`{ list: CustomerListItem[], total: number }`。单条 **CustomerListItem** 与 **1.1 客户主表** 及前端 `Customer` 对齐，至少包含下表字段（多值字段 phone/address/vinInfo/licensePlate 可为 JSON 或数组结构，见 1.4）。

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| id | number | 主键 | 1 | 是 |
| oneId | string | OneID | ONE_202403010001 | 是 |
| userId | string | 兼容旧系统用户 ID | U10086 | 否 |
| customerType | string | individual / company | individual | 是 |
| name | string | 客户姓名/公司名称 | 张三 | 是 |
| companyName | string | 公司名称（公司客户） | 某某科技 | 否 |
| phone | string \| MultiValueItem[] | 手机号（多值见 1.4） | 见 1.4 | 否 |
| birthDate | string | 出生日期 yyyy-MM-dd | 1990-01-01 | 否 |
| residenceArea | string | 居住区域 | 上海市浦东新区 | 否 |
| city | string | 城市 | 上海 | 否 |
| ageGroup | string | 年龄段 | 26-35 | 否 |
| primaryRelationTag | string | 主号关系标签 | 本人 | 否 |
| identityType | string | 准车主/车主/曾用车主 | 车主 | 否 |
| lifecycleStatus | string | active/inactive/pending/conflict | active | 是 |
| hasConflict | boolean | 是否存在跨源冲突 | false | 否 |
| tags | string[] | 标签叶子编码列表 | ["会员分层-销售钻石客户"] | 否 |
| segmentName | string | 当前所属分群名称 | 高价值客户-维保 | 否 |
| primaryStoreId | string | 主服务门店 ID | GZTH | 否 |
| primaryStoreName | string | 主服务门店名称 | GZTH-PC | 否 |
| vinInfo | string \| MultiValueItem[] | VIN 信息（多值） | 见 1.4 | 否 |
| valueInfo | object | 客户价值（见 1.1 CustomerValueInfo） | {} | 否 |
| behaviorInfo | object | 销售/售后行为（见 1.1 CustomerBehaviorInfo） | {} | 否 |
| createdAt | string | 创建时间 | 2026-01-01 10:00:00 | 否 |
| updatedAt | string | 更新时间 | 2026-03-16 09:30:00 | 否 |

#### 1.7.3 按车列表接口出参（车视角行）

响应格式：`{ list: VehicleListItem[], total: number }`。单条 **VehicleListItem** 以「车」为行，关联购车人/首任车主信息，用于按车 Tab 展示。

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| id | string | 行唯一 ID（可为 vehicle_id 或 oneId+vin 组合） | VH_001 | 是 |
| oneId | string | 客户 OneID | ONE_001 | 是 |
| customerRef | object | 关联客户简要信息（可选） | — | 否 |
| hasConflict | boolean | 客户是否存在冲突 | false | 否 |
| customerType | string | individual / company | individual | 否 |
| name | string | 客户/购车人姓名 | 张三 | 否 |
| companyName | string | 公司名称 | 某某科技 | 否 |
| buyerPhone | string | 购车人电话（展示用） | 13800138000 | 否 |
| firstOwnerName | string | 首任车主姓名 | 张三 | 否 |
| ownerPhone | string | 车主电话 | 13800138000 | 否 |
| vin | string | 车架号 | LSGBF53M7DS123456 | 是 |
| licensePlate | string | 车牌号 | 沪A12345 | 否 |
| vehicleModel | string | 车型 | 保时捷 Cayenne | 否 |
| vehicleAge | string | 车龄 | 2年 | 否 |
| vehicleAttribute | string | 车辆属性 | 在售 | 否 |
| topModelTag | string | 顶配车型标签 | — | 否 |
| purchaseDate | string | 购车/交付日期 | 2024-01-15 | 否 |
| currentMileage | number | 当前里程 | 35000 | 否 |
| optionInstallInfo | string | 选装信息 | — | 否 |
| purchaseAttribute | string | 购买属性 | — | 否 |
| insuranceCompany | string | 保险公司 | 人保 | 否 |
| insuranceType | string | 险种 | 商业险 | 否 |
| insuranceStatus | string | 保险状态 | 已生效 | 否 |
| insuranceEndDate | string | 保险到期日 | 2025-12-31 | 否 |
| financeInstitution | string | 金融机构 | 某某银行 | 否 |
| loanStatus | string | 贷款状态 | 正常 | 否 |
| loanAmount | number | 贷款金额 | 300000 | 否 |
| loanTerm | string | 贷款期限 | 36期 | 否 |
| submitDate | string | 提交日期 | 2024-01-10 | 否 |
| signStatus | string | 签单状态 | 已签单 | 否 |
| signDate | string | 签单日期 | 2024-01-12 | 否 |
| issueCenter | string | 发放中心 | — | 否 |
| customerRate | number | 客户费率 | — | 否 |
| bankRebate | number | 银行返点 | — | 否 |
| loanServiceFee | number | 贷款服务费 | — | 否 |
| vehicleRegistrationFee | number | 上牌服务费 | — | 否 |
| vehicleRegistrationCitySubsidy | number | 上牌城市贴息 | — | 否 |
| discountRate | number | 折扣率 | — | 否 |
| lastVisitTime | string | 最近到店时间 | 2026-03-10 15:30:00 | 否 |
| visitCount90Days | number | 近 90 天到店次数 | 3 | 否 |
| annualOrderFrequency | number | 年度下单频次 | 5 | 否 |
| status | string | 车辆状态：自用/维修中/已售/订车中-在途 | 自用 | 否 |
| buyerTags | string[] | 购车人标签（叶子编码） | [] | 否 |

#### 1.7.4 会员分层统计接口（GET /customer/stats/tier 或随列表返回）

用于列表页顶部「会员分层」卡片：总数 + 本月新增数，不随当前页筛选条件变化（全量统计或按门店统计依业务约定）。

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| totals.salesDiamond | number | 销售钻石客户总数 | 1200 | 是 |
| totals.aftersalesDiamond | number | 售后钻石客户总数 | 800 | 是 |
| totals.activeAfterSales | number | 普通活跃售后客户总数 | 5000 | 是 |
| totals.dormant | number | 休眠客户总数 | 3000 | 是 |
| totals.lost | number | 流失客户总数 | 1500 | 是 |
| newThisMonth.salesDiamond | number | 本月新增销售钻石 | 20 | 是 |
| newThisMonth.aftersalesDiamond | number | 本月新增售后钻石 | 15 | 是 |
| newThisMonth.activeAfterSales | number | 本月新增活跃售后 | 120 | 是 |
| newThisMonth.dormant | number | 本月新增休眠 | 80 | 是 |
| newThisMonth.lost | number | 本月新增流失 | 30 | 是 |

可选请求参数：`storeId`（按门店统计时传）。

#### 1.7.5 门店配置表（store，供列表顶部门店 Tab）

列表顶部门店 Tab 与筛选「主服务门店」依赖门店列表，可落表便于运维配置。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | bigint | 主键 | 1 | 是 | PK |
| store_id | varchar(32) | 门店唯一 ID（与 customer.primary_store_id 一致） | GZTH、HN、SHPX | 是 | UK |
| store_name | varchar(128) | 门店展示名称 | GZTH-PC、HN-POA | 是 | |
| sort_order | int | 排序（小在前） | 1 | 否 | 默认 0 |
| is_enabled | tinyint | 是否启用：0 否 1 是 | 1 | 否 | 默认 1 |
| created_at | datetime | 创建时间 | — | 否 | |
| updated_at | datetime | 更新时间 | — | 否 | |

**前端当前门店枚举**（store_id）：GZTH、HN、HZWL、NJJN、SHMH、SHPX、SZLG、SZLH（见 `constants/storeList.ts`）。

#### 1.7.6 客户 360 详情接口（GET /customer/360/:oneId）

根据 oneId 返回客户 360 全景数据，结构见前端 `Customer360View`（含 customer、company、transactions、consumptionTrend、assets、vehicles、interactions、metrics、valueInfo、behaviorInfo、riskStatus 等）。与 **1.1、1.2、1.3、1.4、1.5** 及业务聚合一致即可。

#### 1.7.7 列表导出接口（POST /customer/export）

| 参数名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| listMode | string | person / vehicle | person | 是 |
| 其余与 1.7.1 列表查询参数一致 | — | 筛选条件与列表一致 | — | 否 |

响应：文件流（如 Excel）。导出列与当前列表可见列或配置的导出列一致。

#### 1.7.8 客户列表相关枚举（与前端一致）

**lifecycle_status**：active（启用）、inactive（停用）、pending（审核中）、conflict（冲突）。  
**customer_type**：individual（个人）、company（公司）。  
**identity_type**：准车主、车主、曾用车主。  
**primary_relation_tag**：本人、配偶、子女、父母、朋友、法人、股东/高管、法人亲属、员工、其他。  
**age_group**：18-25、26-35、36-45、46-55、56-65。  
**tag_change_time**（标签变更时间）：one_month_add、one_month_remove、three_month_add、three_month_remove。  
**车辆状态 status**：自用、维修中、已售、订车中-在途。

---

## 二、标签模块（标签管理）

> 对应页面：**标签管理**（`/tagManage`，组件 `tagManage/index.vue`）。标签的增删改查、规则配置（选客规则）、发布/停用/废弃、模拟验证。规则结构与 **2.3 RuleConfig / RuleNode** 一致，与分群、客户筛选共用规则引擎。

---

### 2.1 标签主表（tag）

**说明**：每条记录对应一个标签，自动标签（tag_type=auto）依赖 rule_config 跑批计算覆盖人数；手动/文件导入标签无规则。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| tag_id | varchar(64) | 主键，标签唯一标识 | TAG_20240301001、TAG-049 | 是 | PK |
| tag_name | varchar(128) | 标签名称 | 销售钻石客户 | 是 | 列表搜索 |
| category | varchar(128) | 标签分类（多级，叶子为展示用；与 tagCategory 一致） | 会员分层-销售钻石客户、业务/会员分层 | 是 | 列表筛选、索引 |
| tag_type | varchar(20) | 类型（见 2.7 枚举）：auto/manual/file_upload | auto | 是 | 列表筛选、索引 |
| status | varchar(20) | 状态（见 2.7 枚举）：draft/active/inactive/abandoned | active | 是 | 列表筛选、索引 |
| coverage_count | int | 覆盖客户数量（发布后由跑批/计算更新） | 12345、3200 | 是 | 列表展示 |
| coverage_rate | varchar(20) | 覆盖率（如 12.5%、3.2%） | 12.5% | 是 | 列表展示 |
| creator | varchar(64) | 创建人 | admin、系统初始化 | 是 | 列表筛选、索引 |
| create_time | datetime | 创建时间 | 2026-01-01 10:00:00 | 是 | 索引 |
| update_time | datetime | 更新时间 | 2026-03-10 09:00:00 | 是 | |
| publish_time | datetime | 发布时间（未发布为 NULL） | 2024-01-01 00:00:00、NULL | 否 | |
| version | varchar(32) | 版本号 | v1.0、v1.3.0 | 是 | 与版本历史一致 |
| description | varchar(512) | 业务说明 | 近一年售后消费排名前10% | 是 | |
| rule_config | json | 选客规则（RuleConfig，见 2.3；仅 auto 类型有效） | 见 2.3 | 否 | 空表示无规则 |

**建议索引**：`PK tag_id`、`idx_category`、`idx_tag_type`、`idx_status`、`idx_creator`、`idx_create_time`、`idx_tag_name`（模糊时）。

---

### 2.2 标签版本历史表（tag_version_history）

**说明**：每次规则或关键信息变更可落一条版本记录，用于版本历史列表与回滚参考。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | bigint | 主键 | 1 | 是 | PK |
| tag_id | varchar(64) | 标签 ID | TAG_001 | 是 | FK、索引 |
| version | varchar(32) | 版本号 | v1.0.0 | 是 | |
| update_time | datetime | 更新时间 | 2026-01-02 08:00:00 | 是 | 索引 |
| operator | varchar(64) | 操作人 | admin | 是 | |
| change_log | varchar(512) | 变更说明 | 调整规则条件、发布 | 否 | |

**建议索引**：`idx_tag_id`、`idx_tag_id_update_time`。

---

### 2.3 规则配置（RuleConfig / RuleNode，存 JSON）

**说明**：标签 rule_config、分群 rule_config/rule_payload 均用此结构；后端解析后执行筛选、预估、打标。

- **扁平格式（兼容）**：`logic`（AND/OR/NOT）、`conditions`（数组，每项 `field`、`operator`、`value`）。operator：= / != / > / >= / < / <= / in / not in / contains / not contains。
- **树形格式（推荐）**：`root` 为 RuleNode。**RuleNode**：`id`（string）、`type`（group | predicate）、`operator`（AND | OR，仅 group）、`field`（string，仅 predicate）、`operatorType`（string，如 eq、in、between）、`value`（any，仅 predicate）、`children`（RuleNode[]，仅 group）。

---

### 2.4 标签列表查询参数与出参

**列表接口**：**POST /tag/list**（与前端 getTagList 一致）。

**查询参数（ReqTagParams）**

| 参数名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| pageNum | int | 页码 | 1 | 否 |
| pageSize | int | 每页条数 | 10 | 否 |
| tagName | string | 标签名称（模糊） | 钻石 | 否 |
| category | string | 标签分类（多级 value） | 会员分层-销售钻石客户 | 否 |
| tagType | string | 类型：auto/manual/file_upload | auto | 否 |
| status | string | 状态：draft/active/inactive/abandoned | active | 否 |

**列表单条（TagInfo，与 2.1 表对齐）**

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| tagId | string | 标签 ID | TAG-049 | 是 |
| tagName | string | 标签名称 | 销售钻石客户 | 是 |
| category | string | 标签分类 | 业务/会员分层 | 是 |
| tagType | string | auto/manual/file_upload | auto | 是 |
| status | string | draft/active/inactive/abandoned | active | 是 |
| coverageCount | number | 覆盖客户数量 | 3200 | 是 |
| coverageRate | string | 覆盖率 | 3.2% | 是 |
| creator | string | 创建人 | 系统初始化 | 是 |
| createTime | string | 创建时间 | 2024-01-01 00:00:00 | 是 |
| updateTime | string | 更新时间 | 2024-01-01 00:00:00 | 是 |
| publishTime | string \| null | 发布时间 | 2024-01-01 00:00:00 | 否 |
| version | string | 版本号 | v1.0 | 是 |
| description | string | 业务说明 | 会员分层-销售钻石客户（系统默认标签） | 是 |
| ruleConfig | object \| null | 规则（RuleConfig，见 2.3） | {} | 否 |

---

### 2.5 标签详情、新增、编辑、删除、发布、停用、废弃、模拟

**获取详情**：**GET /tag/:tagId**。响应单条 TagInfo（含 versionHistory 可选）。

**新增标签**：**POST /tag/add**。入参 **ReqTagForm**：

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| tagName | string | 标签名称 | 销售钻石客户 | 是 |
| category | string | 标签分类（叶子 value） | 会员分层-销售钻石客户 | 是 |
| tagType | string | auto/manual/file_upload | auto | 是 |
| status | string | draft/active（新增时可选） | active | 否 |
| description | string | 业务说明 | 近一年售后消费排名前10% | 是 |
| ruleConfig | object \| null | 规则（仅 auto 必填） | 见 2.3 | 否 |

**编辑标签**：**PUT /tag/edit**。入参同 ReqTagForm，并传 tagId。

**删除标签**：**DELETE /tag/delete**。入参 `{ tagIds: string[] }`。

**发布标签**：**POST /tag/publish**。入参 `{ tagId: string }`。发布后 status 可为 active，并更新 publish_time、coverage_count/coverage_rate（若跑批）。

**停用标签**：**POST /tag/disable**。入参 `{ tagId: string }`。status 变为 inactive。

**废弃标签**：**POST /tag/abandon**。入参 `{ tagId: string }`。status 变为 abandoned。

**模拟验证规则**：**POST /tag/simulate**。入参 `{ ruleConfig: RuleConfig | RuleNode }`。出参 `{ estimatedCount: number, estimatedRate: string, sampleData?: Array<{ oneId, name, matchReason }> }`。不落库，用于规则编辑时预览。

---

### 2.6 标签分类配置（与前端 tagCategory 一致）

前端使用多级分类（见 `constants/tagCategory.ts`）：业务 → 会员分层/售后行为/活跃度相关/粘性产品/投诉相关等 → 叶子（如 会员分层-销售钻石客户）。category 存叶子 value 或路径，后端可与 2.1 表 category 一致；若需可落表 **tag_category**（id、parent_id、value、label、sort_order）供配置。

---

### 2.7 标签模块枚举

**标签状态（status）**：draft（草稿）、active（已生效）、inactive（已停用）、abandoned（已废弃）。  
**标签类型（tag_type）**：auto（自动，依赖规则）、manual（手动）、file_upload（文件导入）。

---

## 三、分群模块（分群管理 + 客户筛选与分群）

> 前端有两个页面：**(1) 分群管理**（`/segmentManage`，接口 `/segment/*`）：分群列表、新建/编辑、规则配置、预估、快照、导出、停用/启用。**(2) 客户筛选与分群**（`/customer/segmentation`，接口 `/customer-segmentation/*`）：分群创建（含业务目的、有效期）、草稿/提交审核、预估、样本、导出、推送到 BDC/企微、版本历史。两者规则结构均与 **2.3 RuleConfig** 一致；后端可统一用一张分群表并区分来源或业务类型，或拆成两张表（见下）。

---

### 3.0 分群管理（segmentManage 页面，/segment 接口）

**说明**：对应「分群管理」页面，侧重分群创建、规则配置、成员数/快照、导出；状态含 running（计算中）、failed（计算失败）。

#### 3.0.1 分群管理主表（segment，供 /segment 使用）

若与 3.1 客户筛选与分群表分开设计，可采用本表；若后端统一为一张表，则与 3.1 合并并增加 visibility、member_count、snapshot_count、last_export_at、status 含 running/failed。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | varchar(64) | 主键，分群唯一 ID | SEG_001 | 是 | PK |
| name | varchar(128) | 分群名称 | 高价值维保客户 | 是 | 列表搜索 |
| category | varchar(64) | 分群分类（动态，可选） | 维保相关 | 否 | 列表筛选 |
| visibility | varchar(20) | 可见范围：public/private | public | 否 | 公开=团队可见，private=仅我可见 |
| status | varchar(20) | 状态：draft/running/active/failed/inactive | active | 是 | 列表筛选、索引 |
| member_count | int | 当前成员数（跑批/快照更新） | 5200 | 是 | 列表展示 |
| snapshot_count | int | 已生成快照数 | 3 | 否 | |
| last_export_at | datetime | 最近导出时间 | 2026-03-15 18:00:00 | 否 | |
| creator | varchar(64) | 创建人 | dm_admin | 是 | 列表筛选、索引 |
| created_at | datetime | 创建时间 | 2026-02-01 09:00:00 | 是 | 索引 |
| updated_at | datetime | 更新时间 | 2026-03-10 10:30:00 | 否 | |
| description | varchar(512) | 描述 | 针对高价值售后客户 | 否 | |
| rule_config | json | 选客规则（RuleConfig，见 2.3） | {} | 否 | |

**建议索引**：`PK id`、`idx_status`、`idx_creator`、`idx_created_at`、`idx_name`。

#### 3.0.2 分群管理列表查询与接口

**列表**：**POST /segment/list**。查询参数：pageNum、pageSize、name、category、status、creator。列表单条 **SegmentInfo**：id、name、category、visibility、status、memberCount、snapshotCount、lastExportAt、creator、createdAt、updatedAt、description、ruleConfig。

**详情**：**GET /segment/detail/:id**。响应单条 SegmentInfo。

**新增/编辑**：**POST /segment/add**、**PUT /segment/edit**。入参 **ReqSegmentForm**：id（编辑时）、name、category、visibility、status、description、ruleConfig、triggerCalc（可选，是否触发计算）。

**预估**：**POST /segment/estimate**。入参 `{ ruleConfig: RuleConfig | RuleNode }`。出参：estimatedCount、estimatedRate、sampleData（可选）。

**创建快照**：**POST /segment/:id/snapshot**。无请求体，生成当前成员快照并更新 snapshot_count、member_count。

**导出**：**POST /segment/:id/export**。入参 `{ fields: string[] }`。响应文件流；可更新 last_export_at。

**停用/启用**：**POST /segment/disable**（入参 `{ id }`）、**POST /segment/enable**（入参 `{ id }`）。更新 status 为 inactive / active。

#### 3.0.3 分群管理枚举（status）

draft（草稿）、running（计算中）、active（已生效）、failed（计算失败）、inactive（已停用）。

---

### 3.1 客户筛选与分群主表（customer_segment 或 segment，/customer-segmentation 接口）

> **客户筛选与分群** 页面（`/customer/segmentation`）：创建/编辑分群（规则 rulePayload）、草稿/提交审核、预估、样本预览、导出、推送到 BDC/企微、版本历史。若后端与 3.0 共用一张表，可增加 business_reason、validity、estimated_count、status 含 pending 等字段以区分。

**说明**：每条记录对应一个分群，支持草稿→提交审核→生效/停用；规则存 `rule_payload`（JSON，与 2.3 一致），用于预估、样本、导出与推送。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | varchar(64) | 主键，分群唯一 ID | SEG_20240301001、CS_SEG_001 | 是 | PK |
| name | varchar(128) | 分群名称 | 高价值维保客户、近期高价值客户 | 是 | 列表搜索 |
| description | varchar(512) | 描述（可选） | 近12个月消费>10万 | 否 | |
| business_reason | varchar(512) | 业务目的说明（必填） | 高价值客户关怀 | 是 | |
| status | varchar(20) | 状态（见 3.10 枚举）：draft/pending/active/inactive | draft、pending、active | 是 | 列表筛选、索引 |
| rule_payload | json | 选客规则（RuleConfig，见 2.3；与前端 rulePayload 一致） | 见 2.3 | 否 | 空表示未配置规则 |
| estimated_count | int | 预估客户数（最近一次预估结果） | 3000、15432 | 否 | 列表/详情展示 |
| estimated_rate | varchar(20) | 预估覆盖率（如 8.4%） | 8.4% | 否 | |
| version | varchar(32) | 版本号 | v1.0.0、v2.0.0 | 是 | 与版本历史一致 |
| validity_start | date | 有效期开始 | 2026-03-01 | 否 | |
| validity_end | date | 有效期结束 | 2026-03-31 | 否 | |
| creator | varchar(64) | 创建人 | cb_mkt_head、dm_admin | 是 | 列表筛选、索引 |
| created_at | datetime | 创建时间 | 2026-03-01 10:00:00 | 是 | 索引 |
| updated_at | datetime | 更新时间 | 2026-03-10 10:30:00 | 否 | |
| member_count | int | 当前成员数（生效后由跑批/快照更新） | 5200 | 否 | 可选，与 3.5 快照一致 |
| snapshot_count | int | 已生成快照数 | 3 | 否 | 可选 |
| last_export_at | datetime | 最近导出时间 | 2026-03-15 18:00:00 | 否 | 可选 |
| category | varchar(64) | 分群分类（动态，可选） | 维保相关 | 否 | 可选 |
| visibility | varchar(20) | 可见范围：public/private（可选） | public | 否 | 可选 |

**建议索引**：`PK id`、`idx_status`、`idx_creator`、`idx_created_at`、`idx_name`（模糊搜索时）。

---

### 3.2 分群版本历史表（segment_version_history）

**说明**：每次规则变更或提交审核可落一条版本记录，用于「版本历史」列表与回滚参考。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | bigint | 主键 | 1 | 是 | PK |
| segment_id | varchar(64) | 分群 ID | SEG_001 | 是 | FK、索引 |
| version | varchar(32) | 版本号 | v1.0.0 | 是 | |
| rule_payload_snapshot | json | 该版本规则快照（RuleConfig） | {} | 否 | |
| change_log | varchar(512) | 变更说明 | 调整规则条件、提交审核 | 否 | |
| operator | varchar(64) | 操作人 | admin | 是 | |
| created_at | datetime | 创建时间 | 2026-03-10 10:00:00 | 是 | 索引 |

**建议索引**：`idx_segment_id`、`idx_segment_id_created_at`。

---

### 3.3 分群列表查询参数与出参

**列表接口**：**POST /customer-segmentation/list**（与前端 getSegmentList 一致）。

**查询参数（ReqSegmentParams）**

| 参数名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| pageNum | int | 页码 | 1 | 否 |
| pageSize | int | 每页条数 | 10 | 否 |
| name | string | 分群名称（模糊） | 高价值 | 否 |
| status | string | 状态：draft/pending/active/inactive | active | 否 |
| creator | string | 创建人（模糊） | dm_admin | 否 |

**列表单条（SegmentInfo，与 3.1 表对齐）**

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| id | string | 分群 ID | SEG_001 | 是 |
| name | string | 分群名称 | 高价值维保客户 | 是 |
| description | string | 描述 | 近12个月消费>10万 | 否 |
| businessReason | string | 业务目的说明 | 高价值客户关怀 | 是 |
| status | string | draft/pending/active/inactive | active | 是 |
| rulePayload | object | 规则（RuleConfig，见 2.3） | {} | 否 |
| estimatedCount | number | 预估客户数 | 15432 | 否 |
| version | string | 版本号 | v1.0.0 | 是 |
| validityPeriod | object | { start, end } 有效期 | { start: "2026-03-01", end: "2026-03-31" } | 否 |
| creator | string | 创建人 | cb_mkt_head | 是 |
| createdAt | string | 创建时间 | 2026-03-01 10:00:00 | 是 |
| updatedAt | string | 更新时间 | 2026-03-10 10:30:00 | 否 |

---

### 3.4 分群详情、草稿、提交接口

**获取详情**：**GET /customer-segmentation/detail/:id**。响应单条 SegmentInfo（同上），与 3.1 表一致。

**保存草稿**：**POST /customer-segmentation/draft**。入参 **ReqSegmentForm**：

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| id | string | 分群 ID（更新时传） | SEG_001 | 否 |
| name | string | 分群名称 | 高价值维保客户 | 是 |
| description | string | 描述 | 近12个月消费>10万 | 否 |
| businessReason | string | 业务目的说明 | 高价值客户关怀 | 是 |
| rulePayload | object | 规则（RuleConfig，见 2.3） | {} | 否 |
| validityPeriod | object | { start, end } 有效期 | { start: "2026-03-01", end: "2026-03-31" } | 否 |

**提交审核**：**POST /customer-segmentation/submit**。入参同 ReqSegmentForm。提交后 status 变为 pending，审核通过后可为 active。

---

### 3.5 预估人数接口（POST /customer-segmentation/estimate）

**入参**：`{ rulePayload: RuleConfig }`（见 2.3）。

**出参（ResEstimate）**

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| estimatedCount | number | 预估客户数 | 15432 | 是 |
| estimatedRate | string | 预估覆盖率 | 8.4% | 是 |
| changeFromLast | object | 与上次预估对比（可选） | { count: 1200, rate: "+8.4%" } | 否 |

---

### 3.6 样本数据接口（POST /customer-segmentation/sample）

**入参**：`{ rulePayload: RuleConfig, pageNum: number, pageSize: number }`。

**出参**：分页结构 `{ list: SampleDataItem[], total: number }`。单条 **SampleDataItem** 用于规则命中样本预览：

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| oneId | string | 客户 OneID | ONEID0001 | 是 |
| name | string | 客户姓名 | 陈建华 | 否 |
| phone | string | 电话（可脱敏） | 138****5678 | 否 |
| vin | string | 车架号 | WBAMW123245678901 | 否 |
| gender | string | 性别 | 男 | 否 |
| ageGroup | string | 年龄段 | 30-40 | 否 |
| city | string | 城市（省/市/区） | 北京市/北京市/朝阳区 | 否 |
| carSeriesModel | string | 车系车型 | BMW 5系 530Li | 否 |
| lastVisitTime | string | 最近到店时间 | 2024-01-15 | 否 |
| annualSpend | number | 年均消费 | 25000 | 否 |
| tags | string[] | 标签列表 | ["高价值客户","活跃"] | 否 |

后端按 rulePayload 筛选客户并分页返回即可，字段可与 1.1 客户主表及 valueInfo/behaviorInfo 对齐。

---

### 3.7 导出与推送接口

**导出分群**：**POST /customer-segmentation/:id/export**。入参 `{ fields: string[] }`（导出列字段名，与客户列表/样本列一致）。响应：文件流（如 Excel）。

**推送到 BDC 外呼系统**：**POST /customer-segmentation/:id/push/BDC外呼系统**。无请求体，响应约定成功/失败即可。

**推送到企微营销台**：**POST /customer-segmentation/:id/push/wecom**。无请求体，响应约定成功/失败即可。

---

### 3.8 分群筛选字段配置表（segment_field_option，可选）

**说明**：前端「规则配置」中可选字段、运算符、输入类型、选项值等来自 **GET /customer-segmentation/fields**。可落表便于运维配置，或由后端写死与客户主表/标签对齐。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | bigint | 主键 | 1 | 是 | PK |
| field | varchar(64) | 字段标识（与规则 predicate.field 一致） | ageGroup、annualSpend、systemTag | 是 | UK 或 唯一(field) |
| label | varchar(128) | 展示名称 | 年龄段、年均消费、系统标签 | 是 | |
| operators | json | 支持的运算符列表 | ["equals","notEquals","between","greaterThan"] | 是 | 与前端 operators 一致 |
| input_type | varchar(32) | 输入类型：checkbox/radio/cascader/treeselect/daterange/number/numberrange/select/tagselect | numberrange | 是 | |
| options | json | 选项列表 [{ label, value }]（select/radio/checkbox 等） | [] | 否 | |
| async_search | tinyint | 是否异步搜索（如分群下拉） | 0/1 | 否 | 默认 0 |
| unit | varchar(20) | 单位（万元、元、次、单） | 元 | 否 | |
| multiple | tinyint | 是否多选（select） | 0/1 | 否 | 默认 0 |
| section_key | varchar(32) | 所属区块：basic/value/vehicle/sales/afterSales/tags | value | 否 | 前端分组展示 |
| sort_order | int | 同区块内排序 | 1 | 否 | 默认 0 |

**建议索引**：`uk_field`、`idx_section_key`。

前端当前字段示例（与 Mock 及 segmentFilterFields 一致）：ageGroup、gender、city、familyStatus、contactValidity、modelLine、carAge、usage、lastVisit、visits90D、annualSpend、segment、systemTag、oppLevel、loyalty、totalCarPrice、totalOptionPrice、afterSalesSelfPayAmount、customerValueTier、modelLines、completedOrderCount、visitsIn2Years、selfPayAmountIn2Years、lastServiceOrderDate、lastPurchaseDeliveryDate 等。

---

### 3.9 分群成员/快照表（segment_member 或 segment_snapshot，可选）

**说明**：分群生效后，可将命中规则的客户 one_id 落表，用于导出、推送、成员数统计；或按快照批次存储，便于历史对比。

**segment_member（按分群+客户）**

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | bigint | 主键 | 1 | 是 | PK |
| segment_id | varchar(64) | 分群 ID | SEG_001 | 是 | FK、索引 |
| one_id | varchar(64) | 客户 OneID | ONE_001 | 是 | 索引 |
| snapshot_id | varchar(64) | 所属快照批次（若按快照管理） | SNAP_20260316 | 否 | 索引 |
| created_at | datetime | 入库时间 | — | 否 | |

**建议索引**：`uk_segment_one`(segment_id, one_id)、`idx_segment_id`、`idx_one_id`、`idx_snapshot_id`。

**segment_snapshot（快照批次，可选）**

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| id | varchar(64) | 主键，快照 ID | SNAP_20260316 | 是 |
| segment_id | varchar(64) | 分群 ID | SEG_001 | 是 |
| member_count | int | 该快照成员数 | 5200 | 是 |
| created_at | datetime | 生成时间 | 2026-03-16 02:00:00 | 是 |

---

### 3.10 分群模块枚举与规则结构引用

**分群状态（status）**

| 值 | 说明 |
|----|------|
| draft | 草稿 |
| pending | 待审核 |
| active | 已生效 |
| inactive | 已停用 |

**规则结构**：与 **2.3 规则配置（RuleConfig / RuleNode）** 一致。树形 RuleNode：id、type（group/predicate）、operator（AND/OR）、field、operatorType、value、children。扁平格式：logic（AND/OR/NOT）、conditions（[{ field, operator, value }]）。后端解析 rule_payload 执行筛选、预估、样本、导出即可。

---

### 3.11 模拟验证接口（POST /customer-segmentation/simulate）

**入参**：`{ ruleConfig: RuleConfig | RuleNode }`。用于规则编辑器内即时校验。

**出参**：`{ estimatedCount: number, estimatedRate: string }`。与 3.5 预估接口一致，可不落库。

---

## 四、商机模块（商机看板、商机列表、分发查询、商机追踪）

> 对应页面：**商机管理**（`/leadManagement/*`）：**商机看板**（Dashboard）、**商机列表**（List）、**规则配置/分发查询**（RuleConfig）、**商机追踪**（Tracking）、**审计中心**（AuditCenter）。商机由规则或手工创建，推送至 BDC 外呼等系统，审计日志记录全链路操作；追踪用于统计成交、订单与转化率。

---

### 4.1 商机主表（lead）

**说明**：每条记录为一条商机，关联客户 one_id、规则 rule_id，含推送状态与负载 payload；列表、看板、推送、重载均依赖本表。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | varchar(64) | 主键 | LEAD_202403010001、LEAD-001 | 是 | PK |
| one_id | varchar(64) | 关联客户 OneID | ONE_001 | 是 | 索引、列表筛选 |
| customer_name | varchar(128) | 客户姓名 | 张三 | 是 | 列表展示 |
| phone | varchar(32) | 联系电话（可脱敏存储） | 13800138000、138****8888 | 否 | |
| lead_type | varchar(64) | 商机类型（见 4.12 枚举） | aftersales_cs、newcar_cs、bdc_renewal | 是 | 列表筛选、索引 |
| rule_id | varchar(64) | 触发规则 ID | RULE_001 | 是 | FK、索引 |
| rule_name | varchar(128) | 触发规则名称 | 新转续提醒规则 | 是 | 列表展示 |
| priority | varchar(20) | low/medium/high | high | 是 | 列表筛选 |
| status | varchar(20) | 商机状态（见 4.12） | pushed、completed、pending、processing | 是 | 列表筛选、索引 |
| push_target | varchar(32) | 推送目标系统 | BDC外呼系统 | 否 | 列表筛选 |
| push_role | varchar(20) | 推送角色：SA/SC/OTHER（可选） | SA | 否 | 列表展示 |
| push_status | varchar(20) | 推送状态：pending/success/failed | success | 否 | 列表筛选 |
| push_time | datetime | 推送时间 | 2026-03-16 10:00:00 | 否 | 列表展示、排序 |
| assigned_advisor | varchar(64) | 分配的 SA/SC 姓名 | 李四 | 否 | 列表展示、追踪筛选 |
| payload | json | 商机负载数据（见 4.11 PayloadDetail） | {} | 是 | |
| created_at | datetime | 创建时间 | 2026-03-16 09:00:00 | 是 | 索引、列表排序 |
| updated_at | datetime | 更新时间 | — | 否 | |
| processed_by | varchar(64) | 处理人 | bdc_specialist_01 | 否 | |
| processed_at | datetime | 处理时间 | 2026-03-16 10:20:00 | 否 | |
| feedback | varchar(512) | 处理反馈 | 已联系客户并预约进店 | 否 | |

**建议索引**：`PK id`、`idx_one_id`、`idx_lead_type`、`idx_status`、`idx_rule_id`、`idx_created_at`、`idx_push_time`、`idx_push_target`。

---

### 4.2 商机规则表（lead_rule）

**说明**：分发规则配置，触发类型为分群/事件/定时，生成指定 lead_type 并推送至 push_target；规则列表、启用/禁用、推送人数统计依赖本表。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | varchar(64) | 主键 | RULE_001 | 是 | PK |
| name | varchar(128) | 规则名称 | 维保到期提醒、新转续提醒规则 | 是 | 列表搜索 |
| description | varchar(512) | 描述 | 当车辆维保周期即将到期时自动生成商机 | 否 | |
| batch_no | varchar(64) | 批次号（手工上传批次等） | BATCH_20260316、BATCH-202401-001 | 否 | 列表筛选 |
| trigger_type | varchar(20) | segment/event/schedule | segment、event | 是 | 列表筛选、索引 |
| trigger_config | json | { segmentId?, eventType?, schedule?, conditions? } | {} | 是 | |
| lead_type | varchar(64) | 生成的商机类型 | aftersales_cs、maintenance_expiry | 是 | 列表筛选、索引 |
| priority | varchar(20) | low/medium/high | high | 是 | |
| push_target | varchar(32) | 推送目标 | BDC外呼系统 | 是 | 列表筛选 |
| push_count | int | 该规则已推送商机数量 | 100、120 | 否 | 列表展示 |
| push_config | json | { apiUrl?, headers?, retryTimes? } | {} | 否 | |
| enabled | tinyint(1) | 是否启用 | 1 | 是 | 列表筛选、索引 |
| creator | varchar(64) | 创建人 | admin | 是 | 列表筛选 |
| created_at | datetime | 创建时间 | 2026-03-16 09:00:00 | 否 | 索引 |
| updated_at | datetime | 更新时间 | — | 否 | |
| audit_status | varchar(20) | pending/approved/rejected | approved | 否 | |
| create_method | varchar(32) | manual_upload/system_generated | system_generated | 否 | 列表展示 |

**建议索引**：`PK id`、`idx_trigger_type`、`idx_lead_type`、`idx_enabled`、`idx_created_at`。

---

### 4.3 商机审计日志表（lead_audit_log）

**说明**：每次创建、推送、更新、重载、删除商机落一条审计记录，用于审计中心列表、详情、重载、导出；payload 存操作时完整负载，response_data 存下游响应。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | varchar(64) | 主键，审计流水号 | AUDIT_001、AUDIT-20240113-001 | 是 | PK |
| lead_id | varchar(64) | 商机 ID | LEAD_001 | 是 | FK、索引 |
| one_id | varchar(64) | 客户 OneID | ONE_001 | 是 | 索引、列表筛选 |
| customer_name | varchar(128) | 客户姓名 | 张三 | 否 | |
| lead_type | varchar(64) | 商机类型 | coupon_expiry | 否 | 列表筛选 |
| operation | varchar(20) | create/push/update/reload/delete | push | 是 | 列表筛选、索引 |
| operator | varchar(64) | 操作人 | admin、系统自动 | 是 | 列表筛选 |
| operate_time | datetime | 操作时间（精确到秒） | 2026-03-16 10:00:00 | 是 | 索引、列表排序 |
| target_system | varchar(32) | 推送目标系统 | BDC外呼系统 | 否 | |
| rule_id | varchar(64) | 触发规则 ID | RULE_001 | 否 | |
| rule_name | varchar(128) | 规则名称 | 维保到期提醒 | 否 | |
| payload | json | 操作时数据负载（推送到 BDC 的报文等） | {} | 是 | |
| result | varchar(20) | success/failed/pending | success | 是 | 列表筛选、索引 |
| error_message | varchar(512) | 错误信息 | — | 否 | |
| response_data | json | 下游系统响应（statusCode/message/data） | {} | 否 | |
| reload_count | int | 重载次数 | 0 | 否 | |
| last_reload_time | datetime | 最后重载时间 | — | 否 | |
| masked | tinyint(1) | 是否脱敏 | 0/1 | 否 | |
| mask_level | varchar(32) | 脱敏级别 | — | 否 | |
| batch_count | int | 批量数量 | 1 | 否 | |

**建议索引**：`idx_lead_id`、`idx_one_id`、`idx_operation`、`idx_operate_time`、`idx_result`。

---

### 4.4 商机追踪表或视图（lead_tracking）

**说明**：商机追踪页展示「推送后的商机+成交/订单汇总」。可与 lead 主表+订单/成交宽表关联生成视图，或独立表由跑批写入；列表筛选顾问、门店、是否成交、日期等。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | varchar(64) | 主键（可为 lead_id 或追踪行 ID） | — | 是 | PK |
| lead_id | varchar(64) | 商机 ID | LEAD_001 | 是 | FK、索引 |
| one_id | varchar(64) | 客户 OneID | ONE_001 | 是 | 索引 |
| customer_name | varchar(128) | 客户姓名 | 张三 | 是 | |
| phone | varchar(32) | 电话 | 13800138000 | 否 | |
| lead_type | varchar(64) | 商机类型 | coupon_expiry | 是 | 列表筛选、索引 |
| rule_name | varchar(128) | 规则名称 | 维保到期提醒 | 是 | |
| push_time | datetime | 推送时间 | 2026-03-16 10:00:00 | 是 | 索引、列表排序 |
| push_target | varchar(32) | 推送目标 | BDC外呼系统 | 是 | 列表筛选 |
| converted | tinyint(1) | 是否成交 | 0/1 | 是 | 列表筛选、索引 |
| converted_time | datetime | 成交时间 | — | 否 | |
| order_count | int | 订单数量 | 2 | 是 | 统计用 |
| total_order_amount | decimal(14,2) | 订单总金额 | 50000.00 | 是 | 统计用 |
| first_order_time | datetime | 首单时间 | — | 否 | |
| last_order_time | datetime | 末单时间 | — | 否 | |
| advisor_name | varchar(64) | 顾问姓名 | 李四 | 否 | 列表筛选 |
| store_name | varchar(128) | 保时捷中心/门店 | 上海保时捷中心 | 否 | 列表筛选 |
| status | varchar(20) | 商机状态 | pushed | 是 | 列表展示 |

**建议索引**：`idx_lead_id`、`idx_one_id`、`idx_lead_type`、`idx_push_time`、`idx_converted`、`idx_advisor_name`、`idx_store_name`。

---

### 4.5 商机看板统计接口（GET /lead/dashboard/stats）

**说明**：商机看板卡片与图表数据；可选日期范围。

**请求参数**：`startDate`、`endDate`（yyyy-MM-dd，可选）。

**出参（DashboardStats）**

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| todayTotal | number | 今日生成商机总数 | 331 | 是 |
| todayPushed | number | 今日已推送数 | 198 | 是 |
| pendingCount | number | 待处理数 | 78 | 是 |
| processingCount | number | 处理中数 | 45 | 是 |
| completedCount | number | 已完成数 | 208 | 是 |
| successRate | number | 推送成功率（百分比） | 92.5 | 是 |
| byType | array | 按商机类型统计 { type, count }[] | [] | 是 |
| byStatus | array | 按状态统计 { status, count }[] | [] | 是 |

看板若需「客户生命周期」「客户价值分层」等分组统计，可在此基础上扩展 byCategory 或与业务约定字段。

---

### 4.6 商机列表查询参数与出参（分发查询）

**列表接口**：**POST /lead/list**（与前端 getLeadList 一致）。

**查询参数（ReqLeadParams）**

| 参数名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| pageNum | int | 页码 | 1 | 否 |
| pageSize | int | 每页条数 | 10 | 否 |
| oneId | string | 客户 OneID（模糊/精确） | ONE_001 | 否 |
| leadType | string | 商机类型 | aftersales_cs | 否 |
| status | string | 状态：pushed/completed/followed/pending/processing/rejected/failed | pushed | 否 |
| ruleId | string | 规则 ID | RULE_001 | 否 |
| pushTarget | string | 推送目标 | BDC外呼系统 | 否 |
| pushStatus | string | 推送状态 | pending/success/failed | 否 |
| startDate | string | 创建/推送时间起 yyyy-MM-dd | 2026-03-01 | 否 |
| endDate | string | 创建/推送时间止 | 2026-03-16 | 否 |
| category | string | 分组筛选：general/system（前端传，后端可映射为多 leadType） | general | 否 |

**列表单条（LeadInfo，与 4.1 表对齐）**

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| id | string | 商机 ID | LEAD-001 | 是 |
| oneId | string | 客户 OneID | ONE-202401001 | 是 |
| customerName | string | 客户姓名 | 陈建华 | 是 |
| phone | string | 电话 | 138****8888 | 否 |
| leadType | string | 商机类型 | aftersales_cs | 是 |
| ruleId | string | 规则 ID | RULE-001 | 是 |
| ruleName | string | 规则名称 | 新转续提醒规则 | 是 |
| priority | string | low/medium/high | high | 是 |
| status | string | 见 4.12 | pending、pushed | 是 |
| pushTarget | string | 推送目标 | BDC外呼系统 | 否 |
| pushRole | string | SA/SC/OTHER | SA | 否 |
| pushStatus | string | pending/success/failed | pending | 否 |
| pushTime | string | 推送时间 | 2024-01-13 10:30:00 | 否 |
| assignedAdvisor | string | 分配顾问 | 张顾问 | 否 |
| payload | object | 负载（见 4.11） | {} | 是 |
| createdAt | string | 创建时间 | 2024-01-13 09:00:00 | 是 |
| updatedAt | string | 更新时间 | — | 否 |
| processedBy | string | 处理人 | — | 否 |
| processedAt | string | 处理时间 | — | 否 |
| feedback | string | 处理反馈 | — | 否 |

---

### 4.7 商机详情、创建、推送、重载

**详情**：**GET /lead/detail/:id**。响应单条 LeadInfo（含 payload 完整）。

**创建商机**：**POST /lead/create**。入参 **ReqLeadForm**：oneId、leadType、ruleId（可选）、priority、pushTarget、payload。

**批量推送**：**POST /lead/push**。入参 `{ leadIds: string[], target: PushTarget, force?: boolean }`。推送后更新 lead 的 push_status、push_time、assigned_advisor 等；并写入 4.3 审计日志。

**重载商机**：**POST /lead/reload/:id**。重新推送该商机，更新审计与 lead 推送相关字段；审计表 reload_count、last_reload_time 递增/更新。

---

### 4.8 规则列表/详情/保存/启用禁用/删除（分发查询）

**规则列表**：**POST /lead/rule/list**。查询参数：pageNum、pageSize、enabled（boolean，可选）。列表单条与 4.2 表一致，字段名驼峰（id、name、description、batchNo、triggerType、triggerConfig、leadType、priority、pushTarget、pushCount、pushConfig、enabled、creator、createdAt、updatedAt、auditStatus、createMethod）。

**规则详情**：**GET /lead/rule/detail/:id**。

**保存规则**：**POST /lead/rule/add**、**PUT /lead/rule/edit**。入参与 4.2 表及 Lead.RuleConfig 一致（含 triggerConfig.segmentId、eventType、schedule、conditions）。

**启用/禁用**：**PUT /lead/rule/toggle/:id**。入参 `{ enabled: boolean }`。

**删除规则**：**DELETE /lead/rule/delete/:id**。

---

### 4.9 审计日志列表/详情/重载/导出

**审计列表**：**POST /lead/audit/list**。查询参数：pageNum、pageSize、leadId、oneId、operation、startDate、endDate。列表单条 **AuditLog** 与 4.3 表一致（id、leadId、oneId、customerName、leadType、operation、operator、operateTime、targetSystem、ruleId、ruleName、payload、result、errorMessage、responseData、reloadCount、lastReloadTime、masked、maskLevel、batchCount）。

**审计详情**：**GET /lead/audit/detail/:id**。

**重载（重新推送）**：**POST /lead/audit/reload/:id**。根据该条审计对应商机再次推送，并落新审计记录。

**导出**：**GET 或 POST /lead/audit/export/:id**。参数 format=pdf|excel，响应文件流。

---

### 4.10 商机追踪统计与列表

**追踪统计**：**GET /lead/tracking/stats**。参数：startDate、endDate、leadType（可选）。出参 **LeadTrackingStats**：totalGenerated、totalPushed、convertedCount、orderCount、totalOrderAmount、conversionRate、avgOrderAmount、byType（type、pushed、converted、orderCount、orderAmount）、byDate（date、pushed、converted、orderCount、orderAmount）。

**追踪列表**：**POST /lead/tracking/list**。查询参数 **ReqLeadTrackingParams**：pageNum、pageSize、leadType、pushTarget、converted、startDate、endDate、oneId、customerName、advisorName、storeName。列表单条 **LeadTrackingItem**：id、leadId、oneId、customerName、phone、leadType、ruleName、pushTime、pushTarget、converted、convertedTime、orderCount、totalOrderAmount、firstOrderTime、lastOrderTime、advisorName、storeName、status。与 4.4 表或视图一致。

---

### 4.11 商机负载 PayloadDetail（payload JSON 结构）

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| contacts | array | 联系人 [{ name, phone, relation?, isPrimary? }] | [] | 否 |
| addresses | array | 地址 [{ province?, city?, district?, detail?, fullAddress? }] | [] | 否 |
| vehicleInfo | object | { brand?, model?, plateNumber?, vin?, lastServiceDate?, nextServiceDate?, mileage? } | {} | 否 |
| businessInfo | object | maintenanceExpiryDate?、couponBalance?、lastServiceDate?、nextServiceDate? 等 | {} | 否 |
| [key: string] | any | 其他业务属性（如 triggerReason、leadType、couponInfo、churnRisk、valueSegment） | — | 否 |

前端 Mock 中 payload 还含 oneId、customerName、phone、leadType、triggerReason 及按类型的扩展（vehicleInfo、couponInfo、customerMetrics、churnRisk、repurchaseInfo、upgradeInfo、valueSegment 等），后端可按需落库或仅存 JSON。

---

### 4.12 商机模块枚举（与前端一致）

**商机状态 status**：pushed（已推送）、completed（已成交）、followed（已跟进）、pending（待处理）、processing（处理中）、rejected（已拒绝）、failed（失败）。列表展示可归并为：已推送、已成交、已跟进。

**推送状态 push_status**：pending、success、failed。

**操作类型 operation**：create、push、update、reload、delete。

**审计结果 result**：success、failed、pending。

**商机类型 lead_type**：与产品约定一致，如 aftersales_cs、newcar_cs、cm_custom、bdc_aftersales_recall、bdc_renewal、bdc_campaign、pcn_aftersales_campaign、ttr_survey 等；列表/看板可按 general（通用）、system（C360 系统）分组。

**优先级 priority**：low、medium、high。

**推送目标 push_target**：BDC外呼系统 等。

**触发类型 trigger_type**：segment（分群）、event（事件）、schedule（定时）。

**规则审核 audit_status**：pending、approved、rejected。

**创建方式 create_method**：manual_upload、system_generated。

---

## 五、数据催收模块

> 对应页面：**数据催收配置**（`/collection/config`，组件 `collection/config/index.vue`）、**催收监控**（`/collection/monitor`，组件 `collection/monitor/index.vue`）。按报表配置 T+0/T+1/T+2 时间节点与收件人、兜底抄送邮箱、全局监控规则；监控列表按数据源/上传状态筛选，支持发送催收通知。**与上传闭环**：数据源/报表 ID 与 **八、数据文件上传** 的 8.4/8.1、**十、源数据采集** 的 10.1/10.2 一致；催收监控的「是否已上传」可基于 8.1 上传日志或 10.2 按日状态计算；工作台「邮件通知规则」与本节催收时间节点建议统一配置（见 5.8）。以下表结构可直接用于建表与接口设计。

---

### 5.1 催收配置主表（collection_config）

**说明**：全局仅一条或按租户一条；`platforms` 存各平台/报表的催收配置（含 schedules），与前端按 Tab（报表）配置对应。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | bigint | 主键 | 1 | 是 | PK |
| platforms | json | 平台配置列表（见 5.2 PlatformConfig） | [] | 是 | 前端按 report_id 维度的配置 |
| schedules | json | 催收时间节点（兼容旧版，见 5.6 CollectionSchedule） | [] | 否 | 可与 platforms[].schedules 二选一或并存 |
| cc_email | varchar(256) | 兜底抄送邮箱 | cc@example.com | 是 | 手动上传催收兜底 |
| global_rules | json | 全局监控规则（见 5.3 GlobalRuleConfig） | [] | 否 | 自动数据源/数据质量/系统扩容 |
| created_at | datetime | 创建时间 | 2024-01-01 12:00:00 | 否 | |
| updated_at | datetime | 更新时间 | — | 否 | |

**建议索引**：`PK id`（单条配置时可不建其他索引）。

---

### 5.2 平台配置（PlatformConfig，JSON 内嵌于 5.1.platforms 或独立子表 platform_collection_config）

**说明**：每个「数据源+报表」一条；`report_id` 与 **8.4 报表配置**、**10.1 数据源/报表配置** 一致，便于与上传 Tab、今日采集状态对齐。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| platform | varchar(32) | 平台展示名：DMS/POAS/WWS/C@P系统/Voucher/Manual Files | POAS | 是 | 与 8.8 数据源枚举对应 |
| category | varchar(32) | 平台分类 | 手动上传 | 是 | |
| report_id | varchar(64) | 报表 ID（与 8.4.id、10.1.report_id 一致） | poas_opp、wws_activity | 否 | 列表筛选、与上传闭环关键 |
| report_name | varchar(128) | 报表展示名 | 商机表、活动列表 | 否 | |
| schedules | json | PlatformSchedule[]（见 5.6）：stage/time/employeeIds/description | [] | 是 | 与 8.5/8.6 通知配置可统一 |

---

### 5.3 全局监控规则（GlobalRuleConfig，JSON 内嵌于 5.1.global_rules）

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| key | varchar(64) | auto_source_stopped/data_quality_fatal/system_capacity_threshold | data_quality_fatal | 是 | 规则键 |
| enabled | tinyint(1) | 是否启用 | 1 | 是 | |
| threshold_percent | int | 资源阈值（百分比，仅 system_capacity_threshold 用） | 80 | 否 | |
| extra_recipients | varchar(512) | 额外抄送邮箱（逗号分隔） | a@x.com,b@x.com | 否 | |

---

### 5.4 催收监控记录表（collection_monitor）

**说明**：按「数据负责人+数据源（+报表）」维度的一条监控记录；`upload_status` 可由 **8.1 上传日志** 或 **10.2 今日采集状态** 按截止时间与实际上传时间计算得出（见 5.8 闭环）。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | bigint | 主键 | 1 | 是 | PK |
| employee_id | bigint | 数据负责人（关联 5.5 或 user 表） | 1001 | 否 | FK、索引；无则用 employee_name/email |
| employee_name | varchar(64) | 数据负责人姓名 | 张三 | 是 | 列表展示、筛选 |
| email | varchar(128) | 邮箱 | zhangsan@example.com | 是 | 催收发送、筛选 |
| data_source | varchar(64) | 数据源（与 8.1.data_source、8.8 枚举一致） | poas、wws、dms | 是 | 列表筛选、索引 |
| report_id | varchar(64) | 报表 ID（与 8.1.report_id、8.4 一致，可选） | poas_opp | 否 | 与上传闭环、列表筛选 |
| upload_status | varchar(20) | pending/overdue/completed（见 5.7 枚举） | overdue | 是 | 列表筛选、索引 |
| deadline | varchar(64) | 截止时间展示（如 T+1 18:00） | T+1 18:00 | 是 | 列表展示 |
| deadline_at | datetime | 截止时间点（可选，用于计算 overdue） | 2026-03-16 18:00:00 | 否 | 索引 |
| overdue_days | int | 逾期天数 | 2 | 否 | 列表展示 |
| status | varchar(20) | 员工状态：active/resigned | active | 是 | 列表筛选、索引 |
| department | varchar(64) | 部门 | 数据部 | 否 | |
| position | varchar(64) | 职位 | 数据专员 | 否 | |
| last_nudge_time | datetime | 最后催收时间 | 2026-03-15 09:00:00 | 否 | 列表展示 |
| nudge_count | int | 催收次数 | 3 | 否 | |
| stat_date | date | 统计日期（昨日本批，与 10.2 对齐） | 2026-03-15 | 否 | 索引，按日+报表判定是否到位 |
| created_at | datetime | 创建时间 | — | 否 | |
| updated_at | datetime | 更新时间 | — | 否 | |

**建议索引**：`PK id`、`idx_data_source`、`idx_report_id`、`idx_upload_status`、`idx_employee_id`、`idx_stat_date`、`idx_status`。

---

### 5.5 员工表（collection_employee，若独立维护；或复用系统 user 表）

**说明**：供催收配置选择「收件人」、监控列表展示负责人；若与账号管理统一则可关联 user 表。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | bigint | 主键 | 1 | 是 | PK |
| name | varchar(64) | 姓名 | 张三 | 是 | 列表展示、筛选 |
| email | varchar(128) | 邮箱 | zhangsan@example.com | 是 | UK 或 唯一、催收发送 |
| department | varchar(64) | 部门 | 数据部 | 否 | |
| position | varchar(64) | 职位 | 数据专员 | 否 | |
| status | varchar(20) | active/resigned | active | 否 | 列表筛选、索引 |

**建议索引**：`PK id`、`uk_email`、`idx_status`。

---

### 5.6 催收时间节点结构（PlatformSchedule / CollectionSchedule）

**说明**：与 **8.6 通知规则时间线表** 对齐，可统一为同一套配置驱动「数据质量工作台-邮件通知规则」与「数据催收-T+0/T+1/T+2」。

**PlatformSchedule**（存于 5.2.schedules 或 8.6 子表）

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| stage | varchar(20) | 阶段：T+0、T+1、T+2 | T+0 | 是 |
| time | varchar(20) | 时间点 | 18:00、09:00 | 是 |
| employeeIds | array | 收件人员工 ID 列表 | [1,2] | 否 |
| description | varchar(256) | 阶段描述 | 当日数据需在 18:00 前上传 | 否 |

**CollectionSchedule**（兼容旧版，存于 5.1.schedules）

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| stage | varchar(20) | T+0/T+1/T+2 | T+0 | 是 |
| time | varchar(20) | 时间点 | 18:00 | 是 |
| recipientType | varchar(20) | owner/manager/dept_head | owner | 否 |
| recipientEmail | varchar(256) | 收件人邮箱（多个逗号分隔） | a@x.com,b@x.com | 否 |
| description | varchar(256) | 阶段描述 | — | 否 |

---

### 5.7 列表查询参数与接口约定

**催收配置**

- **GET /collection/config**：获取催收配置（一条）。出参：id、platforms、schedules、ccEmail、globalRules、createdAt、updatedAt；platforms 内每条含 platform、category、reportId、reportName、schedules（PlatformSchedule[]）。
- **POST /collection/config**：保存催收配置。入参与出参结构一致（platforms、ccEmail、globalRules 等）。

**催收监控列表**

- **POST /collection/monitor/list**（与前端 getCollectionMonitorList 一致）。

**查询参数**

| 参数名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| pageNum | int | 页码 | 1 | 否 |
| pageSize | int | 每页条数 | 10 | 否 |
| dataSource | string | 数据源筛选 | poas、dms | 否 |
| reportId | string | 报表 ID 筛选 | poas_opp | 否 |
| uploadStatus | string | pending/overdue/completed | overdue | 否 |
| employeeName | string | 负责人姓名（模糊） | 张 | 否 |
| email | string | 邮箱（模糊） | @company.com | 否 |
| status | string | 员工状态：active/resigned | active | 否 |

**列表单条出参（与 5.4 表一致，驼峰命名）**

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | number | 主键 | 1 |
| employeeName | string | 数据负责人姓名 | 张三 |
| email | string | 邮箱 | zhangsan@example.com |
| dataSource | string | 数据源 | DMS、poas |
| reportId | string | 报表 ID（可选） | poas_opp |
| uploadStatus | string | pending/overdue/completed | overdue |
| deadline | string | 截止时间展示 | T+1 18:00 |
| overdueDays | number | 逾期天数 | 2 |
| status | string | active/resigned | active |
| department | string | 部门 | 数据部 |
| position | string | 职位 | 数据专员 |
| lastNudgeTime | string | 最后催收时间 | 2026-03-15 09:00:00 |
| nudgeCount | number | 催收次数 | 3 |
| createdAt | string | 创建时间 | — |
| updatedAt | string | 更新时间 | — |

响应格式：`{ code, msg, data: { list: [], total: n } }`。

**发送催收通知**

- **POST /collection/nudge**。入参：email（必填）、message（可选）、employeeId（可选）。出参：`{ success, message }`。后端可记录 last_nudge_time、nudge_count 到 5.4。

**员工列表（供配置页选收件人）**

- **GET /collection/employees**。出参：`{ code, msg, data: Employee[] }`，单条：id、name、email、department、position、status。

---

### 5.8 枚举与闭环说明

**上传状态（upload_status）**：pending 待上传、overdue 已逾期、completed 已完成。

**员工状态（status）**：active 在职、resigned 离职。

**全局规则 key（global_rules.key）**：auto_source_stopped（自动数据源停用）、data_quality_fatal（数据质量严重问题）、system_capacity_threshold（系统容量/扩容阈值）。

**与数据文件上传、源数据采集的闭环**

- **报表/数据源统一**：5.2.report_id、5.4.report_id / data_source 与 **8.4 报表配置** id/source、**8.1 上传日志** data_source/report_id、**10.1 数据源/报表配置** report_id/report_source 保持一致；前端「数据催收配置」Tab 与「数据质量工作台」Tab、「今日数据采集状态」卡片共用同一套报表清单（见 constants 的 PLATFORM_REPORTS、ORDERED_PLATFORM_KEYS）。
- **催收监控状态来源**：`upload_status`（pending/overdue/completed）可由以下方式计算：  
  - 按「统计日 stat_date + report_id」查询 **8.1** 是否有该日该报表的 upload_status=success 且 imported_at 在 deadline 前；无则为 pending 或 overdue（结合 deadline_at 与当前时间算 overdue_days）。  
  - 或使用 **10.2 今日数据采集状态** 的 status（success/warning/error/gray）映射为 completed/pending/overdue。
- **通知配置统一**：**8.5 数据源通知配置**、**8.6 通知规则时间线** 与 5.1/5.2 的 schedules（PlatformSchedule）建议共用同一套配置或同步：工作台「邮件通知规则」展示的截止时间、T+0/T+1 时间线与催收配置一致，避免两处维护。

---

## 六、权限与系统模块（账号管理、角色管理、部门管理）

> 对应页面：**账号管理**（`/system/accountManage`）、**角色管理**（`/system/roleManage`）、**部门管理**（`/system/departmentManage`）。闭环关系：账号归属部门（dept_id）、分配角色（user_role）；角色具备功能权限（菜单/页面/按钮）、数据范围、字段脱敏；部门树供账号选归属、角色数据范围选部门。以下表结构可直接用于建表与接口设计。

---

### 6.1 账号/用户表（user）

**说明**：系统用户/账号，登录名唯一；归属部门、角色通过 dept_id 与 user_role 关联；列表支持按部门树筛选、按状态/用户名/手机号搜索。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| user_id | bigint / varchar(64) | 主键 | 1、U001 | 是 | PK |
| user_name | varchar(64) | 登录名（唯一） | admin、zhangsan | 是 | UK、列表搜索 |
| nick_name | varchar(64) | 用户昵称/姓名 | 管理员、张三 | 否 | 列表展示 |
| password | varchar(128) | 密码（加密存储） | — | 新增时必填 | 不返前端 |
| dept_id | bigint / varchar(64) | 归属部门 ID | 100、101 | 否 | FK、列表筛选、索引 |
| phonenumber | varchar(20) | 手机号码 | 15888888888 | 否 | 列表搜索 |
| email | varchar(128) | 邮箱 | admin@163.com | 否 | |
| sex | char(1) / varchar(10) | 性别：0 男 1 女 2 未知 | 0 | 否 | 字典 |
| avatar | varchar(256) | 头像 URL | — | 否 | |
| status | char(1) | 状态：0 正常 1 停用 | 0 | 是 | 列表筛选、索引 |
| create_time | datetime | 创建时间 | 2023-01-01 12:00:00 | 否 | 列表排序、索引 |
| update_time | datetime | 更新时间 | — | 否 | |
| remark | varchar(512) | 备注 | — | 否 | |
| id_card | varchar(32) | 身份证号（可选） | — | 否 | |
| address | varchar(256) | 地址（可选） | — | 否 | |

**建议索引**：`PK user_id`、`uk_user_name`、`idx_dept_id`、`idx_status`、`idx_create_time`、`idx_phonenumber`。

**列表查询参数**：pageNum、pageSize、userName、phonenumber、status、deptId（部门树选中）、createTime（日期范围）。  
**列表单条出参**：userId、userName、nickName、deptId、deptName（关联查）、phonenumber、email、sex、status、createTime、postIds、roleIds（可选，用于回显分配岗位/角色）。

**接口约定**：**POST /user/list**（列表）、**GET /user/department**（部门树，供筛选与表单归属部门）、**GET /user/role**（角色字典，供表单分配角色）、**GET /user/status**（状态字典）、**POST /user/add**（新增）、**POST /user/edit**（编辑）、**POST /user/delete**（删除，入参 id 数组）、**POST /user/change**（切换状态，入参 id、status）、**POST /user/rest_password**（重置密码，入参 id）、**POST /user/export**（导出）。新增/编辑表单入参：userName、nickName、deptId、phonenumber、email、sex、status、remark、password（新增）、roleIds、postIds（若有岗位表）。

---

### 6.2 用户-角色关联表（user_role）

**说明**：多对多，一个用户可挂多个角色；角色管理「分配用户」、账号管理「分配角色」均依赖本表。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | bigint | 主键 | 1 | 是 | PK |
| user_id | bigint / varchar(64) | 用户 ID | 1 | 是 | FK、索引 |
| role_id | bigint / varchar(64) | 角色 ID | 1 | 是 | FK、索引 |

**建议索引**：`uk_user_role`(user_id, role_id)、`idx_user_id`、`idx_role_id`。

---

### 6.3 角色表（role）

**说明**：角色具备基础信息、功能权限（菜单+页面访问+操作按钮）、数据范围、字段脱敏；功能权限与前端 pageAccess、operationButtons 一致时可存 JSON 或拆 role_menu、role_permission 表。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| role_id | bigint / varchar(64) | 主键 | 1、ROLE_001 | 是 | PK |
| role_name | varchar(64) | 角色名称 | 超级管理员、销售经理 | 是 | 列表搜索 |
| role_key | varchar(64) | 权限字符（如 @ss.hasRole('admin')） | admin、sales_manager | 是 | UK、列表搜索 |
| role_sort | int | 显示排序 | 0、1 | 是 | |
| status | char(1) | 状态：0 正常 1 停用 | 0 | 是 | 列表筛选、索引 |
| role_level | varchar(32) | 角色等级：admin/manager/employee/dataSpecialist | admin | 否 | 列表展示 |
| role_description | varchar(512) | 角色描述 | 拥有系统所有权限 | 否 | |
| create_time | datetime | 创建时间 | 2023-01-01 12:00:00 | 否 | 索引 |
| update_time | datetime | 更新时间 | — | 否 | |
| remark | varchar(512) | 备注 | — | 否 | |
| data_scope | char(1) | 数据范围：1 全部 2 自定义 3 本部门 4 本部门及以下 5 仅本人 | 1 | 否 | |
| menu_ids | json / 关联表 | 菜单 ID 列表（与 6.7 菜单表关联） | [1,2,3] | 否 | 若用 role_menu 表则无需本字段 |
| dept_ids | json | 数据范围=自定义时的部门 ID 列表 | [] | 否 | |
| data_scope_config | json | { scopeType, customDeptIds } | {} | 否 | |
| functional_permissions | json | { menuIds, pageAccess, operationButtons }，与前端一致 | 见下 | 否 | 页面访问与按钮权限 |
| field_masking | json | 按业务对象配置字段脱敏 { customerProfile: { phone: { visibility, maskingRule, decryptPermission } } } | {} | 否 | |
| menu_check_strictly | tinyint(1) | 菜单树是否父子不关联 | 1 | 否 | |
| dept_check_strictly | tinyint(1) | 部门树是否父子不关联 | 1 | 否 | |

**functional_permissions 结构**：menuIds（菜单 ID 数组）、pageAccess（页面 key 与是否可访问，如 customerList: true）、operationButtons（页面 key 与按钮 key 数组，如 customerList: ["add","export"]）。与前端 roleManagementMockData、FunctionalPermission 一致。

**建议索引**：`PK role_id`、`uk_role_key`、`idx_role_name`、`idx_status`、`idx_create_time`。

**列表查询参数**：pageNum、pageSize、roleName、roleKey、status。  
**列表单条出参**：roleId、roleName、roleKey、roleSort、status、roleLevel、roleDescription、createTime、remark、menuIds、dataScope、dataScopeConfig、functionalPermissions、fieldMasking（与 6.3 表一致）。  
**接口约定**：**POST /role/list**（列表）、**GET /role/detail/:id**（详情）、**POST /role/add**、**PUT /role/edit**、**DELETE /role/delete/:id**、**GET /role/menu/tree**（功能权限用菜单树）、**PUT /role/toggle/:id**（启用/停用，入参 enabled）。分配用户：**GET /role/users**（该角色下用户列表）、**POST /role/assignUsers**（添加用户）、**POST /role/cancelUser**（取消授权）。

---

### 6.4 角色-菜单关联表（role_menu，可选）

**说明**：若菜单权限不用 JSON 存储，可用本表；前端功能权限 Tab 勾选菜单后提交 menuIds，后端写 role_menu。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | bigint | 主键 | 1 | 是 | PK |
| role_id | bigint / varchar(64) | 角色 ID | 1 | 是 | FK、索引 |
| menu_id | bigint | 菜单 ID | 1 | 是 | FK、索引 |

**建议索引**：`uk_role_menu`(role_id, menu_id)、`idx_role_id`、`idx_menu_id`。

---

### 6.5 部门表（department / dept）

**说明**：树形结构，parent_id=0 为根；账号管理归属部门、角色数据范围「自定义」选部门均依赖部门树。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| dept_id | bigint / varchar(64) | 主键 | 100、DEPT_001 | 是 | PK |
| parent_id | bigint / varchar(64) | 父部门 ID，0 表示根 | 0、100 | 是 | 索引、树查询 |
| dept_name | varchar(128) | 部门名称 | 总公司、研发部门 | 是 | 列表搜索 |
| order_num | int | 显示排序 | 0、1 | 是 | |
| leader | varchar(64) | 负责人 | 若依 | 否 | |
| phone | varchar(20) | 联系电话 | 15888888888 | 否 | |
| email | varchar(128) | 邮箱 | ry@qq.com | 否 | |
| status | char(1) | 状态：0 正常 1 停用 | 0 | 是 | 列表筛选、索引 |
| create_time | datetime | 创建时间 | 2023-01-01 12:00:00 | 否 | |
| update_time | datetime | 更新时间 | — | 否 | |

**建议索引**：`PK dept_id`、`idx_parent_id`、`idx_status`、`idx_dept_name`。

**树形列表**：**GET /dept/tree** 或 **POST /dept/list**（返回树形 children）；筛选条件：deptName、status。  
**列表单条**：deptId、parentId、deptName、orderNum、leader、phone、email、status、createTime、children（子节点）。  
**接口约定**：**GET /dept/list** 或 **GET /dept/tree**（树形数据）、**POST /dept/add**（新增，入参 parentId、deptName、orderNum、leader、phone、email、status）、**PUT /dept/edit**（编辑）、**DELETE /dept/delete/:id**（删除，需校验是否有子部门或用户）。账号管理侧 **GET /user/department** 可复用部门树接口。

---

### 6.6 菜单表（menu，与 authMenuList 结构对应）

**说明**：前端路由/菜单配置，与 authMenuList、角色功能权限菜单树一致；角色管理「功能权限」Tab 的菜单树数据来源。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | bigint | 主键 | 1 | 是 | PK |
| path | varchar(128) | 路由路径 | /customer/list | 是 | |
| name | varchar(64) | 路由名称（唯一） | customerList | 是 | UK |
| component | varchar(256) | 组件路径 | /customerList/index | 否 | |
| redirect | varchar(128) | 重定向 | /customer/list | 否 | |
| parent_id | bigint | 父菜单 ID，0 为根 | 0 | 否 | 索引、树查询 |
| icon | varchar(64) | 图标名 | List | 否 | |
| title | varchar(64) | 菜单标题 | 客户列表 | 是 | |
| is_link | varchar(256) | 外链，空为非外链 | "" | 否 | |
| is_hide | tinyint(1) | 是否隐藏 | 0 | 是 | |
| is_full | tinyint(1) | 是否全屏 | 0 | 是 | |
| is_affix | tinyint(1) | 是否固定标签 | 0 | 是 | |
| is_keep_alive | tinyint(1) | 是否缓存 | 1 | 是 | |
| sort | int | 排序 | 10 | 否 | |

**建议索引**：`PK id`、`uk_name`、`idx_parent_id`。

---

### 6.7 岗位表（post，可选）

**说明**：账号管理表单有「岗位」多选；若需岗位维度的权限或展示，可落本表，并建 user_post 关联表。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| post_id | bigint | 主键 | 1 | 是 | PK |
| post_name | varchar(64) | 岗位名称 | 董事长、部门经理 | 是 | |
| post_code | varchar(32) | 岗位编码 | — | 否 | |
| sort | int | 排序 | 0 | 否 | |
| status | char(1) | 0 正常 1 停用 | 0 | 是 | |

**用户-岗位关联表 user_post**：user_id、post_id，多对多。

---

### 6.8 枚举与闭环说明

**账号状态 status**：0 正常、1 停用。  
**性别 sex**：0 男、1 女、2 未知。  
**角色状态 status**：0 正常、1 停用。  
**角色等级 role_level**：admin、manager、employee、dataSpecialist（与前端 i18n 一致）。  
**数据范围 data_scope**：1 全部、2 自定义、3 本部门、4 本部门及以下、5 仅本人。  
**部门状态 status**：0 正常、1 停用。

**闭环**：用户通过 dept_id 归属部门，通过 user_role 关联角色；角色通过 menu_ids/role_menu 控制菜单，通过 functional_permissions 控制页面与按钮，通过 data_scope/data_scope_config 控制数据范围，通过 field_masking 控制字段脱敏；部门树在账号管理用于筛选与选归属部门，在角色数据范围用于自定义部门。登录后根据用户→角色→菜单/功能权限渲染侧栏与按钮，根据数据范围过滤列表数据，根据字段脱敏规则脱敏展示。

---

### 6.9 通知公告（system_notice）

> 对应页面：**通知公告**（`/system/noticeManage`，组件 `noticeManage/index.vue`）。公告的增删改查、按类型（通知/公告）与状态（正常/关闭）筛选、富文本内容、发布操作（关闭→正常）。以下表结构可直接用于建表与接口设计。

#### 6.9.1 通知公告主表（system_notice / notice）

**说明**：每条记录为一条通知或公告，含标题、类型、富文本内容、状态；列表支持按标题、类型、状态、创建者、创建时间筛选；支持「发布」将状态由关闭改为正常。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| notice_id | bigint | 主键 | 1 | 是 | PK |
| notice_title | varchar(200) | 公告标题 | 系统维护通知 | 是 | 列表搜索 |
| notice_type | char(1) | 公告类型（见 6.9.4 枚举）：1 通知 2 公告 | 1 | 是 | 列表筛选、索引 |
| notice_content | longtext | 公告内容（富文本 HTML） | \<p\>…\</p\> | 否 | 详情/编辑用 |
| status | char(1) | 状态：0 正常 1 关闭 | 0 | 是 | 列表筛选、索引；发布即改为 0 |
| create_by | varchar(64) | 创建者 | admin | 否 | 列表展示、筛选 |
| create_time | datetime | 创建时间 | 2023-01-01 12:00:00 | 否 | 列表排序、索引 |
| update_by | varchar(64) | 更新者 | admin | 否 | |
| update_time | datetime | 更新时间 | — | 否 | |
| remark | varchar(512) | 备注 | — | 否 | |

**建议索引**：`PK notice_id`、`idx_notice_type`、`idx_status`、`idx_create_time`、`idx_create_by`、`idx_notice_title`（模糊时）。

---

#### 6.9.2 列表查询参数与出参

**列表接口**：**GET /system/notice/list**（与前端 listNotice 一致）。支持分页及下列筛选。

**查询参数**

| 参数名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| pageNum | int | 页码 | 1 | 否 |
| pageSize | int | 每页条数 | 10 | 否 |
| noticeTitle | string | 公告标题（模糊） | 维护 | 否 |
| noticeType | string | 公告类型：1 通知 2 公告 | 1 | 否 |
| status | string | 状态：0 正常 1 关闭 | 0 | 否 |
| createBy | string | 创建者（模糊） | admin | 否 |

**列表单条出参（与 6.9.1 表一致）**

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| noticeId | number / string | 主键 | 1 | 是 |
| noticeTitle | string | 公告标题 | 系统维护通知 | 是 |
| noticeType | string | 1 通知 2 公告 | 1 | 是 |
| noticeContent | string | 富文本内容（列表可不返） | — | 否 |
| status | string | 0 正常 1 关闭 | 0 | 是 |
| createBy | string | 创建者 | admin | 否 |
| createTime | string | 创建时间 | 2023-01-01 12:00:00 | 否 |
| updateBy | string | 更新者 | — | 否 |
| updateTime | string | 更新时间 | — | 否 |

响应格式可为 `{ rows: [], total: n }` 或 `{ list: [], total: n }`，前端已兼容 rows/list。

---

#### 6.9.3 详情、新增、修改、删除、发布

**详情**：**GET /system/notice/:noticeId**。响应单条公告（含 noticeContent 完整），用于修改弹窗回显。

**新增**：**POST /system/notice**。入参：noticeTitle（必填）、noticeType（必填）、noticeContent、status（默认 0）。

**修改**：**PUT /system/notice**。入参：noticeId、noticeTitle、noticeType、noticeContent、status；与表单一致。

**删除**：**DELETE /system/notice/:noticeId**。路径参数为公告 ID。

**发布**：前端对「状态=关闭」的公告展示「发布」按钮，调用 **PUT /system/notice** 将本条 status 置为 0 即可，无需单独接口。

---

#### 6.9.4 通知公告枚举

**公告类型 notice_type**：1 通知、2 公告（前端可选展示「其他」则扩展 3）。  
**状态 status**：0 正常（已发布/生效）、1 关闭（草稿或下架）。

---

### 6.10 操作日志（oper_log）

> 对应页面：**操作日志**（`/system/operlogManage`，组件 `operlogManage/index.vue`）。列表按系统模块、操作类型、操作人员、操作地址、操作状态、操作日期筛选；支持查看详情（请求/返回参数、异常信息）、删除单条、清空全部、导出。以下表结构可直接用于建表与接口设计。

#### 6.10.1 操作日志主表（oper_log）

**说明**：每条记录对应一次后端接口操作（由统一拦截器/切面写入），用于审计与排查；列表展示概要，详情展示请求方法、参数、返回、耗时、异常信息。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| oper_id | bigint | 主键 | 1 | 是 | PK |
| title | varchar(64) | 系统模块/业务模块名 | 客户管理、角色管理 | 否 | 列表展示、筛选、索引 |
| business_type | char(1) | 操作类型（见 6.10.4 枚举）：1 新增 2 修改 3 删除 4 授权 5 导出 6 导入 7 强退 8 生成代码 9 清空数据 | 1 | 否 | 列表筛选、索引 |
| method | varchar(256) | 请求对应方法（类.方法） | com.xxx.SysUserController.add() | 否 | 详情展示 |
| request_method | varchar(10) | 请求方式 | GET、POST、PUT、DELETE | 否 | 详情展示 |
| oper_name | varchar(64) | 操作人员（登录名或昵称） | admin | 否 | 列表展示、筛选、索引 |
| oper_url | varchar(512) | 请求 URL | /system/user | 否 | 详情展示 |
| oper_ip | varchar(64) | 操作 IP | 127.0.0.1 | 否 | 列表展示、筛选、索引 |
| oper_location | varchar(128) | 操作地点（可 IP 解析或留空） | 内网IP | 否 | 详情展示 |
| oper_param | text | 请求参数（JSON 或截断） | {"userName":"test"} | 否 | 详情展示，可限制长度 |
| json_result | text | 返回结果（JSON 或截断） | {"code":200} | 否 | 详情展示，可限制长度 |
| status | char(1) | 操作状态：0 正常 1 失败 | 0 | 是 | 列表筛选、索引 |
| error_msg | text | 异常信息（status=1 时） | 删除失败：菜单已被使用 | 否 | 详情展示 |
| cost_time | bigint | 消耗时间（毫秒） | 50 | 否 | 详情展示 |
| oper_time | datetime | 操作时间 | 2023-01-01 12:00:00 | 是 | 列表展示、排序、索引 |

**建议索引**：`PK oper_id`、`idx_title`、`idx_business_type`、`idx_oper_name`、`idx_oper_ip`、`idx_status`、`idx_oper_time`。可按 oper_time 分区或定期归档。

---

#### 6.10.2 列表查询参数与出参

**列表接口**：**GET /monitor/operlog/list**（与前端 listOperlog 一致）。支持分页及下列筛选。

**查询参数**

| 参数名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| pageNum | int | 页码 | 1 | 否 |
| pageSize | int | 每页条数 | 10 | 否 |
| title | string | 系统模块（模糊） | 客户 | 否 |
| businessType | string | 操作类型：1～9 | 1 | 否 |
| operName | string | 操作人员（模糊） | admin | 否 |
| operIp | string | 操作地址（模糊） | 127 | 否 |
| status | string | 操作状态：0 正常 1 失败 | 0 | 否 |
| params[beginTime] | string | 操作日期起（列表传 daterange 时拆成 beginTime/endTime） | 2023-01-01 00:00:00 | 否 |
| params[endTime] | string | 操作日期止 | 2023-01-31 23:59:59 | 否 |

**列表单条出参（与 6.10.1 表一致，驼峰命名）**

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| operId | number | 主键 | 1 |
| title | string | 系统模块 | 客户管理 |
| businessType | string | 1～9 | 1 |
| method | string | 请求方法 | com.xxx.SysUserController.add() |
| requestMethod | string | GET/POST/PUT/DELETE | POST |
| operName | string | 操作人员 | admin |
| operUrl | string | 请求 URL | /system/user |
| operIp | string | 操作 IP | 127.0.0.1 |
| operLocation | string | 操作地点 | 内网IP |
| operParam | string | 请求参数（列表可省略或截断） | {"userName":"test"} |
| jsonResult | string | 返回结果（列表可省略或截断） | {"code":200} |
| status | string | 0 正常 1 失败 | 0 |
| errorMsg | string | 异常信息 | — |
| costTime | number | 消耗时间（毫秒） | 50 |
| operTime | string | 操作时间 | 2023-01-01 12:00:00 |

响应格式：`{ rows: [], total: n }` 或 `{ list: [], total: n }`，前端已兼容 rows/list。

---

#### 6.10.3 详情、删除、清空、导出

**详情**：列表点击「详细」时前端直接用当前行数据回显弹窗，无需单独详情接口；若需按 operId 拉取完整内容（如未在列表中返回 operParam/jsonResult），可提供 **GET /monitor/operlog/:operId**，出参与列表单条一致（含 operParam、jsonResult、errorMsg 完整）。

**删除单条**：**DELETE /monitor/operlog/:operId**。路径参数为日志主键。

**清空**：**DELETE /monitor/operlog/clean**。无入参，清空全表或按策略清理（如仅清空 N 天前数据），需权限控制。

**导出**：**GET /monitor/operlog/export** 或 **POST /monitor/operlog/export**。入参与列表查询参数一致（pageNum/pageSize 可忽略，导出全部或当前筛选结果）；响应为文件流（如 application/vnd.openxmlformats-officedocument.spreadsheetml.sheet），文件名建议含时间戳。

---

#### 6.10.4 操作日志枚举

**操作类型 business_type**：1 新增、2 修改、3 删除、4 授权、5 导出、6 导入、7 强退、8 生成代码、9 清空数据（与前端 operTypeOptions 一致）。  
**操作状态 status**：0 正常、1 失败。

---

## 七、异常中心模块

> 对应页面：**异常中心**（`/dataProcess/errorCorrection`，组件 `errorCorrection/index.vue`）。统一任务列表（待处理/已处理），按异常大类筛选（有效性、唯一性、完整性、关联性、合规性），支持四种处理模式：**A 身份冲突合并工作台**、**B 数据质量快速编辑**、**C 同步失败重试**、**D H5 纠错反馈处理**。以下表结构可直接用于建表与接口设计。

---

### 7.1 异常任务主表（exception_task）

**说明**：一条记录对应一个异常任务。列表按 `status`（pending/processed）分 Tab，按 `category` 分类型统计与筛选。处理模式由 `category` + `sub_type` 决定打开哪种弹窗（合并/快速编辑/同步重试/H5 反馈）。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | varchar(32) | 主键，业务唯一 | T_1001 | 是 | PK |
| task_no | varchar(64) | 任务编号，展示用 | TASK-2025-001 | 是 | UK，列表筛选项 |
| one_id | varchar(64) | 客户 OneID | ONE-88291 | 是 | 列表筛选项、关联客户 |
| source_name | varchar(128) | 主展示姓名/主体名 | 陈建华 | 是 | 列表展示、搜索 |
| target_name | varchar(128) | 合并场景下另一侧姓名 | 陈建华先生 | 否 | 身份冲突时用 |
| score | int | 相似度分数（0–100），仅疑似重复 | 92 | 否 | |
| category | varchar(32) | 异常大类（见 7.5 枚举） | uniqueness | 是 | 列表筛选、统计、索引 |
| sub_type | varchar(32) | 异常子类型（见 7.5 枚举） | suspected_duplicate | 是 | 索引 |
| error_field | varchar(128) | 报错字段/问题简述（展示用） | phone、姓名+手机号高度相似 | 否 | |
| error_message | varchar(512) | 异常描述（主要问题） | 手机号格式错误：138-1234-5678 | 是 | |
| error_fields | json | 涉及字段列表，如 ["phone","email"] | ["phone"] | 否 | |
| source_system | varchar(32) | 来源系统：DMS/BDC/WeCom/H5 等 | DMS | 是 | 列表筛选、索引 |
| target_system | varchar(64) | 目标系统/对比方 | CRM | 否 | |
| source_id | varchar(64) | 源系统内 ID | BDC-00123 | 否 | |
| status | varchar(20) | 任务状态：pending / processed | pending | 是 | 列表 Tab、索引 |
| severity | varchar(20) | 严重程度：high / medium / low | high | 否 | 列表筛选 |
| sla_deadline | datetime | SLA 截止时间 | 2025-01-08 09:00:00 | 否 | 列表展示、排序 |
| handler | varchar(64) | 处理人/经办人 | 张伟 | 否 | 已处理 Tab 展示 |
| reviewer | varchar(64) | 审核人（身份冲突审核流） | — | 否 | |
| create_time | datetime | 创建时间 | 2025-01-07 10:30:00 | 是 | 列表排序、索引 |
| update_time | datetime | 最后更新时间 | 2025-01-07 10:30:00 | 是 | |
| original_data | json | 原始数据快照（用于编辑/对比） | {"name":"陈建华","phone":"138****5678"} | 否 | |
| suggested_fix | varchar(256) | 建议修正值（如格式修正后手机号） | 13812345678 | 否 | |
| value_mapping | json | 值映射（如 enum_mismatch：M→1, F→0） | {"M":"1","F":"0"} | 否 | |
| conflict_records | json | 主键冲突时的多条记录对比 | [{id,name,phone,source,updateTime}] | 否 | 见 7.2 结构 |
| conflict_info | json | 逻辑冲突采纳结果（如 trustedSource） | {"trustedSource":"idCard"} | 否 | |
| status_conflict | json | 状态冲突各系统值及采纳源 | {"dms":"已交车","crm":"未成交","trustedSource":"dms"} | 否 | |
| correction | json | H5 纠错反馈结构化内容（见 7.3） | {"field":"phone","currentValue":"138...","correctValue":"139...","note":"..."} | 否 | |
| merge_status | varchar(20) | 身份冲突工作流：pending/draft/review/resolved/rejected | pending | 否 | 仅 category=uniqueness 且走合并工作台时用 |

**建议索引**：`idx_status`, `idx_category`, `idx_one_id`, `idx_create_time`, `idx_task_no`, `idx_source_system`, `idx_status_category`(status, category)。

---

### 7.2 冲突记录结构（conflict_records JSON 单条）

主键冲突时，`conflict_records` 数组每项建议结构（与前端 Mock 一致）：

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | string | 源系统主键 | CUST-001 |
| name | string | 姓名 | 王建国 |
| phone | string | 电话 | 13812345678 |
| source | string | 来源标识 | DMS-1 |
| updateTime | string | 该条更新时间 | 2025-01-07 10:00:00 |

---

### 7.3 H5 纠错反馈结构（correction JSON）

`exception_task.correction` 或独立反馈表单条，与 **1.6 FeedbackForm** 对齐：

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| field | string | 纠错字段 | phone |
| currentValue | string/number | 当前值 | 13800000000 |
| correctValue | string/number | 用户反馈的正确值 | 13912345678 |
| note | string | 备注说明 | 客户本人反馈手机号已更换 |

---

### 7.4 异常中心纠错反馈表（exception_feedback，可选独立表）

若将 H5/PC 提交的纠错与 `exception_task` 拆开存储，可使用本表；否则仅用 `exception_task.correction` 即可。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | bigint | 主键 | 1 | 是 | PK |
| task_id | varchar(32) | 关联 exception_task.id | T_1001 | 否 | FK |
| one_id | varchar(64) | 客户 OneID | ONE_001 | 是 | 索引 |
| field | varchar(64) | 纠错字段 | phone | 是 | |
| current_value | text | 当前值 | 13800000000 | 是 | |
| reported_value | text | 用户反馈值 | 13912345678 | 是 | |
| reason | varchar(512) | 反馈原因 | 号码变更 | 是 | |
| reporter | varchar(64) | 反馈人 | 张三 | 是 | |
| status | varchar(20) | pending / approved / rejected | pending | 否 | 索引 |
| created_at | datetime | 创建时间 | — | 是 | |
| updated_at | datetime | 更新时间 | — | 否 | |

---

### 7.5 异常分类与动作枚举（与前端 exceptionTaxonomy 一致）

**异常大类（category）**

| 枚举值 | 说明 |
|--------|------|
| validity | 有效性异常 |
| uniqueness | 唯一性异常 |
| completeness | 完整性异常 |
| consistency | 关联性异常 |
| compliance | 合规性异常 |

**异常子类型（sub_type）**

| 大类 | 子类型 | 说明 |
|------|--------|------|
| validity | format_error | 格式错误 |
| validity | value_range_error | 值域越界 |
| validity | enum_mismatch | 枚举不匹配 |
| uniqueness | suspected_duplicate | 疑似重复 |
| uniqueness | primary_key_conflict | 主键冲突 |
| completeness | critical_missing | 关键缺失 |
| completeness | orphan_data | 孤儿数据 |
| consistency | logical_conflict | 逻辑冲突 |
| consistency | status_conflict | 状态冲突 |
| compliance | authorization_missing | 授权缺失 |

**处理动作（action_type，用于规则/建议）**

clean, edit, correct, empty, map, merge, override, discard, supplement, archive, associate, trust_choice, trust_source, freeze。

**任务状态（status）**

| 值 | 说明 |
|----|------|
| pending | 待处理 |
| processed | 已处理 |

**身份冲突工作流状态（merge_status，仅合并工作台）**

| 值 | 说明 |
|----|------|
| pending | 待处理 |
| draft | 草稿 |
| review | 待审核 |
| resolved | 已解决 |
| rejected | 已驳回 |

---

### 7.6 异常中心统计表（exception_stats，可按日快照或实时汇总）

用于首页/看板「异常类型统计」与「全链路指标」。

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| id | bigint | 主键 | 1 | 是 |
| stat_date | date | 统计日期（按日快照时用） | 2026-03-16 | 否 |
| validity | int | 有效性异常数量 | 8 | 否 |
| uniqueness | int | 唯一性异常数量 | 3 | 否 |
| completeness | int | 完整性异常数量 | 2 | 否 |
| consistency | int | 关联性异常数量 | 2 | 否 |
| compliance | int | 合规性异常数量 | 1 | 否 |
| total | int | 异常任务总数（待处理） | 16 | 否 |
| auto_merge_rate | varchar(20) | 自动合并率 | 98.5% | 否 |
| total_processed | int | 全链路本批处理总条数 | 125890 | 否 |
| total_volume | varchar(32) | 数据量展示 | 850 GB | 否 |
| success_count | int | 本批成功条数 | 125600 | 否 |
| manual_merge_needed | int | 待人工合并数 | 45 | 否 |
| auto_merged_count | int | 自动合并数 | 8560 | 否 |
| updated_at | datetime | 更新时间 | — | 否 |

---

### 7.7 列表查询参数（与 ProTable request-api 对齐）

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| pageNum | number | 页码 | 1 |
| pageSize | number | 每页条数 | 10 |
| taskNo | string | 任务编号 | TASK-2025-001 |
| oneId | string | OneID | ONE-88291 |
| sourceName | string | 客户姓名 | 陈建华 |
| status | string | pending / processed | pending |
| sourceSystem | string | 来源系统 | DMS |
| severity | string | high / medium / low | high |
| category | string | 异常大类（与 Tab 联动） | validity |

---

### 7.8 处理结果写入（供接口设计参考）

- **身份冲突（MergeWorkbench）**：确认合并 / 拆分为非同一人 / 忽略。更新 `exception_task.status` 为 processed，可选写 `merge_status`（resolved/rejected）、`handler`、`update_time`；合并时可能产生客户主数据合并流水，由业务库自行落表。
- **数据质量（QuickEdit）**：保存修正。更新 `exception_task.status`、`handler`、`update_time`，可将采纳后的字段写回客户/主数据（业务库实现）。
- **同步失败（SyncRetry）**：重试成功则更新 `exception_task.status` 为 processed 或从列表移除；失败可保留并记录重试次数（若需可增加 `retry_count` 字段）。
- **H5 纠错（FeedbackResolution）**：确认采纳则更新 `exception_task.status` 为 processed，并将 `correction` 或表单修正写回主数据；驳回则更新 status 并可选记录驳回原因（可扩展 `reject_reason` 字段）。

---

### 7.9 与客户模块的关联

- `exception_task.one_id` 关联客户主表 `customer.one_id`，用于打开 360 视图、合并工作台参考面板等。
- 纠错反馈表（7.4）的 `one_id` 与客户表一致；若采用 `exception_task.correction` 存储，则通过 `exception_task.one_id` 关联即可。

---

## 八、数据文件上传模块（数据质量工作台）

> 对应页面：**数据文件上传**（`/dataProcess/dataQualityWorkbench`，组件 `dataQualityWorkbench/index.vue`）。按数据源 Tab 上传 Excel、预检校验、查看错误明细、仅导入正确数据或全部提交，并展示截止时间与邮件通知规则。以下表结构可直接用于建表与接口设计。

---

### 8.1 上传/校验操作日志表（data_quality_audit_log）

**说明**：每条记录对应一次「上传文件并校验」或「导入/提交」操作，用于操作追溯列表与关联校验错误明细。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | bigint | 主键 | 1 | 是 | PK |
| file_id | varchar(64) | 文件唯一 ID（上传后生成，用于 importValidData/submitAllData） | FILE_xxx | 否 | UK，导入接口必传 |
| upload_time | datetime | 上传时间 | 2026-03-16 10:00:00 | 是 | 列表展示、排序、索引 |
| data_source | varchar(32) | 数据源（见 8.8 枚举） | poas、wws、cap、voucher、manual | 是 | 列表筛选、索引 |
| report_id | varchar(64) | 报表 ID（与工作台 Tab、8.4 一致） | poas_opp、wws_activity | 否 | 列表筛选、索引 |
| file_name | varchar(256) | 上传文件名 | 20260316_poas_opp.xlsx | 是 | 列表展示 |
| file_path | varchar(512) | 服务端存储路径（可选） | /uploads/2026/03/FILE_xxx.xlsx | 否 | 仅后端存储文件时用 |
| file_size | bigint | 文件大小（字节） | 102400 | 否 | 可选 |
| operator | varchar(64) | 操作人（账号或邮箱） | zhang.san@jebsen.com | 是 | 列表展示、筛选 |
| operator_id | bigint | 操作人用户 ID（可选） | 1001 | 否 | FK 用户表 |
| validation_result | varchar(20) | 校验结果（见 8.8）：passed/failed/pending | passed | 是 | 列表展示、索引 |
| upload_status | varchar(20) | 上传/导入状态（见 8.8）：success/failed/processing | success | 是 | 列表展示、索引 |
| error_type | varchar(64) | 文件级错误类型（失败时）：表头不匹配/文件为空/文件类型错误 等 | 表头不匹配 | 否 | 列表展示，见 8.8 |
| total_rows | int | 本文件总行数（不含表头） | 1000 | 否 | |
| success_rows | int | 校验通过行数 | 980 | 否 | |
| error_rows | int | 校验失败行数 | 20 | 否 | |
| imported_at | datetime | 实际导入完成时间（仅导入成功时） | 2026-03-16 10:05:00 | 否 | |
| created_at | datetime | 创建时间 | — | 是 | 索引 |
| updated_at | datetime | 更新时间 | — | 否 | |

**建议索引**：`idx_upload_time`、`idx_data_source`、`idx_report_id`、`idx_operator`、`idx_validation_result`、`idx_upload_status`、`uk_file_id`（file_id 唯一）。

---

### 8.2 校验错误明细表（data_quality_validation_error）

**说明**：一次上传若存在行级校验错误，每条错误占一行（同一行多列错误可多行）。用于预检弹窗「错误行列表」与导出。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | bigint | 主键 | 1 | 是 | PK |
| audit_log_id | bigint | 关联上传日志 8.1.id | 1 | 是 | FK、索引，同一批错误同 audit_log_id |
| file_id | varchar(64) | 文件 ID（与 8.1.file_id 一致，便于按 file_id 查错） | FILE_xxx | 否 | 索引 |
| row_index | int | 行号（从 1 起为表头，数据行通常从 2 起，依业务约定） | 5 | 是 | 同一行多列错误多条记录 row_index 相同 |
| column_name | varchar(64) | 列名/字段名（与模板列名一致） | Phone、VIN、Customer_Name | 是 | |
| cell_value | text | 错误单元格原始值 | 1381234、"" | 否 | |
| error_message | varchar(512) | 错误说明 | 手机号格式错误：必须是11位数字 | 是 | |
| error_code | varchar(32) | 错误码（可选，便于统计与 i18n） | PHONE_FORMAT | 否 | |
| created_at | datetime | 创建时间 | — | 否 | |

**建议索引**：`idx_audit_log_id`、`idx_file_id`、`idx_audit_log_row`(audit_log_id, row_index)。

---

### 8.3 上传与导入接口入参/出参（字段级）

**上传并校验请求（POST /dataQuality/upload，FormData）**

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| file | File | Excel 文件（.xlsx） | — | 是 |
| dataSource | string | 数据源：dms/poas/wws/cap/voucher/manual | poas | 是 |
| reportType | string | 报表 ID（多报表数据源时必传，与 8.4.id 一致） | poas_opp | 否 |

**上传并校验响应（ValidationResult.data）**  
后端需在本次上传时写入 8.1 一条记录（upload_status=processing 或 pending），并返回 fileId 供后续「仅导入正确数据/提交全部」使用；若存在行级错误，写入 8.2。

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| fileId | string | 文件唯一 ID，用于 importValidData、submitAllData | FILE_xxx | 是（若支持后续导入） |
| total | number | 总行数 | 1000 | 是 |
| success | number | 通过行数 | 980 | 是 |
| error | number | 错误行数 | 20 | 是 |
| hasErrors | boolean | 是否存在错误行 | true | 是 |
| errorRows | array | 错误行列表，每项见下表 | [] | 是 |
| tableColumns | string[] | 表头列名（用于弹窗表头） | ["VIN","Phone","Customer_Name"] | 否 |

**errorRows 单条**

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| rowIndex | number | 行号 | 5 | 是 |
| errors | array | 该行错误列表，每项见 ValidationError | [] | 是 |
| [key: string] | any | 该行各列原始值（动态列名，与 tableColumns 对应） | — | 否 |

**ValidationError（errors 单条）**

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| rowIndex | number | 行号 | 5 | 是 |
| column | string | 列名 | Phone | 是 |
| value | any | 错误值 | 1381234 | 否 |
| errorMessage | string | 错误说明 | 手机号格式错误：必须是11位数字 | 是 |

**仅导入正确数据（POST /dataQuality/import/valid）**

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| dataSource | string | 数据源 | poas | 是 |
| fileId | string | 上传接口返回的 fileId | FILE_xxx | 是 |

**提交全部数据（POST /dataQuality/submit/all）**

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| dataSource | string | 数据源 | poas | 是 |
| fileId | string | 上传接口返回的 fileId | FILE_xxx | 是 |

导入/提交成功后更新 8.1 对应记录的 `upload_status=success`、`imported_at`、`updated_at`；失败则 `upload_status=failed`，可选写 `error_type`。

---

### 8.4 报表配置表（data_quality_report_config）

**说明**：工作台左侧 Tab 与模板下载、上传 reportType 均依赖此配置。与 **10.1 数据源/报表配置** 一致时可复用同一张表。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | varchar(64) | 报表唯一 ID（Tab 名、上传 reportType、模板路径 key） | wws_activity、poas_opp、manual_ins_renewal_sales | 是 | PK |
| name | varchar(128) | 报表展示名（可 i18n key） | 活动列表、商机表、续保销售记录 | 是 | |
| source | varchar(32) | 数据源：wws、voucher、poas、cap、manual | wws | 是 | 索引、与 8.1.data_source 一致 |
| upload_cycle | varchar(64) | 上传周期展示：每天/每周五/每月第二个周五/按需 | 每天 | 否 | Tab 标签展示 |
| sort_order | int | 同数据源下 Tab 排序（小在前） | 1 | 否 | 默认 0 |
| template_path | varchar(256) | 模板文件路径或存储 key（下载用） | /templates/poas_opp.xlsx | 否 | 下载接口用 |
| required_columns | json | 必填列名列表（校验表头用） | ["VIN","Phone","Customer_Name"] | 否 | 可选，与校验规则配合 |
| is_enabled | tinyint | 是否启用：0 否 1 是 | 1 | 否 | 默认 1 |
| created_at | datetime | 创建时间 | — | 否 | |
| updated_at | datetime | 更新时间 | — | 否 | |

**前端当前报表列表（source → report id）**：wws → wws_activity；voucher → voucher_member_benefit_stats、voucher_balance_detail、voucher_member_addon_sales；poas → poas_opp；cap → cap_vehicle；manual → manual_ins_renewal_sales、manual_ins_new_sales、manual_client_base_table、manual_replace_approval、manual_offline_marketing_segment、manual_generic_opportunity、manual_ttr。

---

### 8.5 数据源通知配置表（data_quality_notification_config）

**说明**：页面「邮件通知规则」卡片：截止时间、收件人说明、T+0/T+1 时间线。可落表或与 **五、数据催收** 的 PlatformSchedule 对齐。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | bigint | 主键 | 1 | 是 | PK |
| data_source | varchar(32) | 数据源：dms、poas、wws、cap、voucher、manual | poas | 是 | UK 或 唯一(data_source) |
| deadline_time | varchar(20) | 每日上传截止时间展示（如 18:00） | 18:00 | 否 | |
| recipients_text | varchar(256) | 收件人说明文案（如「数据负责人+业务负责人」） | 数据负责人+业务负责人 | 否 | |
| created_at | datetime | 创建时间 | — | 否 | |
| updated_at | datetime | 更新时间 | — | 否 | |

---

### 8.6 通知规则时间线表（data_quality_notification_rule，可选子表）

**说明**：每个数据源下 T+0、T+1、T+2 等阶段规则。若用 JSON 存于 8.5 亦可（如 rules_json）。

| 字段名 | 类型 | 说明 | 示例 | 必填 | 索引/备注 |
|--------|------|------|------|------|-----------|
| id | bigint | 主键 | 1 | 是 | PK |
| notification_config_id | bigint | 关联 8.5.id | 1 | 是 | FK、索引 |
| data_source | varchar(32) | 数据源（冗余便于查询） | poas | 否 | 索引 |
| stage | varchar(20) | 阶段：T+0、T+1、T+2 | T+0 | 是 | |
| time_point | varchar(20) | 时间点 | 18:00、09:00 | 是 | |
| description | varchar(256) | 阶段描述（如「当日数据需在 18:00 前上传」） | 当日数据需在18:00前上传 | 否 | |
| recipients | varchar(128) | 该阶段收件人说明 | 数据负责人 | 否 | |
| sort_order | int | 时间线顺序 | 1 | 否 | 默认 0 |

---

### 8.7 操作追溯日志列表接口（getAuditLog）

**查询参数**

| 参数名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| page | number | 页码 | 1 | 否 |
| pageSize | number | 每页条数 | 10 | 否 |
| dataSource | string | 数据源筛选 | poas | 否 |
| reportId | string | 报表 ID 筛选 | poas_opp | 否 |
| operator | string | 操作人筛选 | zhang.san | 否 |
| validationResult | string | 校验结果筛选 | passed、failed、pending | 否 |
| uploadStatus | string | 上传状态筛选 | success、failed、processing | 否 |
| startTime | string | 上传时间起（yyyy-MM-dd HH:mm:ss） | 2026-03-01 00:00:00 | 否 |
| endTime | string | 上传时间止 | 2026-03-16 23:59:59 | 否 |

**列表单条（AuditLogItem，与 8.1 表字段对应）**

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| id | number | 主键（可选返回） | 1 | 否 |
| uploadTime | string | 上传时间 | 2026-03-16 10:00:00 | 是 |
| dataSource | string | 数据源（展示用可转大写/中文） | POAS、poas | 是 |
| reportId | string | 报表 ID | poas_opp | 否 |
| fileName | string | 文件名 | 20260316_poas_opp.xlsx | 是 |
| operator | string | 操作人 | zhang.san@jebsen.com | 是 |
| validationResult | string | passed/failed/pending | passed | 是 |
| uploadStatus | string | success/failed/processing | success | 是 |
| errorType | string | 文件级错误类型（失败时） | 表头不匹配、文件类型错误 | 否 |
| totalRows | number | 总行数 | 1000 | 否 |
| successRows | number | 通过行数 | 980 | 否 |
| errorRows | number | 错误行数 | 20 | 否 |

---

### 8.8 枚举与字典（与前端一致）

**数据源（data_source）**

| 值 | 说明 |
|----|------|
| dms | DMS |
| poas | POAS |
| wws | WWS |
| cap | C@P系统 |
| voucher | Voucher |
| manual | Manual Files |

**校验结果（validation_result）**

| 值 | 说明 |
|----|------|
| passed | 通过 |
| failed | 未通过 |
| pending | 待校验/进行中 |

**上传/导入状态（upload_status）**

| 值 | 说明 |
|----|------|
| success | 成功 |
| failed | 失败 |
| processing | 处理中 |

**文件级错误类型（error_type，upload_status=failed 时）**

| 值 | 说明 |
|----|------|
| 表头不匹配 | 缺少必填列或列名与模板不一致 |
| 文件为空 | 无数据行 |
| 文件类型错误 | 非 xlsx 或无法解析 |
| 文件级别的错误识别 | 其他文件级错误（如加密、损坏） |

---

### 8.9 模板下载接口（GET /dataQuality/template）

**路径**：`/dataQuality/template/{dataSource}` 或 `/dataQuality/template/{dataSource}/{reportType}`（多报表数据源时带 reportType）。  
**响应**：文件流（application/vnd.openxmlformats-officedocument.spreadsheetml.sheet），文件名建议与 8.4 报表 name 或 id 相关。

---

### 8.10 与源数据采集、数据催收的关联（闭环）

- **8.4 报表配置** 与 **10.1 数据源/报表配置** 可共用一张表，供「数据文件上传」Tab 与「今日数据采集状态」展示；**五、数据催收** 的 5.2 platform/report_id 与 8.4.id、8.1.data_source/report_id 一致，形成「同一报表在上传、催收、首页采集状态」一处配置、多处使用。
- **8.5/8.6 通知配置** 与 **五、数据催收** 5.1 schedules、5.2 schedules（5.6 PlatformSchedule）建议统一：工作台「邮件通知规则」与催收 T+0/T+1/T+2 时间线、收件人共用同一套配置，详见 **5.8 与数据文件上传、源数据采集的闭环**。
- 上传日志 **8.1** 的 `data_source + report_id` + `upload_time/imported_at` 是判定「是否已上传」「是否逾期」的数据源：**5.4 催收监控记录** 的 upload_status（pending/overdue/completed）可基于 8.1 按 stat_date + report_id 聚合计算；**10.2 今日数据采集状态** 也可基于 8.1 或与 5.4 对齐。

---

## 十、源数据采集模块（首页 / 源数据采集看板）

> 对应页面：**源数据采集**（`/home/index`，组件 `welcome/index.vue`）。展示今日数据采集状态、核心经营指标、数据接入与质量趋势等，管理员与业务端展示内容略有区分。

### 10.1 数据源/报表配置表（source_report_config）

用于配置「今日数据采集状态」中展示的每个数据源/报表项（手工上传、自动同步）。前端当前为写死列表，建议后端落表以便运维配置。

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| id | bigint | 主键 | 1 | 是 |
| name | varchar(64) | 平台/系统展示名 | WWS、DMS、Manual Files | 是 |
| type | varchar(20) | 类型：manual / auto | manual | 是 |
| report_source | varchar(32) | 数据源标识：wws/voucher/poas/cap/manual/dms/bdc/wecom | wws | 是 |
| report_id | varchar(64) | 报表唯一标识（同数据质量工作台） | wws_activity、poas_opp | 否（auto 可为空） |
| desc | varchar(128) | 报表/数据描述（如「活动列表」「商机表」） | 活动列表 | 否 |
| upload_cycle | varchar(64) | 上传周期展示：每天/每周五/每月第二个周五/T+1 同步/按需 | 每天 | 否 |
| upload_cycle_weak | tinyint(1) | 是否「按需」类（弱周期） | 0/1 | 否 |
| sort_order | int | 排序（频率越高越靠前） | 10 | 否 |
| is_enabled | tinyint(1) | 是否在首页展示 | 1 | 否 |
| created_at | datetime | 创建时间 | — | 否 |
| updated_at | datetime | 更新时间 | — | 否 |

**前端当前手工报表 report_id 示例**：wws_activity；voucher_member_benefit_stats、voucher_balance_detail、voucher_member_addon_sales；poas_opp；cap_vehicle；manual_ins_renewal_sales、manual_ins_new_sales、manual_client_base_table、manual_replace_approval、manual_offline_marketing_segment、manual_generic_opportunity、manual_ttr。**自动**：BDC、DMS、WeCom、Voucher（无 report_id）。

### 10.2 今日数据采集状态（按报表/数据源维度）

用于「今日数据采集状态」卡片：昨日本批到位数、每个系统/报表的上传或同步状态。可与 **5.4 催收监控记录** 或 **8.1 上传日志** 关联，或单独做「按日+报表」状态快照表。

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| id | bigint | 主键 | 1 | 是 |
| stat_date | date | 统计日期（昨日本批） | 2026-03-15 | 是 |
| report_source | varchar(32) | 数据源 | wws | 是 |
| report_id | varchar(64) | 报表 ID（自动同步可为空） | wws_activity | 否 |
| type | varchar(20) | manual / auto | manual | 是 |
| status | varchar(20) | success / warning / error / gray（待上传） | success | 是 |
| upload_time | varchar(64) | 上传/同步时间展示（如「昨日 18:00」「T+1 09:00」） | 昨日 18:00 | 否 |
| actual_upload_at | datetime | 实际上传/同步完成时间 | 2026-03-15 18:00:00 | 否 |
| created_at | datetime | 创建时间 | — | 否 |
| updated_at | datetime | 更新时间 | — | 否 |

### 10.3 核心经营指标（汇总统计，可按日快照）

首页「核心经营指标」：全量 + 今日新增。建议由各业务表汇总或由批处理写入日快照表。

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| stat_date | date | 统计日期 | 2026-03-16 | 是 |
| customer_total | bigint | 客户总量（截至当日批次后） | 1342001 | 是 |
| customer_incremental | int | 当日客户净增量 | 1245 | 否 |
| conflict_total | int | 待处理冲突客户总量 | 3486 | 否 |
| conflict_incremental | int | 当日冲突增量 | 72 | 否 |
| tag_total | int | 被至少一个标签覆盖的客户数 | 256034 | 否 |
| tag_incremental | int | 当日标签覆盖增量 | 3210 | 否 |
| segment_total | int | 被纳入任一分群的客户数 | 168905 | 否 |
| segment_incremental | int | 当日分群增量 | 980 | 否 |
| opportunity_total | int | 商机总量 | 4325 | 否 |
| opportunity_incremental | int | 当日商机增量 | 135 | 否 |
| merged_count | int | 合并客户数（扩展） | 85600 | 否 |
| updated_count | int | 更新客户数（扩展） | 234500 | 否 |
| created_at | datetime | 创建时间 | — | 否 |

### 10.4 源数据看板简要指标（source_monitor_brief）

首页管理员角标「更新 xxx」及看板用：最近一次批处理/刷新后的关键数字。

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| id | bigint | 主键 | 1 | 是 |
| last_update | varchar(32) | 最后更新时间展示（如 11:10:46） | 11:10:46 | 否 |
| last_updated_at | datetime | 最后更新时间（库内） | 2026-03-16 11:10:46 | 否 |
| total_processed | int | 本批处理总条数 | 125890 | 否 |
| total_volume | varchar(32) | 数据量展示（如 850 GB） | 850 GB | 否 |
| success_count | int | 本批成功条数 | 125600 | 否 |
| merge_needed | int | 待合并数 | 45 | 否 |
| auto_merged | int | 自动合并数 | 8560 | 否 |
| incremental | int | 本批增量 | 1248 | 否 |
| data_volume | varchar(32) | 数据量（与 total_volume 二选一或一致） | 850 GB | 否 |
| created_at | datetime | 创建时间 | — | 否 |
| updated_at | datetime | 更新时间 | — | 否 |

### 10.5 数据接入与质量趋势（按日汇总，图表用）

「数据接入与质量」过去 7 天柱状图：按日的数据量或处理量。

| 字段名 | 类型 | 说明 | 示例 | 必填 |
|--------|------|------|------|------|
| id | bigint | 主键 | 1 | 是 |
| stat_date | date | 统计日期 | 2026-03-10 | 是 |
| data_volume | bigint | 当日数据量（条数或存储量，依业务定义） | 1200 | 是 |
| created_at | datetime | 创建时间 | — | 否 |

### 10.6 数据监控接口（dataMonitor）说明

前端会请求以下接口（`/monitor/dataMonitor/*`），后端可返回上述表汇总或实时统计：

| 接口路径 | 说明 | 建议返回字段/用途 |
|----------|------|---------------------|
| pipeline/status | T+1 跑批全链路进度 | 步骤、完成数/总数、状态 |
| quality | 数据流入与质量统计 | 与 10.4、10.5 相关 |
| identity | OneID 身份治理统计 | 合并/去重等 |
| business | 商机价值转化统计 | 与 opportunity 相关 |
| apiLogs | API 推送日志 | 列表、分页 |
| systemHealth | 系统健康状态 | 状态、简要指标 |
| refresh | 刷新监控数据 | 无 body，触发重算或缓存刷新 |

---

## 九、通用与枚举说明

**标准枚举与字典**：项目当前已知的 **标准枚举值** 与 **标准字典信息** 以以下两份为准，表设计与字段设计需与其对齐，避免同义词并存、多源不一致。

- **标准枚举值确认清单**：见仓库根目录 `docs/标准枚举清单.png`（2. 标准枚举值确认清单），文本整理版见 **`docs/标准枚举与字典清单.md`** 第一节。涵盖基础主档（客户类型、性别、与车主关系）、关联人员子档（关联人角色等）、标签中心（标签分类）、运营分群（分群分类）、车辆信息（车辆状态、签单状态）、权益资产（项目来源、权益状态）、维保信息（服务类型）、保险信息（保单类型）等；标注「待后期确认」或「具体见商机表/保险表」的项以产品/客户后续确认或业务表为准。
- **标准字典信息收集清单**：见仓库根目录 `docs/标准字典.png`（3. 标准字典信息收集清单），文本整理版见 **`docs/标准枚举与字典清单.md`** 第二节。涵盖车辆信息（车系、车型、版本/年款、归属门店）、金融信息（金融机构）、保险信息（保险公司）等字典项及其说明/来源、字典用途；新建字典表或字典接口时需与清单中的用途与来源一致。

---

- **多值字段**：address、phone、vin_info、license_plate 等可为 JSON 数组，每项结构见 **1.4 MultiValueItem**。  
- **规则配置**：标签/分群/商机规则多为 JSON，结构见 **2.3 RuleConfig**。  
- **生命周期状态**：active / inactive / pending / conflict。  
- **商机状态**：pushed / completed / followed / pending / processing / rejected / failed。  
- **标签状态**：draft / active / inactive / abandoned。  
- **分群状态**：draft / running / active / failed / inactive（分群管理）；draft / pending / active / inactive（客户筛选与分群）。  

如需某一模块的建表 SQL 或更细的索引/外键建议，可基于上表再细化。
