import { h, icons, copyText } from '../lib.js';

export default {
  id: 'radix',
  name: '进制 / ASCII',
  desc: '二/八/十/十六进制互转、ASCII 码表、字节换算',
  icon: icons.binary,
  category: '编码 / 转换',
  keywords: 'binary hex decimal octal ascii base convert',
  render(main) {
    const inp = h('input', { type: 'text', class: 'mono', placeholder: '输入数值', style: 'flex:1;min-width:180px' });
    const baseSel = h('select', {},
      h('option', { value: '10' }, '十进制'), h('option', { value: '16' }, '十六进制'),
      h('option', { value: '2' }, '二进制'), h('option', { value: '8' }, '八进制'));
    const res = h('div');
    const kv = (k, v) => h('div', { class: 'kv' }, h('span', { class: 'k' }, k),
      h('span', { class: 'v', onclick: () => copyText(v) }, v));

    const run = () => {
      res.innerHTML = '';
      const s = inp.value.trim().replace(/^(0x|0b|0o)/i, '').replace(/\s|_/g, '');
      if (!s) return;
      const base = +baseSel.value;
      if (!/^[0-9a-fA-F]+$/.test(s) || (base !== 16 && /[a-fA-F]/.test(s))) {
        res.append(h('div', { class: 'card err' }, '输入与该进制不匹配')); return;
      }
      const n = BigInt(`0x${base === 16 ? s : BigInt(parseInt(s, base)).toString(16)}`);
      res.append(h('div', { class: 'card' },
        h('div', { class: 'card-h' }, '转换结果（点击复制）'),
        kv('十进制', n.toString(10)),
        kv('十六进制', '0x' + n.toString(16).toUpperCase()),
        kv('二进制', '0b' + n.toString(2)),
        kv('八进制', '0o' + n.toString(8)),
        n >= 0n && n <= 0x10FFFFn ? kv('Unicode 字符', String.fromCodePoint(Number(n))) : null,
        n >= 0n && n <= 127n ? kv('ASCII', `${String.fromCharCode(Number(n))} (${n})`) : null));
    };
    inp.addEventListener('input', run);
    baseSel.addEventListener('change', run);

    // ASCII 表
    const tbl = h('table', { class: 'data' });
    const rows = [];
    for (let i = 32; i < 127; i += 8) {
      rows.push(h('tr', {},
        Array.from({ length: 8 }, (_, j) => i + j).map(c =>
          h('td', { class: 'mono', style: 'text-align:center;cursor:pointer', onclick: () => copyText(String(c)) },
            `${c} ${c === 127 ? '' : String.fromCharCode(c)}`))));
    }
    tbl.append(...rows);

    main.append(
      h('div', { class: 'card' },
        h('div', { class: 'card-h' }, '进制转换'),
        h('div', { class: 'inline-fields' }, inp, h('label', { class: 'muted' }, '输入进制'), baseSel)),
      res,
      h('div', { class: 'card' },
        h('div', { class: 'card-h' }, 'ASCII 可打印字符表（点击复制码值）'), tbl));
  },
};
