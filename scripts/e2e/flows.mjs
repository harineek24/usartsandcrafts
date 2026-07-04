import { chromium } from 'playwright-core'

const dir = process.argv[2] ?? 'scripts/e2e/screenshots'
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader'],
})
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
page.on('pageerror', (e) => console.log('[pageerror]', e.message))

const shot = (name) => page.screenshot({ path: `${dir}/${name}.png` })
const fail = (msg) => {
  console.log('FAIL:', msg)
  process.exitCode = 1
}

await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3500)

// Flow 1: open Grade 3 (center of top row, has 3 artworks), flip pages
const canvas = await page.locator('canvas').boundingBox()
await page.mouse.click(canvas.x + canvas.width * 0.5, canvas.y + canvas.height * 0.35)
await page.waitForTimeout(2200)
if (!(await page.getByText('Clay Coil Pots').isVisible().catch(() => false)))
  fail('Grade 3 spread did not show Clay Coil Pots')
if (!(await page.getByText('Artwork 1 of 3').isVisible().catch(() => false)))
  fail('page counter missing')
await shot('f1-spread')

await page.getByLabel('Next artwork').click()
await page.waitForTimeout(400)
if (!(await page.getByText('Autumn Leaf Prints').isVisible().catch(() => false)))
  fail('page flip did not advance to Autumn Leaf Prints')
await shot('f1-flipped')

// Flow 2: click the artwork image -> fullscreen -> Esc backs out one layer
await page.getByAltText('Autumn Leaf Prints').first().click()
await page.waitForTimeout(400)
if (!(await page.getByLabel('Exit full screen').isVisible().catch(() => false)))
  fail('lightbox did not open')
await shot('f2-fullscreen')
await page.keyboard.press('Escape')
await page.waitForTimeout(300)
if (!(await page.getByText('Artwork 2 of 3').isVisible().catch(() => false)))
  fail('Esc should return to spread, not close it')
await page.keyboard.press('Escape')
await page.waitForTimeout(1500)

// Flow 3: pixie search with disambiguation
await page.getByLabel('Ask the shelf pixie').click()
await page.waitForTimeout(300)
await page.keyboard.type('how to draw giraffes')
await page.waitForTimeout(900)
if (!(await page.getByText('which level would you like?').isVisible().catch(() => false)))
  fail('disambiguation prompt missing for multi-book match')
await shot('f3-search')
await page.getByRole('button', { name: 'Grade 5', exact: true }).click()
await page.waitForTimeout(2400)
if (!(await page.getByText('Giraffe on the Savannah').isVisible().catch(() => false)))
  fail('search navigation did not land on Grade 5 giraffe')
await shot('f3-landed')
await page.keyboard.press('Escape')
await page.waitForTimeout(1200)

// Flow 4: keyboard path — "/" opens search, single-title match navigates directly
await page.keyboard.press('/')
await page.waitForTimeout(300)
await page.keyboard.type('linocut')
await page.waitForTimeout(900)
await page.getByRole('button', { name: /Linocut Portraits/ }).click()
await page.waitForTimeout(2400)
if (!(await page.getByText('First carving project').isVisible().catch(() => false)))
  fail('single-match navigation to Grade 8 failed')
await shot('f4-single')

// Flow 5: empty search result message
await page.keyboard.press('Escape')
await page.waitForTimeout(800)
await page.keyboard.press('/')
await page.keyboard.type('zzzz dinosaur opera')
await page.waitForTimeout(900)
if (!(await page.getByText(/nothing on the shelves/).isVisible().catch(() => false)))
  fail('empty-result message missing')

console.log(process.exitCode ? 'FLOWS FAILED' : 'ALL FLOWS PASSED')
await browser.close()
