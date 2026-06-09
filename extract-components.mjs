import { readFileSync, writeFileSync, existsSync } from 'fs'
import { dirname, basename, join } from 'path'

const componentFiles = [
  'src/app/features/account/account-settings.component.ts',
  'src/app/features/account/account.component.ts',
  'src/app/features/account/order-detail.component.ts',
  'src/app/features/account/orders.component.ts',
  'src/app/features/admin/admin-carousel.component.ts',
  'src/app/features/admin/admin-categories.component.ts',
  'src/app/features/admin/admin-dashboard.component.ts',
  'src/app/features/admin/admin-messages.component.ts',
  'src/app/features/admin/admin-orders.component.ts',
  'src/app/features/admin/admin-product-form.component.ts',
  'src/app/features/admin/admin-products.component.ts',
  'src/app/features/auth/forgot-password.component.ts',
  'src/app/features/auth/login.component.ts',
  'src/app/features/auth/register.component.ts',
  'src/app/features/cart/cart.component.ts',
  'src/app/features/catalogue/catalogue.component.ts',
  'src/app/features/catalogue/category.component.ts',
  'src/app/features/checkout/checkout.component.ts',
  'src/app/features/confirmation/confirmation.component.ts',
  'src/app/features/contact/contact.component.ts',
  'src/app/features/home/home.component.ts',
  'src/app/features/legal/a-propos.component.ts',
  'src/app/features/legal/cgu.component.ts',
  'src/app/features/legal/mentions-legales.component.ts',
  'src/app/features/not-found/not-found.component.ts',
  'src/app/features/product/product.component.ts',
  'src/app/features/search/search.component.ts',
  'src/app/shared/components/chatbot-widget/chatbot-widget.component.ts',
  'src/app/shared/components/footer/footer.component.ts',
  'src/app/shared/components/header/header.component.ts',
  'src/app/shared/components/language-switcher/language-switcher.component.ts',
  'src/app/shared/components/logo/logo.component.ts',
  'src/app/shared/components/menu-burger/menu-burger.component.ts',
  'src/app/shared/components/toast/toast.component.ts',
  'src/app/shared/layout/admin-layout.component.ts',
  'src/app/shared/layout/main-layout.component.ts',
  'src/app/shared/ui/badge/badge.component.ts',
  'src/app/shared/ui/button/button.component.ts',
  'src/app/shared/ui/card/card.component.ts',
  'src/app/shared/ui/carousel/carousel.component.ts',
  'src/app/shared/ui/category-card/category-card.component.ts',
  'src/app/shared/ui/empty-state/empty-state.component.ts',
  'src/app/shared/ui/input/input.component.ts',
  'src/app/shared/ui/loader/loader.component.ts',
  'src/app/shared/ui/modal/modal.component.ts',
  'src/app/shared/ui/pagination/pagination.component.ts',
  'src/app/shared/ui/product-card/product-card.component.ts',
  'src/app/shared/ui/select/select.component.ts',
  'src/app/shared/ui/skeleton/skeleton.component.ts',
]

/**
 * Extract content of a backtick template literal starting after the opening backtick.
 * Returns { content, endIndex } where endIndex points past the closing backtick.
 */
function extractTemplateLiteral(src, startIdx) {
  let i = startIdx
  let depth = 0 // tracks ${ } nesting
  let content = ''
  while (i < src.length) {
    const ch = src[i]
    if (ch === '\\') {
      content += src[i] + (src[i + 1] ?? '')
      i += 2
      continue
    }
    if (ch === '`' && depth === 0) {
      return { content, endIndex: i + 1 }
    }
    if (ch === '$' && src[i + 1] === '{') {
      depth++
      content += ch
      i++
      continue
    }
    if (ch === '}' && depth > 0) {
      depth--
      content += ch
      i++
      continue
    }
    content += ch
    i++
  }
  throw new Error('Unterminated template literal')
}

/**
 * Find a property in the @Component decorator and extract its value.
 * Returns { value, start, end } where start..end is the slice to replace (including key and value).
 */
function findProperty(src, propName) {
  // Match "  propName: " at component-decorator level
  const re = new RegExp(`(\\n[ \\t]+${propName}:\\s*)`, 'g')
  let match
  while ((match = re.exec(src)) !== null) {
    const keyStart = match.index
    const valueStart = match.index + match[0].length
    const ch = src[valueStart]

    if (ch === '`') {
      // template literal
      const { content, endIndex } = extractTemplateLiteral(src, valueStart + 1)
      // consume optional trailing comma
      let end = endIndex
      if (src[end] === ',') end++
      return { value: content, start: keyStart, end, type: 'backtick' }
    }

    if (ch === '[') {
      // styles array: find matching ]
      let depth = 0
      let j = valueStart
      while (j < src.length) {
        if (src[j] === '[') depth++
        else if (src[j] === ']') {
          depth--
          if (depth === 0) {
            j++
            break
          }
        }
        j++
      }
      const arrayContent = src.slice(valueStart, j)
      // Extract first backtick literal inside array if present
      const btIdx = arrayContent.indexOf('`')
      let innerContent = ''
      if (btIdx !== -1) {
        const { content } = extractTemplateLiteral(arrayContent, btIdx + 1)
        innerContent = content
      }
      let end = j
      if (src[end] === ',') end++
      return { value: innerContent, start: keyStart, end, type: 'array' }
    }
  }
  return null
}

const root = '/home/nexzo/projets/ecole/filrouge/cyna-angular'

let processed = 0
let skipped = 0

for (const relPath of componentFiles) {
  const fullPath = join(root, relPath)
  if (!existsSync(fullPath)) {
    console.log(`MISSING: ${relPath}`)
    continue
  }

  let src = readFileSync(fullPath, 'utf8')
  const dir = dirname(fullPath)
  const base = basename(fullPath, '.ts') // e.g. "home.component"
  const htmlFile = `${base}.html`
  const scssFile = `${base}.scss`

  let modified = false

  // --- Handle template ---
  const templateProp = findProperty(src, 'template')
  if (templateProp) {
    writeFileSync(join(dir, htmlFile), templateProp.value)
    // Replace "  template: `...`" with "  templateUrl: './foo.component.html'"
    const replacement = `\n  templateUrl: './${htmlFile}'`
    src = src.slice(0, templateProp.start) + replacement + src.slice(templateProp.end)
    modified = true
    console.log(`  [HTML] ${relPath} → ${htmlFile}`)
  }

  // Re-search after template replacement
  const stylesProp = findProperty(src, 'styles')
  if (stylesProp) {
    writeFileSync(join(dir, scssFile), stylesProp.value)
    const replacement = `\n  styleUrl: './${scssFile}'`
    src = src.slice(0, stylesProp.start) + replacement + src.slice(stylesProp.end)
    modified = true
    console.log(`  [SCSS] ${relPath} → ${scssFile}`)
  } else {
    // No inline styles — still create empty .scss if no styleUrl already exists
    if (!src.includes('styleUrl') && !src.includes('styleUrls')) {
      writeFileSync(join(dir, scssFile), '')
      const scssReplacement = `\n  styleUrl: './${scssFile}'`
      // Insert after templateUrl line
      src = src.replace(
        /(\n  templateUrl: '[^']+')(\n)/,
        `$1,${scssReplacement}$2`
      )
      modified = true
      console.log(`  [SCSS] ${relPath} → ${scssFile} (empty)`)
    }
  }

  if (modified) {
    writeFileSync(fullPath, src)
    processed++
    console.log(`✓ ${relPath}`)
  } else {
    skipped++
    console.log(`- ${relPath} (already external)`)
  }

  // --- Spec file ---
  const specFile = join(dir, `${base}.spec.ts`)
  if (!existsSync(specFile)) {
    const className = base
      .split('.')
      .shift()
      .split('-')
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join('')
    writeFileSync(specFile, `import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ${className}Component } from './${base}';

describe('${className}Component', () => {
  let component: ${className}Component;
  let fixture: ComponentFixture<${className}Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [${className}Component],
    }).compileComponents();

    fixture = TestBed.createComponent(${className}Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
`)
    console.log(`  [SPEC] created ${base}.spec.ts`)
  }
}

console.log(`\nDone: ${processed} processed, ${skipped} skipped`)
