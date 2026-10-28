import { h, icons, copyText } from '../lib.js';

const rnd = (n) => crypto.getRandomValues(new Uint8Array(n));
const uuidv4 = () => {
  const b = rnd(16); b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const s = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
};
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const nanoId = (n = 21) => [...rnd(n)].map(b => ALPHABET[b % ALPHABET.length]).join('');
const strength = (p) => {
  let bits = p.length * Math.log2((/a-z/.test(p) ? 26 : 0) + (/A-Z/.test(p) ? 26 : 0) + (/\d/.test(p) ? 10 : 0) + (/[^a-zA-Z0-9]/.test(p) ? 32 : 0) || 1);
  return Math.round(bits);
};

export default {
  id: 'uuid',
  name: 'ID / 密码生成',
  desc: 'UUID v4、NanoID、随机密码（带强度评估）、随机字符串批量生成',
  icon: icons.key,
  category: '生成器',
  keywords: 'uuid nanoid password random generate secret token',
  render(main) {
    // ---- UUID ----
    const uuidOut = h('div', { class: 'out', style: 'min-height:110px' });
    const genUuid = (n = 5) => { uuidOut.textContent = Array.from({ length: n }, uuidv4).join('\n'); };
    genUuid();

    // ---- 密码 ----
    const len = h('input', { type: 'range', min: 8, max: 64, value: 20 });
    const lenLbl = h('span', { class: 'mono' }, '20');
    const opts = { upper: true, lower: true, digit: true, symbol: true };
    const optBox = h('div', { class: 'btn-row' });
    const pwdOut = h('div', { class: 'out', style: 'min-height:80px;font-size:15px' });
    const meter = h('div', { class: 'muted' });
    [['大写 A-Z', 'upper'], ['小写 a-z', 'lower'], ['数字 0-9', 'digit'], ['符号 !@#$', 'symbol']].forEach(([label, k]) => {
      const c = h('span', { class: 'chip on', onclick: () => { opts[k] = !opts[k]; c.classList.toggle('on'); genPwd(); } }, label);
      optBox.append(c);
    });
    const genPwd = () => {
      let pool = '';
      if (opts.lower) pool += 'abcdefghijklmnopqrstuvwxyz';
      if (opts.upper) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (opts.digit) pool += '0123456789';
      if (opts.symbol) pool += '!@#$%^&*()-_=+[]{}<>?';
      if (!pool) { pwdOut.textContent = '请至少选择一种字符集'; return; }
      const p = [...rnd(+len.value)].map(b => pool[b % pool.length]).join('');
      pwdOut.textContent = p;
      const bits = strength(p);
      const lv = bits < 50 ? ['较弱', 'var(--danger)'] : bits < 80 ? ['中等', 'var(--warn)'] : ['强', 'var(--accent-3)'];
      meter.innerHTML = `熵 ≈ ${bits} bits · 强度：<b style="color:${lv[1]}">${lv[0]}</b>`;
    };
    len.addEventListener('input', () => { lenLbl.textContent = len.value; genPwd(); });
    genPwd();

    // ---- NanoID / 随机串 ----
    const nanoOut = h('div', { class: 'out', style: 'min-height:80px' });
    const genNano = () => { nanoOut.textContent = Array.from({ length: 5 }, () => nanoId()).join('\n'); };
    genNano();

    main.append(
      h('div', { class: 'two-col' },
        h('div', { class: 'card' },
          h('div', { class: 'card-h' }, 'UUID v4'),
          uuidOut,
          h('div', { class: 'btn-row', style: 'margin-top:12px' },
            h('button', { class: 'btn primary', onclick: () => genUuid() }, '重新生成'),
            h('button', { class: 'btn', onclick: () => copyText(uuidOut.textContent) }, '复制全部'),
            h('button', { class: 'btn ghost', onclick: () => copyText(uuidv4()) }, '复制单个新 UUID'))),
        h('div', { class: 'card' },
          h('div', { class: 'card-h' }, 'NanoID (21)'),
          nanoOut,
          h('div', { class: 'btn-row', style: 'margin-top:12px' },
            h('button', { class: 'btn', onclick: genNano }, '重新生成'),
            h('button', { class: 'btn ghost', onclick: () => copyText(nanoOut.textContent) }, '复制'))),
      ),
      h('div', { class: 'card' },
        h('div', { class: 'card-h' }, '随机密码'),
        h('div', { class: 'inline-fields' },
          h('div', { class: 'field', style: 'flex:1;min-width:200px' }, h('label', {}, `长度`), h('div', { style: 'display:flex;gap:10px;align-items:center' }, len, lenLbl))),
        optBox,
        h('div', { style: 'margin-top:14px' }, pwdOut, meter),
        h('div', { class: 'btn-row', style: 'margin-top:12px' },
          h('button', { class: 'btn primary', onclick: genPwd }, '重新生成'),
          h('button', { class: 'btn ghost', onclick: () => copyText(pwdOut.textContent) }, '复制密码'))),
    );
  },
};
