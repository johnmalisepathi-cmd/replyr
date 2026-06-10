// Convert a "#rrggbb" or "#rgb" hex string to an [r, g, b, a] array (a = 255).
export function hexToRgba(hex) {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const value = parseInt(full, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255, 255];
}

function colorsMatch(a, b, tolerance) {
  return (
    Math.abs(a[0] - b[0]) <= tolerance &&
    Math.abs(a[1] - b[1]) <= tolerance &&
    Math.abs(a[2] - b[2]) <= tolerance &&
    Math.abs(a[3] - b[3]) <= tolerance
  );
}

// Flood-fills `imageData` in place starting at (startX, startY) with `fillColor`
// ([r, g, b, a]). Mutates the underlying pixel buffer directly.
export function floodFill(imageData, startX, startY, fillColor, tolerance = 24) {
  const { width, height, data } = imageData;
  if (startX < 0 || startX >= width || startY < 0 || startY >= height) return;

  const startIdx = (startY * width + startX) * 4;
  const startColor = [data[startIdx], data[startIdx + 1], data[startIdx + 2], data[startIdx + 3]];
  if (colorsMatch(startColor, fillColor, 0)) return;

  const visited = new Uint8Array(width * height);
  const stack = [startY * width + startX];
  visited[startY * width + startX] = 1;

  while (stack.length) {
    const pos = stack.pop();
    const idx = pos * 4;
    const current = [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
    if (!colorsMatch(current, startColor, tolerance)) continue;

    data[idx] = fillColor[0];
    data[idx + 1] = fillColor[1];
    data[idx + 2] = fillColor[2];
    data[idx + 3] = fillColor[3];

    const x = pos % width;
    const y = (pos / width) | 0;

    if (x + 1 < width && !visited[pos + 1]) {
      visited[pos + 1] = 1;
      stack.push(pos + 1);
    }
    if (x - 1 >= 0 && !visited[pos - 1]) {
      visited[pos - 1] = 1;
      stack.push(pos - 1);
    }
    if (y + 1 < height && !visited[pos + width]) {
      visited[pos + width] = 1;
      stack.push(pos + width);
    }
    if (y - 1 >= 0 && !visited[pos - width]) {
      visited[pos - width] = 1;
      stack.push(pos - width);
    }
  }
}
