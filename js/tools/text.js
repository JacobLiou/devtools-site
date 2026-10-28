import { h, icons, copyText } from '../lib.js';

const words = (s) => s
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
  .split(/[\s_\-.]+/).filter(Boolean).map(w => w.toLowerCase());

const CASES = {
  camelCase: (w) => w.map((x, i) => i ? x[0].toUpperCase() + x.slice(1) : x).join(''),
  PascalCase: (w) => w.map(x => x[0].toUpperCase() + x.slice(1)).join(''),
  snake_case: (w) => w.join('_'),
  'kebab-case': (w) => w.join('-'),
  SCREAMING_SNAKE: (w) => w.join('_').toUpperCase(),
  'CONSTANT-CASE': (w) => w.join('-').toUpperCase(),
  'dot.case': (w) => w.join('.'),
  'path/case': (w) => w.join('/'),
  'Title Case': (w) => w.map(x => x[0].toUpperCase() + x.slice(1)).join(' '),
  'lower case': (w) => w.join(' '),
};

export default {
  id: 'text',
  name: '文本工具',
  desc: '命名风格互转（camel/snake/kebab…）、字数统计、去重排序、反转',
  icon: icons.text,
  category: '文本 / 时间',
  keywords: 'case camel snake kebab text count sort dedup reverse',
  render(main) {
    const caseIn = h('input', { type: 'text', class: 'mono', placeholder: '如 user_profile_id', style: 'flex:1;min-width:200px' });
    const caseRes = h('div');
    const runCase = () => {
      caseRes.innerHTML = '';
      const w = words(caseIn.value);
      if (!w.length) return;
      const card = h('div', {});
      for (const [name, fn] of Object.entries(CASES)) {
        const v = fn(w);
        card.append(h('div', { class: 'kv' }, h('span', { class: 'k' }, name),
          h('span', { class: 'v', onclick: () => copyText(v) }, v)));
      }
      caseRes.append(card);
    };
    caseIn.addEventListener('input', runCase);

    // 文本统计/处理
    const ta = h('textarea', { rows: 9, placeholder: '输入文本…' });
    const stats = h('div', { class: 'btn-row' });
    const out = h('div', { class: 'out', style: 'min-height:140px' });
    const stat = () => {
      const s = ta.value;
      const cn = (s.match(/[\u4e00-\u9fa5]/g) || []).length;
      stats.innerHTML = '';
      [['字符', s.length], ['行', s ? s.split('\n').length : 0], ['英文单词', (s.match(/[a-zA-Z]+/g) || []).length],
       ['中文字', cn], ['字节(UTF-8)', new TextEncoder().encode(s).length]].forEach(([k, v]) =>
        stats.append(h('span', { class: 'chip' }, `${k}: ${v}`)));
    };
    ta.addEventListener('input', stat);
    const ops = {
      '去重行': () => [...new Set(ta.value.split('\n'))].join('\n'),
      '行排序': () => ta.value.split('\n').sort().join('\n'),
      '行反序': () => ta.value.split('\n').reverse().join('\n'),
      '全文反转': () => [...ta.value].reverse().join(''),
      '去空行': () => ta.value.split('\n').filter(l => l.trim()).join('\n'),
      '去首尾空格': () => ta.value.split('\n').map(l => l.trim()).join('\n'),
      '转大写': () => ta.value.toUpperCase(),
      '转小写': () => ta.value.toLowerCase(),
    };
    const opRow = h('div', { class: 'btn-row' });
    Object.entries(ops).forEach(([name, fn]) =>
      opRow.append(h('button', { class: 'btn sm', onclick: () => { out.textContent = fn(); } }, name)));

    main.append(
      h('div', { class: 'card' },
        h('div', { class: 'card-h' }, '命名风格转换'),
        h('div', { class: 'inline-fields' }, caseIn), caseRes),
      h('div', { class: 'card' },
        h('div', { class: 'card-h' }, '文本处理'), ta,
        h('div', { style: 'margin:10px 0' }, stats), opRow,
        h('div', { style: 'margin-top:12px' }, out)),
    );
    stat();
  },
};
