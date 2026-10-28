// 公共工具：DOM、图标、剪贴板、Toast
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined) continue;
    el.append(c.nodeType ? c : document.createTextNode(c));
  }
  return el;
}

export function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._tm);
  t._tm = setTimeout(() => t.classList.remove('show'), 1600);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('已复制到剪贴板');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.append(ta); ta.select();
    document.execCommand('copy'); ta.remove();
    toast('已复制到剪贴板');
  }
}

export function copyBtn(getText) {
  return h('button', { class: 'btn sm ghost', onclick: () => copyText(typeof getText === 'function' ? getText() : getText) }, '复制');
}

// 输出区：带复制按钮的结果块
export function outBlock(initial = '') {
  const out = h('div', { class: 'out' }, initial);
  const set = (v) => { out.textContent = v; };
  const get = () => out.textContent;
  return { out, set, get };
}

// 简易图标集（stroke 风格 SVG）
const P = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
export const icons = {
  home: P('<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/>'),
  braces: P('<path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1"/><path d="M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-1"/>'),
  lock: P('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  regex: P('<circle cx="12" cy="12" r="9"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>'),
  clock: P('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>'),
  key: P('<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8.2-8.2M15 4l3 3M18 7l2 2"/>'),
  palette: P('<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1" fill="currentColor"/><circle cx="12" cy="7.5" r="1" fill="currentColor"/><circle cx="16" cy="10" r="1" fill="currentColor"/><path d="M12 21c-1 0-2-1-2-2.5S11 15 13.5 15H17a4 4 0 0 0 4-4"/>'),
  hash: P('<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>'),
  markdown: P('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 15V9l2.5 3L12 9v6M16 12v-3m0 3-2-2m2 2 2-2"/>'),
  diff: P('<path d="M12 3v18"/><path d="M5 8h4M5 16h4M15 8h4M15 16h4"/>'),
  jwt: P('<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 12h2m2 0h2m2 0h2m2 0h1"/>'),
  binary: P('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9v6M7 9l2 2M11 9v6m0-6-1.5 1.5"/><rect x="15" y="9" width="3" height="6" rx="1.5"/>'),
  brush: P('<path d="m14 5 5 5L9 20H5a2 2 0 0 1-2-2v-4Z"/><path d="m13 6 3-3 5 5-3 3"/>'),
  cron: P('<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18M8 15h2m4 0h2"/>'),
  data: P('<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>'),
  text: P('<path d="M4 7V5h16v2M9 20h6M12 5v15"/>'),
  star: '★',
};
