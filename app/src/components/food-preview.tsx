import { useEffect, useId, useRef, useState } from 'react'
import { createV34Engine } from '@/lib/v34-engine'
import { createV15BoxEngine } from '@/lib/v34-box-v15'
import { loadPreviewImage, rasterizeV34, waitForV34Images } from '@/lib/v34-snapshot'
export { warmPreviewBases } from '@/lib/v34-snapshot'
import type { V34Engine, V34SauceWells } from '@/lib/v34-types'
import type { Category, Selection } from '@/lib/grannys-menu'

type FoodPreviewProps = {
  category: Category
  selections: Selection
  sauceWells?: V34SauceWells
  onSnapshot?: (data: string, category: Category, selections: Selection, sauceWells?: V34SauceWells) => void
}
type ImageMap = Map<string, HTMLImageElement>
type Fragment = { image: HTMLCanvasElement; ratio: number }
type Surface = { cx: number; cy: number; rx: number; ry: number }

const WIDTH = 800
const HEIGHT = 600
const ASSET = '/assets/layers/'
const sauceColors: Record<string, string> = {
  milk: '#80452D', white: '#F3DFB0', dark: '#3C251F',
  'hazelnut-chocolate': '#A46C46', 'strawberry-chocolate': '#D87B9A',
  pistachio: '#89964B', caramel: '#BE813E', raspberry: '#A33660',
  'milk-jam': '#C38B53', magnolia: '#F8EBC7',
}
const pieceNames: Record<string, string> = { oreo: 'cookie' }
const fruitNames = new Set(['strawberry', 'banana', 'kiwi', 'pineapple'])
const crumbNames = new Set(['cookie', 'coconut', 'peanut', 'lotus', 'hazelnut', 'walnut'])
const chocolateNames = new Set(['milk', 'white', 'dark', 'hazelnut-chocolate', 'strawberry-chocolate', 'pistachio', 'caramel', 'raspberry'])

export type SauceRegion = { id: string; start: number; end: number }

/** Fractions are relative to the full edible surface, in selection order.
 * One sauce owns it all; two own disjoint, equal left/right halves.
 */
export function getSauceRegions(ids: string[] | undefined): SauceRegion[] {
  const chosen = [...new Set(ids ?? [])].filter((id) => chocolateNames.has(id)).slice(0, 2)
  if (chosen.length === 1) return [{ id: chosen[0]!, start: 0, end: 1 }]
  if (chosen.length === 2) return [
    { id: chosen[0]!, start: 0, end: .5 },
    { id: chosen[1]!, start: .5, end: 1 },
  ]
  return []
}

function unique(ids: string[] | undefined) { return [...new Set(ids ?? [])] }
function seeded(n: number) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }
function makeCanvas(width = WIDTH, height = HEIGHT) {
  const canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  return canvas
}
function ellipse(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, fill: string | CanvasGradient) {
  ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill()
}
function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number, fill: string | CanvasGradient) {
  ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fill()
}

/** Separate already-photographed food pieces from transparent ingredient patches.
 * Their optical perspective stays intact; no fruit is modelled or drawn by CSS.
 */
function fragmentsOf(image: HTMLImageElement, name: string): Fragment[] {
  // Some studio patches contain touching pieces joined by opaque shadows.
  // These measured crops isolate one photographed item, never a whole pile.
  const singlePiece: Record<string, [number, number, number, number, 'oval' | 'cube'][]> = {
    banana: [[.268, .0, .228, .305, 'oval'], [.52, .0, .22, .30, 'oval']],
    kiwi: [[.315, .005, .29, .35, 'oval']],
    brownie: [[.32, .0, .22, .31, 'cube']],
    corn: [[.46, .74, .105, .21, 'oval']],
    olive: [[.275, .477, .26, .38, 'oval']],
    pickle: [[.214, .406, .30, .58, 'oval']],
  }
  if (singlePiece[name]) return singlePiece[name]!.map(([x, y, width, height, shape]) => {
    const output = makeCanvas(Math.max(1, Math.round(image.naturalWidth * width)), Math.max(1, Math.round(image.naturalHeight * height)))
    const out = output.getContext('2d')!
    out.drawImage(image, x * image.naturalWidth, y * image.naturalHeight, width * image.naturalWidth, height * image.naturalHeight, 0, 0, output.width, output.height)
    out.globalCompositeOperation = 'destination-in'; out.beginPath()
    if (shape === 'oval') out.ellipse(output.width / 2, output.height / 2, output.width * .48, output.height * .48, 0, 0, Math.PI * 2)
    else { out.moveTo(output.width * .18, 0); out.lineTo(output.width * .9, 0); out.lineTo(output.width, output.height * .67); out.lineTo(output.width * .72, output.height); out.lineTo(output.width * .08, output.height * .85); out.lineTo(0, output.height * .25); out.closePath() }
    out.fill(); return { image: output, ratio: output.width / output.height }
  })
  const scale = Math.min(1, 240 / Math.max(image.naturalWidth, image.naturalHeight))
  const w = Math.max(1, Math.round(image.naturalWidth * scale)), h = Math.max(1, Math.round(image.naturalHeight * scale))
  const sample = makeCanvas(w, h), ctx = sample.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(image, 0, 0, w, h)
  const alphaCutoff = fruitNames.has(name) ? 190 : 70
  const pixels = ctx.getImageData(0, 0, w, h).data, seen = new Uint8Array(w * h), queue = new Int32Array(w * h)
  const regions: { x: number; y: number; w: number; h: number; area: number; mask: number[] }[] = []
  for (let p = 0; p < w * h; p++) {
    if (seen[p] || pixels[p * 4 + 3]! < alphaCutoff) continue
    let head = 0, tail = 1; queue[0] = p; seen[p] = 1
    let minX = p % w, maxX = minX, minY = Math.floor(p / w), maxY = minY
    const mask: number[] = []
    while (head < tail) {
      const current = queue[head++]!, x = current % w, y = Math.floor(current / w)
      mask.push(current); minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y)
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nx = x + dx!, ny = y + dy!
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
        const next = ny * w + nx
        if (!seen[next] && pixels[next * 4 + 3]! >= alphaCutoff) { seen[next] = 1; queue[tail++] = next }
      }
    }
    const regionH = maxY - minY + 1
    const strayGridEdge = fruitNames.has(name) && minY <= 2 && regionH < h * .14
    if (mask.length >= 20 && !strayGridEdge) regions.push({ x: minX, y: minY, w: maxX - minX + 1, h: regionH, area: mask.length, mask })
  }
  regions.sort((a, b) => b.area - a.area)
  if (crumbNames.has(name) || name === 'carrot' || name === 'cheese') {
    // Connected piles are deliberately broken into tiny photographic texture
    // crops. A whole nut/biscuit pile is never stamped as one topping clump.
    const crumbs: Fragment[] = []
    for (let n = 0; n < 120 && crumbs.length < 48; n++) {
      const cropW = Math.max(5, Math.round(w * (.045 + seeded(n + 19) * .055)))
      const cropH = Math.max(5, Math.round(cropW * (.6 + seeded(n + 37) * .6)))
      const x = Math.floor(seeded(n + 71) * Math.max(1, w - cropW)), y = Math.floor(seeded(n + 109) * Math.max(1, h - cropH))
      let visible = 0
      for (let py = y; py < y + cropH; py++) for (let px = x; px < x + cropW; px++) if (pixels[(py * w + px) * 4 + 3]! > 100) visible++
      if (visible < cropW * cropH * .48) continue
      const output = makeCanvas(Math.max(1, Math.round(cropW / scale)), Math.max(1, Math.round(cropH / scale))), out = output.getContext('2d')!
      out.drawImage(image, x / scale, y / scale, cropW / scale, cropH / scale, 0, 0, output.width, output.height)
      // An irregular small contour avoids rectangular photograph edges.
      out.globalCompositeOperation = 'destination-in'
      out.beginPath(); out.moveTo(output.width * .18, 0); out.lineTo(output.width * .84, output.height * .06)
      out.lineTo(output.width, output.height * .47); out.lineTo(output.width * .76, output.height)
      out.lineTo(output.width * .15, output.height * .86); out.lineTo(0, output.height * .35); out.closePath(); out.fill()
      crumbs.push({ image: output, ratio: output.width / output.height })
    }
    if (crumbs.length) return crumbs
  }
  if (!regions.length) return [{ image: sample, ratio: w / h }]
  return regions.slice(0, 24).map((region) => {
    const output = makeCanvas(Math.max(1, Math.round(region.w / scale)), Math.max(1, Math.round(region.h / scale)))
    const out = output.getContext('2d')!
    out.drawImage(image, region.x / scale, region.y / scale, region.w / scale, region.h / scale, 0, 0, output.width, output.height)
    // A bounding box can contain other disconnected pieces. Retain ONLY the
    // pixels belonging to this component, not neighbouring tiny fruit groups.
    const maskCanvas = makeCanvas(region.w, region.h), maskCtx = maskCanvas.getContext('2d')!
    const maskPixels = maskCtx.createImageData(region.w, region.h)
    for (const point of region.mask) {
      const px = point % w - region.x, py = Math.floor(point / w) - region.y
      const at = (py * region.w + px) * 4
      maskPixels.data[at] = 255; maskPixels.data[at + 1] = 255; maskPixels.data[at + 2] = 255; maskPixels.data[at + 3] = 255
    }
    maskCtx.putImageData(maskPixels, 0, 0)
    out.globalCompositeOperation = 'destination-in'
    out.drawImage(maskCanvas, 0, 0, output.width, output.height)
    return { image: output, ratio: output.width / output.height }
  })
}

function paintFood(ctx: CanvasRenderingContext2D, category: Category, selection: Selection, images: ImageMap, fragments: Map<string, Fragment[]>) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT)
  const draw = (name: string, cx: number, cy: number, width: number, height: number, rotation = 0, shadow = 0) => {
    const img = images.get(name); if (!img) return
    let source: HTMLImageElement | HTMLCanvasElement = img
    if (name === 'bowl') {
      if (!fragments.has('bowl')) fragments.set('bowl', fragmentsOf(img, 'bowl'))
      source = fragments.get('bowl')?.[0]?.image ?? img
    }
    const sourceWidth = source instanceof HTMLCanvasElement ? source.width : source.naturalWidth
    const sourceHeight = source instanceof HTMLCanvasElement ? source.height : source.naturalHeight
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rotation)
    if (shadow) { ctx.shadowColor = 'rgba(68, 24, 29, .16)'; ctx.shadowBlur = shadow; ctx.shadowOffsetY = shadow * .55 }
    const fit = Math.min(width / sourceWidth, height / sourceHeight)
    const w = sourceWidth * fit, h = sourceHeight * fit
    ctx.drawImage(source, -w / 2, -h / 2, w, h); ctx.restore()
  }
  // A restrained studio pool anchors the real food without decorative confetti.
  const ambient = ctx.createRadialGradient(400, 384, 20, 400, 384, 345)
  ambient.addColorStop(0, 'rgba(104, 49, 62, .13)'); ambient.addColorStop(1, 'rgba(104, 49, 62, 0)')
  ellipse(ctx, 400, 403, 350, 145, ambient)
  let surface: Surface = { cx: 400, cy: 291, rx: 238, ry: 218 }
  let bowlScale = 1
  let waffleMask: { name: string; cx: number; cy: number; width: number; height: number; rotation: number } | null = null
  const base = selection.base?.[0] ?? ''
  if (category === 'waffle') {
    ctx.save(); ctx.shadowColor = 'rgba(75, 34, 46, .15)'; ctx.shadowBlur = 28; ctx.shadowOffsetY = 18
    const plate = ctx.createLinearGradient(0, 110, 0, 500); plate.addColorStop(0, '#FFFFFF'); plate.addColorStop(1, '#E9DFE0')
    ellipse(ctx, 400, 312, 315, 262, plate); ctx.restore()
    ellipse(ctx, 400, 304, 295, 244, '#FFFDFC')
    ctx.strokeStyle = 'rgba(205, 189, 191, .4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(400, 304, 279, 228, 0, 0, Math.PI * 2); ctx.stroke()
    const brussels = base.includes('brussels')
    draw(brussels ? 'brussels' : 'flower', 400, 293, brussels ? 514 : 524, brussels ? 412 : 484, -.025, 8)
    waffleMask = { name: brussels ? 'brussels' : 'flower', cx: 400, cy: 293, width: brussels ? 514 : 524, height: brussels ? 412 : 484, rotation: -.025 }
    if (brussels) surface = { cx: 400, cy: 290, rx: 235, ry: 186 }
  } else if (category === 'bowl') {
    bowlScale = base === 'waffle-bowl-large' ? 1.05 : .92
    const bowlY = base === 'waffle-bowl-large' ? 324 : 334
    draw('bowl', 400, bowlY, 504 * bowlScale, 455 * bowlScale, 0, 12)
    surface = { cx: 400, cy: bowlY - 34 * bowlScale, rx: 222 * bowlScale, ry: 180 * bowlScale }
    if (base === 'brownie-bowl') {
      const pieces = fragments.get('brownie') ?? []
      for (let n = 0; n < 11 && pieces.length; n++) {
        const part = pieces[n % pieces.length]!, angle = n * 2.4, r = Math.sqrt((n + .4) / 11)
        ctx.drawImage(part.image, surface.cx + Math.cos(angle) * 140 * r - 45, surface.cy + Math.sin(angle) * 65 * r - 30, 90, 62)
      }
    }
  } else if (category === 'kumpir') {
    const tray = ctx.createLinearGradient(0, 300, 0, 510); tray.addColorStop(0, '#392D33'); tray.addColorStop(1, '#221B20')
    ctx.save(); ctx.shadowColor = 'rgba(51, 28, 39, .18)'; ctx.shadowBlur = 25; ctx.shadowOffsetY = 15
    rounded(ctx, 100, 270, 600, 220, 42, tray); ctx.restore()
    rounded(ctx, 160, 303, 480, 152, 14, '#D40078')
    draw('potato', 400, 306, 500, 402, -.02, 8)
    surface = { cx: 400, cy: 285, rx: 195, ry: 132 }
  } else {
    // A two-person tray composition: lower waffle/Brownie compartments are
    // permanent. Upper fruit cells and the two sauce wells alone are editable.
    // A matching empty tray photograph may replace the material tray later.
    if (images.has('box')) draw('box', 400, 308, 650, 443, 0, 14)
    else {
      const edge = ctx.createLinearGradient(100, 180, 700, 490); edge.addColorStop(0, '#EF3B91'); edge.addColorStop(1, '#B60060')
      ctx.save(); ctx.shadowColor = 'rgba(86, 26, 50, .2)'; ctx.shadowBlur = 25; ctx.shadowOffsetY = 16
      rounded(ctx, 103, 128, 594, 372, 12, edge); ctx.restore()
      rounded(ctx, 119, 142, 562, 332, 4, '#F9C4D9')
      for (const [x, y, w, h] of [[129, 153, 262, 122], [407, 153, 262, 122], [129, 314, 262, 145], [407, 314, 262, 145]]) {
        rounded(ctx, x!, y!, w!, h!, 4, '#FDE1EB')
        ctx.strokeStyle = 'rgba(181, 50, 106, .35)'; ctx.lineWidth = 3; ctx.strokeRect(x!, y!, w!, h!)
      }
      ctx.fillStyle = '#D51875'; ctx.fillRect(391, 146, 16, 322); ctx.fillRect(123, 278, 555, 13)
      ctx.fillStyle = '#FFF8FC'; ctx.font = '700 21px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Granny’s Waffles', 400, 491)
      ctx.save(); ctx.beginPath(); ctx.roundRect(129, 314, 262, 145, 4); ctx.clip()
      draw('brussels', 262, 384, 237, 180, 0, 5); ctx.restore()
      ctx.save(); ctx.beginPath(); ctx.roundRect(407, 314, 262, 145, 4); ctx.clip()
      const brownies = fragments.get('brownie') ?? []
      for (let i = 0; i < 12 && brownies.length; i++) {
        const piece = brownies[i % brownies.length]!, row = Math.floor(i / 4), col = i % 4
        const x = 439 + col * 65 + (seeded(i + 81) - .5) * 10, y = 334 + row * 46 + (seeded(i + 83) - .5) * 8
        ctx.save(); ctx.translate(x, y); ctx.rotate((seeded(i + 85) - .5) * .18)
        ctx.drawImage(piece.image, -32, -29, 64, 58); ctx.restore()
      }
      ctx.restore()
    }
    surface = { cx: 262, cy: 381, rx: 113, ry: 63 }
  }

  const tint = (name: string, color: string) => {
    const image = images.get(name); if (!image) return null
    const layer = makeCanvas(image.naturalWidth, image.naturalHeight), lctx = layer.getContext('2d')!
    lctx.drawImage(image, 0, 0)
    const pixels = lctx.getImageData(0, 0, layer.width, layer.height)
    const data = pixels.data, rgb = [parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16)]
    let lightSum = 0, count = 0
    for (let p = 0; p < data.length; p += 16) if (data[p + 3]! > 100) { lightSum += data[p]! * .22 + data[p + 1]! * .69 + data[p + 2]! * .09; count++ }
    const average = lightSum / Math.max(1, count)
    for (let p = 0; p < data.length; p += 4) {
      const luminosity = data[p]! * .22 + data[p + 1]! * .69 + data[p + 2]! * .09
      const factor = Math.max(.48, Math.min(1.45, luminosity / Math.max(1, average)))
      for (let channel = 0; channel < 3; channel++) data[p + channel] = Math.min(255, rgb[channel]! * factor)
    }
    lctx.putImageData(pixels, 0, 0)
    return layer
  }
  const drawSauce = (id: string, drizzle: boolean, at: Surface = surface, region?: SauceRegion, onWaffle = false) => {
    const texture = drizzle ? tint('white-drizzle', sauceColors[id] ?? sauceColors.milk!) : null
    if (drizzle && !texture) return
    const layer = makeCanvas(), lctx = layer.getContext('2d')!
    if (drizzle) {
      // Specials stay above fruit, but as narrow natural ribbons, not a thick
      // opaque lattice that hides the selected ingredients underneath.
      lctx.strokeStyle = sauceColors[id] ?? sauceColors.milk!
      lctx.lineWidth = id === 'magnolia' ? 8 : 5.5; lctx.lineCap = 'round'
      for (let line = 0; line < 6; line++) {
        const y = at.cy - at.ry * .75 + line * at.ry * .27
        lctx.beginPath(); lctx.moveTo(at.cx - at.rx * .9, y)
        lctx.bezierCurveTo(at.cx - at.rx * .3, y + 8, at.cx + at.rx * .25, y + 26, at.cx + at.rx * .92, y + 46)
        lctx.stroke()
      }
      lctx.globalCompositeOperation = 'source-atop'; lctx.globalAlpha = .65
      lctx.drawImage(texture!, at.cx - at.rx, at.cy - at.ry, at.rx * 2, at.ry * 2)
    } else {
      // Main chocolate is a FULL coating. The actual waffle's alpha contour
      // retains its thin flower / thick Brussels geometry and a narrow crust.
      if (onWaffle && waffleMask) {
        const mask = images.get(waffleMask.name)!
        const fit = Math.min(waffleMask.width / mask.naturalWidth, waffleMask.height / mask.naturalHeight) * .92
        const width = mask.naturalWidth * fit, height = mask.naturalHeight * fit
        lctx.save(); lctx.translate(waffleMask.cx, waffleMask.cy); lctx.rotate(waffleMask.rotation)
        lctx.drawImage(mask, -width / 2, -height / 2, width, height); lctx.restore()
        lctx.globalCompositeOperation = 'source-in'; lctx.fillStyle = sauceColors[id] ?? sauceColors.milk!; lctx.fillRect(0, 0, WIDTH, HEIGHT)
      } else ellipse(lctx, at.cx, at.cy, at.rx, at.ry, sauceColors[id] ?? sauceColors.milk!)
      // Adapted from the earlier local Granny’s prototype: a translucent
      // coating with fine Bézier sheen, preserving the real waffle grid.
      // Current full/half masks remain authoritative; a second main chocolate
      // never becomes drizzle and never covers the first chocolate's half.
      lctx.globalCompositeOperation = 'source-atop'
      const glaze = lctx.createLinearGradient(at.cx - at.rx, at.cy - at.ry, at.cx + at.rx, at.cy + at.ry)
      const colour = sauceColors[id] ?? sauceColors.milk!
      glaze.addColorStop(0, colour); glaze.addColorStop(.5, colour); glaze.addColorStop(1, colour)
      lctx.fillStyle = glaze; lctx.fillRect(0, 0, WIDTH, HEIGHT)
      lctx.strokeStyle = 'rgba(255,255,255,.149)'; lctx.lineWidth = category === 'box' ? 1.4 : 3
      for (let ribbon = 0; ribbon < 11; ribbon++) {
        const x = at.cx - at.rx * .84 + ribbon * at.rx * .168
        lctx.beginPath(); lctx.moveTo(x, at.cy - at.ry * .82)
        lctx.bezierCurveTo(x + at.rx * .05, at.cy - at.ry * .35, x - at.rx * .18, at.cy + at.ry * .12, x + at.rx * .1, at.cy + at.ry * .83)
        lctx.stroke()
      }
    }
    ctx.save()
    if (region) {
      const left = at.cx - at.rx + at.rx * 2 * region.start
      ctx.beginPath(); ctx.rect(left, 0, at.rx * 2 * (region.end - region.start), HEIGHT); ctx.clip()
    }
    if (!onWaffle || drizzle) { ctx.beginPath(); ctx.ellipse(at.cx, at.cy, at.rx, at.ry, 0, 0, Math.PI * 2); ctx.clip() }
    ctx.globalAlpha = drizzle || category === 'box' ? 1 : .82
    ctx.drawImage(layer, 0, 0); ctx.restore()
  }
  const sauceRegions = getSauceRegions(selection.chocolate)
  if (category === 'box') {
    // Two separate real wells. A second selection never covers the first well.
    sauceRegions.forEach((region, index) => {
      const cx = 348 + index * 102
      ellipse(ctx, cx, 296, 44, 18, '#FFF6FB')
      drawSauce(region.id, false, { cx, cy: 296, rx: 37, ry: 15 })
    })
  } else if (category !== 'kumpir') sauceRegions.forEach((region) => drawSauce(region.id, false, surface, region, category === 'waffle'))

  const stamp = (name: string, x: number, y: number, size: number, seed: number, shadow = 2.5) => {
    const pieces = fragments.get(name), piece = pieces?.[Math.floor(seeded(seed + 3) * pieces.length)]
    if (!piece) return
    const physicalSize = size * (name === 'corn' ? .65 : name === 'pickle' ? 1.25 : name === 'cheese' ? .8 : 1)
    const ratio = Math.max(.65, Math.min(2.5, piece.ratio)), w = physicalSize * Math.sqrt(ratio), h = physicalSize / Math.sqrt(ratio)
    ctx.save(); ctx.translate(x, y); ctx.rotate((seeded(seed + 4) - .5) * .43)
    ctx.shadowColor = 'rgba(69, 30, 25, .23)'; ctx.shadowBlur = shadow; ctx.shadowOffsetY = shadow * .8
    ctx.drawImage(piece.image, -w / 2, -h / 2, w, h); ctx.restore()
  }
  const coverWith = (names: string[], at: Surface, count: number, size: number, seedOffset: number) => {
    if (!names.length) return
    ctx.save(); ctx.beginPath(); ctx.ellipse(at.cx, at.cy, at.rx, at.ry, 0, 0, Math.PI * 2); ctx.clip()
    const points: { name: string; x: number; y: number; size: number; seed: number }[] = []
    for (let i = 0; i < count; i++) {
      const seed = seedOffset + i * 7, angle = i * 2.3999632297, r = Math.sqrt((i + .4) / count) * .9
      const x = at.cx + Math.cos(angle) * at.rx * r + (seeded(seed) - .5) * 9
      const y = at.cy + Math.sin(angle) * at.ry * r + (seeded(seed + 1) - .5) * 6
      points.push({ name: names[i % names.length]!, x, y, size: size * (.86 + seeded(seed + 2) * .28), seed })
    }
    // Back to front compositing respects the photographed tabletop plane.
    points.sort((a, b) => a.y - b.y).forEach((p) => stamp(p.name, p.x, p.y, p.size, p.seed, crumbNames.has(p.name) ? .7 : 2.5))
    ctx.restore()
  }
  const fruit = unique(selection.fruit).filter((id) => fruitNames.has(id)).slice(0, 4)
  if (category === 'box') {
    const left = fruit.filter((_, index) => index % 2 === 0)
    const right = fruit.length === 1 ? fruit : fruit.filter((_, index) => index % 2 === 1)
    const fillCompartment = (names: string[], x: number, seedOffset: number) => {
      if (!names.length) return
      ctx.save(); ctx.beginPath(); ctx.roundRect(x, 153, 262, 122, 4); ctx.clip()
      const positions: { x: number; y: number; seed: number; name: string }[] = []
      for (let row = 0; row < 4; row++) for (let col = 0; col < 6; col++) {
        const i = row * 6 + col, seed = seedOffset + i * 13
        positions.push({ x: x + 22 + col * 44 + (seeded(seed) - .5) * 8, y: 166 + row * 31 + (seeded(seed + 1) - .5) * 6, seed, name: names[i % names.length]! })
      }
      positions.sort((a, b) => a.y - b.y).forEach((point) => stamp(point.name, point.x, point.y, 44, point.seed, 2))
      ctx.restore()
    }
    fillCompartment(left, 129, 50); fillCompartment(right, 407, 150)
  } else if (category !== 'kumpir') {
    // In a bowl the whole mouth, including the near/lower edge, is filled;
    // the clipping surface prevents a single slice floating outside the cup.
    coverWith(fruit, surface, category === 'bowl' ? Math.round(62 * bowlScale) : 48, category === 'bowl' ? 44 * bowlScale : 50, 250)
  }
  if (category !== 'kumpir') {
    const topping = unique(selection.topping).map((id) => pieceNames[id] ?? id).slice(0, category === 'box' ? undefined : 3)
    topping.forEach((name, index) => {
      const candy = name === 'haribo'
      const count = candy ? 16 : category === 'box' ? 65 : category === 'bowl' ? 115 : 155
      const size = candy ? 16 : category === 'bowl' ? 6.8 : 7.8
      coverWith([name], surface, count, size, 510 + index * 173)
    })
    // Spesiyal always comes last, above chocolate, fruit and fine crumbs.
    unique(selection.special).slice(0, 2).forEach((id, index) => {
      if (id === 'milk-jam' || id === 'magnolia') drawSauce(id, true)
      else coverWith([id], surface, 6, 37, 920 + index * 71)
    })
  }
  if (category === 'kumpir') {
    const fillings = unique(selection.filling).filter((s) => ['corn', 'pickle', 'olive', 'carrot', 'cheese'].includes(s))
    coverWith(fillings, surface, fillings.length * 28, 35, 510)
    if (selection.extras?.includes('extra-cheese')) coverWith(['cheese'], surface, 48, 29, 710)
    if (selection.extras?.includes('extra-butter')) {
      ctx.save(); ctx.shadowColor = 'rgba(168, 118, 38, .2)'; ctx.shadowBlur = 5
      rounded(ctx, 373, 244, 45, 22, 5, '#F7DA84'); ctx.restore()
    }
  }
  if (category === 'bowl') draw('logo', 400, (base === 'waffle-bowl-large' ? 324 : 334) + 175 * bowlScale, 66 * bowlScale, 66 * bowlScale)
}

function CanvasFoodPreview({ category, selections, onSnapshot }: FoodPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<ImageMap>(new Map())
  const fragmentsRef = useRef(new Map<string, Fragment[]>())
  const promisesRef = useRef(new Map<string, Promise<HTMLImageElement | null>>())
  const callbackRef = useRef(onSnapshot)
  const lastFrameRef = useRef<HTMLCanvasElement | null>(null)
  const versionRef = useRef(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [retry, setRetry] = useState(0)
  const [hasFrame, setHasFrame] = useState(false)
  callbackRef.current = onSnapshot
  const signature = JSON.stringify(selections)

  useEffect(() => {
    const version = ++versionRef.current
    let cancelled = false, frame = 0
    const selection = JSON.parse(signature) as Selection
    const requiredBase = category === 'waffle' ? selection.base?.[0]?.includes('brussels') ? 'brussels' : 'flower' : category === 'bowl' ? 'bowl' : category === 'kumpir' ? 'potato' : 'brussels'
    const names = new Set<string>([requiredBase])
    if (category === 'box' || (category === 'bowl' && selection.base?.[0] === 'brownie-bowl')) names.add('brownie')
    if (category === 'bowl') names.add('logo')
    if (category !== 'kumpir' && (selection.special ?? []).some((id) => ['milk-jam', 'magnolia'].includes(id))) names.add('white-drizzle')
    const ingredientKeys = category === 'kumpir' ? ['filling'] : ['fruit', 'topping', 'special']
    for (const key of ingredientKeys) for (const id of selection[key] ?? []) {
      if (id === 'milk-jam' || id === 'magnolia') continue
      names.add(pieceNames[id] ?? id)
    }
    if (selection.extras?.includes('extra-cheese')) names.add('cheese')
    const load = (name: string): Promise<HTMLImageElement | null> => {
      if (imagesRef.current.has(name)) return Promise.resolve(imagesRef.current.get(name)!)
      const existing = promisesRef.current.get(name); if (existing) return existing
      const url = name === 'logo' ? '/assets/logo.png' : `${ASSET}${name}.webp`
      const promise = loadPreviewImage(url).then((image) => { imagesRef.current.set(name, image); return image }).catch(() => { promisesRef.current.delete(name); return null })
      promisesRef.current.set(name, promise)
      return promise
    }
    if (!imagesRef.current.has(requiredBase)) setStatus('loading')
    Promise.all([...names].map(load)).then((loaded) => {
      if (cancelled || version !== versionRef.current) return
      if (loaded.some((image) => !image)) { setStatus('error'); return }
      for (const name of names) {
        if (['logo', 'flower', 'brussels', 'bowl', 'potato', 'box', 'chocolate', 'white-drizzle'].includes(name)) continue
        if (!fragmentsRef.current.has(name)) fragmentsRef.current.set(name, fragmentsOf(imagesRef.current.get(name)!, name))
      }
      const canvas = canvasRef.current, ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      const target = makeCanvas(), targetCtx = target.getContext('2d')!
      paintFood(targetCtx, category, selection, imagesRef.current, fragmentsRef.current)
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const previous = lastFrameRef.current
      const complete = () => {
        ctx.clearRect(0, 0, WIDTH, HEIGHT); ctx.drawImage(target, 0, 0)
        lastFrameRef.current = target; setHasFrame(true); setStatus('ready')
        try { callbackRef.current?.(canvas.toDataURL('image/webp', .76), category, selection) } catch { /* Image preview remains usable without a basket thumbnail. */ }
      }
      if (!previous || reduced) { complete(); return }
      setStatus('ready')
      const start = performance.now()
      const animate = (time: number) => {
        if (cancelled || version !== versionRef.current) return
        const progress = Math.min(1, (time - start) / 165), ease = 1 - (1 - progress) ** 3
        ctx.clearRect(0, 0, WIDTH, HEIGHT); ctx.globalAlpha = 1 - ease; ctx.drawImage(previous, 0, 0)
        ctx.globalAlpha = ease; ctx.drawImage(target, 0, 0); ctx.globalAlpha = 1
        if (progress < 1) frame = requestAnimationFrame(animate); else complete()
      }
      frame = requestAnimationFrame(animate)
    }).catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true; cancelAnimationFrame(frame) }
  }, [category, signature, retry])

  const selectedCount = Object.entries(selections).filter(([key]) => key !== 'base').reduce((sum, [, ids]) => sum + ids.length, 0)
  const labels = { waffle: 'Waffle', bowl: 'Bowl', box: 'Granny’s Box', kumpir: 'Kumpir' }
  return <div className="preview-stage" data-selected-count={selectedCount} aria-busy={status === 'loading'}>
    <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} role="img" aria-label={`${labels[category]} için temsili malzeme önizlemesi. ${selectedCount} malzeme seçildi.`} />
    {!hasFrame && <svg className="preview-base-poster" viewBox="0 0 800 600" width="100%" height="100%" aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}><image href="/assets/layers/potato.webp" x="150" y="105" width="500" height="402" transform="rotate(-1.146 400 306)" preserveAspectRatio="xMidYMid meet" /></svg>}
    {status === 'error' && <div className="preview-retry" role="status" style={{ position: 'absolute', bottom: 8, right: 8 }}><button type="button" onClick={() => setRetry((n) => n + 1)}>Görseli yeniden yükle</button></div>}
  </div>
}

function SvgFoodPreview({ category, selections, sauceWells, onSnapshot }: FoodPreviewProps & { category: Exclude<Category, 'kumpir'> }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const engineRef = useRef<{ kind: string; engine: V34Engine } | null>(null)
  const callbackRef = useRef(onSnapshot)
  const versionRef = useRef(0)
  const instance = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [status, setStatus] = useState<'ready' | 'error'>('ready')
  const [retry, setRetry] = useState(0)
  callbackRef.current = onSnapshot
  const signature = JSON.stringify(selections)
  const wellsSignature = JSON.stringify(sauceWells ?? {})
  const renderSignature = `${category}:${signature}:${wellsSignature}`
  const latestSignatureRef = useRef(renderSignature)
  latestSignatureRef.current = renderSignature
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const version = ++versionRef.current
    let cancelled = false
    let thumbnailTimer: ReturnType<typeof setTimeout> | undefined
    const selection = JSON.parse(signature) as Selection
    const wells = JSON.parse(wellsSignature) as V34SauceWells
    const current = () => !cancelled && version === versionRef.current && latestSignatureRef.current === renderSignature
    try {
      const kind = category === 'box' ? 'v15-box' : 'v34'
      if (engineRef.current?.kind !== kind) {
        engineRef.current = { kind, engine: category === 'box' ? createV15BoxEngine(svg, `food-${instance}`) : createV34Engine(svg, `food-${instance}`) }
      }
      engineRef.current.engine.render({ category, selections: selection, sauceWells: wells })
      svg.setAttribute('data-reduced-motion', String(window.matchMedia('(prefers-reduced-motion: reduce)').matches))
      // The original SVG paints immediately. Image validation and thumbnails run independently.
      setStatus('ready')
      thumbnailTimer = setTimeout(() => {
        if (!current()) return
        waitForV34Images(svg).then(() => {
          if (!current() || !callbackRef.current) return
          // rasterizeV34 clones synchronously here, after the current-recipe guard.
          void rasterizeV34(svg).then((image) => {
            if (!current()) return
            if (category === 'box') callbackRef.current?.(image, category, selection, wells)
            else callbackRef.current?.(image, category, selection)
          }).catch(() => { /* A missing basket thumbnail never hides the visible product. */ })
        }).catch(() => { if (current()) setStatus('error') })
      }, 80)
    } catch { if (current()) setStatus('error') }
    return () => { cancelled = true; clearTimeout(thumbnailTimer) }
  }, [category, signature, wellsSignature, renderSignature, retry, instance])
  const selectedCount = Object.entries(selections).filter(([key]) => key !== 'base').reduce((sum, [, ids]) => sum + ids.length, 0)
  const label = category === 'box' ? 'Granny’s Box' : category === 'bowl' ? 'Bowl' : 'Waffle'
  return <div className="preview-stage" data-selected-count={selectedCount} data-preview-engine={category === 'box' ? 'v15' : 'v34'} aria-busy={false}>
    <svg ref={svgRef} className="food-engine-svg" viewBox="0 0 420 290" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`${label} için temsili malzeme önizlemesi. ${selectedCount} malzeme seçildi.`} />
    {status === 'error' && <div className="preview-retry" role="status" style={{ position: 'absolute', bottom: 8, right: 8 }}><button type="button" onClick={() => setRetry((n) => n + 1)}>Görseli yeniden yükle</button></div>}
  </div>
}

export function FoodPreview(props: FoodPreviewProps) {
  return props.category === 'kumpir' ? <CanvasFoodPreview {...props} /> : <SvgFoodPreview {...props} category={props.category} />
}
