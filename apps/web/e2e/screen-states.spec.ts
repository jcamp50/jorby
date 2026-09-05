import { expect, test } from '@playwright/test'

/**
 * The handoff requires every screen to distinguish loading, empty, filtered-empty,
 * not-found, and recoverable-error. `?simulate=` drives the mock store into each.
 */
test.describe('screen states', () => {
  test('shows a skeleton while the household loads', async ({ page }) => {
    await page.goto('/our-home/lists?simulate=slow')
    await expect(page.getByRole('status', { name: 'Loading' })).toBeAttached()
    await expect(page.getByRole('heading', { name: 'Lists', level: 1 })).toBeVisible()
  })

  test('offers a retry on a recoverable error', async ({ page }) => {
    await page.goto('/our-home/lists?simulate=error')
    const alert = page.getByRole('alert')
    await expect(alert).toContainText('offline')
    await expect(alert.getByRole('button', { name: 'Try again' })).toBeVisible()
  })

  test('distinguishes an empty household from a filtered-empty result', async ({ page }) => {
    await page.goto('/our-home/lists?simulate=empty')
    await expect(page.getByText('No lists yet.')).toBeVisible()

    await page.goto('/our-home/places')
    await expect(page.getByRole('status', { name: 'Loading' })).toBeHidden()
    await page.getByRole('button', { name: 'We disagree' }).click()
    await expect(page.getByRole('link', { name: /Lilia/ })).toBeVisible()
  })

  test('hides whether an inaccessible record exists', async ({ page }) => {
    await page.goto('/our-home/notes/note-does-not-exist')
    await expect(page.getByText('This isn’t available.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back to Notes' })).toBeVisible()
  })
})

test.describe('action feedback', () => {
  test('announces a note save', async ({ page }) => {
    await page.goto('/our-home/notes/note-hudson')
    await expect(page.getByRole('status', { name: 'Loading' })).toBeHidden()

    await page.getByLabel('Title').fill('Hudson weekend, booked')
    await page.getByRole('button', { name: 'Save changes' }).click()

    await expect(page.getByText('Note saved')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Saved' })).toBeDisabled()
  })

  test('refuses to add a blank list item', async ({ page }) => {
    await page.goto('/our-home/lists/list-groceries')
    await expect(page.getByRole('status', { name: 'Loading' })).toBeHidden()
    // The button stays disabled rather than letting an invalid write through.
    await expect(page.getByRole('button', { name: 'Add' })).toBeDisabled()
  })

  test('states where a purchased thing went', async ({ page }) => {
    await page.goto('/our-home/things/thing-espresso')
    await expect(page.getByRole('status', { name: 'Loading' })).toBeHidden()

    await page.getByRole('button', { name: 'Mark purchased' }).click()
    await page.getByRole('button', { name: 'Move to Home' }).click()

    await expect(page.getByText('Moved to Home.')).toBeVisible()
    await expect(page.getByText('Owned')).toBeVisible()
    // Purchasing clears the reservation.
    await expect(page.getByText('Reserved by')).toBeHidden()
  })
})
