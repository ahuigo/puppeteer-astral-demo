export function btoa2(s: string) {
  return globalThis.btoa(unescape(encodeURIComponent(s)));
}

export function atob2(s: string) {
  try {
    s = s.replace(/ /g, '+');
    const r = decodeURIComponent(escape(globalThis.atob(s)));
    return r;
  } catch (e) {
    console.error(e, { s });
    throw e;
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export function getArgs() {
  const args = {} as Record<string, string | boolean>;
  console.log('argv', Deno.args);
  Deno.args
    .forEach(arg => {
      // long arg
      if (arg.includes('=')) {
        const longArg = arg.split('=');
        const longArgFlag = longArg[0];
        const longArgValue = longArg.length > 1 ? longArg[1] : true;
        args[longArgFlag] = longArgValue;
      }
    });
  return args;
}

export async function gitLastGitLog() {
  const command = new Deno.Command("git", {
    args: ['log', '-1', '--pretty=format:%s']
  });
  const { code, stdout, stderr } = await command.output();
  if (code !== 0) {
    console.log(stderr);
    Deno.exit(1);
  }
  const outputString = new TextDecoder().decode(stdout);
  return outputString;
}

export function isFilePathExist(filePath:string){
  try{
    Deno.statSync(filePath);
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
