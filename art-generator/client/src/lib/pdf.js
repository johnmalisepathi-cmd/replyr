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

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Renders `imageSrc` (a data URL) centered on a single page sized to a real
// print size, then triggers a PDF download.
export async function downloadImageAsPdf(imageSrc, { sizeId = "8x10", filename = "artwork.pdf" } = {}) {
  const size = printSizes.find((s) => s.id === sizeId) || printSizes[0];
  const img = await loadImage(imageSrc);

  const pageW = size.widthIn;
  const pageH = size.heightIn;
  const imgRatio = img.width / img.height;
  const pageRatio = pageW / pageH;

  let drawW;
  let drawH;
  if (imgRatio > pageRatio) {
    drawW = pageW;
    drawH = pageW / imgRatio;
  } else {
    drawH = pageH;
    drawW = pageH * imgRatio;
  }
  const x = (pageW - drawW) / 2;
  const y = (pageH - drawH) / 2;

  const doc = new jsPDF({ unit: "in", format: [pageW, pageH] });
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageW, pageH, "F");
  doc.addImage(imageSrc, "PNG", x, y, drawW, drawH);
  doc.save(filename);
}
