// Procedurally generated colouring-book line art. Each template returns a
// full SVG (1000x750, matching the canvas) with black outlines on a white
// background, ready to be drawn onto the canvas and filled in by the user.

const STROKE = "#1f2937";
const SW = 6;
const W = 1000;
const H = 750;

function svgWrap(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="#ffffff"/>
    ${content}
  </svg>`;
}

function tree(x, y, scale) {
  return `
    <rect x="${x - 10 * scale}" y="${y}" width="${20 * scale}" height="${100 * scale}" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    <circle cx="${x}" cy="${y - 40 * scale}" r="${70 * scale}" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    <circle cx="${x - 50 * scale}" cy="${y - 10 * scale}" r="${50 * scale}" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    <circle cx="${x + 50 * scale}" cy="${y - 10 * scale}" r="${50 * scale}" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
  `;
}

function flowerDoodle(x, y, scale) {
  let petals = "";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const px = x + Math.cos(a) * 22 * scale;
    const py = y + Math.sin(a) * 22 * scale;
    petals += `<circle cx="${px}" cy="${py}" r="${16 * scale}" fill="none" stroke="${STROKE}" stroke-width="3"/>`;
  }
  return `${petals}<circle cx="${x}" cy="${y}" r="${10 * scale}" fill="none" stroke="${STROKE}" stroke-width="3"/>`;
}

function blankSVG() {
  return svgWrap("");
}

function flowerSVG() {
  const cx = 500;
  const cy = 320;
  const petalCount = 8;
  const petalLength = 140;
  const petalWidth = 70;
  let petals = "";
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const x = cx + Math.cos(angle) * petalLength * 0.55;
    const y = cy + Math.sin(angle) * petalLength * 0.55;
    const rotation = (angle * 180) / Math.PI;
    petals += `<ellipse cx="${x}" cy="${y}" rx="${petalLength / 2}" ry="${petalWidth / 2}" transform="rotate(${rotation} ${x} ${y})" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
  }
  return svgWrap(`
    ${petals}
    <circle cx="${cx}" cy="${cy}" r="50" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    <path d="M500 370 C 480 480, 460 560, 500 680" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    <path d="M500 520 C 440 500, 380 520, 360 580 C 430 600, 480 570, 500 520 Z" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    <path d="M500 580 C 560 560, 620 580, 640 640 C 570 660, 520 630, 500 580 Z" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
  `);
}

function mandalaSVG() {
  const cx = 500;
  const cy = 375;
  let shapes = "";

  const rings = [
    { r: 320, count: 16, size: 30 },
    { r: 240, count: 12, size: 36 },
    { r: 160, count: 8, size: 44 },
  ];
  rings.forEach(({ r, count, size }) => {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      shapes += `<circle cx="${x}" cy="${y}" r="${size / 2}" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
    }
  });

  [340, 260, 180, 100, 40].forEach((r) => {
    shapes += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>`;
  });

  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const x1 = cx + Math.cos(angle) * 40;
    const y1 = cy + Math.sin(angle) * 40;
    const x2 = cx + Math.cos(angle) * 340;
    const y2 = cy + Math.sin(angle) * 340;
    shapes += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${STROKE}" stroke-width="2"/>`;
  }

  return svgWrap(shapes);
}

function butterflySVG() {
  return svgWrap(`
    <ellipse cx="500" cy="375" rx="18" ry="160" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    <path d="M495 230 C 470 180, 430 160, 410 140" fill="none" stroke="${STROKE}" stroke-width="4"/>
    <path d="M505 230 C 530 180, 570 160, 590 140" fill="none" stroke="${STROKE}" stroke-width="4"/>
    <circle cx="410" cy="140" r="8" fill="none" stroke="${STROKE}" stroke-width="4"/>
    <circle cx="590" cy="140" r="8" fill="none" stroke="${STROKE}" stroke-width="4"/>
    <path d="M490 280 C 320 180, 140 220, 140 360 C 140 460, 320 440, 490 360 Z" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    <path d="M510 280 C 680 180, 860 220, 860 360 C 860 460, 680 440, 510 360 Z" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    <path d="M490 380 C 380 460, 240 520, 220 600 C 340 640, 450 540, 490 440 Z" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    <path d="M510 380 C 620 460, 760 520, 780 600 C 660 640, 550 540, 510 440 Z" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    <circle cx="320" cy="300" r="40" fill="none" stroke="${STROKE}" stroke-width="3"/>
    <circle cx="680" cy="300" r="40" fill="none" stroke="${STROKE}" stroke-width="3"/>
    <circle cx="350" cy="500" r="30" fill="none" stroke="${STROKE}" stroke-width="3"/>
    <circle cx="650" cy="500" r="30" fill="none" stroke="${STROKE}" stroke-width="3"/>
  `);
}

function cottageSVG() {
  let sunRays = "";
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x1 = 850 + Math.cos(angle) * 75;
    const y1 = 120 + Math.sin(angle) * 75;
    const x2 = 850 + Math.cos(angle) * 95;
    const y2 = 120 + Math.sin(angle) * 95;
    sunRays += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${STROKE}" stroke-width="${SW}"/>`;
  }

  return svgWrap(`
    <circle cx="850" cy="120" r="60" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    ${sunRays}
    <line x1="0" y1="620" x2="${W}" y2="620" stroke="${STROKE}" stroke-width="${SW}"/>
    <rect x="320" y="380" width="360" height="240" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    <path d="M280 380 L500 220 L720 380 Z" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    <rect x="600" y="250" width="40" height="90" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    <path d="M460 620 L460 480 A40 40 0 0 1 540 480 L540 620 Z" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    <rect x="350" y="430" width="70" height="70" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    <line x1="385" y1="430" x2="385" y2="500" stroke="${STROKE}" stroke-width="3"/>
    <line x1="350" y1="465" x2="420" y2="465" stroke="${STROKE}" stroke-width="3"/>
    <rect x="580" y="430" width="70" height="70" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    <line x1="615" y1="430" x2="615" y2="500" stroke="${STROKE}" stroke-width="3"/>
    <line x1="580" y1="465" x2="650" y2="465" stroke="${STROKE}" stroke-width="3"/>
    ${tree(120, 480, 1)}
    ${tree(880, 470, 0.9)}
    ${tree(180, 560, 0.6)}
  `);
}

function heartWreathSVG() {
  let flowers = "";
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const x = 500 + Math.cos(angle) * 340;
    const y = 350 + Math.sin(angle) * 280;
    flowers += flowerDoodle(x, y, 0.4);
  }

  return svgWrap(`
    <path d="M500 620 C 500 620, 180 430, 180 270 C 180 180, 260 130, 340 160 C 410 185, 470 250, 500 300 C 530 250, 590 185, 660 160 C 740 130, 820 180, 820 270 C 820 430, 500 620, 500 620 Z" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    <rect x="400" y="330" width="200" height="130" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    <path d="M400 330 L500 410 L600 330" fill="none" stroke="${STROKE}" stroke-width="${SW}"/>
    ${flowers}
  `);
}

export const templates = [
  { id: "blank", name: "Blank Canvas", description: "Start from scratch", svg: blankSVG() },
  { id: "flower", name: "Blooming Flower", description: "A flower with petals, stem & leaves", svg: flowerSVG() },
  { id: "mandala", name: "Mandala", description: "Symmetric radial pattern", svg: mandalaSVG() },
  { id: "butterfly", name: "Butterfly", description: "Wings ready for colour", svg: butterflySVG() },
  { id: "cottage", name: "Woodland Cottage", description: "A cosy cottage among the trees", svg: cottageSVG() },
  { id: "heart-wreath", name: "Heart Wreath", description: "A floral heart with a love letter", svg: heartWreathSVG() },
];

export function templateToDataUrl(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
