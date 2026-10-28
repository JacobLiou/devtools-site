import { h, toast, icons } from './lib.js';
import { TOOLS, CATEGORIES } from './tools/index.js';

const FAV_KEY = 'devforge.favs';
const favs = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'));
const saveFavs = () => localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));

const navEl = document.getElementById('nav');
const mainEl = document.getElementById('main');
const searchEl = document.getElementById('search');

document.getElementById('tool-count').textContent = TOOLS.length;

function currentTool() {
  const id = location.hash.replace(/^#\/?/, '');
  return TOOLS.find(t => t.id === id) || null;
}

function renderNav(filter = '') {
  navEl.innerHTML = '';
  const q = filter.trim().toLowerCase();
  const match = (t) => !q || t.name.toLowerCase().includes(q) || t.id.includes(q)
    || (t.keywords || '').toLowerCase().includes(q) || t.desc.toLowerCase().includes(q);

  // 收藏区
  const favTools = TOOLS.filter(t => favs.has(t.id) && match(t));
  if (favTools.length) {
    navEl.append(h('div', { class: 'nav-cat' }, '⭐ 收藏'));
    favTools.forEach(t => navEl.append(navItem(t)));
  }

  for (const cat of CATEGORIES) {
    const items = TOOLS.filter(t => t.category === cat && match(t));
    if (!items.length) continue;
    navEl.append(h('div', { class: 'nav-cat' }, cat));
    items.forEach(t => navEl.append(navItem(t)));
  }
  if (!navEl.children.length) navEl.append(h('div', { class: 'nav-cat' }, '无匹配工具'));
}

function navItem(t) {
  const active = currentTool() === t;
  const star = h('span', {
    class: 'nav-star' + (favs.has(t.id) ? ' faved' : ''),
    onclick: (e) => { e.stopPropagation(); favs.has(t.id) ? favs.delete(t.id) : favs.add(t.id); saveFavs(); renderNav(searchEl.value); },
  }, icons.star);
  return h('div', {
    class: 'nav-item' + (active ? ' active' : ''),
    onclick: () => { location.hash = '#/' + t.id; },
  }, h('span', { class: 'nav-ico', html: t.icon }), t.name, star);
}

function renderDashboard() {
  mainEl.innerHTML = '';
  const hero = h('div', { class: 'hero' },
    h('h1', {}, 'DevForge 创意工具箱'),
    h('p', {}, `${TOOLS.length} 个程序员必备工具，全部在浏览器本地运行 —— 无需联网、数据不上传。点击卡片或按 Ctrl+K 搜索开始使用。`),
  );
  const grid = h('div', { class: 'tool-grid' });
  for (const t of TOOLS) {
    const card = h('div', { class: 'tool-card', onclick: () => location.hash = '#/' + t.id },
      h('div', { class: 'tc-ico', html: t.icon }),
      h('h3', {}, t.name),
      h('p', {}, t.desc),
      favs.has(t.id) ? h('span', { class: 'tc-star' }, icons.star) : null,
    );
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    });
    grid.append(card);
  }
  mainEl.append(hero, grid);
}

function render() {
  const t = currentTool();
  renderNav(searchEl.value);
  if (!t) { renderDashboard(); return; }
  mainEl.innerHTML = '';
  mainEl.append(h('div', { class: 'tool-head' },
    h('div', { class: 'tool-title' }, h('span', { class: 't-ico', html: t.icon }), t.name),
    h('div', { class: 'tool-desc' }, t.desc),
  ));
  try {
    t.render(mainEl);
  } catch (e) {
    console.error(e);
    mainEl.append(h('div', { class: 'card err' }, '工具加载出错：' + e.message));
  }
  mainEl.scrollTop = 0;
}

window.addEventListener('hashchange', render);
searchEl.addEventListener('input', () => renderNav(searchEl.value));
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); searchEl.focus(); }
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') { e.preventDefault(); searchEl.focus(); }
});

render();
