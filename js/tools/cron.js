import { h, icons } from '../lib.js';

const MON = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 };
const DOW = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
const FIELD_META = [
  ['分钟', 0, 59, null],
  ['小时', 0, 23, null],
  ['日', 1, 31, null],
  ['月', 1, 12, MON],
  ['星期', 0, 7, DOW],
];

function parseField(src, min, max, names) {
  src = src.toUpperCase();
  if (names) src = src.replace(/[A-Z]{3}/g, m => names[m] ?? m);
  const set = new Set();
  for (const part of src.split(',')) {
    const [range, step] = part.split('/');
    const stepN = step ? parseInt(step) : 1;
    if (step && (isNaN(stepN) || stepN < 1)) throw `无效步长: ${part}`;
    let lo, hi;
    if (range === '*' || range === '') { lo = min; hi = max; }
    else if (range.includes('-')) {
      [lo, hi] = range.split('-').map(Number);
      if (isNaN(lo) || isNaN(hi) || lo > hi) throw `无效范围: ${range}`;
    } else {
      lo = hi = parseInt(range);
      if (isNaN(lo)) throw `无效值: ${range}`;
      if (step) { hi = max; } // a/n 表示从 a 开始每 n
    }
    if (lo < min || hi > max) throw `${range} 超出范围 ${min}-${max}`;
    for (let i = lo; i <= hi; i += stepN) set.add(i % (max + 1) === 0 && max === 7 ? 0 : i);
  }
  return set;
}

function describeField(src, label, names) {
  if (src === '*') return `每${label}`;
  if (src.startsWith('*/')) return `每 ${src.slice(2)} ${label}`;
  if (names && /[A-Z]{3}/.test(src.toUpperCase())) return `${label}：${src}`;
  if (src.includes(',')) return `${label}为 ${src}`;
  if (src.includes('-')) {
    const [a, b] = src.split('-');
    return `${label} ${a} 到 ${b}`;
  }
  if (src.includes('/')) {
    const [a, n] = src.split('/');
    return `从 ${label} ${a} 起每 ${n}`;
  }
  return `${label}为 ${src}`;
}

function nextRuns(expr, count = 8) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) throw '需要 5 段表达式：分 时 日 月 周';
  const [mins, hours, doms, mons, dows] = parts.map((p, i) => parseField(p, ...FIELD_META[i].slice(1)));
  const domRest = parts[2] !== '*', dowRest = parts[4] !== '*';
  const runs = [];
  const t = new Date();
  t.setSeconds(0, 0); t.setMinutes(t.getMinutes() + 1);
  const limit = 366 * 24 * 60;
  for (let i = 0; i < limit && runs.length < count; i++) {
    const d = new Date(t.getTime() + i * 60000);
    if (!mins.has(d.getMinutes()) || !hours.has(d.getHours()) || !mons.has(d.getMonth() + 1)) continue;
    const domOk = doms.has(d.getDate()), dowOk = dows.has(d.getDay());
    if (domRest && dowRest ? (domOk || dowOk) : (domOk && dowOk)) runs.push(new Date(d));
  }
  return runs;
}

export default {
  id: 'cron',
  name: 'Cron 解析器',
  desc: '解析 crontab 表达式：中文描述 + 未来 8 次执行时间',
  icon: icons.cron,
  category: '文本 / 时间',
  keywords: 'cron crontab schedule 定时任务 quartz',
  render(main) {
    const input = h('input', { type: 'text', class: 'mono', value: '0 9 * * 1-5',
      placeholder: '分 时 日 月 周，如 */15 9-18 * * 1-5', style: 'width:100%;font-size:15px' });
    const res = h('div');
    const presets = h('div', { class: 'btn-row' });
    [['每分钟', '* * * * *'], ['每小时整点', '0 * * * *'], ['每天 9 点', '0 9 * * *'],
     ['工作日 9 点', '0 9 * * 1-5'], ['每 15 分钟', '*/15 * * * *'], ['每月 1 号零点', '0 0 1 * *'],
     ['每周一三五 8 点半', '30 8 * * 1,3,5']].forEach(([label, v]) =>
      presets.append(h('span', { class: 'chip', onclick: () => { input.value = v; run(); } }, label)));

    const run = () => {
      res.innerHTML = '';
      const expr = input.value.trim();
      if (!expr) return;
      const parts = expr.split(/\s+/);
      try {
        if (parts.length !== 5) throw '需要 5 段：分 时 日 月 周（不支持秒级表达式）';
        parts.forEach((p, i) => parseField(p, ...FIELD_META[i].slice(1)));
        const desc = h('div', { class: 'card' }, h('div', { class: 'card-h' }, '表达式解读'));
        const labels = ['分钟', '小时', '日', '月', '星期'];
        parts.forEach((p, i) => desc.append(
          h('div', { class: 'kv' }, h('span', { class: 'k mono' }, `${p}（${labels[i]}）`),
            h('span', { class: 'v' }, describeField(p, labels[i], FIELD_META[i][3])))));
        const runs = nextRuns(expr);
        const runCard = h('div', { class: 'card' }, h('div', { class: 'card-h' }, '未来执行时间'));
        if (!runs.length) runCard.append(h('div', { class: 'muted' }, '未来一年内无执行时间'));
        runs.forEach(d => runCard.append(h('div', { class: 'kv' },
          h('span', { class: 'k mono' }, d.toLocaleString('zh-CN', { hour12: false, weekday: 'short' })),
          h('span', { class: 'v' }, ''))));
        res.append(desc, runCard);
      } catch (e) {
        res.append(h('div', { class: 'card err' }, '解析错误：' + e));
      }
    };
    input.addEventListener('input', run);

    main.append(
      h('div', { class: 'card' }, h('div', { class: 'card-h' }, 'Cron 表达式'), input,
        h('div', { style: 'margin-top:10px' }, presets)),
      res);
    run();
  },
};
