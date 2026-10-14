export const BODY_MIN = 10;
export const BODY_MAX = 2000;
export const MAX_IMAGES = 3;
export const MAX_IMAGE_SIDE = 1600;

export function isBodyValid(body: string): boolean {
  const n = body.trim().length;
  return n >= BODY_MIN && n <= BODY_MAX;
}

// Resize target keeping the aspect ratio; null when the image already fits.
export function fitWithin(width: number, height: number, max = MAX_IMAGE_SIDE): { width: number; height: number } | null {
  const long = Math.max(width, height);
  if (long <= max) return null;
  return width >= height
    ? { width: max, height: Math.round((height * max) / width) }
    : { width: Math.round((width * max) / height), height: max };
}

export function imagePath(userId: string, reportId: string, index: number): string {
  return `${userId}/${reportId}/${index + 1}.jpg`;
}
