// Downscale + re-encode uploads in the browser so multi-MB camera photos
// land in storage as ~100-300KB WebP files. Keeps whichever is smaller.

const MAX_DIMENSION = 1600 // plenty for a fullscreen lightbox on any school device
const QUALITY = 0.82

export interface CompressedImage {
  blob: Blob
  ext: string
  contentType: string
}

export async function compressImage(file: File): Promise<CompressedImage> {
  const original: CompressedImage = {
    blob: file,
    ext: file.name.split('.').pop()?.toLowerCase() ?? 'png',
    contentType: file.type || 'application/octet-stream',
  }
  // never rasterize vectors or flatten animations
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return original

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', QUALITY),
    )
    if (!blob || blob.size >= file.size) return original
    return { blob, ext: 'webp', contentType: 'image/webp' }
  } catch {
    return original // unreadable/exotic format: store as-is rather than fail the upload
  }
}
