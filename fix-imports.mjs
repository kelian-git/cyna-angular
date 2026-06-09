import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const src = '/home/nexzo/projets/ecole/filrouge/cyna-angular/src/app'

// Tous les .component.ts déplacés d'un niveau plus profond
const movedTs = [
  'shared/layout/admin-layout/admin-layout.component.ts',
  'shared/layout/main-layout/main-layout.component.ts',
  'features/account/account/account.component.ts',
  'features/account/account-settings/account-settings.component.ts',
  'features/account/orders/orders.component.ts',
  'features/account/order-detail/order-detail.component.ts',
  'features/admin/admin-carousel/admin-carousel.component.ts',
  'features/admin/admin-categories/admin-categories.component.ts',
  'features/admin/admin-dashboard/admin-dashboard.component.ts',
  'features/admin/admin-messages/admin-messages.component.ts',
  'features/admin/admin-orders/admin-orders.component.ts',
  'features/admin/admin-product-form/admin-product-form.component.ts',
  'features/admin/admin-products/admin-products.component.ts',
  'features/auth/login/login.component.ts',
  'features/auth/register/register.component.ts',
  'features/auth/forgot-password/forgot-password.component.ts',
  'features/catalogue/catalogue/catalogue.component.ts',
  'features/catalogue/category/category.component.ts',
  'features/legal/a-propos/a-propos.component.ts',
  'features/legal/cgu/cgu.component.ts',
  'features/legal/mentions-legales/mentions-legales.component.ts',
]

for (const rel of movedTs) {
  const fullPath = join(src, rel)
  let content = readFileSync(fullPath, 'utf8')

  // Ajoute un niveau ../ à tous les imports relatifs (from '../...' ou from '../../...')
  const fixed = content.replace(/from '(\.\.[^']+)'/g, "from '../$1'")

  if (fixed !== content) {
    writeFileSync(fullPath, fixed)
    const changes = (content.match(/from '(\.\.[^']+)'/g) || []).length
    console.log(`✓ ${rel} (${changes} import(s) mis à jour)`)
  } else {
    console.log(`- ${rel} (aucun import relatif)`)
  }
}

console.log('\nDone')
