import type { Category, Selection } from './grannys-menu'
import type { SauceWells } from './recipe-selection'

type PreviewRecipe = { category: Category; selections: Selection; sauceWells: SauceWells; thumb: string }
const selectionKey = (value: Selection) => JSON.stringify(Object.keys(value).sort().map(key => [key, value[key]]))
const wellsKey = (value: SauceWells) => JSON.stringify(Object.keys(value).sort().map(key => [key, value[key]]))
export function matchesRecipePreview(recipe: PreviewRecipe, category: Category, selections: Selection, wells?: SauceWells): boolean {
  return recipe.category === category && selectionKey(recipe.selections) === selectionKey(selections)
    && (category !== 'box' || Boolean(wells) && wellsKey(recipe.sauceWells) === wellsKey(wells!))
}
/** A late thumbnail can complete a saved recipe, but never another recipe's image. */
export function completeRecipeThumbnails<T extends PreviewRecipe | {kind:'catalogue';thumb:string}>(items: T[], thumb: string, category: Category, selections: Selection, wells?: SauceWells): T[] {
  let changed = false
  const next = items.map(item => {
    if (!('selections' in item) || item.thumb || !matchesRecipePreview(item, category, selections, wells)) return item
    changed = true
    return { ...item, thumb }
  })
  return changed ? next : items
}
