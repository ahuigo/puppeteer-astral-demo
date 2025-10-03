import { launch } from "$puppeteer";
import { sleep } from "../deps.ts";

Deno.test("get auth page content", async function (t) {
  // Launch browser
  const browser = await launch();
  const page = await browser.newPage();
  const targetUrl = "https://httpbun.com/basic-auth/user/passwd";

  // auth
  await page.authenticate({ username: "user", password: "passwd" });
  await page.goto(targetUrl);
  await sleep(300);

  // get content via page.content()
  console.log("page content:", await page.content());
  // or via evaluate
  let body: string | null = null;
  try {
    body = await page.evaluate(() => {
      // strip HTML tags to get JSON only
      const pre = document.querySelector("pre");
      if (pre) {
        body = pre.textContent || body;
      }
      return body;
    });
    const response = JSON.parse(body || '{}');
    // Assert JSON response
    if (response.authenticated !== true || response.user !== "user") {
      throw new Error("Authentication failed");
    } else {
      console.log("Authentication succeeded:", response);
    }

  } catch (e) {
    console.error("Error during authentication or parsing body", body, e);
  }

  // Close browser
  await browser.close();
},);

