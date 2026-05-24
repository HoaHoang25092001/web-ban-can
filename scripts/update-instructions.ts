/**
 * scripts/update-instructions.ts
 *
 * Quét codebase và tự động cập nhật các section trong
 * .github/copilot-instructions.md (đánh dấu bằng <!-- AUTO:tag -->).
 *
 * Chạy: npm run docs:sync
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(process.cwd())
const INSTRUCTIONS = path.join(ROOT, '.github', 'copilot-instructions.md')

// ─── Helpers ────────────────────────────────────────────────────────────────

function walkDir(dir: string, predicate: (name: string) => boolean, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkDir(full, predicate, out)
    } else if (entry.isFile() && predicate(entry.name)) {
      out.push(full)
    }
  }
  return out
}

function toUnix(p: string) {
  return p.replace(/\\/g, '/')
}

function relFrom(base: string, full: string) {
  return toUnix(path.relative(base, full))
}

// ─── Builders ───────────────────────────────────────────────────────────────

// Quet app/**/page.tsx -> bang routes
function buildRoutes(): string {
  const appDir = path.join(ROOT, 'app')
  const files = walkDir(appDir, n => n === 'page.tsx')

  const rows = files.map(f => {
    const rel = relFrom(appDir, f)            // e.g. "admin/products/page.tsx"
    const parts = rel.split('/').slice(0, -1) // remove "page.tsx"
    const route = parts.length === 0 ? '/' : '/' + parts.join('/')
    return { route, file: `app/${rel}` }
  })

  // Sort: public first, then admin
  rows.sort((a, b) => {
    const ai = a.route.startsWith('/admin') ? 1 : 0
    const bi = b.route.startsWith('/admin') ? 1 : 0
    return ai - bi || a.route.localeCompare(b.route)
  })

  const lines = ['| Route | File |', '|-------|------|']
  for (const { route, file } of rows) {
    lines.push(`| \`${route}\` | \`${file}\` |`)
  }
  return lines.join('\n')
}

// Quet app/api/**/route.ts -> bang API endpoints
function buildAPI(): string {
  const apiDir = path.join(ROOT, 'app', 'api')
  const files = walkDir(apiDir, n => n === 'route.ts')

  const rows = files.map(f => {
    const rel = relFrom(apiDir, f)
    const parts = rel.split('/').slice(0, -1)
    const endpoint = '/api' + (parts.length === 0 ? '' : '/' + parts.join('/'))
    return { endpoint, file: `app/api/${rel}` }
  })

  rows.sort((a, b) => a.endpoint.localeCompare(b.endpoint))

  const lines = ['| Endpoint | File |', '|----------|------|']
  for (const { endpoint, file } of rows) {
    lines.push(`| \`${endpoint}\` | \`${file}\` |`)
  }
  return lines.join('\n')
}

// Quet components/**/*.tsx -> danh sach
function buildComponents(): string {
  const compDir = path.join(ROOT, 'components')
  const files = walkDir(compDir, n => n.endsWith('.tsx'))

  return files
    .map(f => `- \`${relFrom(ROOT, f)}\``)
    .sort()
    .join('\n')
}

// Parse prisma/schema.prisma -> danh sach models + fields
function buildModels(): string {
  const schemaPath = path.join(ROOT, 'prisma', 'schema.prisma')

  if (!fs.existsSync(schemaPath)) return '_Không tìm thấy schema.prisma_'

  const schema = fs.readFileSync(schemaPath, 'utf-8')
  const blocks = [...schema.matchAll(/^model\s+(\w+)\s*\{([^}]+)\}/gm)]

  return blocks
    .map(([, name, body]) => {
      const fields = body
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('//') && !l.startsWith('@') && !l.startsWith('@@'))
        .map(l => l.split(/\s+/)[0])
        .filter(Boolean)
      return `**${name}**: ${fields.join(', ')}`
    })
    .join('\n')
}

// ─── Inject ─────────────────────────────────────────────────────────────────

function inject(content: string, tag: string, body: string): string {
  const open = `<!-- AUTO:${tag} -->`
  const close = `<!-- /AUTO:${tag} -->`
  const re = new RegExp(`${open}[\\s\\S]*?${close}`, 'g')
  return content.replace(re, `${open}\n${body}\n${close}`)
}

// ─── Main ────────────────────────────────────────────────────────────────────

if (!fs.existsSync(INSTRUCTIONS)) {
  console.error(`❌ Không tìm thấy: ${INSTRUCTIONS}`)
  process.exit(1)
}

let content = fs.readFileSync(INSTRUCTIONS, 'utf-8')

content = inject(content, 'models', buildModels())
content = inject(content, 'routes', buildRoutes())
content = inject(content, 'api', buildAPI())
content = inject(content, 'components', buildComponents())

fs.writeFileSync(INSTRUCTIONS, content, 'utf-8')
console.log('✅ .github/copilot-instructions.md đã được cập nhật')
