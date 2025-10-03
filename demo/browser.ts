import { Browser, launch, Page } from "$puppeteer";
import { ChromeArgOptions, LaunchOptions } from "LaunchOptions";

export async function runBrowser(
  fn: (page: Page, browser: Browser) => void,
  options: ChromeArgOptions & LaunchOptions = {},
) {
  // 不同放在外面
  // launch() 时可以通过浏览器启动参数传入（例如 --ignore-certificate-errors）；
  const browser = await launch({
    args: ["--start-maximized", "--no-sandbox"], // you can also use '--start-fullscreen'
    // executablePath: "/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome",
    headless: false,
    ...options,
  });
  try {
    const page = await browser.newPage();
    // browser.#celestial
    await fn(page, browser);
  } catch (err) {
    console.log(err);
  } finally {
    await browser.close();
  }
}