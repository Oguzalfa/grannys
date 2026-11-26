// The API validates shared recipes against the same options and limits as the builder.
import fs from 'node:fs/promises'
import ts from 'typescript'
const menu = await fs.readFile(new URL('../src/lib/grannys-menu.ts', import.meta.url), 'utf8')
const code = ts.transpile(menu, { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 })
const { products, getSteps } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'))
const rules = Object.fromEntries(products.map(({ id }) => [id,
 Object.fromEntries(getSteps(id).map(step => [step.id, { ids: step.options.map(option => option.id), limit: step.limit }]))
]))
await fs.writeFile(new URL('../server/menu-rules.js', import.meta.url), 'export default ' + JSON.stringify(rules, null, 1) + '\n')
