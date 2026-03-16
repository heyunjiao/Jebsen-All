import { chromium, Browser, Page } from "playwright";
import path from "node:path";
import fs from "node:fs";

interface CaptureTarget {
  /** 说明用的模块名称 */
  module: string;
  /** 功能点名称/描述 */
  name: string;
  /** 访问路径（相对 baseUrl） */
  path: string;
  /** 输出文件名（不含路径） */
  fileName: string;
}

const PC_OUTPUT_DIR = path.resolve(
  process.cwd(),
  "..",
  "产品截图",
  "cursor-ai-screenshot"
);

// TODO: 如有需要，可继续补充更多页面
const PC_TARGETS: CaptureTarget[] = [
  {
    module: "源数据采集",
    name: "首页-源数据采集总览",
    path: "/home/index",
    fileName: "01-01-PC-欢迎页-源数据采集总览.png"
  },
  {
    module: "异常中心",
    name: "异常中心总览",
    path: "/errorCorrection",
    fileName: "02-01-PC-异常中心-总览页.png"
  },
  {
    module: "客户列表",
    name: "客户列表-列表页全屏",
    path: "/customer/list",
    fileName: "03-01-PC-客户列表-列表页全屏.png"
  },
  {
    module: "客户列表",
    name: "客户360-总览",
    path: "/customer/list?open360=1",
    fileName: "03-03-PC-客户360-总览.png"
  }
];

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function waitPageStable(page: Page, timeout = 3000) {
  // 等待网络基本空闲 + 额外延时，确保图表/列表渲染完成
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(timeout);
}

async function captureForTargets(baseUrl: string, targets: CaptureTarget[]) {
  ensureDir(PC_OUTPUT_DIR);

  const browser: Browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  for (const target of targets) {
    const url = new URL(target.path, baseUrl).toString();
    const savePath = path.join(PC_OUTPUT_DIR, target.fileName);

    console.log(`\n[截图] 模块：${target.module}`);
    console.log(`功能：${target.name}`);
    console.log(`URL：${url}`);
    console.log(`保存为：${savePath}`);

    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
      await waitPageStable(page);

      await page.screenshot({
        path: savePath,
        fullPage: true
      });

      console.log("✅ 截图完成");
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
    : "http://localhost:5173/";

  if (!baseUrl.startsWith("http")) {
    console.error("请通过 --baseUrl=http://localhost:xxxx 指定正确的地址");
    process.exit(1);
  }

  console.log("将使用 baseUrl：", baseUrl);
  await captureForTargets(baseUrl, PC_TARGETS);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

