import { chromium } from 'playwright-core'
const dir = process.argv[2] ?? 'scripts/e2e/screenshots'
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader'],
})
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
page.on('pageerror', (e) => console.log('[pageerror]', e.message))
await page.goto('http://localhost:4173/#/admin', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1200)
if (!(await page.getByText('Supabase not connected').isVisible().catch(() => false)))
  console.log('FAIL: offline admin notice missing')
await page.screenshot({ path: `${dir}/admin-offline.png` })
await page.getByText('back to the library').click()
await page.waitForTimeout(3000)
if (!(await page.getByText('Click a book to open it').isVisible().catch(() => false)))
  console.log('FAIL: back link did not return to library')
console.log('ADMIN FLOW DONE')
await browser.close()
