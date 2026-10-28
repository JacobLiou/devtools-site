import { h, icons, copyText } from '../lib.js';

const b64url = (s) => {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return new TextDecoder().decode(Uint8Array.from(atob(s), c => c.charCodeAt(0)));
};
const fmtTime = (sec) => new Date(sec * 1000).toLocaleString('zh-CN', { hour12: false });

export default {
  id: 'jwt',
  name: 'JWT 解码',
  desc: '解码 JWT Header / Payload / 签名，检查过期时间与签发信息',
  icon: icons.jwt,
  category: '编码 / 转换',
  keywords: 'jwt token decode bearer auth',
  render(main) {
    const input = h('textarea', { rows: 5, class: 'mono', placeholder: '粘贴 JWT（eyJhbGciOi…）' });
    const res = h('div');

    const kv = (k, v) => h('div', { class: 'kv' }, h('span', { class: 'k' }, k),
      h('span', { class: 'v', onclick: () => copyText(v) }, v));

    const run = () => {
      res.innerHTML = '';
      const raw = input.value.trim().replace(/^Bearer\s+/i, '');
      if (!raw) return;
      const parts = raw.split('.');
      if (parts.length < 2 || parts.length > 3) {
        res.append(h('div', { class: 'card err' }, 'JWT 应由 3 段组成（header.payload.signature）')); return;
      }
      try {
        const header = JSON.parse(b64url(parts[0]));
        const payload = JSON.parse(b64url(parts[1]));
        const headerCard = h('div', { class: 'card' },
          h('div', { class: 'card-h' }, 'Header'),
          h('div', { class: 'out' }, JSON.stringify(header, null, 2)));
        const claims = h('div', { class: 'card' }, h('div', { class: 'card-h' }, '标准声明'));
        let hasClaims = false;
        const claimMap = { iss: '签发者 iss', sub: '主题 sub', aud: '受众 aud', iat: '签发时间 iat', nbf: '生效时间 nbf', jti: 'JWT ID' };
        for (const [k, label] of Object.entries(claimMap)) {
          if (payload[k] !== undefined) {
            hasClaims = true;
            const v = ['iat', 'nbf'].includes(k) ? fmtTime(payload[k]) : String(payload[k]);
            claims.append(kv(label, v));
          }
        }
        if (payload.exp !== undefined) {
          hasClaims = true;
          const exp = payload.exp * 1000, left = exp - Date.now();
          claims.append(kv('过期时间 exp', fmtTime(payload.exp)));
          claims.append(kv('状态', left > 0
            ? `✓ 有效（剩余 ${Math.round(left / 60000)} 分钟）`
            : `✕ 已过期 ${Math.round(-left / 60000)} 分钟`));
        }
        const payloadCard = h('div', { class: 'card' },
          h('div', { class: 'card-h' }, 'Payload'),
          h('div', { class: 'out' }, JSON.stringify(payload, null, 2)));
        const sigCard = h('div', { class: 'card' },
          h('div', { class: 'card-h' }, '签名（算法: ' + (header.alg || '?') + '）'),
          h('div', { class: 'out', style: 'word-break:break-all' }, parts[2] || '(无)'),
          h('div', { class: 'muted', style: 'margin-top:8px' }, '注：签名校验需密钥，本工具仅解码不验签。'));
        res.append(h('div', { class: 'two-col' }, headerCard, hasClaims ? claims : h('div')),
          payloadCard, sigCard);
      } catch (e) {
        res.append(h('div', { class: 'card err' }, '解码失败：' + e.message));
      }
    };
    input.addEventListener('input', run);
    main.append(h('div', { class: 'card' }, h('div', { class: 'card-h' }, 'JWT Token'), input), res);
  },
};
