// resize supabase image on the fly
export function getResizedImageUrl(url: string, width: number, height: number): string {
  if (!url) return url
  return url
    .replace('/storage/v1/object/', '/storage/v1/render/image/')
    + `?width=${width}&height=${height}&resize=cover`
}
