import { Cookie, Page } from "$puppeteer";
import { runBrowser } from "./demo/browser.ts";
import { getArgs, gitLastGitLog, sleep } from "./deps.ts";
interface Args {
  repo: string;
  from: string;
  to: string;
  msg: string;
}

const cookiePath = getHomeFile('/tmp/cookies.json');

async function syncCookie(page: Page) {
  const cookies = await page.cookies();
  Deno.writeTextFileSync(cookiePath, JSON.stringify(cookies, null, 2));
}

async function loadCookie(page: Page) {
  const cookiesString = Deno.readTextFileSync(cookiePath);
  const cookiesObj = JSON.parse(cookiesString) as Cookie[];
  const cookies: Cookie[] = [];
  for (const cookieObj of cookiesObj) {
    const cookie: Cookie = {
      name: cookieObj.name,
      value: cookieObj.value,
      domain: cookieObj.domain,
      expires: cookieObj.expires,
      httpOnly: cookieObj.httpOnly,
      secure: cookieObj.secure,
      session: cookieObj.session,
      sameSite: cookieObj.sameSite,
      path: cookieObj.path,
      size: cookieObj.size,
      priority: cookieObj.priority,
      sameParty: cookieObj.sameParty,
      sourceScheme: cookieObj.sourceScheme,
      sourcePort: cookieObj.sourcePort,
    };
    cookies.push(cookie);
  }
  await page.setCookies(cookies);
}

function isCookiePathValid() {
  if (!isCookiePathExist()) {
    return false;
  }
  const cookiesString = Deno.readTextFileSync(cookiePath);
  const cookies = JSON.parse(cookiesString);
  if (cookies.length === 0) {
    return false;
  }
  return true;
}
function isCookiePathExist() {
  try {
    Deno.statSync(cookiePath);
    // successful, file or directory must exist
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      // file or directory does not exist
      return false;
    } else {
      // unexpected error, maybe permissions, pass it along
      throw error;
    }
  }

}

// const MO_DEVOPS_PROJECT_URL = Deno.env.get('MO_DEVOPS_PROJECT_URL');
const MO_DEVOPS_PROJECT_URL = 'http://localhost:4500/dump/a';

async function getLoginPage(args: Args, page: Page) {

  const repo = args.repo;
  const username = Deno.env.get('MO_ME_USERNAME') as string;
  const password = getPassword();
  const userpass = { 'username': username, 'password': password };
  if (!username || !password) {
    console.log(username, password);
    Deno.exit(1);
  }
  const url = `${MO_DEVOPS_PROJECT_URL}/_git/${repo}/pullrequests?_a=mine`;
  await page.setViewportSize({ width: 1366, height: 768 });
  if (!isCookiePathValid()) {
    console.log(userpass);
  } else {
    console.log("loadCookie");
    await loadCookie(page);
  }
  await page.authenticate(userpass);

  for (let i = 0; i < 3; i++) {
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      break;
    } catch (e: any) {
      console.log('e:', e);
    }
  }
  await syncCookie(page);

  await sleep(1000 * 5);
  // page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.addEventListener('console', e => console.log('PAGE LOG:', e));
  await page.evaluate(() => console.log(`url is ${location.href}`));

  return page;
  //await browser.close();
};

function getHomeFile(path: string) {
  const home = Deno.env.get('HOME');
  return home + path;
}

async function main() {
  const args = getArgs() as any as Args;
  if (!args.msg) {
    args.msg = await gitLastGitLog();
  }
  console.log('args', args);
  if (!args.to || !args.msg || !args.repo) {
    console.log(`require to=? and msg=? and repo=?`);
    return;
  }

  await runBrowser(async (page) => {
    //1. login
    await getLoginPage(args, page);
    //window.page = page
    //2. goto pull request
    await gotoPullRequest(page, args);
    //3. creat request
  }, {
    headless: false,
    executablePath: "/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome",
    args: ["--start-maximized", "--no-sandbox"],
    // '--start-maximized' // you can also use '--start-fullscreen'
  });

}

import { parse } from "$std/yaml/mod.ts";

function getPassword(): string {
  const home = Deno.env.get('HOME');
  const data = parse(Deno.readTextFileSync(home + '/.mo.yaml')) as any;
  return data.passwdme;
}


async function gotoPullRequest(page: Page, args: Args) {
  await page.goto(`${MO_DEVOPS_PROJECT_URL}/_git/${args.repo}/pullrequestcreate`, { waitUntil: 'networkidle2' });
  console.log("wait for request create");
  await page.waitForSelector('.repos-pr-create-header div.version-dropdown', {
    timeout: 2000 * 1000
  });
  console.log("goto merge to page");
  await page.evaluate((args, b) => {
    console.log(args, b);
    const setSearchParam = (params: Record<string, string>) => {
      const urlInfo = new URL(window.location.href);
      const searchParams = new URLSearchParams(window.location.search);
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          searchParams.delete(key);
        } else {
          searchParams.set(key, value);
        }
      });

      urlInfo.search = searchParams.toString();
      const url = urlInfo.toString();
      return url;
    };
    const url = setSearchParam({
      sourceRef: args.from,
      targetRef: args.to,
    });
    location.href = url;
    return url;
  }, { args: [args, 1] });

  console.log("wait merge to page networkidle0");
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  console.log("wait merge to page element");
  await page.waitForSelector('input[placeholder="Enter a title"]');

  console.log("get element title");
  let selector = 'input[placeholder="Enter a title"]';
  const element = (await page.$(selector)) as HTMLInputElement | null;
  let title = await page.evaluate(element => element?.value, { args: [element] });
  if (!title) {
    title = args.msg || '';
    // use astral's locator.fill or ElementHandle.type
    await page.locator('input[placeholder="Enter a title"]').fill(args.msg || '');
    await sleep(100);
  }
  // click create
  await page.locator('button.bolt-split-button-main').click();

  // click approve button
  selector = '.repos-pr-header-vote-button>button.bolt-split-button-main';
  await clickSelector(page, selector);

  // click auto-completn button
  selector = 'button.bolt-split-button-main.primary[aria-disabled="false"]';
  await clickSelector(page, selector);

  selector = '#__bolt-complete';
  await clickSelector(page, selector);
  // astral exposes url as a property
  console.log("%cPR: " + page.url, 'background: #222; color: green');
  console.log("%c" + title, 'background: #222; color: green');
  await sleep(1000 * 1000);
}

async function clickSelector(page: Page, selector: string) {
  await page.waitForSelector(selector, {
    timeout: 2000 * 10
  });
  await page.locator(selector).click();
}

if (import.meta.main) {
  main();
}
