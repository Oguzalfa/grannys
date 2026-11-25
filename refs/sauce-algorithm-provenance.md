# Granny's original renderer port

The user supplied `Grannys-Eski-Sos-Motoru(1).zip` and explicitly requested its old sauce engine and then the nested v15 divided Box. The current premium React interface, catalogue and selection rules remain the application controls. No legacy page UI or scripts are loaded at runtime.

## Authoritative sources

- Outer ZIP SHA256: `b8c487f3ae81e854eae5cd370740b3e6b3bd1ca44e6141d50153095f097ae056`.
- Waffle/Bowl: `Calisan-v34/dist/app.js`, SHA256 `9b92f867afdf1e3b5708a76c7c9fdaf3cbc7844ee73fc236ce11596f5f801e68`; `portions.js` SHA256 `184effb2ddf8269e37313d79498b4c1fa1e21713e776e55a6e1639b9a349a809`.
- Box: nested `Eski-v15-Bolmeli-Box.zip` SHA256 `6bfd52361cbee578caecbdb086682e1436a048b67deea437c6269acf62f84dff`; `Grannys-v15/dist/app.js` SHA256 `10f2f23ffac61ecb8976ca3fa9964e52264617229ba5c18fb9dbc968981557de`; `portions.js` SHA256 `fc9f522f3c811a2d417e3b34c32947819239d5b467148129e206636c7eef10a6`.
- User-confirmed original site: https://grannys-tabagini-hazirla.alfaoguz22.chatgpt.site

## Copied algorithm

`v34-engine.ts` copies the reviewed v34 `makeSvg` through `buildBowlFruit` rendering helpers and the food-composition body of `renderLayers`, including `coatPalette`, `coatPaths`, `chocolateSeams`, `paintCoat`, `coatBowl`, `sauceFootprints`, `bowlWaffleMound`, `buildBowlFruit`, source-photo fragments, fine garnish and topmost specials. The original portions engine is retained. Single sauce covers the surface; two sauces close the same organic seam to opposite edges; removal recomposes a full remaining coat. Historical patches are already represented in v34 and are not reapplied.

`v34-box-v15.ts` copies the reviewed v15 helpers, portions and `renderLayers` composition. Its Box base remains `scene-box-base` at center (210,143), size 360×260. The original photograph already contains waffle and four brownies. Wells remain [[180,89,35,16],[270,115,35,17]], using the original `paintWell` and `dip-*` photos. The original v15 single fruit patches are retained at (216,54,101,45), angle 11, and (311,81,100,46), angle 14. No new Box body or base food is drawn, and no 3/6-person scaling is inferred.

## Bounded integration changes

1. React owns the SVG element; the copied primitives operate only inside its local base/layers groups. Every SVG ID and URL reference is prefixed per instance. Legacy global IDs, UI handlers, window listeners, observers and initial side effects are omitted.
2. Bitmap paths resolve to copied source assets in `/assets/v34/` or `/assets/v15/`.
3. A typed adapter maps existing current ingredient IDs to the source numeric indices. Main sauce array order is preserved. Box uses the persisted current-ID `sauceWells` map, retaining surviving well positions after removal/reload. Clear is represented by empty selections on the same base.
4. The current Box UI supports seven toppings absent from the v15 Box controls. Only that extension uses the supplied v34 fine crumb photos and v15 gummy photos, clipped to the existing photographed waffle surface; the original base, brownies, wells and fruit composition remain unchanged.
5. Kumpir retains the existing canvas renderer so current fillings and extra butter/cheese remain intact.
6. Thumbnail serialization clones the SVG before any await and embeds original image bytes as data URLs before native canvas rasterization. Effect cancellation, monotonically increasing versions and current render signatures reject stale snapshots. Box callbacks include the same well map captured with that snapshot. Loads are retryable; the original fall class is applied only to a newly added ingredient; removal and clear do not animate, and the scoped CSS disables arrivals under reduced motion. Serialized thumbnails contain static photo shadows without fall animation.
7. The reviewed legacy JavaScript bodies are marked `@ts-nocheck` to avoid rewriting its algorithm during migration; the exported renderer/input/snapshot boundaries are typed in `v34-types.ts` and `v34-snapshot.ts`.

## Native renderer verification

`/home/user/grannys-qa/v34-render.cjs` tests the actual port source in standard Chromium. 63 assertions passed, zero page errors and zero CSP violations under the exact application security headers. SVG image transport uses a CSP-permitted data URL. Tests include bare/full/two matching seam halves/removal/clear for flower, Brussels, medium and large Bowl; unchanged base/container photographs; topmost specials; exact v15 Box base and fruit coordinates; stable Box wells after removal/re-add; all seven toppings confined to waffle; single-ingredient arrival and clear without animation; six simultaneous unique-ID instances; and 840×580 WebP thumbnails from the actual SVG with embedded assets. Visual evidence: `/home/user/grannys-qa/v34-overview.jpg`; structured results: `v34-render-results.json`. This harness validates the rendering source, not the entire React user flow or deployment.

The earlier provisional 82% canvas sauce adaptation is superseded for Waffle, Bowl and Box. The user explicitly overrode the outer OKU.md Box recommendation in favour of the nested v15 Box. Its original single fruit-patch geometry is retained exactly; no front-fill extension is included.

Kumpir native source regression: 11/11 assertions passed with no page errors. All five fillings and both extras change visible pixels; removing extras exactly restores the filled image, clear exactly restores the bare image, and sweet selections have no effect. Evidence: `/home/user/grannys-qa/kumpir-regression.jpg`, with JSON and harness alongside.
