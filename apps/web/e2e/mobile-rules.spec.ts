import { expect, test, type Page } from '@playwright/test'

/**
 * Codifies the rules in docs/this-repo/design-system.md. Every one of these
 * was violated by an earlier prototype pass, so they run on every route.
 */

const MIN_TOUCH_TARGET = 44
const MIN_LABEL_FONT = 11
const MIN_INPUT_FONT = 16

const routes = [
  'home',
  'search',
  'lists',
  'lists/list-groceries',
  'notes',
  'notes/note-hudson',
  'places',
  'places/place-lilia',
  'watch',
  'watch/watch-bear',
  'things',
  'things/thing-espresso',
  'settings',
]

async function gotoReady(page: Page, route: string) {
  await page.goto(`/our-home/${route}`)
  // The mock store resolves after a short delay; wait for real content.
  await expect(page.getByRole('status', { name: 'Loading' })).toBeHidden()
}

test.describe('mobile layout rules', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) > 767, 'mobile viewports only')

  for (const route of routes) {
    test(`${route} has no horizontal overflow`, async ({ page }) => {
      await gotoReady(page, route)
      const overflow = await page.evaluate(
        () => document.scrollingElement!.scrollWidth - window.innerWidth,
      )
      expect(overflow, `${route} scrolls sideways`).toBeLessThanOrEqual(0)
    })

    test(`${route} touch targets clear ${MIN_TOUCH_TARGET}px`, async ({ page }) => {
      await gotoReady(page, route)
      const tooShort = await page.evaluate((min) => {
        const bad: string[] = []
        document
          .querySelectorAll('a, button, [role=tab], input:not([type=hidden]), textarea, select')
          .forEach((el) => {
            const rect = el.getBoundingClientRect()
            if (rect.width === 0 && rect.height === 0) return
            // A checkbox inside a label row is fine; the whole row is tappable.
            if (el.getAttribute('role') === 'checkbox' && el.closest('label')) return
            if (rect.height < min) {
              const label = (el.textContent || el.getAttribute('aria-label') || '').trim()
              bad.push(`${label.slice(0, 24)} (${Math.round(rect.height)}px)`)
            }
          })
        return bad
      }, MIN_TOUCH_TARGET)
      expect(tooShort).toEqual([])
    })

    test(`${route} keeps content clear of the tab bar`, async ({ page }) => {
      await gotoReady(page, route)
      await page.evaluate(() => window.scrollTo(0, document.scrollingElement!.scrollHeight))
      const clipped = await page.evaluate(() => {
        const nav = document.querySelector('nav.fixed')
        if (!nav) return []
        const navTop = nav.getBoundingClientRect().top
        const bad: string[] = []
        document.querySelectorAll('main h1, main h2, main p, main li, main button').forEach((el) => {
          const rect = el.getBoundingClientRect()
          if (rect.height === 0) return
          if (rect.bottom > navTop + 1 && rect.top < navTop) {
            bad.push((el.textContent || '').trim().slice(0, 24))
          }
        })
        return bad
      })
      expect(clipped).toEqual([])
    })
  }

  test(`tab bar labels are at least ${MIN_LABEL_FONT}px`, async ({ page }) => {
    await gotoReady(page, 'home')
    const sizes = await page.evaluate(() =>
      [...document.querySelectorAll('nav.fixed a')].map((el) =>
        parseFloat(getComputedStyle(el).fontSize),
      ),
    )
    expect(sizes.length).toBeGreaterThan(0)
    for (const size of sizes) {
      expect(size).toBeGreaterThanOrEqual(MIN_LABEL_FONT)
    }
  })

  test(`text inputs render at ${MIN_INPUT_FONT}px so iOS does not zoom on focus`, async ({
    page,
  }) => {
    for (const route of ['search', 'notes/note-hudson', 'lists/list-groceries']) {
      await gotoReady(page, route)
      const sizes = await page.evaluate(() =>
        [...document.querySelectorAll('input:not([type=hidden]), textarea')].map((el) =>
          parseFloat(getComputedStyle(el).fontSize),
        ),
      )
      for (const size of sizes) {
        expect(size, `${route} input would trigger iOS zoom`).toBeGreaterThanOrEqual(
          MIN_INPUT_FONT,
        )
      }
    }
  })
})
