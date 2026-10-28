import { h, icons, copyBtn, copyText } from '../lib.js';

export default {
  id: 'json',
  name: 'JSON 工具',
  desc: '格式化、压缩、校验、排序、JSON 转义 / 反转义',
  icon: icons.braces,
  category: '编码 / 转换',
  keywords: 'json format pretty validate minify escape',
  render(main) {
    const input = h('textarea', { rows: 12, placeholder: '{ "paste": "json here" }' });
    const out = h('div', { class: 'out', style: 'min-height:280px' });
    const status = h('div', { class: 'muted', style: 'margin:8px 0' });
    const indent = h('select', {},
      h('option', { value: '2' }, '缩进 2'), h('option', { value: '4' }, '缩进 4'), h('option', { value: '1' }, '缩进 1'), h('option', { value: 'tab' }, 'Tab'));
    const sortKeys = h('label', { class: 'muted', style: 'display:flex;align-items:center;gap:5px;cursor:pointer' },
      h('input', { type: 'checkbox' }), '按键排序');

    const parse = () => {
      const src = input.value.trim();
      if (!src) { status.textContent = ''; return null; }
      // 容错：去掉尾逗号
      try { return JSON.parse(src); }
      catch (e1) {
        try { return JSON.parse(src.replace(/,\s*([}\]])/g, '$1')); }
        catch { status.innerHTML = `<span class="err">✕ ${e1.message}</span>`; return undefined; }
      }
    };
    const sorted = (v) => {
      if (Array.isArray(v)) return v.map(sorted);
      if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map(k => [k, sorted(v[k])]));
      return v;
    };
    const run = (mode) => {
      let v = parse();
      if (v === undefined) return;
      if (v === null) { out.textContent = ''; return; }
      if (sortKeys.querySelector('input').checked) v = sorted(v);
      if (mode === 'min') out.textContent = JSON.stringify(v);
      else if (mode === 'escape') out.textContent = JSON.stringify(JSON.stringify(v));
      else out.textContent = JSON.stringify(v, null, indent.value === 'tab' ? '\t' : +indent.value);
      const keys = JSON.stringify(v).length;
      status.innerHTML = `<span class="ok">✓ 合法 JSON</span> · ${keys} 字符`;
    };
    const unescape = () => {
      const src = input.value.trim();
      try {
        let v = src;
        // 反复解析直到得到非字符串
        for (let i = 0; i < 5 && typeof v === 'string'; i++) v = JSON.parse(v);
        out.textContent = typeof v === 'string' ? v : JSON.stringify(v, null, 2);
        status.innerHTML = '<span class="ok">✓ 已反转义</span>';
      } catch (e) { status.innerHTML = `<span class="err">✕ ${e.message}</span>`; }
    };

    input.addEventListener('input', () => run('fmt'));

    main.append(
      h('div', { class: 'two-col' },
        h('div', { class: 'card' },
          h('div', { class: 'card-h' }, '输入'),
          input,
          h('div', { class: 'btn-row', style: 'margin-top:12px' },
            h('button', { class: 'btn primary', onclick: () => run('fmt') }, '格式化'),
            h('button', { class: 'btn', onclick: () => run('min') }, '压缩'),
            h('button', { class: 'btn', onclick: () => run('escape') }, '转义'),
            h('button', { class: 'btn', onclick: unescape }, '反转义'),
            h('button', { class: 'btn ghost', onclick: () => { input.value = ''; out.textContent = ''; status.textContent = ''; } }, '清空'),
          ),
          h('div', { class: 'btn-row', style: 'margin-top:10px' }, indent, sortKeys),
        ),
        h('div', { class: 'card' },
          h('div', { class: 'card-h' }, '输出 ', copyBtn(() => out.textContent)),
          out, status),
      ),
    );
    run('fmt');
  },
};
