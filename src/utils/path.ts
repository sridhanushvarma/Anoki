export const getAssetPath = (path: string) => {
  const basePath = process.env.NODE_ENV === 'production' ? '/Encode-25' : '';
  return `${basePath}${path}`;
}
