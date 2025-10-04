
import { getPageBrowser} from "../lib/browser.ts";

//deno test --allow-all --no-check --filter /^test gogo1$/ ./puppeteer-goto_test.ts 
Deno.test("test goto", async function (t) {
  const [page, _] = await getPageBrowser()
  await page.goto("https://t.cn", { waitUntil: 'networkidle2' });
});