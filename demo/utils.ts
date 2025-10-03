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
