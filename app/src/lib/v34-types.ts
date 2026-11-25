import type { Category, Selection } from './grannys-menu'
export type V34SauceWells = Record<string, 0 | 1>
export type V34EngineInput = {
  category: Exclude<Category, 'kumpir'>
  selections: Selection
  sauceWells?: V34SauceWells
}
export type V34Engine = { render: (input: V34EngineInput) => void }
