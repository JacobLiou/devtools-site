import { h, icons } from '../lib.js';

const PRESETS = [
  ['邮箱', '^[\\w.+-]+@[\\w-]+(\\.[\\w-]+)+$'],
  ['手机号(中国)', '^1[3-9]\\d{9}$'],
  ['URL', 'https?://[\\w.-]+(?::\\d+)?(/\\S*)?'],
  ['IPv4', '^((25[0-5]|2[0-4]\\d|1?\\d?\\d)\\.){3}(25[0-5]|2[0-4]\\d|1?\\d?\\d)$'],
  ['日期 YYYY-MM-DD', '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$'],
  ['Hex 颜色', '#(?:[0-9a-fA-F]{3}){1,2}\\b'],
  ['中文字符', '[\\u4e00-\\u9fa5]+'],
  ['驼峰命名', '\\b[a-z]+(?:[A-Z][a-z0-9]*)+\\b'],
];
const FLAGS = ['g', 'i', 'm', 's', 'u', 'y'];

export default {
  id: 'regex',
  name: '正则测试器',
  desc: '实时匹配高亮、捕获组展示、常用正则模板库',
  icon: icons.regex,
  category: '格式化 / 校验',
  keywords: 'regex regexp regular expression match test',
  render(main) {
    const patInput = h('input', { type: 'text', class: 'mono', style: 'flex:1;min-width:200px', value: '\\b\\w+@\\w+\\.\\w+\\b', spellcheck: 'false' });
    const flagBox = h('div', { class: 'btn-row' });
    const flagSet = new Set(['g']);
    FLAGS.forEach(f => {
      const c = h('span', { class: 'chip' + (flagSet.has(f) ? ' on' : ''), onclick: () => { flagSet.has(f) ? flagSet.delete(f) : flagSet.add(f); c.classList.toggle('on'); run(); } }, f);
      flagBox.append(c);
    });
    const testInput = h('textarea', { rows: 8, placeholder: '在此粘贴测试文本…' });
    testInput.value = '联系 ops@devforge.io 或 admin@example.com，备用邮箱 backup@test.dev。';
    const hl = h('div', { class: 'out', style: 'min-height:160px' });
    const matchInfo = h('div', { class: 'muted', style: 'margin:8px 0' });
    const groupsBox = h('div');

    const run = () => {
      hl.innerHTML = ''; groupsBox.innerHTML = ''; matchInfo.textContent = '';
      let re;
      try { re = new RegExp(patInput.value, [...flagSet].join('')); }
      catch (e) { matchInfo.innerHTML = `<span class="err">✕ ${e.message}</span>`; return; }
      const text = testInput.value;
      if (!text) return;
      const matches = [];
      if (re.global) {
        let m, guard = 0;
        while ((m = re.exec(text)) && guard++ < 5000) { matches.push(m); if (m[0] === '') re.lastIndex++; }
      } else {
        const m = re.exec(text); if (m) matches.push(m);
      }
      // 高亮渲染
      let pos = 0;
      matches.forEach((m, i) => {
        hl.append(document.createTextNode(text.slice(pos, m.index)));
        hl.append(h('span', { class: 'rx-mark g' + (i % 4 === 0 ? '' : i % 4), title: `#${i + 1}` }, m[0]));
        pos = m.index + m[0].length;
        if (m[0] === '') pos = m.index;
      });
      hl.append(document.createTextNode(text.slice(pos)));
      matchInfo.innerHTML = `<span class="${matches.length ? 'ok' : 'err'}">${matches.length ? '✓ ' + matches.length + ' 个匹配' : '无匹配'}</span>`;
      // 捕获组
      const withGroups = matches.filter(m => m.length > 1);
      if (withGroups.length) {
        const tbl = h('table', { class: 'data' },
          h('tr', {}, h('th', {}, '#'), withGroups[0].map((_, i) => i ? h('th', {}, '组' + i) : null)));
        withGroups.slice(0, 20).forEach((m, i) => {
          tbl.append(h('tr', {}, h('td', {}, String(i + 1)), m.slice(1).map(g => h('td', { class: 'mono' }, g ?? ''))));
        });
        groupsBox.append(h('div', { class: 'card-h', style: 'margin-top:14px' }, '捕获组'), tbl);
      }
    };
    patInput.addEventListener('input', run);
    testInput.addEventListener('input', run);

    const presetRow = h('div', { class: 'btn-row' });
    PRESETS.forEach(([name, p]) => presetRow.append(h('span', { class: 'chip', onclick: () => { patInput.value = p; run(); } }, name)));

    main.append(
      h('div', { class: 'card' },
        h('div', { class: 'card-h' }, '正则表达式'),
        h('div', { style: 'display:flex;gap:10px;align-items:center;flex-wrap:wrap' },
          h('span', { class: 'mono muted' }, '/'), patInput, h('span', { class: 'mono muted' }, '/'), flagBox),
        h('div', { style: 'margin-top:12px' }, presetRow)),
      h('div', { class: 'two-col' },
        h('div', { class: 'card' }, h('div', { class: 'card-h' }, '测试文本'), testInput),
        h('div', { class: 'card' }, h('div', { class: 'card-h' }, '匹配结果'), matchInfo, hl, groupsBox)),
    );
    run();
  },
};
