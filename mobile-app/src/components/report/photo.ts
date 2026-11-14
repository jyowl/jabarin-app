export function imageType(header: Uint8Array): 'image/jpeg' | 'image/png' | null {
  if (header.length >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) return 'image/jpeg';
  if (header.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => header[index] === byte)) return 'image/png';
  return null;
}

export function validPhoto(size: number, header: Uint8Array) {
  return size > 0 && size <= 10 * 1024 * 1024 && imageType(header) !== null;
}
