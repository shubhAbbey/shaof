/**
 * ATEEVRA MVP-2 — Asset Generation & Strapi CMS Branding Migration
 * 
 * Extracts high-res transparent PNGs, generates cropped logo variants,
 * extracts the standalone 'A' emblem, and updates Strapi CMS database.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { Client } = require('pg');

// ---------------------------------------------------------------------------
// 1. Pure Node PNG Encoder
// ---------------------------------------------------------------------------
function encodePng(width, height, rgbaBuffer) {
  const stride = 1 + width * 4;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0; // Filter: None
    rgbaBuffer.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // 8-bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // Deflate
  ihdr[11] = 0; // Standard filter
  ihdr[12] = 0; // No interlace

  const crcTable = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff);
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// 2. Decode Uploaded PNG
// ---------------------------------------------------------------------------
function decodeUploadedPng(sourcePath) {
  const buf = fs.readFileSync(sourcePath);
  let pos = 8;
  const idatChunks = [];
  let width = 0, height = 0;

  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.slice(pos + 4, pos + 8).toString('ascii');
    if (type === 'IHDR') {
      width = buf.readUInt32BE(pos + 8);
      height = buf.readUInt32BE(pos + 12);
    } else if (type === 'IDAT') {
      idatChunks.push(buf.slice(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }

  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  const uncompressed = Buffer.alloc(width * height * 4);
  const stride = 1 + width * 4;

  for (let y = 0; y < height; y++) {
    const filter = decompressed[y * stride];
    for (let x = 0; x < width * 4; x++) {
      const raw = decompressed[y * stride + 1 + x];
      const left = x >= 4 ? uncompressed[y * width * 4 + x - 4] : 0;
      const up = y > 0 ? uncompressed[(y - 1) * width * 4 + x] : 0;
      const upLeft = y > 0 && x >= 4 ? uncompressed[(y - 1) * width * 4 + x - 4] : 0;
      let val = 0;
      if (filter === 0) val = raw;
      else if (filter === 1) val = (raw + left) & 0xff;
      else if (filter === 2) val = (raw + up) & 0xff;
      else if (filter === 3) val = (raw + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left), pb = Math.abs(p - up), pc = Math.abs(p - upLeft);
        const pr = (pa <= pb && pa <= pc) ? left : (pb <= pc ? up : upLeft);
        val = (raw + pr) & 0xff;
      }
      uncompressed[y * width * 4 + x] = val;
    }
  }

  return { width, height, data: uncompressed };
}

// ---------------------------------------------------------------------------
// 3. Main Asset Generation and Database Migration
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== ATEEVRA ASSET GENERATION & CMS BRANDING MIGRATION ===\n');

  const srcPath = 'C:/Users/Shubham/.gemini/antigravity-cli/brain/440e959d-3242-4a30-9198-49c733b4a010/.user_uploaded/uploaded_media_0_1793333745136.png';
  if (!fs.existsSync(srcPath)) {
    throw new Error('Uploaded media file not found at: ' + srcPath);
  }

  const { width, height, data } = decodeUploadedPng(srcPath);
  console.log(`✓ Decoded source image (${width}x${height} RGBA)`);

  // Target directories
  const cmsUploadsDir = path.resolve('apps/cms/public/uploads');
  const sfImagesDir = path.resolve('apps/storefront/public/images');
  fs.mkdirSync(cmsUploadsDir, { recursive: true });
  fs.mkdirSync(sfImagesDir, { recursive: true });

  // --- Asset 1: Original Full Logo ---
  fs.copyFileSync(srcPath, path.join(cmsUploadsDir, 'ateevra-logo.png'));
  fs.copyFileSync(srcPath, path.join(sfImagesDir, 'ateevra-logo.png'));
  console.log('✓ Saved ateevra-logo.png (2000x666 original full logo)');

  // --- Asset 2: Tightly Cropped Primary Logo ---
  // Bounding box: x in [128, 1871], y in [172, 423]
  // Add 16px padding
  const pad = 16;
  const cropMinX = Math.max(0, 128 - pad);
  const cropMaxX = Math.min(width - 1, 1871 + pad);
  const cropMinY = Math.max(0, 172 - pad);
  const cropMaxY = Math.min(height - 1, 423 + pad);
  const cropW = cropMaxX - cropMinX + 1;
  const cropH = cropMaxY - cropMinY + 1;

  const croppedRgba = Buffer.alloc(cropW * cropH * 4);
  const whiteCroppedRgba = Buffer.alloc(cropW * cropH * 4);

  for (let cy = 0; cy < cropH; cy++) {
    const sy = cropMinY + cy;
    for (let cx = 0; cx < cropW; cx++) {
      const sx = cropMinX + cx;
      const srcIdx = (sy * width + sx) * 4;
      const dstIdx = (cy * cropW + cx) * 4;

      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];
      const a = data[srcIdx + 3];

      croppedRgba[dstIdx] = r;
      croppedRgba[dstIdx + 1] = g;
      croppedRgba[dstIdx + 2] = b;
      croppedRgba[dstIdx + 3] = a;

      // White variant: convert colored pixels to white while preserving alpha anti-aliasing
      whiteCroppedRgba[dstIdx] = 255;
      whiteCroppedRgba[dstIdx + 1] = 255;
      whiteCroppedRgba[dstIdx + 2] = 255;
      whiteCroppedRgba[dstIdx + 3] = a;
    }
  }

  const croppedPng = encodePng(cropW, cropH, croppedRgba);
  const whiteCroppedPng = encodePng(cropW, cropH, whiteCroppedRgba);

  fs.writeFileSync(path.join(cmsUploadsDir, 'ateevra-logo-cropped.png'), croppedPng);
  fs.writeFileSync(path.join(sfImagesDir, 'ateevra-logo-cropped.png'), croppedPng);
  fs.writeFileSync(path.join(sfImagesDir, 'ateevra-logo-white.png'), whiteCroppedPng);
  console.log(`✓ Saved ateevra-logo-cropped.png & white variant (${cropW}x${cropH} tightly cropped)`);

  // --- Asset 3: Isolated 'A' Brand Emblem ---
  // Bounding box of first 'A': x in [128, 523], y in [173, 418]
  // Filter out the left tip of 'T' (x > 331 + (y - 173) * (192 / 245) + 15)
  const aMinX = 129, aMaxX = 523, aMinY = 173, aMaxY = 418;
  const aWidth = aMaxX - aMinX + 1; // 395
  const aHeight = aMaxY - aMinY + 1; // 246

  // Square canvas for clean loader centering: 440 x 440
  const squareSize = 440;
  const aSquareRgba = Buffer.alloc(squareSize * squareSize * 4);
  const aSquareWhiteRgba = Buffer.alloc(squareSize * squareSize * 4);

  const offsetX = Math.floor((squareSize - aWidth) / 2);
  const offsetY = Math.floor((squareSize - aHeight) / 2);

  for (let ay = 0; ay < aHeight; ay++) {
    const sy = aMinY + ay;
    for (let ax = 0; ax < aWidth; ax++) {
      const sx = aMinX + ax;
      const rightEdge = 331 + (sy - 173) * (192 / 245);
      if (sx > rightEdge + 15) {
        continue; // Skip the tip of 'T'
      }

      const srcIdx = (sy * width + sx) * 4;
      const dstIdx = ((offsetY + ay) * squareSize + (offsetX + ax)) * 4;

      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];
      const a = data[srcIdx + 3];

      aSquareRgba[dstIdx] = r;
      aSquareRgba[dstIdx + 1] = g;
      aSquareRgba[dstIdx + 2] = b;
      aSquareRgba[dstIdx + 3] = a;

      aSquareWhiteRgba[dstIdx] = 255;
      aSquareWhiteRgba[dstIdx + 1] = 255;
      aSquareWhiteRgba[dstIdx + 2] = 255;
      aSquareWhiteRgba[dstIdx + 3] = a;
    }
  }

  const aSquarePng = encodePng(squareSize, squareSize, aSquareRgba);
  const aSquareWhitePng = encodePng(squareSize, squareSize, aSquareWhiteRgba);

  fs.writeFileSync(path.join(cmsUploadsDir, 'ateevra-a-mark.png'), aSquarePng);
  fs.writeFileSync(path.join(sfImagesDir, 'ateevra-a-mark.png'), aSquarePng);
  fs.writeFileSync(path.join(sfImagesDir, 'ateevra-a-mark-white.png'), aSquareWhitePng);
  console.log(`✓ Saved ateevra-a-mark.png (${squareSize}x${squareSize} brand emblem for circular loader)`);

  // ---------------------------------------------------------------------------
  // 4. Update Strapi PostgreSQL Database
  // ---------------------------------------------------------------------------
  console.log('\n▶ Updating Strapi PostgreSQL Database (strapi_db)...');
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres_secure_password',
    database: 'strapi_db',
  });
  await client.connect();

  // 4.1 Update global_settings
  await client.query(`
    UPDATE global_settings
    SET 
      site_name = 'Ateevra',
      site_tagline = 'Made For Your Vibe',
      footer_about_text = 'Ateevra is India’s premier modern fashion destination offering curated ethnic wear, contemporary western silhouettes, plus size edits, and artisanal textiles with seamless checkout and pan-India express delivery.',
      updated_at = NOW()
    WHERE id = 1
  `);
  console.log('✓ Updated global_settings site_name to "Ateevra" and site_tagline to "Made For Your Vibe"');

  // 4.2 Insert / update file record in files table
  const statLogo = fs.statSync(path.join(cmsUploadsDir, 'ateevra-logo-cropped.png'));
  const existingFile = await client.query("SELECT id FROM files WHERE name = 'ateevra-logo'");
  let fileId;
  if (existingFile.rows.length > 0) {
    fileId = existingFile.rows[0].id;
    await client.query(`
      UPDATE files
      SET 
        name = 'ateevra-logo',
        alternative_text = 'Ateevra Logo',
        caption = 'Ateevra - Made For Your Vibe',
        width = $1,
        height = $2,
        hash = 'ateevra_logo_cropped',
        ext = '.png',
        mime = 'image/png',
        size = $3,
        url = '/uploads/ateevra-logo-cropped.png',
        updated_at = NOW()
      WHERE id = $4
    `, [cropW, cropH, (statLogo.size / 1024).toFixed(2), fileId]);
    console.log(`✓ Updated existing files record (id: ${fileId})`);
  } else {
    const docId = 'doc_' + Math.random().toString(36).substring(2, 12);
    const ins = await client.query(`
      INSERT INTO files (
        document_id, name, alternative_text, caption, width, height, hash, ext, mime, size, url, provider, folder_path, created_at, updated_at, published_at
      ) VALUES (
        $1, 'ateevra-logo', 'Ateevra Logo', 'Ateevra - Made For Your Vibe', $2, $3, 'ateevra_logo_cropped', '.png', 'image/png', $4, '/uploads/ateevra-logo-cropped.png', 'local', '/', NOW(), NOW(), NOW()
      ) RETURNING id
    `, [docId, cropW, cropH, (statLogo.size / 1024).toFixed(2)]);
    fileId = ins.rows[0].id;
    console.log(`✓ Inserted new files record (id: ${fileId})`);
  }

  // 4.3 Link file in files_related_mph to global_settings.logo
  await client.query("DELETE FROM files_related_mph WHERE related_type = 'api::global-setting.global-setting' AND field = 'logo'");
  await client.query(`
    INSERT INTO files_related_mph (file_id, related_id, related_type, field, "order")
    VALUES ($1, 1, 'api::global-setting.global-setting', 'logo', 1)
  `, [fileId]);
  console.log(`✓ Linked file ${fileId} to global_settings.logo in files_related_mph`);

  // 4.4 Update SEO records in components_shared_seos
  const seoUpdates = await client.query(`
    UPDATE components_shared_seos
    SET 
      meta_title = REPLACE(meta_title, 'EcomFashion', 'Ateevra'),
      meta_description = REPLACE(meta_description, 'EcomFashion', 'Ateevra'),
      canonical_url = REPLACE(canonical_url, 'https://ecomfashion.com', 'https://ateevra.in')
    WHERE meta_title LIKE '%EcomFashion%' OR canonical_url LIKE '%ecomfashion.com%'
  `);
  console.log(`✓ Updated ${seoUpdates.rowCount} SEO rows to reference "Ateevra" and "https://ateevra.in"`);

  // 4.5 Update pages and hero components
  const pageUpdates = await client.query(`
    UPDATE pages
    SET 
      title = REPLACE(title, 'EcomFashion', 'Ateevra'),
      description = REPLACE(description, 'EcomFashion', 'Ateevra')
    WHERE title LIKE '%EcomFashion%' OR description LIKE '%EcomFashion%'
  `);
  console.log(`✓ Updated ${pageUpdates.rowCount} CMS pages`);

  await client.end();
  console.log('\n✓ Strapi database migration complete.');
}

main().catch((err) => {
  console.error('Fatal error during asset generation / CMS update:', err);
  process.exit(1);
});
