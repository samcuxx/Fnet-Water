import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// --------------------------------------------------------------------------
// 1. Source Logo Paths
// --------------------------------------------------------------------------
const SOURCE_TRANSPARENT = 'C:\\Users\\samue\\Downloads\\Glossy Water Delivery Logo.png';
const SOURCE_WHITE = 'C:\\Users\\samue\\Downloads\\Water Delivery Droplet Logo.png';

const localTransparent = path.resolve('public/logo/logo-transparent.png');
const inputPath = fs.existsSync(SOURCE_TRANSPARENT) ? SOURCE_TRANSPARENT : localTransparent;

// --------------------------------------------------------------------------
// 2. SVG Definitions
// --------------------------------------------------------------------------
export function getLogoIconSvg(b64Emblem) {
  return `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <image href="data:image/png;base64,${b64Emblem}" x="0" y="0" width="64" height="64" />
</svg>`;
}

export function getFullLogoSvg({ isDark = false, b64Emblem } = {}) {
  const primaryText = isDark ? "#FFFFFF" : "#0F172A";
  const secondaryText = isDark ? "#38BDF8" : "#0284C7";
  const taglineText = isDark ? "#94A3B8" : "#64748B";

  return `<svg width="250" height="48" viewBox="0 0 250 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Brand Emblem Mark -->
  <image href="data:image/png;base64,${b64Emblem}" x="1" y="1" width="46" height="46" />
  
  <!-- Typography -->
  <text x="54" y="26" font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="17" letter-spacing="-0.03em" fill="${primaryText}">F NET</text>
  <text x="110" y="26" font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="17" letter-spacing="-0.01em" fill="${secondaryText}">WATER HUB</text>
  <text x="54.5" y="38" font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="8" letter-spacing="0.14em" fill="${taglineText}">SMART HYDRATION &#x2022; LOGISTICS</text>
</svg>`;
}

export function getAuthLogoSvg(b64Emblem) {
  return `<svg width="290" height="56" viewBox="0 0 290 56" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Brand Emblem Mark -->
  <image href="data:image/png;base64,${b64Emblem}" x="1" y="1" width="54" height="54" />
  
  <!-- Typography -->
  <text x="62" y="30" font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="20" letter-spacing="-0.03em" fill="#FFFFFF">F NET</text>
  <text x="127" y="30" font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="20" letter-spacing="-0.01em" fill="#38BDF8">WATER HUB</text>
  <text x="62.5" y="45" font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="9" letter-spacing="0.16em" fill="#94A3B8">GHANA'S SMART WATER PLATFORM</text>
</svg>`;
}

function createIcoFromPngBuffers(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = count * dirEntrySize;
  let offset = headerSize + dirSize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(item.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(p => p.buffer)]);
}

// --------------------------------------------------------------------------
// 3. Build Pipeline
// --------------------------------------------------------------------------
async function buildAll() {
  console.log("Loading source image for brand assets:", inputPath);
  
  // Clean threshold trim (removes stray alpha < 8)
  const trimmed = await sharp(inputPath)
    .trim({ threshold: 8 })
    .toBuffer();
  
  // 1024x1024 transparent emblem with 96% content fill (minimal margins, max size)
  const emblem1024Buffer = await sharp(trimmed)
    .resize(980, 980, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 22,
      bottom: 22,
      left: 22,
      right: 22,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  const emblem256Buffer = await sharp(emblem1024Buffer)
    .resize(256, 256, { kernel: 'lanczos3' })
    .png({ quality: 90 })
    .toBuffer();
  const b64Emblem = emblem256Buffer.toString('base64');

  const iconSvg = getLogoIconSvg(b64Emblem);
  const logoLightSvg = getFullLogoSvg({ isDark: false, b64Emblem });
  const logoDarkSvg = getFullLogoSvg({ isDark: true, b64Emblem });
  const authLogoSvg = getAuthLogoSvg(b64Emblem);

  const destDirs = [
    path.resolve('public/logo'),
    path.resolve('public/images/logo'),
  ];

  for (const dir of destDirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'logo-icon.svg'), iconSvg, 'utf-8');
    fs.writeFileSync(path.join(dir, 'logo.svg'), logoLightSvg, 'utf-8');
    fs.writeFileSync(path.join(dir, 'logo-dark.svg'), logoDarkSvg, 'utf-8');
    fs.writeFileSync(path.join(dir, 'auth-logo.svg'), authLogoSvg, 'utf-8');
    fs.writeFileSync(path.join(dir, 'pera-logo.svg'), logoLightSvg, 'utf-8');
    fs.writeFileSync(path.join(dir, 'pera-logo-2.svg'), logoDarkSvg, 'utf-8');
  }

  const png16 = await sharp(emblem1024Buffer).resize(16, 16, { kernel: 'lanczos3' }).png().toBuffer();
  const png32 = await sharp(emblem1024Buffer).resize(32, 32, { kernel: 'lanczos3' }).png().toBuffer();
  const png48 = await sharp(emblem1024Buffer).resize(48, 48, { kernel: 'lanczos3' }).png().toBuffer();
  const png128 = await sharp(emblem1024Buffer).resize(128, 128, { kernel: 'lanczos3' }).png().toBuffer();
  const png180 = await sharp(emblem1024Buffer)
    .flatten({ background: '#FFFFFF' })
    .resize(180, 180, { kernel: 'lanczos3' })
    .png()
    .toBuffer();
  const png192 = await sharp(emblem1024Buffer).resize(192, 192, { kernel: 'lanczos3' }).png().toBuffer();
  const png512 = await sharp(emblem1024Buffer).resize(512, 512, { kernel: 'lanczos3' }).png().toBuffer();

  const pngWhite512 = await sharp(emblem1024Buffer)
    .flatten({ background: '#FFFFFF' })
    .resize(512, 512, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const pngDark512 = await sharp(emblem1024Buffer)
    .flatten({ background: '#0B1528' })
    .resize(512, 512, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const icoBuffer = createIcoFromPngBuffers([
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 }
  ]);

  for (const dir of destDirs) {
    fs.writeFileSync(path.join(dir, 'favicon-16x16.png'), png16);
    fs.writeFileSync(path.join(dir, 'favicon-32x32.png'), png32);
    fs.writeFileSync(path.join(dir, 'apple-touch-icon.png'), png180);
    fs.writeFileSync(path.join(dir, 'android-chrome-192x192.png'), png192);
    fs.writeFileSync(path.join(dir, 'android-chrome-512x512.png'), png512);
    fs.writeFileSync(path.join(dir, 'logo-transparent.png'), png512);
    fs.writeFileSync(path.join(dir, 'logo-white.png'), pngWhite512);
    fs.writeFileSync(path.join(dir, 'logo-dark.png'), pngDark512);
    fs.writeFileSync(path.join(dir, 'logo-icon.png'), png128);
    fs.writeFileSync(path.join(dir, 'favicon.ico'), icoBuffer);
  }

  fs.writeFileSync(path.resolve('public/favicon.ico'), icoBuffer);
  if (fs.existsSync(path.resolve('public/images'))) {
    fs.writeFileSync(path.resolve('public/images/favicon.ico'), icoBuffer);
  }

  const manifestContent = JSON.stringify({
    name: "FNet Water Hub",
    short_name: "F-Net Water",
    icons: [
      {
        src: "/logo/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/logo/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    theme_color: "#0284C7",
    background_color: "#0B1528",
    display: "standalone"
  }, null, 2);

  for (const dir of destDirs) {
    fs.writeFileSync(path.join(dir, 'site.webmanifest'), manifestContent, 'utf-8');
  }

  console.log("All logo assets created and replaced successfully!");
}

buildAll().catch(err => {
  console.error("Error in build-all-logos:", err);
  process.exit(1);
});
