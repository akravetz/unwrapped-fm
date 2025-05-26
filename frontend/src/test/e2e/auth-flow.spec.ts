import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should show login screen for unauthenticated users', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /unwrapped\.fm/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /connect with spotify/i })).toBeVisible()
  })

  test('should have proper page title', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/unwrapped\.fm/i)
  })

  test('login button should be clickable', async ({ page }) => {
    await page.goto('/')

    const loginButton = page.getByRole('button', { name: /connect with spotify/i })
    await expect(loginButton).toBeEnabled()
  })
})
