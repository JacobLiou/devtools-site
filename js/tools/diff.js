import { h, icons } from '../lib.js';

// 行级 LCS diff
function lineDiff(a, b) {
  const A = a.split('\n'), B = b.split('\n');
  const n = A.length, m = B.length;
  // LCS DP（限制规模防卡顿）
  if (n * m > 4e6) return null;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ops = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { ops.push(['ctx', A[i], i + 1, j + 1]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push(['del', A[i], i + 1, null]); i++; }
    else { ops.push(['add', B[j], null, j + 1]); j++; }
  }
  while (i < n) ops.push(['del', A[i++], i, null]);
  while (j < m) ops.push(['add', B[j++], null, j]);
  return ops;
}

export default {
  id: 'diff',
  name: '文本 Diff',
  desc: '行级差异对比，增删高亮，支持统计增删行数',
  icon: icons.diff,
  category: '格式化 / 校验',
  keywords: 'diff compare 对比 merge patch',
  render(main) {
    const aIn = h('textarea', { rows: 10, placeholder: '原始文本 A' });
    const bIn = h('textarea', { rows: 10, placeholder: '对比文本 B' });
    const res = h('div');
    const stat = h('div', { class: 'muted' });

    const run = () => {
      res.innerHTML = ''; stat.textContent = '';
      if (!aIn.value && !bIn.value) return;
      const ops = lineDiff(aIn.value, bIn.value);
      if (!ops) { stat.innerHTML = '<span class="err">文本过大（>400 万单元），请分段对比</span>'; return; }
      let add = 0, del = 0;
      const box = h('div', { class: 'out', style: 'padding:0;overflow:auto' });
      ops.forEach(([t, line, la, lb]) => {
        if (t === 'add') add++;
        if (t === 'del') del++;
        box.append(h('div', { class: `diff-line diff-${t}` },
          h('span', { class: 'dl-n' }, la ?? ''), h('span', { class: 'dl-n' }, lb ?? ''),
          h('span', { style: 'white-space:pre-wrap;word-break:break-all;flex:1' },
            (t === 'add' ? '+ ' : t === 'del' ? '- ' : '  ') + (line || ' '))));
      });
      stat.innerHTML = `<span class="ok">+${add}</span> / <span class="err">-${del}</span> 行差异`;
      res.append(box);
    };
    const lazy = () => { clearTimeout(run._t); run._t = setTimeout(run, 250); };
    aIn.addEventListener('input', lazy);
    bIn.addEventListener('input', lazy);

    main.append(
      h('div', { class: 'two-col' },
        h('div', { class: 'card' }, h('div', { class: 'card-h' }, 'A — 原始'), aIn),
        h('div', { class: 'card' }, h('div', { class: 'card-h' }, 'B — 对比'), bIn)),
      h('div', { class: 'card' },
        h('div', { class: 'card-h' }, '差异 ', stat,
          h('span', { style: 'flex:1' }),
          h('button', { class: 'btn sm', onclick: () => { const t = aIn.value; aIn.value = bIn.value; bIn.value = t; run(); } }, '⇄ 交换 A/B')),
        res));
  },
};
