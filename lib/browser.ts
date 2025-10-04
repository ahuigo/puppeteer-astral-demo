import { Browser, connect, launch, Page } from "$puppeteer";
import { ChromeArgOptions, LaunchOptions } from "LaunchOptions";

const CHROME_DEBUG_PORT = 9222;
export async function runRemoteBrowser() {
}
/**
 * 连接到本地已运行的Chrome浏览器
 * 需要先启动Chrome并开启远程调试端口，安全要求指定非默认目录 --user-data-dir=/tmp/chrome-debug
 * 例如: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 -user-data-dir=/tmp/chrome-debug
 */
async function connectToExistingChrome(): Promise<Browser> {
  try {
    console.log(`正在连接到本地Chrome浏览器(端口: ${CHROME_DEBUG_PORT})...`);
    // 连接到本地Chrome
    const browser = await connect({
      endpoint: `http://localhost:${CHROME_DEBUG_PORT}`,
      // 如果需要指定WebSocket端点，可以使用以下方式
      // browserWSEndpoint: `ws://localhost:${CHROME_DEBUG_PORT}/devtools/browser/[id]`,
      // endpoint: "ws://", // 注意：astral字段名是 endpoint, 不是 browserWSEndpoint
    });
    console.log("成功连接到本地Chrome浏览器");
    return browser;
  } catch (error) {
    console.error("连接本地Chrome失败:", error);
    throw new Error(
      "无法连接到本地Chrome，请确保Chrome已启动并开启远程调试端口",
    );
  }
}
async function getBrowser(
  options: ChromeArgOptions & LaunchOptions = {},
) {
  try {
    const browser = await connectToExistingChrome();
    return browser;
  } catch (error) {
    console.error("连接本地Chrome失败:", error);
    // launch() 时可以通过浏览器启动参数传入（例如 --ignore-certificate-errors）；
    const browser = await launch({

      // executablePath: "/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome",
      args: ["--start-maximized", "--no-sandbox"], // you can also use '--start-fullscreen'
      headless: false,
      ...options,
    });
    return browser;
  }
}

export async function getPageBrowser(
  options: ChromeArgOptions & LaunchOptions = {},
) {
  // 不同放在外面
  const browser = await getBrowser(options);
  try {
    const page = await browser.newPage();
    // browser.#celestial
    return [page, browser] as const;
  } catch (err) {
    await browser.close();
    throw err;
  }
}
