export function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  return [r, g, b];
}

function loadImage(svgMarkup: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Não foi possível carregar o logotipo para o PDF.'));
    image.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgMarkup)))}`;
  });
}

export async function svgToPngDataUrl(svgMarkup: string, width: number, height: number): Promise<string> {
  const image = await loadImage(svgMarkup);
  const canvas = document.createElement('canvas');
  const scale = 2;
  canvas.width = width * scale;
  canvas.height = height * scale;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Não foi possível preparar o canvas para o PDF.');
  }

  context.scale(scale, scale);
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL('image/png');
}
