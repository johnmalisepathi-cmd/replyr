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

function renderImagePage(doc, img, imageSrc, size) {
  const { x, y, width, height } = fitContain(img.width, img.height, size.widthIn, size.heightIn);
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, size.widthIn, size.heightIn, "F");
  doc.addImage(imageSrc, "PNG", x, y, width, height);
}

// Renders `imageSrc` (a data URL) centered on a single page sized to a real
// print size, then triggers a PDF download.
export async function downloadImageAsPdf(imageSrc, { sizeId = "8x10", filename = "artwork.pdf" } = {}) {
  const size = printSizes.find((s) => s.id === sizeId) || printSizes[0];
  const img = await loadImage(imageSrc);

  const doc = new jsPDF({ unit: "in", format: [size.widthIn, size.heightIn] });
  renderImagePage(doc, img, imageSrc, size);
  doc.save(filename);
}

// Renders the same image once per requested size, each on its own
// correctly-sized page, as one multi-page "size bundle" PDF — the
// standard format for Etsy "printable wall art, multiple sizes" listings.
export async function downloadImageSizeBundlePdf(
  imageSrc,
  { sizeIds = printSizes.map((s) => s.id), filename = "artwork-bundle.pdf" } = {}
) {
  const sizes = printSizes.filter((s) => sizeIds.includes(s.id));
  if (sizes.length === 0) return;
  const img = await loadImage(imageSrc);

  let doc;
  sizes.forEach((size, index) => {
    if (index === 0) {
      doc = new jsPDF({ unit: "in", format: [size.widthIn, size.heightIn] });
    } else {
      doc.addPage([size.widthIn, size.heightIn]);
    }
    renderImagePage(doc, img, imageSrc, size);
  });
  doc.save(filename);
}
