import { getPageBrowser} from "../lib/browser.ts";

// const page = 1 as unknown as Page;

const [page, _] = await getPageBrowser();
await page.goto("https://www.baidu.com");
//截取页面部分区域(默认是整个页面)：
const buf = await page.screenshot({
  clip: { x: 0, y: 0, width: 800, height: 600, scale: 1 },
});
await Deno.writeFile("clip.png", buf);

// 截取某个元素：
const el = await page.$("#lg");
if (el) {
  const buf3 = await el.screenshot();
  await Deno.writeFile("element.png", buf3);
}
