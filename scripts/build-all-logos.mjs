import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// --------------------------------------------------------------------------
// 1. SVG Definitions
// --------------------------------------------------------------------------

// 32x32 Standalone Mark SVG
export function getLogoIconSvg() {
  return `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Ocean Deep Gradient Base -->
    <linearGradient id="fnIconBg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="45%" stop-color="#1D4ED8" />
      <stop offset="100%" stop-color="#0B1528" />
    </linearGradient>

    <!-- Hydro Spine Gradient (White to sky blue) -->
    <linearGradient id="fnIconSpine" x1="7" y1="7" x2="13" y2="25" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="70%" stop-color="#F0F9FF" />
      <stop offset="100%" stop-color="#BAE6FD" />
    </linearGradient>

    <!-- Top Wave Arm Gradient (White to electric cyan) -->
    <linearGradient id="fnIconTop" x1="10" y1="7" x2="25" y2="14" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="50%" stop-color="#E0F2FE" />
      <stop offset="100%" stop-color="#38BDF8" />
    </linearGradient>

    <!-- Mid Wave Jet Gradient (Aqua cyan) -->
    <linearGradient id="fnIconMid" x1="10" y1="15" x2="20" y2="20" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#67E8F9" />
      <stop offset="100%" stop-color="#00D2FF" />
    </linearGradient>

    <!-- Water Pearl Gradient (Purity droplet) -->
    <linearGradient id="fnIconPearl" x1="17" y1="21" x2="22" y2="26" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E0F2FE" />
      <stop offset="50%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>

    <filter id="fnIconShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="1.2" stdDeviation="1.2" flood-color="#000000" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Container Badge -->
  <rect width="32" height="32" rx="8" fill="url(#fnIconBg)"/>
  <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="#38BDF8" stroke-opacity="0.3" stroke-width="1"/>

  <!-- The Monogram 'F' Water Motion -->
  <g filter="url(#fnIconShadow)">
    <!-- 1. Left Vertical Hydro Spine -->
    <rect x="7.5" y="6.5" width="4.2" height="18.5" rx="2.1" fill="url(#fnIconSpine)"/>

    <!-- 2. Top Fluid Wave Arm -->
    <path
      d="M10 6.5
         H 22.5
         C 24.1569 6.5 25.5 7.84315 25.5 9.5
         C 25.5 11.1569 24.1569 12.5 22.5 12.5
         H 10
         V 6.5 Z"
      fill="url(#fnIconTop)"
    />

    <!-- 3. Mid Fluid Wave Jet -->
    <path
      d="M10 14.5
         H 19
         C 20.3807 14.5 21.5 15.6193 21.5 17
         C 21.5 18.3807 20.3807 19.5 19 19.5
         H 10
         V 14.5 Z"
      fill="url(#fnIconMid)"
    />

    <!-- 4. Luminous Water Hub Pearl -->
    <circle cx="18.5" cy="23.2" r="2" fill="url(#fnIconPearl)"/>
    <circle cx="17.9" cy="22.6" r="0.65" fill="#FFFFFF" opacity="0.85"/>
  </g>
</svg>`;
}

// 216x40 Full Horizontal Logo (Light or Dark)
export function getFullLogoSvg({ isDark = false } = {}) {
  const primaryText = isDark ? "#FFFFFF" : "#0F172A";
  const secondaryText = isDark ? "#38BDF8" : "#0284C7";
  const taglineText = isDark ? "#94A3B8" : "#64748B";
  const suffix = isDark ? "dark" : "light";

  return `<svg width="216" height="40" viewBox="0 0 216 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fnH_${suffix}" x1="0" y1="4" x2="32" y2="36" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="45%" stop-color="#1D4ED8" />
      <stop offset="100%" stop-color="#0B1528" />
    </linearGradient>

    <linearGradient id="fnHSpine_${suffix}" x1="7" y1="7" x2="13" y2="25" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="70%" stop-color="#F0F9FF" />
      <stop offset="100%" stop-color="#BAE6FD" />
    </linearGradient>

    <linearGradient id="fnHTop_${suffix}" x1="10" y1="7" x2="25" y2="14" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="50%" stop-color="#E0F2FE" />
      <stop offset="100%" stop-color="#38BDF8" />
    </linearGradient>

    <linearGradient id="fnHMid_${suffix}" x1="10" y1="15" x2="20" y2="20" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#67E8F9" />
      <stop offset="100%" stop-color="#00D2FF" />
    </linearGradient>

    <linearGradient id="fnHPearl_${suffix}" x1="17" y1="21" x2="22" y2="26" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E0F2FE" />
      <stop offset="50%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>

    <filter id="fnHShadow_${suffix}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="1.2" stdDeviation="1.2" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Left Mark (32x32 at x=4, y=4) -->
  <g transform="translate(4, 4)">
    <rect width="32" height="32" rx="8" fill="url(#fnH_${suffix})"/>
    <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="#38BDF8" stroke-opacity="0.3" stroke-width="1"/>

    <g filter="url(#fnHShadow_${suffix})">
      <!-- Spine -->
      <rect x="7.5" y="6.5" width="4.2" height="18.5" rx="2.1" fill="url(#fnHSpine_${suffix})"/>

      <!-- Top Wave -->
      <path
        d="M10 6.5
           H 22.5
           C 24.1569 6.5 25.5 7.84315 25.5 9.5
           C 25.5 11.1569 24.1569 12.5 22.5 12.5
           H 10
           V 6.5 Z"
        fill="url(#fnHTop_${suffix})"
      />

      <!-- Mid Jet -->
      <path
        d="M10 14.5
           H 19
           C 20.3807 14.5 21.5 15.6193 21.5 17
           C 21.5 18.3807 20.3807 19.5 19 19.5
           H 10
           V 14.5 Z"
        fill="url(#fnHMid_${suffix})"
      />

      <!-- Pearl -->
      <circle cx="18.5" cy="23.2" r="2" fill="url(#fnHPearl_${suffix})"/>
      <circle cx="17.9" cy="22.6" r="0.65" fill="#FFFFFF" opacity="0.85"/>
    </g>
  </g>

  <!-- Typography -->
  <text x="46" y="22" font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="15.5" letter-spacing="-0.03em" fill="${primaryText}">F NET</text>
  <text x="96" y="22" font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="15.5" letter-spacing="-0.01em" fill="${secondaryText}">WATER HUB</text>
  <text x="46.5" y="32" font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="7" letter-spacing="0.14em" fill="${taglineText}">SMART HYDRATION &#x2022; LOGISTICS</text>
</svg>`;
}

// 260x48 Auth / Hero Lockup SVG (High-Impact Display)
export function getAuthLogoSvg() {
  return `<svg width="260" height="48" viewBox="0 0 260 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fnAuthBg" x1="0" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="45%" stop-color="#1D4ED8" />
      <stop offset="100%" stop-color="#0B1528" />
    </linearGradient>

    <linearGradient id="fnAuthSpine" x1="9" y1="9" x2="16" y2="31" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="70%" stop-color="#F0F9FF" />
      <stop offset="100%" stop-color="#BAE6FD" />
    </linearGradient>

    <linearGradient id="fnAuthTop" x1="12" y1="9" x2="31" y2="18" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="50%" stop-color="#E0F2FE" />
      <stop offset="100%" stop-color="#38BDF8" />
    </linearGradient>

    <linearGradient id="fnAuthMid" x1="12" y1="19" x2="25" y2="25" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#67E8F9" />
      <stop offset="100%" stop-color="#00D2FF" />
    </linearGradient>

    <linearGradient id="fnAuthPearl" x1="21" y1="26" x2="27" y2="33" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E0F2FE" />
      <stop offset="50%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>

    <filter id="fnAuthShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- 40x40 Emblem at (4, 4) -->
  <g transform="translate(4, 4)">
    <rect width="40" height="40" rx="10" fill="url(#fnAuthBg)"/>
    <rect x="0.5" y="0.5" width="39" height="39" rx="9.5" stroke="#38BDF8" stroke-opacity="0.35" stroke-width="1"/>

    <g filter="url(#fnAuthShadow)">
      <rect x="9.5" y="8.5" width="5.2" height="23" rx="2.6" fill="url(#fnAuthSpine)"/>

      <path
        d="M12.5 8.5
           H 28
           C 30.2091 8.5 32 10.2909 32 12.5
           C 32 14.7091 30.2091 16.5 28 16.5
           H 12.5
           V 8.5 Z"
        fill="url(#fnAuthTop)"
      />

      <path
        d="M12.5 18.5
           H 24
           C 25.6569 18.5 27 19.8431 27 21.5
           C 27 23.1569 25.6569 24.5 24 24.5
           H 12.5
           V 18.5 Z"
        fill="url(#fnAuthMid)"
      />

      <circle cx="23" cy="29" r="2.5" fill="url(#fnAuthPearl)"/>
      <circle cx="22.2" cy="28.2" r="0.8" fill="#FFFFFF" opacity="0.85"/>
    </g>
  </g>

  <!-- Typography -->
  <text x="56" y="26" font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="18" letter-spacing="-0.03em" fill="#FFFFFF">F NET</text>
  <text x="114" y="26" font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="18" letter-spacing="-0.01em" fill="#38BDF8">WATER HUB</text>
  <text x="56.5" y="38" font-family="system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="8" letter-spacing="0.16em" fill="#94A3B8">GHANA'S SMART WATER PLATFORM</text>
</svg>`;
}

// Multi-size ICO generation function
function createIcoFromPngBuffers(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = count * dirEntrySize;
  let offset = headerSize + dirSize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type (1)
  header.writeUInt16LE(count, 4); // count

  const dirEntries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(item.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    dirEntries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(p => p.buffer)]);
}

// --------------------------------------------------------------------------
// 2. Build Pipeline
// --------------------------------------------------------------------------
async function buildAll() {
  console.log("Generating SVG assets...");

  const iconSvg = getLogoIconSvg();
  const logoLightSvg = getFullLogoSvg({ isDark: false });
  const logoDarkSvg = getFullLogoSvg({ isDark: true });
  const authLogoSvg = getAuthLogoSvg();

  // Destination folders
  const destDirs = [
    path.resolve('public/logo'),
    path.resolve('public/images/logo'),
  ];

  for (const dir of destDirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  // 1. Write SVG files
  for (const dir of destDirs) {
    fs.writeFileSync(path.join(dir, 'logo-icon.svg'), iconSvg, 'utf-8');
    fs.writeFileSync(path.join(dir, 'logo.svg'), logoLightSvg, 'utf-8');
    fs.writeFileSync(path.join(dir, 'logo-dark.svg'), logoDarkSvg, 'utf-8');
    fs.writeFileSync(path.join(dir, 'auth-logo.svg'), authLogoSvg, 'utf-8');
    // Replace old template assets
    fs.writeFileSync(path.join(dir, 'pera-logo.svg'), logoLightSvg, 'utf-8');
    fs.writeFileSync(path.join(dir, 'pera-logo-2.svg'), logoDarkSvg, 'utf-8');
  }

  console.log("SVG files written successfully.");

  // 2. Generate High-Res PNGs from SVG
  console.log("Rendering raster PNGs from SVG...");

  // High-res icon SVG (512x512) for razor-sharp downscaling
  const highResIconSvg = iconSvg
    .replace('width="32" height="32"', 'width="512" height="512"');

  const highResBuffer = Buffer.from(highResIconSvg);

  const png16 = await sharp(highResBuffer).resize(16, 16, { kernel: 'lanczos3' }).png().toBuffer();
  const png32 = await sharp(highResBuffer).resize(32, 32, { kernel: 'lanczos3' }).png().toBuffer();
  const png48 = await sharp(highResBuffer).resize(48, 48, { kernel: 'lanczos3' }).png().toBuffer();
  const png180 = await sharp(highResBuffer).resize(180, 180, { kernel: 'lanczos3' }).png().toBuffer();
  const png192 = await sharp(highResBuffer).resize(192, 192, { kernel: 'lanczos3' }).png().toBuffer();
  const png512 = await sharp(highResBuffer).resize(512, 512, { kernel: 'lanczos3' }).png().toBuffer();

  // Generate ICO containing 16x16, 32x32, 48x48
  const icoBuffer = createIcoFromPngBuffers([
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 }
  ]);

  // Write PNG and ICO assets to directories
  for (const dir of destDirs) {
    fs.writeFileSync(path.join(dir, 'favicon-16x16.png'), png16);
    fs.writeFileSync(path.join(dir, 'favicon-32x32.png'), png32);
    fs.writeFileSync(path.join(dir, 'apple-touch-icon.png'), png180);
    fs.writeFileSync(path.join(dir, 'android-chrome-192x192.png'), png192);
    fs.writeFileSync(path.join(dir, 'android-chrome-512x512.png'), png512);
    fs.writeFileSync(path.join(dir, 'favicon.ico'), icoBuffer);
  }

  // Also write root favicons
  fs.writeFileSync(path.resolve('public/favicon.ico'), icoBuffer);
  if (fs.existsSync(path.resolve('public/images'))) {
    fs.writeFileSync(path.resolve('public/images/favicon.ico'), icoBuffer);
  }

  // 3. Write site.webmanifest
  const manifestContent = JSON.stringify({
    name: "F Net Water Hub",
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
    background_color: "#0F172A",
    display: "standalone"
  }, null, 2);

  for (const dir of destDirs) {
    fs.writeFileSync(path.join(dir, 'site.webmanifest'), manifestContent, 'utf-8');
  }

  console.log("All logo assets created and replaced successfully!");
}

buildAll();
