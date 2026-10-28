import { h, icons, copyText } from '../lib.js';

const SURNAMES = '王李张刘陈杨黄赵吴周徐孙马朱胡郭何高林罗郑梁谢宋唐许韩冯邓曹彭'.split('');
const GIVEN = '伟芳娜敏静丽强磊军洋勇艳杰娟涛明超霞平刚桂英华玉梅海燕宇浩子轩雨桐一诺欣怡'.split('');
const WORDS = 'the quick brown fox jumps over lazy dog lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'.split(' ');
const CN_CHARS = '的了一是我人在有他这中大来上国个到说们为子和你地出道也时年得就那要下以生会自着去之过家学对可她里后小么心多天而能好都然没日于起还发成事只作当想看文无开手十用主行方又如前所本见经头面公同三已老从动两长知民样现分将外但身些与高意进法此月正儿世点新其内应少全间光由己果何因信理使二第定美接位员品很名情通听回切北先给目争期算或领真便';
const DOMAINS = ['gmail.com', 'outlook.com', 'qq.com', '163.com', 'example.dev'];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rndInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

const GENS = {
  '随机姓名（中文）': (n) => Array.from({ length: n }, () => pick(SURNAMES) + pick(GIVEN) + (Math.random() > 0.5 ? pick(GIVEN) : '')),
  '随机邮箱': (n) => Array.from({ length: n }, () => `${pick(WORDS)}${rndInt(1, 999)}@${pick(DOMAINS)}`),
  '随机手机号': (n) => Array.from({ length: n }, () => '1' + pick('345789') + String(rndInt(0, 999999999)).padStart(9, '0')),
  '随机 IPv4': (n) => Array.from({ length: n }, () => Array.from({ length: 4 }, () => rndInt(1, 254)).join('.')),
  'Lorem Ipsum': (n) => Array.from({ length: Math.min(n, 20) }, () =>
    Array.from({ length: rndInt(8, 20) }, () => pick(WORDS)).join(' ') + '.'),
  '随机中文段落': (n) => Array.from({ length: Math.min(n, 20) }, () =>
    Array.from({ length: rndInt(10, 40) }, () => pick(CN_CHARS.split(''))).join('') + '。'),
  '随机日期': (n) => Array.from({ length: n }, () => {
    const d = new Date(rndInt(2000, 2030), rndInt(0, 11), rndInt(1, 28));
    return d.toISOString().slice(0, 10);
  }),
  '随机金额': (n) => Array.from({ length: n }, () => '¥' + (Math.random() * 10000).toFixed(2)),
};

export default {
  id: 'datagen',
  name: '测试数据生成',
  desc: '批量生成姓名、邮箱、手机号、IP、随机段落等 Mock 数据（JSON/CSV/纯文本导出）',
  icon: icons.data,
  category: '生成器',
  keywords: 'mock data faker generate test data lorem',
  render(main) {
    const seg = h('div', { class: 'btn-row' });
    const count = h('input', { type: 'number', value: 10, min: 1, max: 500, style: 'width:80px' });
    const out = h('div', { class: 'out', style: 'min-height:260px' });
    let cur = Object.keys(GENS)[0], rows = [];

    const gen = () => {
      rows = GENS[cur](+count.value || 10);
      out.textContent = rows.join('\n');
    };
    const asJson = () => copyText(JSON.stringify(rows, null, 2));
    const asCsv = () => copyText('value\n' + rows.map(r => `"${r.replace(/"/g, '""')}"`).join('\n'));

    Object.keys(GENS).forEach((k, i) =>
      seg.append(h('span', { class: 'chip' + (i === 0 ? ' on' : ''), onclick: (e) => {
        cur = k; seg.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === e.target)); gen();
      } }, k)));

    main.append(
      h('div', { class: 'card' },
        h('div', { class: 'card-h' }, '数据类型'),
        seg,
        h('div', { class: 'inline-fields', style: 'margin-top:14px' },
          h('div', { class: 'field', style: 'margin:0' }, h('label', {}, '数量'), count),
          h('button', { class: 'btn primary', onclick: gen }, '生成'),
          h('button', { class: 'btn', onclick: () => copyText(out.textContent) }, '复制文本'),
          h('button', { class: 'btn', onclick: asJson }, '复制 JSON'),
          h('button', { class: 'btn', onclick: asCsv }, '复制 CSV'))),
      h('div', { class: 'card' }, h('div', { class: 'card-h' }, '生成结果'), out));
    gen();
  },
};
