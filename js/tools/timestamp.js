import { h, icons, copyText } from '../lib.js';

function fmt(d, tz) {
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).format(d);
  } catch { return d.toLocaleString('zh-CN'); }
}
function rel(d) {
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff), f = (n, u) => `${Math.floor(n)} ${u}${diff > 0 ? '后' : '前'}`;
  if (abs < 60e3) return '刚刚';
  if (abs < 3600e3) return f(abs / 60e3, '分钟');
  if (abs < 86400e3) return f(abs / 3600e3, '小时');
  if (abs < 30 * 86400e3) return f(abs / 86400e3, '天');
  if (abs < 365 * 86400e3) return f(abs / 2592000e3, '个月');
  return f(abs / 31536000e3, '年');
}

export default {
  id: 'timestamp',
  name: '时间戳转换',
  desc: 'Unix 时间戳 ↔ 日期时间互转、时区换算、相对时间',
  icon: icons.clock,
  category: '文本 / 时间',
  keywords: 'timestamp unix epoch date time timezone',
  render(main) {
    const nowBox = h('div');
    const tsInput = h('input', { type: 'text', class: 'mono', placeholder: 'Unix 时间戳（秒/毫秒自动识别）', style: 'flex:1;min-width:200px' });
    const dateInput = h('input', { type: 'text', class: 'mono', placeholder: '如 2026-10-28 14:30:00 或 ISO 格式', style: 'flex:1;min-width:200px' });
    const tzSel = h('select', {},
      ['Asia/Shanghai', 'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney']
        .map(t => h('option', {}, t)));
    const resBox = h('div');

    const showDate = (d, label) => {
      const kv = (k, v) => h('div', { class: 'kv' }, h('span', { class: 'k' }, k),
        h('span', { class: 'v', onclick: () => copyText(v) }, v));
      return h('div', { class: 'card' },
        h('div', { class: 'card-h' }, label),
        kv('Unix (秒)', String(Math.floor(d.getTime() / 1000))),
        kv('Unix (毫秒)', String(d.getTime())),
        kv('本地时间', d.toLocaleString('zh-CN', { hour12: false })),
        kv('所选时区', fmt(d, tzSel.value)),
        kv('ISO 8601', d.toISOString()),
        kv('UTC', d.toUTCString()),
        kv('相对时间', rel(d)),
        kv('星期', '周' + '日一二三四五六'[d.getDay()]),
        kv('年内第几天', String(Math.ceil((d - new Date(d.getFullYear(), 0, 0)) / 86400e3))),
      );
    };

    const parseTs = () => {
      const s = tsInput.value.trim(); if (!s) return null;
      const n = Number(s);
      if (isNaN(n)) return 'NaN';
      return new Date(s.length > 11 || Math.abs(n) > 1e12 ? n : n * 1000);
    };
    const parseDate = () => {
      const s = dateInput.value.trim(); if (!s) return null;
      const d = new Date(s.replace(/\//g, '-'));
      return isNaN(d) ? 'NaN' : d;
    };
    const run = () => {
      resBox.innerHTML = '';
      const a = parseTs(), b = parseDate();
      if (a === 'NaN' || b === 'NaN') resBox.append(h('div', { class: 'card err' }, '输入无法解析，请检查格式'));
      if (a instanceof Date) resBox.append(showDate(a, '时间戳 → 日期'));
      if (b instanceof Date) resBox.append(showDate(b, '日期 → 时间戳'));
    };
    tsInput.addEventListener('input', run);
    dateInput.addEventListener('input', run);
    tzSel.addEventListener('change', run);

    const tick = () => {
      const now = new Date();
      nowBox.innerHTML = '';
      nowBox.append(h('div', { class: 'card' },
        h('div', { class: 'card-h' }, '当前时间'),
        h('div', { class: 'three-col' },
          h('div', {}, h('div', { class: 'muted' }, 'Unix 秒'), h('div', { class: 'mono', style: 'font-size:20px;color:var(--accent)' }, String(Math.floor(now / 1000)))),
          h('div', {}, h('div', { class: 'muted' }, 'Unix 毫秒'), h('div', { class: 'mono', style: 'font-size:20px;color:var(--accent-2)' }, String(now.getTime()))),
          h('div', {}, h('div', { class: 'muted' }, '本地时间'), h('div', { class: 'mono', style: 'font-size:20px' }, now.toLocaleTimeString('zh-CN', { hour12: false }))))));
    };
    tick();
    const timer = setInterval(tick, 1000);
    // 页面切换时清理
    const obs = new MutationObserver(() => { if (!document.contains(nowBox)) { clearInterval(timer); obs.disconnect(); } });
    obs.observe(document.body, { childList: true, subtree: true });

    main.append(nowBox,
      h('div', { class: 'card' },
        h('div', { class: 'card-h' }, '转换'),
        h('div', { class: 'inline-fields', style: 'width:100%' },
          tsInput, dateInput, h('div', { class: 'field', style: 'margin:0' }, h('label', {}, '时区'), tzSel),
          h('button', { class: 'btn primary', onclick: run }, '转换'))),
      resBox);
  },
};
