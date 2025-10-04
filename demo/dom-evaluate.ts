import { getPageBrowser } from "../lib/browser.ts";

//deno test --allow-all --no-check --filter /^test gogo1$/ ./puppeteer-goto_test.ts
Deno.test("get dom", async function (t) {
  const [page, _] = await getPageBrowser();
  await page.goto("https://www.baidu.com");
  const dimensions = await page.evaluate(() => {
    return {
      width: globalThis.document.documentElement.clientWidth,
      height: globalThis.document.documentElement.clientHeight,
      deviceScaleFactor: globalThis.devicePixelRatio,
    };
  });
  console.log("Dimensions:", dimensions);
});
