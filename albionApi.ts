// lib/albionApi.ts
export const getItemIconUrl = (uniqueName: string, size = 64, quality?: number) => {
  const baseUrl = `https://render.albiononline.com/v1/item/${uniqueName}.png`;
  const params = new URLSearchParams();
  if (size) params.append('size', size.toString());
  if (quality) params.append('quality', quality.toString());
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};
