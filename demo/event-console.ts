import { sleep } from "../deps.ts";
import { getPageBrowser } from "../lib/browser.ts";

//deno test --allow-all --no-check --filter /^test gogo1$/ ./puppeteer-goto_test.ts 
Deno.test("on console", async function (t) {
  const [page, _] = await getPageBrowser();
    await page.goto("https://www.baidu.com");
    //2. open console: console.log(1111)
    // 原puppeteer的用法是: page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.addEventListener("console", (e) => {
      const { type, text } = e.detail as { type: string; text: string; };
      console.log(`[PAGE console ${type}]`, text);
    });
    await page.evaluate(() => {
      console.log("hello", { a: 1 });
      console.error("boom", 123n);
    });
    await sleep(2000);
},);

