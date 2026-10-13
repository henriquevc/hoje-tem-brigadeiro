export const FALLBACK_IMAGE_DATA_URL =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#361b11"/>
      <circle cx="200" cy="180" r="70" fill="#5c301e"/>
      <circle cx="200" cy="180" r="60" fill="#7a422b"/>
      <circle cx="180" cy="165" r="8" fill="#fcd9b8" opacity="0.6"/>
      <text x="200" y="290" fill="#fcd9b8" font-size="18" font-family="sans-serif" font-weight="bold" text-anchor="middle">Hoje Tem Brigadeiro</text>
    </svg>`
  )

export function handleImgError(e: Event) {
  const target = e.target as HTMLImageElement
  if (target && target.src !== FALLBACK_IMAGE_DATA_URL) {
    target.src = FALLBACK_IMAGE_DATA_URL
  }
}
