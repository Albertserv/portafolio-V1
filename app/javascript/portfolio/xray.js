// Convierte una captura en un "plano técnico": fondo azul con grilla y los bordes
// de la interfaz detectados (filtro Sobel). Es lo que muestra la lupa de rayos X.

const BG = [8, 28, 64]
const GRID = [15, 42, 88]
const GRID_MAJOR = [24, 60, 118]
const EDGE = [200, 230, 255]

function waitForImage(img) {
  if (img.complete && img.naturalWidth) return Promise.resolve()
  return new Promise((resolve, reject) => {
    img.addEventListener("load", resolve, { once: true })
    img.addEventListener("error", reject, { once: true })
  })
}

export async function blueprint(img, maxWidth = 1100) {
  await waitForImage(img)
  const W = Math.min(img.naturalWidth, maxWidth)
  const H = Math.round((img.naturalHeight * W) / img.naturalWidth)
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const g = canvas.getContext("2d", { willReadFrequently: true })
  g.drawImage(img, 0, 0, W, H)
  const src = g.getImageData(0, 0, W, H).data

  const lum = new Float32Array(W * H)
  for (let i = 0, p = 0; i < lum.length; i++, p += 4) {
    lum[i] = (0.299 * src[p] + 0.587 * src[p + 1] + 0.114 * src[p + 2]) / 255
  }

  const out = g.createImageData(W, H)
  const o = out.data
  for (let y = 0; y < H; y++) {
    const major = y % 80 === 0, minor = y % 16 === 0
    for (let x = 0; x < W; x++) {
      const i = y * W + x, p = i * 4
      const base = major || x % 80 === 0 ? GRID_MAJOR : minor || x % 16 === 0 ? GRID : BG
      let m = 0
      if (x > 0 && y > 0 && x < W - 1 && y < H - 1) {
        const tl = lum[i - W - 1], t = lum[i - W], tr = lum[i - W + 1]
        const l = lum[i - 1], r = lum[i + 1]
        const bl = lum[i + W - 1], b = lum[i + W], br = lum[i + W + 1]
        const gx = tr + 2 * r + br - tl - 2 * l - bl
        const gy = bl + 2 * b + br - tl - 2 * t - tr
        m = Math.sqrt(gx * gx + gy * gy) * 1.6
        m = m < 0.08 ? 0 : Math.min(1, m)
      }
      o[p] = base[0] + (EDGE[0] - base[0]) * m
      o[p + 1] = base[1] + (EDGE[1] - base[1]) * m
      o[p + 2] = base[2] + (EDGE[2] - base[2]) * m
      o[p + 3] = 255
    }
  }
  g.putImageData(out, 0, 0)

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"))
  return URL.createObjectURL(blob)
}
