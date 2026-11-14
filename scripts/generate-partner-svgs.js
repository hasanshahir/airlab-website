import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'public', 'partners');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const svgs = {
  'sindh-hec.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" fill="none">
    <rect width="40" height="40" x="4" y="4" rx="10" fill="#0D5C3A"/>
    <path d="M24 12L31 24H17L24 12Z" fill="#FFD700"/>
    <circle cx="24" cy="28" r="4" fill="white"/>
    <text x="52" y="22" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="currentColor">SINDH HEC</text>
    <text x="52" y="35" font-family="system-ui, sans-serif" font-size="9" font-weight="500" fill="currentColor" opacity="0.7">Govt. of Sindh</text>
  </svg>`,

  'ned-sac.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" fill="none">
    <rect width="40" height="40" x="4" y="4" rx="10" fill="#0F172A"/>
    <circle cx="24" cy="24" r="10" stroke="#38BDF8" stroke-width="2"/>
    <ellipse cx="24" cy="24" rx="14" ry="5" stroke="#F97316" stroke-width="1.5" transform="rotate(-25 24 24)"/>
    <circle cx="28" cy="20" r="2" fill="white"/>
    <text x="52" y="22" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="currentColor">NED-SAC</text>
    <text x="52" y="35" font-family="system-ui, sans-serif" font-size="9" font-weight="500" fill="currentColor" opacity="0.7">Space Applications</text>
  </svg>`,

  'siehs.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" fill="none">
    <rect width="40" height="40" x="4" y="4" rx="10" fill="#DC2626"/>
    <path d="M24 14V34M14 24H34" stroke="white" stroke-width="3.5" stroke-linecap="round"/>
    <text x="52" y="22" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="currentColor">SIEHS 1122</text>
    <text x="52" y="35" font-family="system-ui, sans-serif" font-size="9" font-weight="500" fill="currentColor" opacity="0.7">Emergency Health</text>
  </svg>`,

  'nedaasc.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" fill="none">
    <rect width="40" height="40" x="4" y="4" rx="10" fill="#1E3A8A"/>
    <path d="M16 30L24 14L32 30H27L24 23L21 30H16Z" fill="#F59E0B"/>
    <text x="52" y="22" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="currentColor">NEDAASC</text>
    <text x="52" y="35" font-family="system-ui, sans-serif" font-size="9" font-weight="500" fill="currentColor" opacity="0.7">SoCal Alumni</text>
  </svg>`,

  'neduet.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" fill="none">
    <rect width="40" height="40" x="4" y="4" rx="10" fill="#7C2D12"/>
    <circle cx="24" cy="24" r="11" stroke="white" stroke-width="2" stroke-dasharray="2 2"/>
    <text x="24" y="28" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="white" text-anchor="middle">NED</text>
    <text x="52" y="22" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="currentColor">NEDUET CSIT</text>
    <text x="52" y="35" font-family="system-ui, sans-serif" font-size="9" font-weight="500" fill="currentColor" opacity="0.7">Host Department</text>
  </svg>`,

  'hec-pakistan.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" fill="none">
    <rect width="40" height="40" x="4" y="4" rx="10" fill="#047857"/>
    <path d="M24 14L33 22L24 30L15 22L24 14Z" fill="white"/>
    <circle cx="24" cy="22" r="3" fill="#047857"/>
    <text x="52" y="22" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="currentColor">HEC PAKISTAN</text>
    <text x="52" y="35" font-family="system-ui, sans-serif" font-size="9" font-weight="500" fill="currentColor" opacity="0.7">Higher Education Comm.</text>
  </svg>`,

  'nvidia.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" fill="none">
    <rect width="40" height="40" x="4" y="4" rx="10" fill="#111827"/>
    <path d="M16 24C16 19 20 15 24 15C28 15 32 19 32 24C32 27 30 31 24 31C20 31 18 28 18 28" stroke="#76B900" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="24" cy="24" r="3" fill="#76B900"/>
    <text x="52" y="22" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="currentColor">NVIDIA</text>
    <text x="52" y="35" font-family="system-ui, sans-serif" font-size="9" font-weight="500" fill="currentColor" opacity="0.7">Applied Research</text>
  </svg>`,

  'meta.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" fill="none">
    <rect width="40" height="40" x="4" y="4" rx="10" fill="#EE4C2C"/>
    <path d="M24 15L28 21L25 25L24 23L23 25L20 21L24 15Z" fill="white"/>
    <circle cx="28" cy="22" r="2.5" fill="#FFD700"/>
    <text x="52" y="22" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="currentColor">PYTORCH</text>
    <text x="52" y="35" font-family="system-ui, sans-serif" font-size="9" font-weight="500" fill="currentColor" opacity="0.7">AI Ecosystem</text>
  </svg>`
};

for (const [filename, content] of Object.entries(svgs)) {
  fs.writeFileSync(path.join(dir, filename), content.trim(), 'utf8');
}
console.log('SVGs generated successfully in', dir);
