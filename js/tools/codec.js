import { h, icons, copyText, outBlock } from '../lib.js';

const b64enc = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
const b64dec = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g, '')), c => c.charCodeAt(0)));
const ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const entEnc = (s) => s.replace(/[&<>"']/g, c => ENT[c]);
const entDec = (s) => { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; };
const hexEnc = (s) => [...new TextEncoder().encode(s)].map(b => b.toString(16).padStart(2, '0')).join('');
const hexDec = (s) => new TextDecoder().decode(Uint8Array.from(s.replace(/\s|0x/g, '').match(/../g) || [], x => parseInt(x, 16)));
const uniEnc = (s) => [...s].map(c => '\\u' + c.codePointAt(0).toString(16).padStart(4, '0')).join('');
const uniDec = (s) => s.replace(/\\u\{?([0-9a-fA-F]{4,6})\}?/g, (_, x) => String.fromCodePoint(parseInt(x, 16)));

const TABS = [
  ['Base64', b64enc, b64dec],
  ['URL', (s) => encodeURIComponent(s), (s) => decodeURIComponent(s)],
  ['HTML 实体', entEnc, entDec],
  ['Hex', hexEnc, hexDec],
  ['Unicode', uniEnc, uniDec],
];

export default {
  id: 'codec',
  name: '编解码器',
  desc: 'Base64 / URL / HTML 实体 / Hex / Unicode 双向编解码（UTF-8 安全）',
  icon: icons.lock,
  category: '编码 / 转换',
  keywords: 'base64 urlencode encode decode hex unicode entity',
  render(main) {
    const input = h('textarea', { rows: 8, placeholder: '输入要编码或解码的文本…' });
    const { out, set } = outBlock();
    const status = h('div', { class: 'muted', style: 'margin:8px 0' });
    let dir = 'enc';
    let cur = 0;

    const seg = h('div', { class: 'seg' });
    const dSeg = h('div', { class: 'seg' });
    [['编码', 'enc'], ['解码', 'dec']].forEach(([label, v]) => {
      const b = h('button', { class: v === dir ? 'on' : '', onclick: () => { dir = v; dSeg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); run(); } }, label);
      dSeg.append(b);
    });
    TABS.forEach(([label], i) => {
      const b = h('button', { class: i === 0 ? 'on' : '', onclick: () => { cur = i; seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); run(); } }, label);
      seg.append(b);
    });

    const run = () => {
      const src = input.value;
      if (!src) { set(''); status.textContent = ''; return; }
      try {
        const [, enc, dec] = TABS[cur];
        set(dir === 'enc' ? enc(src) : dec(src));
        status.innerHTML = '<span class="ok">✓</span> ' + TABS[cur][0] + (dir === 'enc' ? ' 编码' : ' 解码');
      } catch (e) {
        set('');
        status.innerHTML = `<span class="err">✕ ${e.message}</span>`;
      }
    };
    input.addEventListener('input', run);

    const swap = h('button', { class: 'btn', onclick: () => { input.value = out.textContent; run(); } }, '⇅ 输出 → 输入');

    main.append(h('div', { class: 'two-col' },
      h('div', { class: 'card' },
        h('div', { class: 'card-h' }, '输入'), input,
        h('div', { class: 'btn-row', style: 'margin-top:12px' }, seg, dSeg, swap)),
      h('div', { class: 'card' },
        h('div', { class: 'card-h' }, '输出 ', h('button', { class: 'btn sm ghost', onclick: () => copyText(out.textContent) }, '复制')),
        out, status),
    ));
  },
};
