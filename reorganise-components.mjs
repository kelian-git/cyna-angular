import { existsSync, mkdirSync, renameSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'

const root = '/home/nexzo/projets/ecole/filrouge/cyna-angular'
const src = join(root, 'src/app')

// [ sourceDir, componentBase, destSubdir ]
// destSubdir = sous-dossier à créer dans sourceDir
const moves = [
  // shared/layout
  ['shared/layout', 'admin-layout',      'admin-layout'],
  ['shared/layout', 'main-layout',       'main-layout'],

  // features/account
  ['features/account', 'account',          'account'],
  ['features/account', 'account-settings', 'account-settings'],
  ['features/account', 'orders',           'orders'],
  ['features/account', 'order-detail',     'order-detail'],

  // features/admin
  ['features/admin', 'admin-carousel',     'admin-carousel'],
  ['features/admin', 'admin-categories',   'admin-categories'],
  ['features/admin', 'admin-dashboard',    'admin-dashboard'],
  ['features/admin', 'admin-messages',     'admin-messages'],
  ['features/admin', 'admin-orders',       'admin-orders'],
  ['features/admin', 'admin-product-form', 'admin-product-form'],
  ['features/admin', 'admin-products',     'admin-products'],

  // features/auth
  ['features/auth', 'login',           'login'],
  ['features/auth', 'register',        'register'],
  ['features/auth', 'forgot-password', 'forgot-password'],

  // features/catalogue
  ['features/catalogue', 'catalogue', 'catalogue'],
  ['features/catalogue', 'category',  'category'],

  // features/legal
  ['features/legal', 'a-propos',         'a-propos'],
  ['features/legal', 'cgu',              'cgu'],
  ['features/legal', 'mentions-legales', 'mentions-legales'],
]

const exts = ['.component.ts', '.component.html', '.component.scss', '.component.spec.ts']

let moved = 0
let skipped = 0

for (const [relDir, base, subdir] of moves) {
  const srcDir = join(src, relDir)
  const destDir = join(srcDir, subdir)

  // Vérification idempotente : si le .ts de destination existe déjà, skip
  const destTs = join(destDir, `${base}.component.ts`)
  if (existsSync(destTs)) {
    console.log(`- SKIP (already done): ${relDir}/${subdir}/`)
    skipped++
    continue
  }

  mkdirSync(destDir, { recursive: true })

  for (const ext of exts) {
    const srcFile = join(srcDir, `${base}${ext}`)
    const destFile = join(destDir, `${base}${ext}`)
    if (existsSync(srcFile)) {
      renameSync(srcFile, destFile)
      console.log(`  mv ${relDir}/${base}${ext} → ${relDir}/${subdir}/`)
    }
  }

  moved++
  console.log(`✓ ${relDir}/${subdir}/`)
}

// ── Patch app.routes.ts ────────────────────────────────────────────────────
const routesPath = join(src, 'app.routes.ts')
let routes = readFileSync(routesPath, 'utf8')

const routeReplacements = [
  // imports statiques layout
  [`./shared/layout/admin-layout.component`,  `./shared/layout/admin-layout/admin-layout.component`],
  [`./shared/layout/main-layout.component`,   `./shared/layout/main-layout/main-layout.component`],
  // loadComponent features
  [`./features/catalogue/catalogue.component`, `./features/catalogue/catalogue/catalogue.component`],
  [`./features/catalogue/category.component`,  `./features/catalogue/category/category.component`],
  [`./features/auth/login.component`,          `./features/auth/login/login.component`],
  [`./features/auth/register.component`,       `./features/auth/register/register.component`],
  [`./features/auth/forgot-password.component`,`./features/auth/forgot-password/forgot-password.component`],
  [`./features/account/account.component`,     `./features/account/account/account.component`],
  [`./features/account/account-settings.component`, `./features/account/account-settings/account-settings.component`],
  [`./features/account/orders.component`,      `./features/account/orders/orders.component`],
  [`./features/account/order-detail.component`,`./features/account/order-detail/order-detail.component`],
  [`./features/legal/cgu.component`,           `./features/legal/cgu/cgu.component`],
  [`./features/legal/mentions-legales.component`, `./features/legal/mentions-legales/mentions-legales.component`],
  [`./features/legal/a-propos.component`,      `./features/legal/a-propos/a-propos.component`],
  [`./features/admin/admin-dashboard.component`,  `./features/admin/admin-dashboard/admin-dashboard.component`],
  [`./features/admin/admin-products.component`,   `./features/admin/admin-products/admin-products.component`],
  [`./features/admin/admin-product-form.component`,`./features/admin/admin-product-form/admin-product-form.component`],
  [`./features/admin/admin-categories.component`, `./features/admin/admin-categories/admin-categories.component`],
  [`./features/admin/admin-orders.component`,     `./features/admin/admin-orders/admin-orders.component`],
  [`./features/admin/admin-carousel.component`,   `./features/admin/admin-carousel/admin-carousel.component`],
  [`./features/admin/admin-messages.component`,   `./features/admin/admin-messages/admin-messages.component`],
]

for (const [from, to] of routeReplacements) {
  if (routes.includes(from)) {
    routes = routes.replaceAll(from, to)
    console.log(`  [routes] ${from} → ${to}`)
  }
}
writeFileSync(routesPath, routes)
console.log('✓ app.routes.ts patched')

// ── Patch shared/index.ts ──────────────────────────────────────────────────
const indexPath = join(src, 'shared/index.ts')
let idx = readFileSync(indexPath, 'utf8')

idx = idx
  .replace(`./layout/main-layout.component`,  `./layout/main-layout/main-layout.component`)
  .replace(`./layout/admin-layout.component`, `./layout/admin-layout/admin-layout.component`)

writeFileSync(indexPath, idx)
console.log('✓ shared/index.ts patched')

console.log(`\nDone: ${moved} moved, ${skipped} skipped`)
