import { h, icons, copyText } from '../lib.js';

export default {
  id: 'cssgen',
  name: 'CSS 生成器',
  desc: '可视化生成渐变、阴影、玻璃拟态、圆角 —— 实时预览 + CSS 代码',
  icon: icons.brush,
  category: '创意 / CSS',
  keywords: 'css gradient shadow glass border-radius generator 渐变',
  render(main) {
    const seg = h('div', { class: 'seg' });
    const panel = h('div');
    const preview = h('div', { style: 'height:180px;border-radius:12px;border:1px solid var(--border);display:grid;place-items:center;transition:all .2s;overflow:hidden' });
    const code = h('div', { class: 'out', style: 'min-height:70px;margin-top:12px' });
    let cur = 'gradient';

    const ctrl = (label, input) => h('div', { class: 'field', style: 'min-width:140px;flex:1' }, h('label', {}, label), input);
    const slider = (min, max, val, fn) => {
      const s = h('input', { type: 'range', min, max, value: val });
      s.addEventListener('input', () => fn(+s.value));
      return s;
    };
    const colorIn = (val, fn) => {
      const c = h('input', { type: 'color', value: val });
      c.addEventListener('input', () => fn(c.value));
      return c;
    };

    const panels = {
      gradient() {
        const st = { c1: '#22d3ee', c2: '#a78bfa', angle: 135, type: 'linear' };
        const upd = () => {
          const css = st.type === 'linear'
            ? `linear-gradient(${st.angle}deg, ${st.c1}, ${st.c2})`
            : `radial-gradient(circle, ${st.c1}, ${st.c2})`;
          preview.style.background = css;
          preview.textContent = '';
          code.textContent = `background: ${css};`;
        };
        panel.append(
          h('div', { class: 'inline-fields' },
            ctrl('颜色 1', colorIn(st.c1, v => { st.c1 = v; upd(); })),
            ctrl('颜色 2', colorIn(st.c2, v => { st.c2 = v; upd(); })),
            ctrl('角度 ' + st.angle + '°', slider(0, 360, st.angle, v => { st.angle = v; upd(); })),
            ctrl('类型', (() => { const s = h('select', {}, h('option', { value: 'linear' }, '线性'), h('option', { value: 'radial' }, '径向')); s.addEventListener('change', () => { st.type = s.value; upd(); }); return s; })())));
        upd();
      },
      shadow() {
        const st = { x: 0, y: 12, blur: 32, spread: -6, color: '#22d3ee', opacity: 35 };
        const hexA = (hex, a) => hex + Math.round(a / 100 * 255).toString(16).padStart(2, '0');
        const upd = () => {
          const css = `${st.x}px ${st.y}px ${st.blur}px ${st.spread}px ${hexA(st.color, st.opacity)}`;
          preview.style.background = 'var(--bg-2)';
          preview.innerHTML = '';
          const box = h('div', { style: `width:150px;height:90px;background:#1a2233;border-radius:12px;box-shadow:${css}` });
          preview.append(box);
          code.textContent = `box-shadow: ${css};`;
        };
        panel.append(h('div', { class: 'inline-fields' },
          ctrl('X 偏移', slider(-60, 60, st.x, v => { st.x = v; upd(); })),
          ctrl('Y 偏移', slider(-60, 60, st.y, v => { st.y = v; upd(); })),
          ctrl('模糊', slider(0, 100, st.blur, v => { st.blur = v; upd(); })),
          ctrl('扩散', slider(-40, 40, st.spread, v => { st.spread = v; upd(); })),
          ctrl('颜色', colorIn(st.color, v => { st.color = v; upd(); })),
          ctrl('透明度', slider(0, 100, st.opacity, v => { st.opacity = v; upd(); }))));
        upd();
      },
      glass() {
        const st = { blur: 12, alpha: 8, border: 12, radius: 16 };
        const upd = () => {
          preview.style.background = 'linear-gradient(135deg,#0e7490,#7c3aed,#db2777)';
          preview.innerHTML = '';
          const css = `background: rgba(255, 255, 255, ${st.alpha / 100});\nbackdrop-filter: blur(${st.blur}px);\n-webkit-backdrop-filter: blur(${st.blur}px);\nborder: 1px solid rgba(255, 255, 255, ${st.border / 100});\nborder-radius: ${st.radius}px;`;
          preview.append(h('div', { style: `width:65%;height:60%;${css.replace(/\n/g, '')}display:grid;place-items:center;color:rgba(255,255,255,.85);font-weight:600` }, 'Glass'));
          code.textContent = css;
        };
        panel.append(h('div', { class: 'inline-fields' },
          ctrl('背景模糊', slider(0, 40, st.blur, v => { st.blur = v; upd(); })),
          ctrl('不透明度 %', slider(0, 60, st.alpha, v => { st.alpha = v; upd(); })),
          ctrl('边框强度 %', slider(0, 60, st.border, v => { st.border = v; upd(); })),
          ctrl('圆角', slider(0, 40, st.radius, v => { st.radius = v; upd(); }))));
        upd();
      },
      radius() {
        const st = { tl: 20, tr: 20, br: 20, bl: 20 };
        const upd = () => {
          const css = `${st.tl}px ${st.tr}px ${st.br}px ${st.bl}px`;
          preview.style.background = 'var(--bg-2)';
          preview.innerHTML = '';
          preview.append(h('div', { style: `width:150px;height:90px;background:linear-gradient(135deg,#22d3ee,#a78bfa);border-radius:${css}` }));
          code.textContent = `border-radius: ${css};`;
        };
        panel.append(h('div', { class: 'inline-fields' },
          ctrl('左上', slider(0, 100, st.tl, v => { st.tl = v; upd(); })),
          ctrl('右上', slider(0, 100, st.tr, v => { st.tr = v; upd(); })),
          ctrl('右下', slider(0, 100, st.br, v => { st.br = v; upd(); })),
          ctrl('左下', slider(0, 100, st.bl, v => { st.bl = v; upd(); }))));
        upd();
      },
    };

    [['渐变', 'gradient'], ['阴影', 'shadow'], ['玻璃拟态', 'glass'], ['圆角', 'radius']].forEach(([label, k], i) => {
      seg.append(h('button', {
        class: i === 0 ? 'on' : '',
        onclick: (e) => {
          cur = k;
          seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === e.target));
          panel.innerHTML = ''; preview.removeAttribute('style');
          preview.style.cssText = 'height:180px;border-radius:12px;border:1px solid var(--border);display:grid;place-items:center;overflow:hidden';
          panels[k]();
        },
      }, label));
    });

    main.append(
      h('div', { class: 'card' }, h('div', { class: 'card-h' }, '效果'), seg, h('div', { style: 'margin-top:14px' }, panel)),
      h('div', { class: 'card' },
        h('div', { class: 'card-h' }, '预览 ', h('button', { class: 'btn sm ghost', onclick: () => copyText(code.textContent) }, '复制 CSS')),
        preview, code));
    panels.gradient();
  },
};
