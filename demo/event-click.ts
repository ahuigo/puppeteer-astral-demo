import { Page } from "$puppeteer";

const page = 1 as unknown as Page;
// await page.click('.vc-pullRequestCreate-createButton button');
await page.locator('.vc-pullRequestCreate-createButton button').click();
await (await page.$('.vc-pullRequestCreate-createButton button'))?.focus();