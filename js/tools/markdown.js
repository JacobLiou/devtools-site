import { h, icons, copyText } from '../lib.js';

// 轻量 Markdown → HTML（覆盖常用语法，输出已做 HTML 转义）
function mdToHtml(src) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (s) => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<i>$1</i>')
    .replace(/~~([^~]+)~~/g, '<s>$1</s>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<span class="muted">[图片: $1]</span>');

  const lines = src.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim();
      let code = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i++;
      out.push(`<pre><code class="lang-${esc(lang)}">${esc(code.join('\n'))}</code></pre>`);
      continue;
    }
    if (/^\s*$/.test(line)) { i++; continue; }
    if (/^#{1,6}\s/.test(line)) {
      const n = line.match(/^#+/)[0].length;
      out.push(`<h${Math.min(n, 3)}>${inline(line.replace(/^#+\s*/, ''))}</h${Math.min(n, 3)}>`); i++; continue;
    }
    if (/^>\s?/.test(line)) {
      let q = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote>${q.map(inline).join('<br>')}</blockquote>`); continue;
    }
    if (/^\s*[-*+]\s/.test(line)) {
      let items = [];
      while (i < lines.length && /^\s*[-*+]\s/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*+]\s/, ''));
      out.push(`<ul>${items.map(x => `<li>${inline(x)}</li>`).join('')}</ul>`); continue;
    }
    if (/^\s*\d+\.\s/.test(line)) {
      let items = [];
      while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\.\s/, ''));
      out.push(`<ol>${items.map(x => `<li>${inline(x)}</li>`).join('')}</ol>`); continue;
    }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
    if (/^\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const head = line.split('|').slice(1, -1).map(c => c.trim());
      i += 2;
      let rows = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) rows.push(lines[i++].split('|').slice(1, -1).map(c => c.trim()));
      out.push(`<table><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</table>`);
      continue;
    }
    out.push(`<p>${inline(line)}</p>`); i++;
  }
  return out.join('\n');
}

const SAMPLE = `# Markdown 预览

**加粗** *斜体* ~~删除线~~ \`行内代码\`

> 引用：Stay hungry, stay foolish.

- 列表项一
- 列表项二

\`\`\`js
const hello = () => console.log('Hi DevForge');
\`\`\`

| 名称 | 说明 |
| --- | --- |
| 实时 | 边输边渲染 |

[Devin](https://devin.ai)
`;

export default {
  id: 'markdown',
  name: 'Markdown 预览',
  desc: '实时渲染 Markdown：标题、代码块、表格、列表、引用、链接',
  icon: icons.markdown,
  category: '格式化 / 校验',
  keywords: 'markdown md preview render readme',
  render(main) {
    const input = h('textarea', { rows: 18 });
    input.value = SAMPLE;
    const preview = h('div', { class: 'out md-preview', style: 'min-height:420px' });
    const run = () => { preview.innerHTML = mdToHtml(input.value) || '<span class="muted">预览…</span>'; };
    input.addEventListener('input', run);
    main.append(
      h('div', { class: 'two-col' },
        h('div', { class: 'card' },
          h('div', { class: 'card-h' }, 'Markdown 源文 ', h('button', { class: 'btn sm ghost', onclick: () => copyText(input.value) }, '复制源文')),
          input),
        h('div', { class: 'card' },
          h('div', { class: 'card-h' }, '预览 ', h('button', { class: 'btn sm ghost', onclick: () => copyText(mdToHtml(input.value)) }, '复制 HTML')),
          preview)));
    run();
  },
};
