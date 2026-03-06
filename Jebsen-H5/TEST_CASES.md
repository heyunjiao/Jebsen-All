# C360 客户画像 H5 — 测试用例

本文档描述手机号搜索、多 OneID 切换、空状态等功能的 Mock 测试用例。**需在开发环境且启用 Mock（`VITE_USE_MOCK=true`）时使用。** 所有访问地址均采用 **URL 携带 token** 的形式，前端会解码 token 完成鉴权后再执行业务逻辑。

---

## Token 说明（演示用）

内部系统通过 URL 参数 `token`（或兼容 `ticket`）传入鉴权信息，前端解码后得到 `token` 与 `userId`，不请求后端校验。

**演示用 Token（Base64 JSON，解码后为 `{"token":"demo_token_c360","userId":"demo_user_001"}`）：**

```
eyJ0b2tlbiI6ImRlbW9fdG9rZW5fYzM2MCIsInVzZXJJZCI6ImRlbW9fdXNlcl8wMDEifQ==
```

**JWT 示例（可选）：** 若使用 JWT，payload 中需包含 `sub` 或 `userId`，前端会解码 payload 取用户信息。

以下所有「访问地址」均以 `token=上述值` 为例；实际演示时把 `端口` 换成当前开发端口（如 5173）。

---

## 一、手机号搜索 + 多 OneID 场景

H5 可通过 URL 参数 `phone` 以「手机号搜索」方式打开，后端可能返回多个 OneID（个人/企业），页面顶部会展示「当前身份」切换栏。

### 1.1 多 OneID（5 个）— 下拉模式

| 项目 | 说明 |
|------|------|
| **用例目的** | 验证同一手机号关联多个身份时，顶部展示「共 N 个 OneID」并支持下拉选择切换。 |
| **访问地址** | `http://localhost:端口/?token=eyJ0b2tlbiI6ImRlbW9fdG9rZW5fYzM2MCIsInVzZXJJZCI6ImRlbW9fdXNlcl8wMDEifQ==&phone=13800138000` |
| **Mock 行为** | 返回 5 个 OneID：陈明(C001)、张雪(C002)、李华(C003)、深圳市望昕实业有限公司(COMP001)、上海捷成汽车销售有限公司(COMP002)。 |
| **预期结果** | 1）先解码 token 完成鉴权，URL 会去掉 token 参数；<br>2）顶部显示「当前身份」+ 金色徽标「共 5 个 OneID」；<br>3）当前身份为一行可点击区域，点击后底部弹出 5 个选项的 ActionSheet；<br>4）切换不同身份后，下方画像、交易、车辆、商机等数据与该身份一致。 |

### 1.2 多 OneID（2 个）— Tab 模式

| 项目 | 说明 |
|------|------|
| **用例目的** | 验证 2 个 OneID 时顶部为横向 Tab，可直接点击切换。 |
| **访问地址** | `http://localhost:端口/?token=eyJ0b2tlbiI6ImRlbW9fdG9rZW5fYzM2MCIsInVzZXJJZCI6ImRlbW9fdXNlcl8wMDEifQ==&phone=13811112222` 或 `http://localhost:端口/?token=eyJ0b2tlbiI6ImRlbW9fdG9rZW5fYzM2MCIsInVzZXJJZCI6ImRlbW9fdXNlcl8wMDEifQ==&phone=13833334444` |
| **Mock 行为** | 返回 2 个 OneID：陈明(C001)、深圳市望昕实业有限公司(COMP001)。 |
| **预期结果** | 1）先解码 token 完成鉴权；<br>2）顶部显示「当前身份」+「共 2 个 OneID」；<br>3）两个 Tab 并排，点击即可切换；<br>4）切换后下方数据与所选身份一致。 |

### 1.3 单 OneID（1 个）

| 项目 | 说明 |
|------|------|
| **用例目的** | 验证仅 1 个 OneID 时仍按手机号拉取并展示，无顶部切换栏。 |
| **访问地址** | `http://localhost:端口/?token=eyJ0b2tlbiI6ImRlbW9fdG9rZW5fYzM2MCIsInVzZXJJZCI6ImRlbW9fdXNlcl8wMDEifQ==&phone=13900000000`（或除 13800138000/13811112222/13833334444/10000000000 外的任意 11 位手机号） |
| **Mock 行为** | 返回 1 个 OneID：陈明(C001)。 |
| **预期结果** | 鉴权后不显示「当前身份」切换栏，直接展示该唯一身份的画像与数据。 |

---

## 二、手机号搜索无结果（空状态）

| 项目 | 说明 |
|------|------|
| **用例目的** | 验证未关联任何 OneID 时，全屏空状态展示及「查看本次搜索手机号」能力。 |
| **访问地址** | `http://localhost:端口/?token=eyJ0b2tlbiI6ImRlbW9fdG9rZW5fYzM2MCIsInVzZXJJZCI6ImRlbW9fdXNlcl8wMDEifQ==&phone=10000000000` |
| **Mock 行为** | 根据手机号查询 OneID 接口返回空数组 `[]`。 |
| **预期结果** | 1）鉴权后全屏深色背景，居中展示「未找到关联的客户身份」及说明文案；<br>2）按钮「查看本次搜索手机号」点击后，Toast 提示「本次搜索手机号：10000000000」（或当前 URL 中的 phone 值）。 |

---

## 三、非手机号入口（原有能力）

| 项目 | 说明 |
|------|------|
| **用例目的** | 验证带 token 但不带 `phone` 时，仍为原有个人/公司切换逻辑。 |
| **访问地址** | `http://localhost:端口/?token=eyJ0b2tlbiI6ImRlbW9fdG9rZW5fYzM2MCIsInVzZXJJZCI6ImRlbW9fdXNlcl8wMDEifQ==` 或 `http://localhost:端口/?token=eyJ0b2tlbiI6ImRlbW9fdG9rZW5fYzM2MCIsInVzZXJJZCI6ImRlbW9fdXNlcl8wMDEifQ==&type=company` |
| **预期结果** | 鉴权后右侧悬浮球「看公司/回个人」，切换后展示对应 COMP001 / C001 画像与数据。 |

---

## 四、Mock 配置与数据一致性

- **鉴权**：URL 带 `token`（或 `ticket`）时走内部系统鉴权，前端解码 token 得到 `token` 与 `userId`，写入本地后清除 URL 上的 token 参数。
- **OneID 列表接口**：`GET /api/customer/oneids-by-phone?phone=xxx`，Mock 在 `src/mock/index.ts` 中按 `phone` 分支返回不同条数。
- **画像及列表数据**：`customerId` 为 C001/C002/C003/COMP001/COMP002 时，profile、transactions、vehicles、assets、opportunities、platform-sources、appointments、operation-logs 等 Mock 均按当前选中的 OneID 返回对应身份的数据，保证「顶部身份」与「下方数据」一致。
- **空列表测试**：仅 `phone=10000000000` 时 OneID 列表返回 `[]`，用于稳定复现空状态。

---

## 五、快速自测清单（复制即用）

将下面 `http://192.168.2.140:3000` 改成你的实际端口后，在浏览器地址栏打开即可演示。

| 序号 | 操作 | 预期 |
|------|------|------|
| 1 | 打开 5 个 OneID 场景 | 顶部「共 5 个 OneID」，下拉可切换 5 个身份，下方数据随切换变化。 |
| 2 | 打开 2 个 OneID 场景 | 顶部「共 2 个 OneID」，两个 Tab 可点击切换。 |
| 3 | 打开空状态场景 | 全屏空状态，按钮可查看本次搜索手机号。 |
| 4 | 打开单 OneID 场景 | 无顶部切换栏，直接展示陈明(C001) 画像。 |
| 5 | 打开个人/公司切换 | 右侧悬浮球切换个人/公司，无顶部 OneID 栏。 |

**可直接复制的演示 URL（端口 5173）：**

```
# 1）5 个 OneID — 下拉
http://192.168.2.140:3000/?token=eyJ0b2tlbiI6ImRlbW9fdG9rZW5fYzM2MCIsInVzZXJJZCI6ImRlbW9fdXNlcl8wMDEifQ==&phone=13800138000

# 2）2 个 OneID — Tab
http://192.168.2.140:3000/?token=eyJ0b2tlbiI6ImRlbW9fdG9rZW5fYzM2MCIsInVzZXJJZCI6ImRlbW9fdXNlcl8wMDEifQ==&phone=13811112222

# 3）空状态
http://192.168.2.140:3000/?token=eyJ0b2tlbiI6ImRlbW9fdG9rZW5fYzM2MCIsInVzZXJJZCI6ImRlbW9fdXNlcl8wMDEifQ==&phone=10000000000

# 4）单 OneID
http://192.168.2.140:3000/?token=eyJ0b2tlbiI6ImRlbW9fdG9rZW5fYzM2MCIsInVzZXJJZCI6ImRlbW9fdXNlcl8wMDEifQ==&phone=13900000000

# 5）个人/公司切换（无 phone）
http://192.168.2.140:3000/?token=eyJ0b2tlbiI6ImRlbW9fdG9rZW5fYzM2MCIsInVzZXJJZCI6ImRlbW9fdXNlcl8wMDEifQ==
```

---

## 六、自定义 Token 生成（可选）

若需自建演示 token：

- **Base64 JSON**：`JSON → Base64`，例如 `{"token":"your_api_token","userId":"user_001"}` 做 Base64 编码后作为 `?token=xxx` 传入。
- **JWT**：payload 中需包含 `sub` 或 `userId`，前端会解码 payload（不校验签名）并取整段 JWT 作为请求头中的 Authorization token。

解码逻辑见 `src/utils/token.ts`，鉴权流程见 `src/adapters/authAdapter.ts`。
