import { jsPDF } from "jspdf";

// Common print/frame sizes for printable wall art (inches).
export const printSizes = [
  { id: "5x7", label: "5 x 7 in", widthIn: 5, heightIn: 7 },
  { id: "8x10", label: "8 x 10 in", widthIn: 8, heightIn: 10 },
  { id: "11x14", label: "11 x 14 in", widthIn: 11, heightIn: 14 },
  { id: "16x20", label: "16 x 20 in", widthIn: 16, heightIn: 20 },
  { id: "a4", label: "A4", widthIn: 8.27, heightIn: 11.69 },
  { id: "square10", label: "10 x 10 in (square)", widthIn: 10, heightIn: 10 },
];

// Loads an image with CORS enabled so it can be drawn to a canvas / embedded
// in a PDF even though it comes from another origin (Pollinations).
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Converts a (possibly cross-origin) image URL into a PNG data URL via canvas.
async function toPngDataUrl(src) {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return { dataUrl: canvas.toDataURL("image/png"), width: canvas.width, height: canvas.height };
}

// Computes the centered, aspect-fit (contain) placement of an image on a page.
function fitContain(imgWidth, imgHeight, pageWidth, pageHeight) {
  const imgRatio = imgWidth / imgHeight;
  const pageRatio = pageWidth / pageHeight;

  let drawW;
  let drawH;
  if (imgRatio > pageRatio) {
    drawW = pageWidth;
    drawH = pageWidth / imgRatio;
  } else {
    drawH = pageHeight;
    drawW = pageHeight * imgRatio;
  }
  return { x: (pageWidth - drawW) / 2, y: (pageHeight - drawH) / 2, width: drawW, height: drawH };
}

function renderImagePage(doc, dataUrl, imgWidth, imgHeight, size) {
  const { x, y, width, height } = fitContain(imgWidth, imgHeight, size.widthIn, size.heightIn);
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, size.widthIn, size.heightIn, "F");
  doc.addImage(dataUrl, "PNG", x, y, width, height);
}

// Downloads `imageSrc` centered on a single page sized to a real print size.
export async function downloadImageAsPdf(imageSrc, { sizeId = "8x10", filename = "artwork.pdf" } = {}) {
  const size = printSizes.find((s) => s.id === sizeId) || printSizes[0];
  const { dataUrl, width, height } = await toPngDataUrl(imageSrc);

  const doc = new jsPDF({ unit: "in", format: [size.widthIn, size.heightIn] });
  renderImagePage(doc, dataUrl, width, height, size);
  doc.save(filename);
}

// Renders the same image once per requested size, each on its own correctly
// sized page, as one multi-page "size bundle" PDF — the standard format for
// Etsy "printable wall art, multiple sizes" listings.
export async function downloadImageSizeBundlePdf(
  imageSrc,
  { sizeIds = printSizes.map((s) => s.id), filename = "artwork-bundle.pdf" } = {}
) {
  const sizes = printSizes.filter((s) => sizeIds.includes(s.id));
  if (sizes.length === 0) return;
  const { dataUrl, width, height } = await toPngDataUrl(imageSrc);

  let doc;
  sizes.forEach((size, index) => {
    if (index === 0) {
      doc = new jsPDF({ unit: "in", format: [size.widthIn, size.heightIn] });
    } else {
      doc.addPage([size.widthIn, size.heightIn]);
    }
    renderImagePage(doc, dataUrl, width, height, size);
  });
  doc.save(filename);
}

// Downloads the raw image as a PNG file (fetches the bytes so a cross-origin
// URL still saves as a real file instead of navigating to it).
export async function downloadPng(imageSrc, filename = "artwork.png") {
  const { dataUrl } = await toPngDataUrl(imageSrc);
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
