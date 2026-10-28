import { h, icons, copyText } from '../lib.js';

// ---- MD5（纯 JS 实现，SubtleCrypto 不支持 MD5）----
function md5(input) {
  const bytes = new TextEncoder().encode(input);
  const len = bytes.length;
  const bitLen = len * 8;
  const padLen = (((len + 8) >> 6) + 1) * 64;
  const buf = new Uint8Array(padLen);
  buf.set(bytes); buf[len] = 0x80;
  const dv = new DataView(buf.buffer);
  dv.setUint32(padLen - 8, bitLen >>> 0, true);
  dv.setUint32(padLen - 4, Math.floor(bitLen / 4294967296), true);
  let [a0, b0, c0, d0] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
  const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
  const K = Array.from({length:64},(_,i)=>Math.floor(Math.abs(Math.sin(i+1))*2**32));
  const F = [
    (b,c,d)=> (b&c)|(~b&d),
    (b,c,d)=> (b&d)|(c&~d),
    (b,c,d)=> b^c^d,
    (b,c,d)=> c^(b|~d)];
  const M = new Uint32Array(16);
  const rot = (x,n)=> (x<<n)|(x>>>(32-n));
  for (let off=0; off<padLen; off+=64) {
    for (let i=0;i<16;i++) M[i]=dv.getUint32(off+i*4,true);
    let [a,b,c,d]=[a0,b0,c0,d0];
    for (let i=0;i<64;i++) {
      const g = i<16? i : i<32? (5*i+1)%16 : i<48? (3*i+5)%16 : (7*i)%16;
      const f = F[i>>4](b,c,d);
      [a,b,c,d] = [d, (b + rot((a + f + K[i] + M[g])>>>0, S[i]))>>>0, b, c];
    }
    a0=(a0+a)>>>0; b0=(b0+b)>>>0; c0=(c0+c)>>>0; d0=(d0+d)>>>0;
  }
  const out = new Uint8Array(16); const odv = new DataView(out.buffer);
  [a0,b0,c0,d0].forEach((v,i)=>odv.setUint32(i*4,v,true));
  return [...out].map(x=>x.toString(16).padStart(2,'0')).join('');
}

// ---- CRC32 ----
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
const crc32 = (s) => {
  let c = 0xffffffff;
  for (const b of new TextEncoder().encode(s)) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return ((c ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
};

const hex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');

export default {
  id: 'hash',
  name: '哈希 / HMAC',
  desc: 'MD5、SHA-1/256/384/512、CRC32 摘要与 HMAC 签名（本地计算）',
  icon: icons.hash,
  category: '编码 / 转换',
  keywords: 'hash md5 sha sha256 crc32 hmac digest checksum',
  render(main) {
    const input = h('textarea', { rows: 7, placeholder: '输入要计算摘要的文本…' });
    const keyIn = h('input', { type: 'text', class: 'mono', placeholder: 'HMAC 密钥（可选，填写后计算 HMAC-SHA256）', style: 'width:100%' });
    const resBox = h('div');

    const run = async () => {
      resBox.innerHTML = '';
      const s = input.value; if (!s) return;
      const enc = new TextEncoder().encode(s);
      const kv = (k, v) => h('div', { class: 'kv' }, h('span', { class: 'k' }, k),
        h('span', { class: 'v', onclick: () => copyText(v) }, v));
      const card = h('div', { class: 'card' }, h('div', { class: 'card-h' }, '摘要值（点击复制）'));
      card.append(kv('MD5', md5(s)), kv('CRC32', crc32(s)));
      for (const algo of ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']) {
        card.append(kv(algo, hex(await crypto.subtle.digest(algo, enc))));
      }
      const key = keyIn.value;
      if (key) {
        const ck = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        card.append(kv('HMAC-SHA256', hex(await crypto.subtle.sign('HMAC', ck, enc))));
      }
      resBox.append(card);
    };
    let deb;
    const lazy = () => { clearTimeout(deb); deb = setTimeout(run, 200); };
    input.addEventListener('input', lazy);
    keyIn.addEventListener('input', lazy);

    main.append(
      h('div', { class: 'card' }, h('div', { class: 'card-h' }, '输入'), input,
        h('div', { style: 'margin-top:12px' }, keyIn)),
      resBox);
  },
};
