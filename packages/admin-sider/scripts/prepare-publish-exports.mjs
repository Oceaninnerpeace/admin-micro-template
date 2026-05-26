/**
 * publish 前把 exports 指向 dist（GitHub Packages / npm 发布用）
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkgPath = resolve(root, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))

writeFileSync(resolve(root, 'package.json.dev-backup'), readFileSync(pkgPath, 'utf8'), 'utf8')

pkg.exports = {
  '.': {
    types: './dist/index.d.ts',
    import: './dist/index.js',
  },
  './style.css': './dist/style.css',
}
pkg.files = ['dist', 'README.md']

writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')
console.info('[smart-power-sider] exports -> dist for publish')
