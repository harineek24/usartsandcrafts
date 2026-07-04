import { chromium } from 'playwright-core'

const dir = process.argv[2] ?? 'scripts/e2e/screenshots'
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader'],
})
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
page.on('pageerror', (e) => console.log('[pageerror]', e.message))

await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3500)
await page.screenshot({ path: `${dir}/m-shelf.png` })

await page.keyboard.press('/')
await page.waitForTimeout(300)
await page.keyboard.type('clay coil')
await page.waitForTimeout(900)
await page.screenshot({ path: `${dir}/m-search.png` })
await page.getByRole('button', { name: /Clay Coil Pots/ }).click()
await page.waitForTimeout(2400)
if (!(await page.getByText('Air-dry clay').isVisible().catch(() => false)))
  console.log('FAIL: mobile spread missing materials')
await page.screenshot({ path: `${dir}/m-spread.png` })
console.log('MOBILE FLOW DONE')
await browser.close()
