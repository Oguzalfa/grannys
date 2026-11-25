// Public same-origin food assets are cached independently from visible rendering.
// Every network/decode task has a deadline; rejected entries can be retried.
const ASSET_TIMEOUT_MS = 10_000
const encodedAssets = new Map<string, Promise<string>>()
const decodedAssets = new Map<string, Promise<HTMLImageElement>>()

function withDeadline<T>(work: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout>
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => { controller.abort(); reject(new Error('Preview asset timed out')) }, ASSET_TIMEOUT_MS)
  })
  return Promise.race([work(controller.signal), deadline]).finally(() => clearTimeout(timer))
}

function encodedAsset(url: string, priority: 'auto' | 'low' = 'auto'): Promise<string> {
  const cached = encodedAssets.get(url)
  if (cached) return cached
  const task = withDeadline(async (signal) => {
    const response = await fetch(url, { signal, priority })
    if (!response.ok) throw new Error(`Preview asset ${response.status}`)
    const blob = await response.blob()
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      const abort = () => reader.abort()
      const clean = () => signal.removeEventListener('abort', abort)
      reader.onload = () => { clean(); resolve(String(reader.result)) }
      reader.onerror = reader.onabort = () => { clean(); reject(new Error('Preview asset could not be embedded')) }
      signal.addEventListener('abort', abort, { once: true })
      if (signal.aborted) { clean(); reject(new Error('Preview asset was cancelled')); return }
      reader.readAsDataURL(blob)
    })
  }).catch((error: unknown) => { if (encodedAssets.get(url) === task) encodedAssets.delete(url); throw error })
  encodedAssets.set(url, task)
  return task
}

export function loadPreviewImage(url: string, priority: 'auto' | 'low' = 'auto'): Promise<HTMLImageElement> {
  const cacheable = !url.startsWith('data:')
  const cached = cacheable ? decodedAssets.get(url) : undefined
  if (cached) return cached
  // Abortable fetch finishes (and evicts failed cache entries) before the decode deadline begins.
  const sourceTask = cacheable ? encodedAsset(url, priority) : Promise.resolve(url)
  const task = sourceTask.then((source) => withDeadline((signal) => new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      const clean = () => { image.onload = null; image.onerror = null; signal.removeEventListener('abort', abort) }
      const abort = () => { clean(); image.src = ''; reject(new Error('Preview photograph timed out')) }
      image.onload = () => { clean(); resolve(image) }
      image.onerror = () => { clean(); reject(new Error('Preview photograph could not be decoded')) }
      signal.addEventListener('abort', abort, { once: true })
      if (signal.aborted) { abort(); return }
      image.src = source
    }))).catch((error: unknown) => {
    if (decodedAssets.get(url) === task) decodedAssets.delete(url)
    if (cacheable && encodedAssets.get(url) === sourceTask) encodedAssets.delete(url)
    throw error
  })
  if (cacheable) decodedAssets.set(url, task)
  return task
}

export function warmPreviewBases(): void {
  if (typeof window === 'undefined') return
  for (const url of [
    '/assets/v34/scene-papatya-base.webp',
    '/assets/v34/scene-brussels-base.webp',
    '/assets/v34/scene-bowl-base.webp',
    '/assets/v15/scene-box-base.webp',
    '/assets/layers/potato.webp',
  ]) void loadPreviewImage(url, 'low').catch(() => { /* Prewarming never delays the menu. */ })
}

export function waitForV34Images(svg: SVGSVGElement): Promise<void[]> {
  const urls = new Set([...svg.querySelectorAll('image')].map((node) => node.getAttribute('href')).filter((url): url is string => Boolean(url)))
  return Promise.all([...urls].map((url) => loadPreviewImage(url).then(() => undefined)))
}

export async function rasterizeV34(svg: SVGSVGElement): Promise<string> {
  // Clone synchronously before any await so this thumbnail keeps its recipe metadata.
  const copy = svg.cloneNode(true) as SVGSVGElement
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  copy.setAttribute('width', '1260'); copy.setAttribute('height', '870')
  copy.setAttribute('style', 'filter:drop-shadow(0 9px 8px #51372926)')
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
  style.textContent = '.food-photo{filter:drop-shadow(0 1px 1px #34232338)}'
  copy.prepend(style)
  await Promise.all([...copy.querySelectorAll('image')].map(async (node) => {
    const href = node.getAttribute('href')
    if (href) node.setAttribute('href', await encodedAsset(href))
  }))
  const source = new XMLSerializer().serializeToString(copy)
  // img-src allows data: and excludes blob: on the live application.
  const image = await loadPreviewImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source))
  const canvas = document.createElement('canvas')
  canvas.width = 1260; canvas.height = 870
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Preview canvas is unavailable')
  context.drawImage(image, 0, 0, 1260, 870)
  return canvas.toDataURL('image/webp', .92)
}
