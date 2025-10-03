import { Page } from "$puppeteer";
const page = 1 as unknown as Page;


// await page.type('input[placeholder="Enter a title"]', 'hello world');
await page.locator('input[placeholder="Enter a title"]').fill('hello world');
// 或者如果你想逐键延迟：
const el = await page.$('input[placeholder="Enter a title"]');
await el?.type('hello world', { delay: 100 }); // delay 单位 ms，逐字符延迟
// 先 focus 某个元素
await (await page.$('input[placeholder="Enter a title"]'))?.focus();
await page.keyboard.type('hello world', { delay: 50 });

// keyboard press `Enter` key
await page.keyboard.press('Enter');