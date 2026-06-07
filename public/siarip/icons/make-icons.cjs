/* Pure-Node PNG icon generator for SIARIP KPU (no native deps).
 * Renders the same emblem as icon.svg (blue rounded square, white filing
 * cabinet with 3 drawers, amber AI lens) into 192x192 and 512x512 PNGs.
 * Run: node make-icons.cjs */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function hexToRgb(h) {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}

function makeIcon(S) {
  const buf = new Uint8Array(S * S * 4); // RGBA
  const px = (x, y, [r, g, b], a = 255) => {
    if (x < 0 || y < 0 || x >= S || y >= S) return;
    const i = (y * S + x) * 4;
    const af = a / 255, ia = 1 - af;
    buf[i] = Math.round(r * af + buf[i] * ia);
    buf[i + 1] = Math.round(g * af + buf[i + 1] * ia);
    buf[i + 2] = Math.round(b * af + buf[i + 2] * ia);
    buf[i + 3] = Math.max(buf[i + 3], a);
  };
  const k = S / 512; // scale factor from 512 design space
  const sc = (v) => Math.round(v * k);

  // gradient background with rounded corners
  const radius = sc(104);
  const inCorner = (x, y) => {
    const corners = [[radius, radius], [S - radius, radius], [radius, S - radius], [S - radius, S - radius]];
    const nearLeft = x < radius, nearRight = x >= S - radius, nearTop = y < radius, nearBot = y >= S - radius;
    if ((nearLeft || nearRight) && (nearTop || nearBot)) {
      const cx = nearLeft ? radius : S - radius;
      const cy = nearTop ? radius : S - radius;
      return (x - cx) ** 2 + (y - cy) ** 2 <= radius * radius;
    }
    return true;
  };
  const top = hexToRgb('#1d4ed8'), bot = hexToRgb('#0f3a9e');
  for (let y = 0; y < S; y++) {
    const t = y / (S - 1);
    const col = [0, 1, 2].map((c) => Math.round(top[c] * (1 - t) + bot[c] * t));
    for (let x = 0; x < S; x++) if (inCorner(x, y)) px(x, y, col);
  }

  // rounded-rect helper
  const rrect = (x0, y0, w, h, rad, color, alpha = 255) => {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        let ok = true;
        const cxs = [[x0 + rad, y0 + rad], [x0 + w - rad, y0 + rad], [x0 + rad, y0 + h - rad], [x0 + w - rad, y0 + h - rad]];
        const nl = x < x0 + rad, nr = x >= x0 + w - rad, nt = y < y0 + rad, nb = y >= y0 + h - rad;
        if ((nl || nr) && (nt || nb)) {
          const cx = nl ? x0 + rad : x0 + w - rad;
          const cy = nt ? y0 + rad : y0 + h - rad;
          ok = (x - cx) ** 2 + (y - cy) ** 2 <= rad * rad;
        }
        if (ok) px(x, y, color, alpha);
      }
    }
  };
  const disc = (cx, cy, r, color, alpha = 255) => {
    for (let y = cy - r; y <= cy + r; y++)
      for (let x = cx - r; x <= cx + r; x++)
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) px(x, y, color, alpha);
  };

  const white = hexToRgb('#eef3fd'), blue = hexToRgb('#1d4ed8'), pureWhite = hexToRgb('#ffffff');
  const amber = hexToRgb('#fbbf24'), deep = hexToRgb('#0f3a9e');

  // cabinet body
  rrect(sc(120), sc(116), sc(220), sc(280), sc(20), white);
  // drawers
  const drawerY = [142, 220, 298];
  for (const dy of drawerY) {
    rrect(sc(142), sc(dy), sc(176), sc(60), sc(10), blue);
    rrect(sc(206), sc(dy + 24), sc(48), sc(12), sc(6), pureWhite); // handle
  }
  // AI lens
  disc(sc(356), sc(356), sc(74), amber);
  disc(sc(356), sc(356), sc(48), deep);
  // lens handle (diagonal bar approximated by small disc trail)
  for (let t = 0; t <= 1; t += 0.04) {
    const x = sc(404 + 44 * t), y = sc(404 + 44 * t);
    disc(x, y, sc(13), amber);
  }

  return encodePNG(S, S, buf);
}

function encodePNG(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const tb = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([tb, data])) >>> 0, 0);
    return Buffer.concat([len, tb, data, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0; // 8-bit RGBA
  // filtered raw scanlines (filter 0)
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.subarray ? 0 : 0;
    for (let x = 0; x < w * 4; x++) raw[y * (w * 4 + 1) + 1 + x] = rgba[y * w * 4 + x];
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

for (const size of [192, 512]) {
  const png = makeIcon(size);
  fs.writeFileSync(path.join(__dirname, `icon-${size}.png`), png);
  console.log(`wrote icon-${size}.png (${png.length} bytes)`);
}
