import type { MenuStep } from './grannys-menu'

/** The same transition is used by every ingredient card. */
export function selectIngredient(step: MenuStep, selected: string[], id: string): string[] {
  if (!step.options.some(option => option.id === id)) return selected
  if (step.limit === 1) return [id]
  if (selected.includes(id)) return selected.filter(value => value !== id)
  if (step.limit !== null && selected.length >= step.limit) return selected
  return [...selected, id]
}

export type SauceWells = Record<string, 0 | 1>
const sauceIds = new Set(['milk','white','dark','hazelnut-chocolate','strawberry-chocolate','pistachio','caramel','raspberry'])
/** Keep surviving Box sauces in their original physical well, including reloads. */
export function assignSauceWells(selected: unknown, previous: unknown): SauceWells {
  const ids = Array.isArray(selected) ? [...new Set(selected.filter((id): id is string => typeof id === 'string' && sauceIds.has(id)))].slice(0, 2) : []
  const source = previous && typeof previous === 'object' ? previous as Record<string, unknown> : {}
  const result: SauceWells = {}, occupied = new Set<0 | 1>()
  for (const id of ids) {
    const seat = source[id]
    if ((seat === 0 || seat === 1) && !occupied.has(seat)) { result[id] = seat; occupied.add(seat) }
  }
  for (const id of ids) if (!(id in result)) {
    const seat = occupied.has(0) ? 1 : 0
    result[id] = seat; occupied.add(seat)
  }
  return result
}
