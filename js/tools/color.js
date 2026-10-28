import { h, icons, copyText, toast } from '../lib.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = [...hex].map(c => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
}
const toHex = (r, g, b) => '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, Math.round(l * 100)];
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [Math.round(hh * 60), Math.round(s * 100), Math.round(l * 100)];
}
function hslToHex(hh, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + hh / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return toHex(f(0) * 255, f(8) * 255, f(4) * 255);
}
const hueShift = (hex, deg) => {
  const rgb = hexToRgb(hex); if (!rgb) return hex;
  const [hh, s, l] = rgbToHsl(...rgb);
  return hslToHex((hh + deg + 360) % 360, s, l);
};
const lightShift = (hex, dl) => {
  const rgb = hexToRgb(hex); if (!rgb) return hex;
  const [hh, s, l] = rgbToHsl(...rgb);
  return hslToHex(hh, s, clamp(l + dl, 4, 96));
};

export default {
  id: 'color',
  name: '颜色工具',
  desc: 'HEX / RGB / HSL / CMYK 互转，配色方案生成（互补/类似/三色/渐变）',
  icon: icons.palette,
  category: '创意 / CSS',
  keywords: 'color hex rgb hsl cmyk palette converter 配色',
  render(main) {
    const picker = h('input', { type: 'color', value: '#22d3ee' });
    const hexIn = h('input', { type: 'text', class: 'mono', value: '#22d3ee', style: 'width:110px' });
    const infoBox = h('div');
    const palBox = h('div');

    const swatch = (hex, label) => h('div', {
      class: 'swatch', style: `background:${hex}`, title: '点击复制',
      onclick: () => copyText(hex),
    }, h('span', {}, label || hex));

    const render = (hex) => {
      const rgb = hexToRgb(hex);
      infoBox.innerHTML = ''; palBox.innerHTML = '';
      if (!rgb) { infoBox.innerHTML = '<span class="err">无效 HEX 颜色</span>'; return; }
      const [r, g, b] = rgb;
      const [hh, s, l] = rgbToHsl(r, g, b);
      const k = (1 - Math.max(r, g, b) / 255);
      const cmyk = k >= 1 ? [0, 0, 0, 100] : [
        Math.round((1 - r / 255 - k) / (1 - k) * 100),
        Math.round((1 - g / 255 - k) / (1 - k) * 100),
        Math.round((1 - b / 255 - k) / (1 - k) * 100),
        Math.round(k * 100)];
      const kv = (kk, v) => h('div', { class: 'kv' }, h('span', { class: 'k' }, kk),
        h('span', { class: 'v', onclick: () => copyText(v) }, v));
      // 对比度
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const onDark = lum < 0.5;
      infoBox.append(
        h('div', { style: `height:90px;border-radius:10px;background:${hex};border:1px solid var(--border);margin-bottom:14px` }),
        kv('HEX', hex.toUpperCase()), kv('RGB', `rgb(${r}, ${g}, ${b})`),
        kv('HSL', `hsl(${hh}, ${s}%, ${l}%)`), kv('CMYK', `cmyk(${cmyk.join('%, ')}%)`),
        kv('CSS 变量', `--color: ${hex};`),
        kv('建议文字色', onDark ? '#FFFFFF 白字' : '#000000 黑字'));

      const row = (name, colors) => h('div', {}, h('div', { class: 'card-h' }, name),
        h('div', { class: 'pal-row' }, colors.map(c => swatch(c))));
      const tints = [-30, -15, 0, 15, 30].map(d => lightShift(hex, d));
      palBox.append(
        row('明暗梯度', tints),
        row('互补色', [hex, hueShift(hex, 180), lightShift(hex, 20), lightShift(hueShift(hex, 180), 20), lightShift(hex, -20)]),
        row('类似色', [hueShift(hex, -40), hueShift(hex, -20), hex, hueShift(hex, 20), hueShift(hex, 40)]),
        row('三色系', [hex, hueShift(hex, 120), hueShift(hex, 240), lightShift(hex, 25), lightShift(hueShift(hex, 120), -20)]),
        h('div', { class: 'card-h', style: 'margin-top:14px' }, 'CSS 渐变（点击复制）'),
        h('div', { class: 'swatch', style: `height:56px;background:linear-gradient(135deg, ${hex}, ${hueShift(hex, 60)})`,
          onclick: () => copyText(`background: linear-gradient(135deg, ${hex}, ${hueShift(hex, 60)});`) },
          h('span', {}, `linear-gradient(135deg, ${hex}, ${hueShift(hex, 60)})`)),
      );
    };
    const sync = (hex) => { hexIn.value = hex; picker.value = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : picker.value; render(hex); };
    picker.addEventListener('input', () => sync(picker.value));
    hexIn.addEventListener('input', () => { const v = hexIn.value.trim(); if (hexToRgb(v)) sync(v); });

    main.append(
      h('div', { class: 'card' },
        h('div', { class: 'card-h' }, '取色'),
        h('div', { class: 'inline-fields' }, picker, hexIn,
          h('button', { class: 'btn', onclick: () => sync('#' + [...crypto.getRandomValues(new Uint8Array(3))].map(b => b.toString(16).padStart(2, '0')).join('')) }, '🎲 随机'))),
      h('div', { class: 'two-col' },
        h('div', { class: 'card' }, h('div', { class: 'card-h' }, '颜色值（点击复制）'), infoBox),
        h('div', { class: 'card' }, h('div', { class: 'card-h' }, '配色方案'), palBox)),
    );
    render('#22d3ee');
  },
};
