import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPNG(width, height, isMaskable = false) {
  // CRC32 table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // Draw icon directly in RGBA buffer
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const cx = width / 2;
  const cy = height / 2;
  const outerR = width * 0.46;
  const safeR = width * (isMaskable ? 0.38 : 0.42);

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Base background color: deep petrol navy #0b1723
      let r = 11;
      let g = 23;
      let b = 35;
      let a = 255;

      if (!isMaskable) {
        // Rounded corner squircle for non-maskable / apple-touch
        const rad = width * 0.22;
        const qx = Math.max(0, Math.abs(dx) - (width / 2 - rad));
        const qy = Math.max(0, Math.abs(dy) - (height / 2 - rad));
        const cDist = Math.sqrt(qx * qx + qy * qy);
        if (cDist > rad) {
          a = 0;
        }
      }

      if (a > 0) {
        // Inner circle ring
        if (Math.abs(dist - safeR * 0.85) < width * 0.015) {
          // Teal ring accent #2dd4bf
          r = 45;
          g = 212;
          b = 191;
        } else if (dist < safeR * 0.85) {
          // Inside central circle: slightly lighter #13273b
          r = 19;
          g = 39;
          b = 59;
        }

        // Draw pharmacy cross in center
        const crossW = width * 0.12;
        const crossH = width * 0.42;

        const inVertBar = Math.abs(dx) <= crossW / 2 && Math.abs(dy) <= crossH / 2;
        const inHorizBar = Math.abs(dy) <= crossW / 2 && Math.abs(dx) <= crossH / 2;

        if (inVertBar || inHorizBar) {
          // Cross teal gradient #2dd4bf to #0d9488
          const t = (dy + crossH / 2) / crossH;
          r = Math.round(45 * (1 - t) + 13 * t);
          g = Math.round(212 * (1 - t) + 148 * t);
          b = Math.round(191 * (1 - t) + 136 * t);
        }

        // Center dot
        if (dist <= width * 0.05) {
          r = 15;
          g = 35;
          b = 52;
        } else if (dist <= width * 0.07 && dist >= width * 0.05) {
          r = 56;
          g = 189;
          b = 248; // Cyan ring
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  // Header chunk
  const headerData = Buffer.alloc(13);
  headerData.writeUInt32BE(width, 0);
  headerData.writeUInt32BE(height, 4);
  headerData[8] = 8; // 8-bit depth
  headerData[9] = 6; // Color type RGBA
  headerData[10] = 0; // Compression deflate
  headerData[11] = 0; // Filter
  headerData[12] = 0; // Interlace

  const ihdr = makeChunk('IHDR', headerData);
  const idat = makeChunk('IDAT', zlib.deflateSync(rawData));
  const iend = makeChunk('IEND', Buffer.alloc(0));

  const pngSig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([pngSig, ihdr, idat, iend]);
}

const publicDir = path.resolve('public');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(64, 64, false));

console.log('Successfully generated all PWA icons.');
