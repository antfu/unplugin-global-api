import { ImportsFlatMap } from '../types'

export function generateDeclaration(imports: ImportsFlatMap, resolvedImports: ImportsFlatMap = {}) {
  const body = [
    ...Object.entries(imports),
    ...Object.entries(resolvedImports),
  ]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, info]) => `  const ${name}: typeof import('${info.path}')${info.importName !== '*' ? `['${info.importName || name}']` : ''}`)
    .join('\n')
  return `// Generated by 'unplugin-auto-import'\n// We suggest you to commit this file into source control\ndeclare global {\n${body}\n}\nexport {}\n`
}
