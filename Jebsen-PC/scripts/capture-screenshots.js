import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const OUTPUT_DIR = path.resolve(
  process.cwd(),
  "..",
  "产品截图",
  "cursor-ai-screenshot"
);

/**
 * 这里是「功能点路由 → 固定截图文件名」的显式映射，
 * 文件名严格对齐你在 `产品图` 目录和文档中的命名。
 */
const TARGETS = [
  // 1. 源数据采集 & 数据质量
  {
    module: "源数据采集",
    name: "首页-源数据采集总览",
    path: "/home/index",
    fileName: "1-PC-源数据采集.png"
  },
  {
    module: "数据处理",
    name: "数据文件上传",
    path: "/dataProcess/dataQualityWorkbench",
    fileName: "2-PC-数据文件上传.png"
  },
  {
    module: "数据处理",
    name: "异常中心",
    path: "/dataProcess/errorCorrection",
    fileName: "3-1-PC-异常中心.png"
  },
  {
    module: "数据处理",
    name: "文件上传日志",
    path: "/dataProcess/fileUploadLog",
    fileName: "4-PC-文件上传日志.png"
  },

  // 2. 客户列表 & 360 视图（列表页先按整体页面截全）
  {
    module: "客户管理",
    name: "客户列表",
    path: "/customer/list",
    fileName: "5-1-PC-客户列表.png"
  },

  // 3. 标签 & 分群（列表页）
  {
    module: "标签管理",
    name: "标签管理",
    path: "/tagManage",
    fileName: "7-1-PC-标签管理.png"
  },
  {
    module: "分群管理",
    name: "分群管理",
    path: "/segmentManage",
    fileName: "8-1-PC-分群管理.png"
  },

  // 4. 商机管理
  {
    module: "商机管理",
    name: "商机看板",
    path: "/leadManagement/dashboard",
    fileName: "9-1-PC-商机看板.png"
  },
  {
    module: "商机管理",
    name: "商机列表",
    path: "/leadManagement/list",
    fileName: "10-PC-商机列表.png"
  },
  {
    module: "商机管理",
    name: "分发查询",
    path: "/leadManagement/rule",
    fileName: "11-PC-分发查询.png"
  },
  {
    module: "商机管理",
    name: "商机追踪",
    path: "/leadManagement/tracking",
    fileName: "12-PC-商机追踪.png"
  },

  // 5. 系统管理（账号/角色/部门/通知/催收配置）
  {
    module: "系统管理",
    name: "账号管理",
    path: "/system/accountManage",
    fileName: "13-PC-账号管理.png"
  },
  {
    module: "系统管理",
    name: "角色管理",
    path: "/system/roleManage",
    fileName: "14-1-PC-角色管理.png"
  },
  {
    module: "系统管理",
    name: "部门管理",
    path: "/system/departmentManage",
    fileName: "19-PC-部门管理.png"
  },
  {
    module: "系统管理",
    name: "通知公告",
    path: "/system/noticeManage",
    fileName: "20-PC-通知管理.png"
  },
  {
    module: "系统管理",
    name: "数据催收配置",
    path: "/collection/config",
    fileName: "21-PC-数据催收配置.png"
  },

  // 6. 系统监控
  {
    module: "系统监控",
    name: "操作日志",
    path: "/system/operlogManage",
    fileName: "22-PC-操作日志.png"
  }
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function waitPageStable(page, timeout = 3000) {
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(timeout);
}

// 项目使用 Hash 路由，地址必须是  baseUrl#/path  才会正确切换页面
function toHashUrl(baseUrl, path) {
  const base = baseUrl.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}#${p}`;
}

// 如果文件已存在则跳过截图，避免重复生成
async function screenshotIfNotExists(page, savePath, label) {
  if (fs.existsSync(savePath)) {
    console.log(`[跳过] 已存在截图：${label} -> ${savePath}`);
    return;
  }
  // 长图：先滚到页面最底部，触发懒加载/动态高度，再截整页
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));

  await page.screenshot({
    path: savePath,
    fullPage: true
  });
  console.log(`[完成] 截图：${label}`);
}

async function captureAll(baseUrl) {
  ensureDir(OUTPUT_DIR);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  // 先登录：打开带 hash 的登录页
  const loginUrl = toHashUrl(baseUrl, "/login");
  console.log(`\n[登录] 打开登录页：${loginUrl}`);
  try {
    await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 60000 });
    await waitPageStable(page);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(5000);
    console.log("✅ 自动登录完成");
  } catch (e) {
    console.error("❌ 自动登录过程异常：", e);
  }

  // ---------- 客户管理模块：客户列表 & 360 视图功能截图 ----------
  // 1) 打开客户列表页面
  try {
    const customerListUrl = toHashUrl(baseUrl, "/customer/list");
    console.log(`\n[客户管理] 打开客户列表：${customerListUrl}`);
    await page.goto(customerListUrl, { waitUntil: "networkidle", timeout: 60000 });
    await waitPageStable(page);

    // 等表格渲染（按 Element Plus 表格行选择器）
    const firstRowSelector = ".el-table__body-wrapper .el-table__row";
    const hasRow = await page
      .waitForSelector(firstRowSelector, { timeout: 15000 })
      .then(() => true)
      .catch(() => false);

    // 如果当前环境客户列表没有任何数据，就跳过 360 截图，避免整个脚本失败
    if (!hasRow) {
      console.warn("⚠ 客户列表中未检测到数据行，跳过 360 视图截图。");
      throw new Error("no-customer-row");
    }

    // 优先点击文案为“360视图”的操作按钮
    let view360Button = page.locator("text=360视图").first();
    if (!(await view360Button.isVisible().catch(() => false))) {
      // 兜底：在第一行中取最后一个按钮
      const firstRow = page.locator(firstRowSelector).first();
      view360Button = firstRow.locator("button").last();
    }
    await view360Button.click();
    await waitPageStable(page);

    // 360 总览长图：对应 5-2-PC-360视图.png
    const profileOverviewPath = path.join(OUTPUT_DIR, "5-2-PC-360视图.png");
    console.log(`\n[客户管理] 截图：360 总览 -> ${profileOverviewPath}`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: profileOverviewPath, fullPage: true });
    console.log("✅ 360 总览长图完成");

    // 维保记录 Tab：name = 'transactions' -> 5-2-1-PC-360视图-维保记录.png
    const maintenanceTab = page.locator('.info-tabs .el-tabs__item').filter({
      hasText: /维保|交易|Transactions/i
    }).first();
    await maintenanceTab.click();
    await waitPageStable(page);
    const maintenancePath = path.join(OUTPUT_DIR, "5-2-1-PC-360视图-维保记录.png");
    console.log(`\n[客户管理] 截图：维保记录 Tab -> ${maintenancePath}`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: maintenancePath, fullPage: true });
    console.log("✅ 维保记录长图完成");

    // 保险合同 Tab：label = customer.profile360.insuranceContract -> 5-2-2-PC-360视图-保险合同.png
    const insuranceTab = page.locator('.info-tabs .el-tabs__item').filter({
      hasText: /保险|Insurance/i
    }).first();
    await insuranceTab.click();
    await waitPageStable(page);
    const insurancePath = path.join(OUTPUT_DIR, "5-2-2-PC-360视图-保险合同.png");
    console.log(`\n[客户管理] 截图：保险合同 Tab -> ${insurancePath}`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: insurancePath, fullPage: true });
    console.log("✅ 保险合同长图完成");

    // 沟通记录 Tab：label = customer.profile360.communicationRecords -> 5-2-3-PC-360视图.-沟通记录png.png
    const communicationTab = page.locator('.info-tabs .el-tabs__item').filter({
      hasText: /沟通|互动|Communication/i
    }).first();
    await communicationTab.click();
    await waitPageStable(page);
    const communicationPath = path.join(OUTPUT_DIR, "5-2-3-PC-360视图.-沟通记录png.png");
    console.log(`\n[客户管理] 截图：沟通记录 Tab -> ${communicationPath}`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: communicationPath, fullPage: true });
    console.log("✅ 沟通记录长图完成");

    // 金融贷款 Tab：label = customer.profile360.financialLoans -> 5-2-4-PC-360视图-金融贷款.png
    const loanTab = page.locator('.info-tabs .el-tabs__item').filter({
      hasText: /金融|贷款|Loan/i
    }).first();
    await loanTab.click();
    await waitPageStable(page);
    const loanPath = path.join(OUTPUT_DIR, "5-2-4-PC-360视图-金融贷款.png");
    console.log(`\n[客户管理] 截图：金融贷款 Tab -> ${loanPath}`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: loanPath, fullPage: true });
    console.log("✅ 金融贷款长图完成");

    // 车辆信息 Tab：label = customer.profile360.vehicleInfo -> 5-2-5-PC-360视图-车辆信息.png
    const vehicleTab = page.locator('.info-tabs .el-tabs__item').filter({
      hasText: /车辆|车辆信息|Vehicle/i
    }).first();
    await vehicleTab.click();
    await waitPageStable(page);
    const vehiclePath = path.join(OUTPUT_DIR, "5-2-5-PC-360视图-车辆信息.png");
    console.log(`\n[客户管理] 截图：车辆信息 Tab -> ${vehiclePath}`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: vehiclePath, fullPage: true });
    console.log("✅ 车辆信息长图完成");

    // 资产信息 Tab：label = customer.profile360.assets -> 5-2-6-PC-360视图-资产信息.png
    const assetsTab = page.locator('.info-tabs .el-tabs__item').filter({
      hasText: /资产|Assets?/i
    }).first();
    await assetsTab.click();
    await waitPageStable(page);
    const assetsPath = path.join(OUTPUT_DIR, "5-2-6-PC-360视图-资产信息.png");
    console.log(`\n[客户管理] 截图：资产信息 Tab -> ${assetsPath}`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: assetsPath, fullPage: true });
    console.log("✅ 资产信息长图完成");
  } catch (e) {
    console.error("❌ 客户管理 360 视图截图失败：", e);
  }

  // ---------- 1. 异常中心模块：典型功能截图 ----------
  try {
    const errorCenterUrl = toHashUrl(baseUrl, "/dataProcess/errorCorrection");
    console.log(`\n[异常中心] 打开异常中心列表：${errorCenterUrl}`);
    await page.goto(errorCenterUrl, { waitUntil: "networkidle", timeout: 60000 });
    await waitPageStable(page);

    // 待处理 Tab（默认）列表长图 -> 3-1-PC-异常中心.png
    const errorListPath = path.join(OUTPUT_DIR, "3-1-PC-异常中心.png");
    console.log(`[异常中心] 截图：待处理列表 -> ${errorListPath}`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: errorListPath, fullPage: true });

    // 唯一性异常筛选（如果有“唯一性”字样的二级筛选按钮）
    const uniquenessBtn = page.locator("text=唯一性").first();
    if (await uniquenessBtn.isVisible().catch(() => false)) {
      await uniquenessBtn.click();
      await waitPageStable(page);
      const uniqueListPath = path.join(OUTPUT_DIR, "3-3-PC-唯一性异常.png");
      console.log(`[异常中心] 截图：唯一性异常列表 -> ${uniqueListPath}`);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(800);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: uniqueListPath, fullPage: true });
    }
  } catch (e) {
    console.error("❌ 异常中心模块截图失败：", e);
  }

  // ---------- 2. 标签管理模块：列表 + 新增/编辑/详情 ----------
  try {
    const tagUrl = toHashUrl(baseUrl, "/tagManage");
    console.log(`\n[标签管理] 打开标签管理：${tagUrl}`);
    await page.goto(tagUrl, { waitUntil: "networkidle", timeout: 60000 });
    await waitPageStable(page);

    // 列表长图 -> 7-1-PC-标签管理.png
    const tagListPath = path.join(OUTPUT_DIR, "7-1-PC-标签管理.png");
    console.log(`[标签管理] 截图：列表 -> ${tagListPath}`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: tagListPath, fullPage: true });

    // 新增标签弹窗 -> 7-4-PC-新增标签.png
    const addTagBtn = page.locator("button:has-text('新增标签'), button:has-text('新增')");
    const addTagEl = addTagBtn.first();
    if (await addTagEl.isVisible().catch(() => false)) {
      await addTagEl.click();
      await waitPageStable(page);
      const addTagPath = path.join(OUTPUT_DIR, "7-4-PC-新增标签.png");
      console.log(`[标签管理] 截图：新增标签弹窗 -> ${addTagPath}`);
      await page.screenshot({ path: addTagPath, fullPage: true });
      // 关闭弹窗（优先点击「取消」，否则点击右上角关闭图标）
      const cancelBtn = page.locator("button:has-text('取消')").last();
      const closeIcon = page.locator(".el-dialog__headerbtn").last();
      if (await cancelBtn.isVisible().catch(() => false)) {
        await cancelBtn.click();
      } else if (await closeIcon.isVisible().catch(() => false)) {
        await closeIcon.click();
      }
      await waitPageStable(page);
    }
  } catch (e) {
    console.error("❌ 标签管理模块截图失败：", e);
  }

  // ---------- 3. 分群管理模块：列表 + 新增/编辑/导出 ----------
  try {
    const segmentUrl = toHashUrl(baseUrl, "/segmentManage");
    console.log(`\n[分群管理] 打开分群管理：${segmentUrl}`);
    await page.goto(segmentUrl, { waitUntil: "networkidle", timeout: 60000 });
    await waitPageStable(page);

    // 列表长图 -> 8-1-PC-分群管理.png
    const segmentListPath = path.join(OUTPUT_DIR, "8-1-PC-分群管理.png");
    console.log(`[分群管理] 截图：列表 -> ${segmentListPath}`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: segmentListPath, fullPage: true });

    // 新增分群弹窗/页面 -> 8-2-PC-新增分群.png
    const addSegmentBtn = page.locator("button:has-text('新增分群'), button:has-text('新增')");
    const addSegmentEl = addSegmentBtn.first();
    if (await addSegmentEl.isVisible().catch(() => false)) {
      await addSegmentEl.click();
      await waitPageStable(page);
      const addSegmentPath = path.join(OUTPUT_DIR, "8-2-PC-新增分群.png");
      console.log(`[分群管理] 截图：新增分群 -> ${addSegmentPath}`);
      await page.screenshot({ path: addSegmentPath, fullPage: true });
      // 关闭新增分群弹窗 / 抽屉，避免影响后续截图
      const cancelBtn = page.locator("button:has-text('取消')").last();
      const closeIcon = page.locator(".el-dialog__headerbtn, .el-drawer__close-btn").last();
      if (await cancelBtn.isVisible().catch(() => false)) {
        await cancelBtn.click();
      } else if (await closeIcon.isVisible().catch(() => false)) {
        await closeIcon.click();
      }
      await waitPageStable(page);
    }

    // 编辑分群弹窗 -> 8-3-PC-编辑分群.png
    const firstRowSelector = ".el-table__body-wrapper .el-table__row";
    const hasSegmentRow = await page
      .waitForSelector(firstRowSelector, { timeout: 15000 })
      .then(() => true)
      .catch(() => false);
    if (hasSegmentRow) {
      const editBtn =
        (await page.locator("button:has-text('编辑')").first().isVisible().catch(() => false))
          ? page.locator("button:has-text('编辑')").first()
          : page.locator(firstRowSelector).first().locator("button").first();
      await editBtn.click();
      await waitPageStable(page);
      const editSegmentPath = path.join(OUTPUT_DIR, "8-3-PC-编辑分群.png");
      console.log(`[分群管理] 截图：编辑分群 -> ${editSegmentPath}`);
      await page.screenshot({ path: editSegmentPath, fullPage: true });
      // 关闭编辑弹窗
      const cancelEditBtn = page.locator(".segment-manage-dialog button:has-text('取消')").last();
      const closeEditIcon = page.locator(".segment-manage-dialog .el-dialog__headerbtn").last();
      if (await cancelEditBtn.isVisible().catch(() => false)) {
        await cancelEditBtn.click();
      } else if (await closeEditIcon.isVisible().catch(() => false)) {
        await closeEditIcon.click();
      }
      await waitPageStable(page);
    }

    // 导出分群确认弹窗 -> 8-4-PC-导出分群.png
    if (hasSegmentRow) {
      const exportBtn =
        (await page.locator("button:has-text('导出')").first().isVisible().catch(() => false))
          ? page.locator("button:has-text('导出')").first()
          : page.locator(firstRowSelector).first().locator("button:has-text('导出')");
      if (await exportBtn.isVisible().catch(() => false)) {
        await exportBtn.click();
        await waitPageStable(page);
        const exportSegmentPath = path.join(OUTPUT_DIR, "8-4-PC-导出分群.png");
        console.log(`[分群管理] 截图：导出分群确认 -> ${exportSegmentPath}`);
        await page.screenshot({ path: exportSegmentPath, fullPage: true });
        // 关闭确认弹窗（点“取消”或关闭）
        const cancelExportBtn = page.locator(".el-message-box__btns button:has-text('取消')").last();
        const closeExportIcon = page.locator(".el-message-box__headerbtn").last();
        if (await cancelExportBtn.isVisible().catch(() => false)) {
          await cancelExportBtn.click();
        } else if (await closeExportIcon.isVisible().catch(() => false)) {
          await closeExportIcon.click();
        }
        await waitPageStable(page);
      }
    }
  } catch (e) {
    console.error("❌ 分群管理模块截图失败：", e);
  }

  // ---------- 4. 商机管理模块：看板 + 新增商机 + 列表 + 追踪 ----------
  try {
    // 商机看板 -> 9-1-PC-商机看板.png
    const leadDashboardUrl = toHashUrl(baseUrl, "/leadManagement/dashboard");
    console.log(`\n[商机管理] 打开商机看板：${leadDashboardUrl}`);
    await page.goto(leadDashboardUrl, { waitUntil: "networkidle", timeout: 60000 });
    await waitPageStable(page);
    const leadDashboardPath = path.join(OUTPUT_DIR, "9-1-PC-商机看板.png");
    console.log(`[商机管理] 截图：商机看板 -> ${leadDashboardPath}`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: leadDashboardPath, fullPage: true });

    // 新增商机弹窗 -> 9-2-PC-新增商机.png
    const addLeadBtn = page.locator("button:has-text('新增商机'), button:has-text('新增')");
    const addLeadEl = addLeadBtn.first();
    if (await addLeadEl.isVisible().catch(() => false)) {
      await addLeadEl.click();
      await waitPageStable(page);
      const addLeadPath = path.join(OUTPUT_DIR, "9-2-PC-新增商机.png");
      console.log(`[商机管理] 截图：新增商机弹窗 -> ${addLeadPath}`);
      await page.screenshot({ path: addLeadPath, fullPage: true });
      // 关闭新增商机弹窗
      const cancelLeadBtn = page.locator(".el-dialog button:has-text('取消')").last();
      const closeLeadIcon = page.locator(".el-dialog__headerbtn").last();
      if (await cancelLeadBtn.isVisible().catch(() => false)) {
        await cancelLeadBtn.click();
      } else if (await closeLeadIcon.isVisible().catch(() => false)) {
        await closeLeadIcon.click();
      }
      await waitPageStable(page);
    }

    // 商机列表 -> 10-PC-商机列表.png
    const leadListUrl = toHashUrl(baseUrl, "/leadManagement/list");
    console.log(`\n[商机管理] 打开商机列表：${leadListUrl}`);
    await page.goto(leadListUrl, { waitUntil: "networkidle", timeout: 60000 });
    await waitPageStable(page);
    const leadListPath = path.join(OUTPUT_DIR, "10-PC-商机列表.png");
    console.log(`[商机管理] 截图：商机列表 -> ${leadListPath}`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: leadListPath, fullPage: true });
  } catch (e) {
    console.error("❌ 商机管理模块截图失败：", e);
  }

  // ---------- 6. 客户筛选与分群（漏斗 / 自定义筛选） ----------
  try {
    const segmentationUrl = toHashUrl(baseUrl, "/customer/segmentation");
    console.log(`\n[客户筛选与分群] 打开页面：${segmentationUrl}`);
    await page.goto(segmentationUrl, { waitUntil: "networkidle", timeout: 60000 });
    await waitPageStable(page);

    // 漏斗筛选模式长图 -> 6-1-PC-顾客筛选与分群-漏斗.png
    const funnelPath = path.join(OUTPUT_DIR, "6-1-PC-顾客筛选与分群-漏斗.png");
    console.log(`[客户筛选与分群] 截图：漏斗筛选模式 -> ${funnelPath}`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: funnelPath, fullPage: true });

    // 切换到自定义筛选模式（点击“自定义筛选”按钮）
    const advancedBtn = page.locator("button:has-text('自定义筛选')");
    if (await advancedBtn.first().isVisible().catch(() => false)) {
      await advancedBtn.first().click();
      await waitPageStable(page);
      const advancedPath = path.join(OUTPUT_DIR, "6-2-PC-顾客筛选与分群自定义筛选.png");
      console.log(`[客户筛选与分群] 截图：自定义筛选模式 -> ${advancedPath}`);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(800);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: advancedPath, fullPage: true });
    } else {
      console.warn("⚠ 未找到“自定义筛选”按钮，跳过自定义筛选模式截图。");
    }
  } catch (e) {
    console.error("❌ 客户筛选与分群模块截图失败：", e);
  }

  // ---------- 5. 角色管理模块：列表 + 修改角色 + 分配用户 ----------
  try {
    const roleUrl = toHashUrl(baseUrl, "/system/roleManage");
    console.log(`\n[角色管理] 打开角色管理：${roleUrl}`);
    await page.goto(roleUrl, { waitUntil: "networkidle", timeout: 60000 });
    await waitPageStable(page);

    // 列表长图（如已由 TARGETS 截过，可视为覆盖）-> 14-1-PC-角色管理.png
    const roleListPath = path.join(OUTPUT_DIR, "14-1-PC-角色管理.png");
    console.log(`[角色管理] 截图：角色列表 -> ${roleListPath}`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: roleListPath, fullPage: true });

    // 点击第一行的“编辑”/“修改角色”按钮，打开编辑对话框
    const firstRowSelector = ".el-table__body-wrapper .el-table__row";
    const hasRoleRow = await page
      .waitForSelector(firstRowSelector, { timeout: 15000 })
      .then(() => true)
      .catch(() => false);

    if (hasRoleRow) {
      const editBtn =
        (await page.locator("button:has-text('编辑')").first().isVisible().catch(() => false))
          ? page.locator("button:has-text('编辑')").first()
          : page.locator(firstRowSelector).first().locator("button").first();

      await editBtn.click();
      await waitPageStable(page);

      // 14-2-PC-修改角色.png：基本信息 Tab
      const roleEditBasicPath = path.join(OUTPUT_DIR, "14-2-PC-修改角色.png");
      console.log(`[角色管理] 截图：修改角色-基本信息 -> ${roleEditBasicPath}`);
      await page.screenshot({ path: roleEditBasicPath, fullPage: true });

      // 14-3-PC-修改角色.png：切到“功能权限”Tab 后截图
      const funcTab = page.locator(".el-dialog .el-tabs__item").filter({ hasText: /功能权限|Functional/i }).first();
      if (await funcTab.isVisible().catch(() => false)) {
        await funcTab.click();
        await waitPageStable(page);
        const roleEditFuncPath = path.join(OUTPUT_DIR, "14-3-PC-修改角色.png");
        console.log(`[角色管理] 截图：修改角色-功能权限 -> ${roleEditFuncPath}`);
        await page.screenshot({ path: roleEditFuncPath, fullPage: true });
      }

      // 14-5-PC修改角色.png：切到“字段脱敏”Tab 后截图
      const maskingTab = page.locator(".el-dialog .el-tabs__item").filter({ hasText: /字段脱敏|Masking/i }).first();
      if (await maskingTab.isVisible().catch(() => false)) {
        await maskingTab.click();
        await waitPageStable(page);
        const roleEditMaskingPath = path.join(OUTPUT_DIR, "14-5-PC修改角色.png");
        console.log(`[角色管理] 截图：修改角色-字段脱敏 -> ${roleEditMaskingPath}`);
        await page.screenshot({ path: roleEditMaskingPath, fullPage: true });
      }

      // 关闭编辑对话框（取消 or 右上角 X）
      const cancelBtn = page.locator(".el-dialog button:has-text('取消')").last();
      const closeIcon = page.locator(".el-dialog__headerbtn").last();
      if (await cancelBtn.isVisible().catch(() => false)) {
        await cancelBtn.click();
      } else if (await closeIcon.isVisible().catch(() => false)) {
        await closeIcon.click();
      }
      await waitPageStable(page);
    } else {
      console.warn("⚠ 角色列表中未检测到数据行，跳过角色编辑相关截图。");
    }

    // 分配用户对话框 -> 14-6-PC-角色分配用户.png
    const assignBtn =
      (await page.locator("button:has-text('分配用户')").first().isVisible().catch(() => false))
        ? page.locator("button:has-text('分配用户')").first()
        : page.locator(firstRowSelector).first().locator("button:has-text('分配用户')");

    if (await assignBtn.isVisible().catch(() => false)) {
      await assignBtn.click();
      await waitPageStable(page);
      const assignPath = path.join(OUTPUT_DIR, "14-6-PC-角色分配用户.png");
      console.log(`[角色管理] 截图：角色分配用户 -> ${assignPath}`);
      await page.screenshot({ path: assignPath, fullPage: true });

      // 关闭分配用户对话框
      const cancelAssignBtn = page.locator(".el-dialog button:has-text('取消')").last();
      const closeAssignIcon = page.locator(".el-dialog__headerbtn").last();
      if (await cancelAssignBtn.isVisible().catch(() => false)) {
        await cancelAssignBtn.click();
      } else if (await closeAssignIcon.isVisible().catch(() => false)) {
        await closeAssignIcon.click();
      }
      await waitPageStable(page);
    } else {
      console.warn("⚠ 未找到“分配用户”按钮，跳过 角色分配用户 截图。");
    }
  } catch (e) {
    console.error("❌ 角色管理模块截图失败：", e);
  }

  for (const target of TARGETS) {
    const url = toHashUrl(baseUrl, target.path);
    const savePath = path.join(OUTPUT_DIR, target.fileName);

    console.log(`\n[截图] 模块：${target.module}`);
    console.log(`功能：${target.name}`);
    console.log(`URL：${url}`);
    console.log(`保存为：${savePath}`);

    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
      await waitPageStable(page);

      await screenshotIfNotExists(page, savePath, `${target.module}-${target.name}`);
    } catch (error) {
      console.error("❌ 截图失败：", error);
    }
  }

  await browser.close();
}

async function main() {
  const baseUrlArg = process.argv.find(arg => arg.startsWith("--baseUrl="));
  const baseUrl = baseUrlArg
    ? baseUrlArg.replace("--baseUrl=", "")
    : "http://192.168.2.140:8848/";

  if (!baseUrl.startsWith("http")) {
    console.error("请通过 --baseUrl=http://localhost:xxxx 指定正确的地址");
    process.exit(1);
  }

  console.log("将使用 baseUrl：", baseUrl);
  await captureAll(baseUrl);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

