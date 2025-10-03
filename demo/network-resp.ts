import { launch } from "$puppeteer";

Deno.test("get auth page content", async function (t) {
  // Launch browser
  const browser = await launch();
  // Open the webpage
  const page = await browser.newPage();
  // Provide credentials for HTTP authentication.
  // 获取低级 bindings
  const celestial = page.unsafelyGetCelestialBindings();

  const targetUrl = "https://httpbun.com/basic-auth/user/passwd";

  // 在导航前注册事件
  let bodyPromiseResolve: (v: string) => void;
  const bodyPromise = new Promise<string>((res) => (bodyPromiseResolve = res));

  const onResponse = async (e: Event) => {
    // e.detail 是 Network.responseReceivedEvent 的 detail
    // 注意类型断言以便访问字段
    // deno-lint-ignore no-explicit-any
    const detail: any = (e as CustomEvent).detail;
    try {
      if (detail.response && detail.response.url === targetUrl) {
        const requestId = detail.requestId;
        const res = await celestial.Network.getResponseBody({ requestId });
        const raw = res.base64Encoded
          ? Uint8Array.from(atob(res.body), (c) => c.charCodeAt(0))
          : new TextEncoder().encode(res.body);
        const text = new TextDecoder().decode(raw);
        bodyPromiseResolve(text);
      }
    } catch (err) {
      // 忽略错误或把错误 propagate
      bodyPromiseResolve("");
    }
  };

  celestial.addEventListener("Network.responseReceived", onResponse);
  await page.authenticate({ username: "user", password: "passwd" });
  await page.goto(targetUrl);

  // 等待并获得响应体（或者超时）
  const respText = await Promise.race([
    bodyPromise,
    // new Promise<string>((res) => setTimeout(() => res(""), 1000)),
  ]);

  console.log("raw response:", respText);

  // cleanup
  celestial.removeEventListener("Network.responseReceived", onResponse);
  // Close browser
  await browser.close();
},);

